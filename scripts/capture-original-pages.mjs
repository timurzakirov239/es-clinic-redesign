import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const routes = [
  "vrachi",
  "doctor-tishina", "doctor-frolov", "doctor-utin", "doctor-sorokin", "doctor-maksakov",
  "doctor-stolov", "doctor-kochetkova", "doctor-vershok", "doctor-shishova", "doctor-ignateva",
  "doctor-kolosova", "doctor-volkova", "doctor-shubina",
  "career", "partners", "legal", "consent-data", "privacy", "payment", "consent-ads", "contacts", "parents",
];
const documents = JSON.parse(await readFile("app/data/linked-page-documents.json", "utf8"));
const pages = {};

function localPath(rawUrl) {
  let url;
  try { url = new URL(rawUrl); } catch { return null; }
  if (url.hostname !== "es-clinic.ru" && url.hostname !== "www.es-clinic.ru") return documents[rawUrl] || null;
  if (url.pathname === "/medicalfamilyoffice") return "/";
  if (url.pathname === "/") return `/${url.hash || ""}`;
  if (url.pathname === "/values") return `/#responsibility${url.search}${url.hash}`;
  if (url.pathname === "/forwhom") return `/#comparison${url.search}${url.hash}`;
  return `${url.pathname}${url.search}${url.hash}`;
}

for (const slug of routes) {
  const response = await fetch(`https://es-clinic.ru/${slug}`, { redirect: "follow" });
  if (!response.ok) throw new Error(`Could not capture /${slug}: HTTP ${response.status}`);
  let html = await response.text();
  html = html.replace(/\b(href|action|formaction)=(['"])(https?:\/\/[^'"]+)\2/gi, (match, attr, quote, value) => {
    const local = localPath(value);
    return local ? `${attr}=${quote}${local}${quote}` : match;
  });
  html = html.replace(/<meta\s+name=["']robots["'][^>]*>/i, '<meta name="robots" content="noindex,nofollow">');
  if (!/<meta\s+name=["']robots["']/i.test(html)) html = html.replace("</head>", '<meta name="robots" content="noindex,nofollow"></head>');
  pages[slug] = html;
  console.log(`Captured /${slug}: ${html.length.toLocaleString()} chars`);
}

await writeFile("app/data/original-pages.json", JSON.stringify(pages));
const sourceHosts = new Set();
for (const html of Object.values(pages)) {
  for (const match of html.matchAll(/<(?:script|link)[^>]+(?:src|href)=["'](https?:\/\/[^"']+)/gi)) {
    try { sourceHosts.add(new URL(match[1]).hostname); } catch {}
  }
}
console.log(`Saved ${routes.length} exact pages. Resource hosts: ${[...sourceHosts].sort().join(", ")}`);
