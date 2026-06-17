import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQ_ITEMS } from "@/lib/config";

export function FAQAccordion() {
  return (
    <section id="faq" className="w-full bg-background">
      <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
        <div className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Häufige Fragen
          </h2>
          <p className="mt-3 text-muted-foreground">
            Antworten zu Recht, Ablauf und Daten.
          </p>
        </div>
        <Accordion className="mt-10">
          {FAQ_ITEMS.map((item, idx) => (
            <AccordionItem key={item.q} value={`faq-${idx}`}>
              <AccordionTrigger>{item.q}</AccordionTrigger>
              <AccordionContent>
                <p>{item.a}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
