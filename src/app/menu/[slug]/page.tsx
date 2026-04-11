"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { trpc } from "@/lib/trpc";

/**
 * Public QR menu page — accessed via /menu/[tenant-slug].
 * Customers scan a QR code on their table and see the full menu on
 * their phone. Browse-only for now — no login, no cart submission.
 * Mobile-first design.
 */
export default function PublicMenuPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug || "";
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const { data, isLoading, error } = trpc.restaurant.publicMenuByTenantSlug.useQuery(
    { slug },
    { enabled: !!slug, retry: 1 },
  );

  const filteredCategories = useMemo(() => {
    if (!data?.categories) return [];
    if (!search) {
      return activeCategory
        ? data.categories.filter((c) => c.name === activeCategory)
        : data.categories;
    }
    const q = search.toLowerCase();
    return data.categories
      .map((c) => ({
        ...c,
        items: c.items.filter(
          (i: any) =>
            i.nameAr?.toLowerCase().includes(q) ||
            i.nameEn?.toLowerCase().includes(q) ||
            i.description?.toLowerCase().includes(q),
        ),
      }))
      .filter((c) => c.items.length > 0);
  }, [data, activeCategory, search]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-[#0070F2] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <div className="text-center">
          <div className="text-5xl mb-4">😕</div>
          <h1 className="text-xl font-bold text-[#021544] mb-2">القائمة غير موجودة</h1>
          <p className="text-sm text-muted-foreground">Menu not found</p>
        </div>
      </div>
    );
  }

  const primaryColor = data.tenant.documentColor || "#021544";
  const currencySymbol =
    data.tenant.currency === "EGP" ? "ج.م" :
    data.tenant.currency === "SAR" ? "ر.س" :
    data.tenant.currency === "AED" ? "د.إ" :
    data.tenant.currency === "USD" ? "$" : data.tenant.currency;

  return (
    <div className="min-h-screen bg-[#fafbfc]" dir="rtl">
      {/* Hero with tenant branding */}
      <header
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
        }}
      >
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "20px 20px"
        }} />
        <div className="relative max-w-2xl mx-auto px-6 py-8 text-center text-white">
          {data.tenant.logoUrl && (
            <img
              src={data.tenant.logoUrl}
              alt={data.tenant.name}
              className="w-20 h-20 rounded-2xl mx-auto mb-3 shadow-xl bg-white/10"
            />
          )}
          <h1 className="text-2xl font-bold mb-1">{data.tenant.name}</h1>
          <p className="text-sm text-white/70">القائمة الرقمية</p>
        </div>
      </header>

      {/* Search */}
      <div className="sticky top-0 z-10 bg-white border-b border-border shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن صنف..."
            className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-[#0070F2]/20"
          />
        </div>

        {/* Category tabs */}
        {!search && data.categories.length > 1 && (
          <div className="max-w-2xl mx-auto px-4 pb-3 flex gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === null
                  ? "text-white shadow-md"
                  : "bg-muted/50 text-muted-foreground"
              }`}
              style={activeCategory === null ? { backgroundColor: primaryColor } : {}}
            >
              الكل
            </button>
            {data.categories.map((c) => (
              <button
                key={c.name}
                onClick={() => setActiveCategory(c.name)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  activeCategory === c.name
                    ? "text-white shadow-md"
                    : "bg-muted/50 text-muted-foreground"
                }`}
                style={activeCategory === c.name ? { backgroundColor: primaryColor } : {}}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Menu content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            لا توجد أصناف تطابق بحثك
          </div>
        ) : (
          <div className="space-y-8">
            {filteredCategories.map((cat) => (
              <section key={cat.name}>
                <h2
                  className="text-lg font-bold mb-3 px-2 py-1 inline-block rounded-lg"
                  style={{ color: primaryColor }}
                >
                  {cat.name}
                </h2>
                <div className="space-y-3">
                  {cat.items.map((item: any) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-border p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-[#021544] text-base">
                            {item.nameAr}
                          </h3>
                          {item.nameEn && (
                            <div className="text-xs text-muted-foreground mt-0.5" dir="ltr">
                              {item.nameEn}
                            </div>
                          )}
                          {item.description && (
                            <p className="text-xs text-muted-foreground mt-2 leading-relaxed line-clamp-2">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <div
                          className="font-mono font-bold text-lg whitespace-nowrap"
                          style={{ color: primaryColor }}
                        >
                          {Number(item.sellingPrice).toFixed(2)}
                          <span className="text-xs font-normal text-muted-foreground mr-1">
                            {currencySymbol}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Footer branding */}
        <footer className="mt-12 pt-8 pb-6 text-center border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            القائمة الرقمية مقدمة من
          </p>
          <a
            href="https://g-ledger.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-bold text-[#0070F2] mt-1 inline-block"
          >
            G-Ledger
          </a>
        </footer>
      </main>
    </div>
  );
}
