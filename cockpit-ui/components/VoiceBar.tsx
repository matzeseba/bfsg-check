'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Send } from 'lucide-react';
import { getWsUrl, sendVoiceIntent } from '@/lib/api';

interface Props {
  onJobStart?: (jobId: string) => void;
}

type VoiceStatus = 'idle' | 'connecting' | 'ready' | 'recording' | 'processing' | 'speaking' | 'error';

const STATUS_LABELS: Record<VoiceStatus, string> = {
  idle: 'Bereit',
  connecting: 'Verbinde...',
  ready: 'Bereit (Leertaste halten)',
  recording: 'Aufnahme läuft...',
  processing: 'Verarbeite...',
  speaking: 'Spricht...',
  error: 'Fehler',
};

// ---------------------------------------------------------------------------
// Audio helpers
// ---------------------------------------------------------------------------

/**
 * Converts any audio blob (e.g. audio/webm;codecs=opus) produced by MediaRecorder
 * into a 16-kHz mono WAV ArrayBuffer suitable for faster-whisper / Whisper STT.
 *
 * Steps:
 *  1. Decode the full webm/opus blob via AudioContext.decodeAudioData
 *  2. Resample to 16 000 Hz using OfflineAudioContext
 *  3. Mix down to mono (average channels)
 *  4. Write a standard RIFF WAV header + 16-bit PCM samples
 */
