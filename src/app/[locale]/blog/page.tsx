import Link from "next/link";
import { LogoFull } from "@/components/logo";
import { getPublishedPosts } from "@/config/blog-posts";

export default function BlogPage() {
  const posts = getPublishedPosts();

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border/50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/ar">
            <LogoFull size="sm" variant="dark" />
          </Link>
          <Link
            href="/ar/register"
            className="px-5 py-2 text-sm font-semibold bg-[#0070F2] text-white rounded-lg hover:bg-[#005ed4]"
          >
            ابدأ مجاناً
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-[#021544] mb-2">مدونة G-Ledger</h1>
        <p className="text-muted-foreground mb-10">
          أخبار محاسبية، نصائح مالية، وتحديثات النظام
        </p>

        <div className="space-y-6">
          {posts.map((post) => (
            <article
              key={post.id}
              id={`post-${post.id}`}
              className="bg-white rounded-xl border border-border/50 p-6 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#0070F2]/10 text-[#0070F2]">
                  {post.category}
                </span>
                <span className="text-xs text-muted-foreground">{post.date}</span>
              </div>
              <h2 className="text-xl font-bold text-[#021544] mb-2">{post.title}</h2>
              <p className="text-sm text-muted-foreground mb-3">{post.excerpt}</p>
              <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                {post.content}
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
