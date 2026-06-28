import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["app/**/*.{ts,tsx,js,jsx}", "components/**/*.{ts,tsx,js,jsx}", "lib/**/*.{ts,tsx,js,jsx}"],
    rules: {
      // Umlaut-Lint: Verbiete ASCII-Ersatz fuer Umlaute in deutschen Texten.
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "Literal[value=/Pruef|Staerk|Loes|Maen|Bus[gks]eld|Auswaehl|fuehl/]",
          message:
            "Umlaut-Lint: Bitte echte Umlaute (ä/ö/ü/ß) nutzen statt ae/oe/ue/ss.",
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
