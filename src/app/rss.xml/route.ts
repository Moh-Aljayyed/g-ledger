import { getPublishedPosts } from "@/config/blog-posts";

export async function GET() {
  const posts = getPublishedPosts();

  const rssItems = posts
    .map(
      (post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <description>${escapeXml(post.excerpt)}</description>
      <content:encoded><![CDATA[${post.content.replace(/\n/g, "<br/>")}<br/><br/><a href="https://g-ledger.com/ar/register">ابدأ مجاناً — g-ledger.com</a>]]></content:encoded>
      <link>https://g-ledger.com/ar/blog#post-${post.id}</link>
      <guid>https://g-ledger.com/blog/${post.id}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <category>${post.category}</category>
    </item>
  `
    )
    .join("");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>G-Ledger — حساب الأستاذ</title>
    <link>https://g-ledger.com</link>
    <description>أخبار محاسبية، نصائح مالية، وتحديثات النظام — G-Ledger</description>
    <language>ar</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="https://g-ledger.com/rss.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>https://g-ledger.com/logo.svg</url>
      <title>G-Ledger</title>
      <link>https://g-ledger.com</link>
    </image>
    ${rssItems}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
