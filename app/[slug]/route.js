import originalPages from "../data/original-pages.json";

export const dynamic = "force-static";

export async function GET(_request, { params }) {
  const { slug } = await params;

  if (slug === "medicalfamilyoffice") {
    return new Response(null, { status: 307, headers: { Location: "/" } });
  }

  const html = originalPages[slug];
  if (!html) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