async function convertToWav16kMono(blob: Blob): Promise<ArrayBuffer> {
  const arrayBuffer = await blob.arrayBuffer();

  // Decode with a temporary AudioContext (sample-rate doesn't matter here)
  const decodeCtx = new AudioContext();
  let decoded: AudioBuffer;
  try {
    decoded = await decodeCtx.decodeAudioData(arrayBuffer);
  } finally {
    await decodeCtx.close();
  }

  const targetSampleRate = 16_000;
  const numChannels = decoded.numberOfChannels;
  const sourceSamples = decoded.length;

  // Resample via OfflineAudioContext
  const offlineCtx = new OfflineAudioContext(numChannels, Math.ceil(sourceSamples * targetSampleRate / decoded.sampleRate), targetSampleRate);
  const source = offlineCtx.createBufferSource();
  source.buffer = decoded;
  source.connect(offlineCtx.destination);
  source.start(0);
  const resampled = await offlineCtx.startRendering();

  // Mix down to mono
  const numFrames = resampled.length;
  const monoData = new Float32Array(numFrames);
  for (let ch = 0; ch < resampled.numberOfChannels; ch++) {
    const channelData = resampled.getChannelData(ch);
    for (let i = 0; i < numFrames; i++) {
      monoData[i] += channelData[i];
    }
  }
  if (resampled.numberOfChannels > 1) {
    for (let i = 0; i < numFrames; i++) {
      monoData[i] /= resampled.numberOfChannels;
    }
  }

  // Build WAV: RIFF header + 16-bit PCM
  const bytesPerSample = 2;
  const dataBytes = numFrames * bytesPerSample;
  const wavBuffer = new ArrayBuffer(44 + dataBytes);
  const view = new DataView(wavBuffer);

  function writeStr(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  }

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataBytes, true);          // ChunkSize
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);                      // Subchunk1Size (PCM)
  view.setUint16(20, 1, true);                       // AudioFormat = PCM
  view.setUint16(22, 1, true);                       // NumChannels = 1 (mono)
  view.setUint32(24, targetSampleRate, true);         // SampleRate
  view.setUint32(28, targetSampleRate * bytesPerSample, true); // ByteRate
  view.setUint16(32, bytesPerSample, true);          // BlockAlign
  view.setUint16(34, 16, true);                      // BitsPerSample
  writeStr(36, 'data');
  view.setUint32(40, dataBytes, true);               // Subchunk2Size

  // Write 16-bit PCM samples (clamped)
  let offset = 44;
  for (let i = 0; i < numFrames; i++) {
    const s = Math.max(-1, Math.min(1, monoData[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  return wavBuffer;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function VoiceBar({ onJobStart }: Props) {
  const [status, setStatus] = useState<VoiceStatus>('idle');
  const [transcript, setTranscript] = useState('');
  const [textInput, setTextInput] = useState('');
  const [sending, setSending] = useState(false);
  const [waveActive, setWaveActive] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  // Accumulate all chunks for a single convert-at-end approach
  const audioChunksRef = useRef<Blob[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  // Connect WebSocket
  const connectWs = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    try {
      setStatus('connecting');
      const ws = new WebSocket(getWsUrl());
      wsRef.current = ws;

      ws.onopen = () => setStatus('ready');
      ws.onerror = () => setStatus('error');
      ws.onclose = () => {
        if (status !== 'idle') setStatus('idle');
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data as string) as {
            type: string;
            text?: string;
            // Bug 1 fix: bridge sends 'wav', not 'audio'
            wav?: string;
            jobId?: string;
          };

          if (msg.type === 'transcript' && msg.text) {
            setTranscript(msg.text);
          } else if (msg.type === 'status') {
            setStatus('processing');
          } else if (msg.type === 'intent') {
            // intent carries no jobId — job is started separately via 'result'
            // (nothing to do here beyond potentially showing the recognised intent)
          } else if (msg.type === 'result') {
            // Bug 2 fix: 'result' is where the bridge sends jobId after _launchJob
            if (msg.jobId) {
              onJobStart?.(msg.jobId);
            }
            setStatus('ready');
          } else if (msg.type === 'tts_audio' && msg.wav) {
            // Bug 1 fix: read msg.wav, not msg.audio
            playTtsAudio(msg.wav);
          }
        } catch {
          // Ignore parse errors
        }
      };
    } catch {
      setStatus('error');
    }
  }, [status, onJobStart]);

  function playTtsAudio(base64: string) {
    try {
      setStatus('speaking');
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      audioCtxRef.current.decodeAudioData(bytes.buffer).then((buffer) => {
        const source = audioCtxRef.current!.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtxRef.current!.destination);
        source.onended = () => setStatus('ready');
        source.start(0);
      }).catch(() => setStatus('ready'));
    } catch {
      setStatus('ready');
    }
  }

  // Waveform animation
  const drawWave = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const barWidth = canvas.width / 16;
    for (let i = 0; i < 16; i++) {
      const val = data[i * 2] / 255;
      const h = Math.max(2, val * canvas.height);
      ctx.fillStyle = `rgba(0, 212, 255, ${0.5 + val * 0.5})`;
      ctx.fillRect(i * barWidth, (canvas.height - h) / 2, barWidth - 2, h);
    }

    animFrameRef.current = requestAnimationFrame(drawWave);
  }, []);

  // Push to talk
  const startRecording = useCallback(async () => {
    if (status === 'recording') return;
    connectWs();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Setup analyser for waveform
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
      const analyser = audioCtxRef.current.createAnalyser();
      analyser.fftSize = 64;
      const source = audioCtxRef.current.createMediaStreamSource(stream);
      source.connect(analyser);
      analyserRef.current = analyser;
      setWaveActive(true);
      drawWave();

      // Reset chunk accumulator
      audioChunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : '';
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;

      // Accumulate chunks — convert and send only on stop (final=true)
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const chunks = audioChunksRef.current;
        audioChunksRef.current = [];
        if (chunks.length === 0) return;

        const ws = wsRef.current;
        if (!ws || ws.readyState !== WebSocket.OPEN) return;

        try {
          // Bug 3 fix: convert webm/opus → 16 kHz mono WAV before sending
          const fullBlob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
          const wavBuffer = await convertToWav16kMono(fullBlob);
          const base64 = arrayBufferToBase64(wavBuffer);

          // Bridge reads msg.pcm (see bridge.js line 158: typeof msg.pcm !== 'string')
          ws.send(JSON.stringify({ type: 'audio', pcm: base64, final: true }));
        } catch (err) {
          console.error('VoiceBar: WAV-Konvertierung fehlgeschlagen', err);
          setStatus('error');
        }
      };

      recorder.start();
      setStatus('recording');
    } catch {
      setStatus('error');
    }
  }, [status, connectWs, drawWave]);

  const stopRecording = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    setWaveActive(false);

    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
      recorder.stream.getTracks().forEach((t) => t.stop());
    }
    mediaRecorderRef.current = null;
    setStatus('processing');
  }, []);

  // Keyboard: hold Space to talk
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        startRecording();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && status === 'recording') {
        stopRecording();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [startRecording, stopRecording, status]);

  // Cleanup
  useEffect(() => {
    return () => {
      wsRef.current?.close();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    setSending(true);
    try {
      const result = await sendVoiceIntent(textInput.trim());
      if (result.jobId) {
        onJobStart?.(result.jobId);
      }
      setTextInput('');
    } catch (err) {
      console.error('Voice intent failed', err);
    } finally {
      setSending(false);
    }
  };

  const isRecording = status === 'recording';
  const statusColor =
    status === 'error'
      ? '#ef4444'
      : status === 'recording'
      ? 'var(--accent-secondary)'
      : status === 'ready'
      ? 'var(--accent-success)'
      : 'var(--text-muted)';

  return (
    <footer className="glass-card px-4 py-3 flex items-center gap-4" role="contentinfo">
      {/* Status indicator */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span
          className={`status-dot ${isRecording ? 'status-dot-error' : status === 'ready' ? 'status-dot-success' : 'status-dot-info'}`}
          aria-hidden="true"
        />
        <span className="text-xs" style={{ color: statusColor }} aria-live="polite" aria-label={`Sprach-Status: ${STATUS_LABELS[status]}`}>
          {STATUS_LABELS[status]}
        </span>
      </div>

      {/* Push to Talk button */}
      <button
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
        onTouchStart={startRecording}
        onTouchEnd={stopRecording}
        disabled={status === 'processing' || status === 'speaking' || status === 'connecting'}
        className={`
          flex items-center justify-center w-9 h-9 rounded-full transition-all flex-shrink-0
          disabled:opacity-40 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-base)]
          ${isRecording
            ? 'bg-red-500 focus:ring-red-500 scale-110'
            : 'bg-[var(--accent-primary)]/20 border border-[var(--accent-primary)]/30 hover:bg-[var(--accent-primary)]/30 focus:ring-[var(--accent-primary)]'
          }
        `}
        aria-label={isRecording ? 'Aufnahme stoppen' : 'Spracheingabe starten (oder Leertaste halten)'}
        aria-pressed={isRecording}
      >
        {isRecording ? (
          <MicOff className="w-4 h-4 text-white" aria-hidden="true" />
        ) : (
          <Mic className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} aria-hidden="true" />
        )}
      </button>

      {/* Waveform canvas */}
      <canvas
        ref={canvasRef}
        width={128}
        height={32}
        className={`rounded transition-opacity ${waveActive ? 'opacity-100' : 'opacity-20'}`}
        aria-hidden="true"
      />

      {/* Transcript */}
      {transcript && (
        <p className="text-xs text-[var(--text-secondary)] flex-1 truncate italic" aria-live="polite">
          &ldquo;{transcript}&rdquo;
        </p>
      )}

      {/* Text fallback */}
      <form
        onSubmit={handleTextSubmit}
        className="flex items-center gap-2 flex-1 max-w-md ml-auto"
        aria-label="Text-Sprachassistent-Eingabe"
      >
        <label htmlFor="voice-text-input" className="sr-only">
          Sprachbefehl als Text eingeben
        </label>
        <input
          id="voice-text-input"
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Befehl eintippen..."
          className="flex-1 bg-white/5 border border-white/10 rounded text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] px-3 py-1.5 focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
        />
        <button
          type="submit"
          disabled={sending || !textInput.trim()}
          className="p-1.5 rounded bg-[var(--accent-primary)]/20 border border-[var(--accent-primary)]/30 text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:ring-offset-2 focus:ring-offset-[var(--bg-base)]"
          aria-label="Befehl senden"
        >
          <Send className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </form>
    </footer>
  );
}
