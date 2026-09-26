import localFont from "next/font/local";
import Script from "next/script";
import { comparisonBootGuard } from "./ui/comparison-scroll-boot";
import "./globals.css";

const editorPreloadScript = String.raw`
(() => {
  try {
    const draftKey = "es-clinic-next-document-v1";
    const fixedKey = "es-clinic-next-fixed-layout-v1";
    const raw = localStorage.getItem(fixedKey) || localStorage.getItem(draftKey);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    const changes = parsed && parsed.changes ? parsed.changes : parsed;
    if (!changes || typeof changes !== "object" || Array.isArray(changes)) return;
    if (changes["node-1-4-1"] && !changes["video-card"])
      changes["video-card"] = changes["node-1-4-1"];
    const rules = [];
    for (const [id, value] of Object.entries(changes)) {
      if (!/^[a-z][a-z0-9-]{0,100}$/.test(id) || !value || typeof value !== "object") continue;
      const declarations = [];
      const layout = value.layout;
      if (layout && typeof layout === "object") {
        const number = (key, fallback, min, max) => {
          const current = Number(layout[key]);
          return Number.isFinite(current) ? Math.max(min, Math.min(max, current)) : fallback;
        };
        const x = number("x", 0, -50000, 50000);
        const y = number("y", 0, -50000, 50000);
        const scale = number("scale", 100, 10, 300);
        declarations.push("translate:" + x + "px " + y + "px", "scale:" + scale / 100);
        const width = number("width", 0, 0, 2400);
        const height = number("height", 0, 0, 2400);
        if (width) declarations.push("width:" + width + "px!important", "max-width:none!important");
        if (height) declarations.push("height:" + height + "px!important", "min-height:0!important");
      }
      const fontSize = value.style && value.style.fontSize;
      if (typeof fontSize === "string" && /^\d+(?:\.\d+)?px$/.test(fontSize))
        declarations.push("font-size:" + fontSize + "!important");
      if (!declarations.length) continue;
      const selector = '[data-layout-id="' + id + '"],[data-edit-id="' + id + '"]';
      rules.push(selector + "{" + declarations.join(";") + "}");
    }
    if (!rules.length) return;
    const style = document.createElement("style");
    style.id = "editor-fixed-layout";
    style.textContent = rules.join("\n");
    document.head.appendChild(style);
  } catch {}
})();`;
const aeroport = localFont({
  src: "./aeroport.woff",
  display: "swap",
  variable: "--font-aeroport",
});
const germes = localFont({
  src: [
    { path: "./fonts/Germes_Light.otf", weight: "300" },
    { path: "./fonts/Germes_Regular.otf", weight: "400" },
    { path: "./fonts/Germes_Bold.otf", weight: "700" },
  ],
  display: "swap",
  variable: "--font-germes",
});
export const metadata = {
  title: "ЕС Клиника – Медицинский Family Office",
  description:
    "Единая система управления здоровьем семьи. Постоянная медицинская команда ЕС Клиники.",
  robots: { index: false, follow: false },
  icons: { icon: "/clinic-favicon.ico", shortcut: "/clinic-favicon.ico" },
};
export default function RootLayout({ children }) {
  return (
    <html lang="ru" className={`${aeroport.variable} ${germes.variable}`}>
      <head>
        <link rel="preload" as="image" href="/assets/original-first-screen/hero.webp" fetchPriority="high" />
        <Script
          id="editor-fixed-layout-preload"
          strategy="beforeInteractive"
        >
          {editorPreloadScript}
        </Script>
      </head>
      <body>
        <Script id="comparison-scroll-boot" strategy="beforeInteractive">{comparisonBootGuard}</Script>
        {children}
      </body>
    </html>
  );
}
