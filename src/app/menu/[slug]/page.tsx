"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { trpc } from "@/lib/trpc";

/**
 * Public QR menu page — accessed via /menu/[tenant-slug]?t=TABLE_NAME.
 * Customers scan the QR on their table, browse the full menu, build a
 * cart, and submit an order. The order lands in G-Ledger as a Tab in
 * PENDING_CONFIRM status so the cashier reviews it before it flows to
 * the kitchen.
 */

type CartItem = {
  productId: string;
  nameAr: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
};

export default function PublicMenuPage() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const slug = params?.slug || "";
  const tableParam = searchParams?.get("t") || "";

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [tableName, setTableName] = useState(tableParam);
  const [submittedTabNumber, setSubmittedTabNumber] = useState<number | null>(null);

  // Persist cart across page loads (important on mobile)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`gl_cart_${slug}`);
      if (stored) setCart(JSON.parse(stored));
    } catch {}
  }, [slug]);
  useEffect(() => {
    try {
      localStorage.setItem(`gl_cart_${slug}`, JSON.stringify(cart));
    } catch {}
  }, [cart, slug]);

  const { data, isLoading, error } = trpc.restaurant.publicMenuByTenantSlug.useQuery(
    { slug },
    { enabled: !!slug, retry: 1 },
  );

  const submitOrder = trpc.restaurant.publicSubmitOrder.useMutation({
    onSuccess: (res) => {
      setSubmittedTabNumber(res.tabNumber);
      setCart([]);
      setCartOpen(false);
      setShowCheckout(false);
      try {
        localStorage.removeItem(`gl_cart_${slug}`);
      } catch {}
    },
  });

  const cartTotal = useMemo(
    () => cart.reduce((s, i) => s + i.unitPrice * i.quantity, 0),
    [cart],
  );
  const cartCount = useMemo(
    () => cart.reduce((s, i) => s + i.quantity, 0),
    [cart],
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

  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          nameAr: product.nameAr,
          quantity: 1,
          unitPrice: Number(product.sellingPrice),
        },
      ];
    });
  };

  const changeQty = (productId: string, delta: number) => {
    setCart((prev) => {
      const next = prev
        .map((i) =>
          i.productId === productId ? { ...i, quantity: i.quantity + delta } : i,
        )
        .filter((i) => i.quantity > 0);
      return next;
    });
  };

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

  // ============ SUCCESS SCREEN ============
  if (submittedTabNumber) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-6" dir="rtl">
        <div className="max-w-sm w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-green-500 flex items-center justify-center text-white text-4xl mb-4">
            ✓
          </div>
          <h1 className="text-2xl font-bold text-[#021544] mb-2">تم استلام طلبك!</h1>
          <p className="text-sm text-muted-foreground mb-6">
            النادل هيراجع الطلب ويبعته للمطبخ خلال لحظات
          </p>
          <div className="bg-muted/30 rounded-xl p-4 mb-6">
            <div className="text-xs text-muted-foreground">رقم طلبك</div>
            <div className="text-4xl font-bold text-[#0070F2] font-mono">
              #{submittedTabNumber}
            </div>
          </div>
          <button
            onClick={() => setSubmittedTabNumber(null)}
            className="w-full py-3 bg-[#0070F2] text-white rounded-xl font-semibold text-sm"
          >
            طلب إضافي
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafbfc] pb-24" dir="rtl">
      {/* Hero with tenant branding */}
      <header
        className="relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` }}
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
          {tableName && (
            <div className="mt-3 inline-block px-3 py-1 rounded-full bg-white/15 text-xs font-semibold">
              🪑 طاولة {tableName}
            </div>
          )}
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

        {!search && data.categories.length > 1 && (
          <div className="max-w-2xl mx-auto px-4 pb-3 flex gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === null ? "text-white shadow-md" : "bg-muted/50 text-muted-foreground"
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
                  activeCategory === c.name ? "text-white shadow-md" : "bg-muted/50 text-muted-foreground"
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
                <h2 className="text-lg font-bold mb-3 px-2 py-1 inline-block rounded-lg" style={{ color: primaryColor }}>
                  {cat.name}
                </h2>
                <div className="space-y-3">
                  {cat.items.map((item: any) => {
                    const inCart = cart.find((c) => c.productId === item.id);
                    return (
                      <div
                        key={item.id}
                        className="bg-white rounded-2xl border border-border p-4 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-[#021544] text-base">{item.nameAr}</h3>
                            {item.nameEn && (
                              <div className="text-xs text-muted-foreground mt-0.5" dir="ltr">{item.nameEn}</div>
                            )}
                            {item.description && (
                              <p className="text-xs text-muted-foreground mt-2 leading-relaxed line-clamp-2">
                                {item.description}
                              </p>
                            )}
                          </div>
                          <div className="font-mono font-bold text-lg whitespace-nowrap" style={{ color: primaryColor }}>
                            {Number(item.sellingPrice).toFixed(2)}
                            <span className="text-xs font-normal text-muted-foreground mr-1">{currencySymbol}</span>
                          </div>
                        </div>
                        {inCart ? (
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => changeQty(item.id, -1)}
                              className="w-8 h-8 rounded-full bg-red-100 text-red-600 font-bold"
                            >
                              −
                            </button>
                            <span className="font-bold text-base w-8 text-center">{inCart.quantity}</span>
                            <button
                              onClick={() => changeQty(item.id, 1)}
                              className="w-8 h-8 rounded-full bg-green-100 text-green-600 font-bold"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(item)}
                            className="w-full py-2 rounded-lg text-white text-sm font-semibold"
                            style={{ backgroundColor: primaryColor }}
                          >
                            + إضافة للسلة
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}

        <footer className="mt-12 pt-8 pb-6 text-center border-t border-border/50">
          <p className="text-xs text-muted-foreground">القائمة الرقمية مقدمة من</p>
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

      {/* Floating cart button */}
      {cart.length > 0 && !cartOpen && !showCheckout && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-4 left-4 right-4 max-w-2xl mx-auto py-4 rounded-2xl text-white font-bold text-base shadow-2xl flex items-center justify-between px-5 z-20"
          style={{ backgroundColor: primaryColor }}
        >
          <span className="flex items-center gap-2">
            🛒 <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">{cartCount}</span>
          </span>
          <span>عرض الطلب</span>
          <span className="font-mono">
            {cartTotal.toFixed(2)} {currencySymbol}
          </span>
        </button>
      )}

      {/* Cart drawer */}
      {cartOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 flex items-end" onClick={() => setCartOpen(false)}>
          <div
            className="bg-white rounded-t-3xl w-full max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#021544]">طلبك</h2>
              <button onClick={() => setCartOpen(false)} className="text-muted-foreground">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {cart.map((item) => (
                <div key={item.productId} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{item.nameAr}</div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {item.quantity} × {item.unitPrice.toFixed(2)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => changeQty(item.productId, -1)}
                      className="w-7 h-7 rounded-full bg-red-100 text-red-600 font-bold text-sm"
                    >
                      −
                    </button>
                    <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                    <button
                      onClick={() => changeQty(item.productId, 1)}
                      className="w-7 h-7 rounded-full bg-green-100 text-green-600 font-bold text-sm"
                    >
                      +
                    </button>
                  </div>
                  <div className="w-16 text-end font-mono font-bold text-sm">
                    {(item.quantity * item.unitPrice).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-5 border-t border-border">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold">الإجمالي</span>
                <span className="font-mono font-bold text-xl" style={{ color: primaryColor }}>
                  {cartTotal.toFixed(2)} {currencySymbol}
                </span>
              </div>
              <button
                onClick={() => {
                  setCartOpen(false);
                  setShowCheckout(true);
                }}
                className="w-full py-3.5 rounded-xl text-white font-bold text-sm"
                style={{ backgroundColor: primaryColor }}
              >
                إرسال الطلب
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout dialog */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-end" onClick={() => setShowCheckout(false)}>
          <div
            className="bg-white rounded-t-3xl w-full p-5 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-[#021544] mb-1">إرسال الطلب</h2>
            <p className="text-xs text-muted-foreground mb-4">
              الفريق هيراجع الطلب ويبعته للمطبخ
            </p>

            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-xs font-semibold text-[#021544] mb-1.5">
                  رقم الطاولة {tableParam ? "✓" : "(اختياري)"}
                </label>
                <input
                  type="text"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  placeholder="مثال: T1"
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#021544] mb-1.5">الاسم (اختياري)</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#021544] mb-1.5">رقم الهاتف (اختياري)</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  dir="ltr"
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm outline-none"
                />
              </div>
            </div>

            {submitOrder.error && (
              <div className="mb-3 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                {submitOrder.error.message}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setShowCheckout(false)}
                className="flex-1 py-3 rounded-xl border border-border text-sm font-semibold"
              >
                رجوع
              </button>
              <button
                onClick={() =>
                  submitOrder.mutate({
                    slug,
                    tableName: tableName || undefined,
                    customerName: customerName || undefined,
                    customerPhone: customerPhone || undefined,
                    items: cart.map((i) => ({
                      productId: i.productId,
                      quantity: i.quantity,
                      notes: i.notes,
                    })),
                  })
                }
                disabled={submitOrder.isPending || cart.length === 0}
                className="flex-1 py-3 rounded-xl text-white text-sm font-bold disabled:opacity-50"
                style={{ backgroundColor: primaryColor }}
              >
                {submitOrder.isPending ? "جاري الإرسال..." : "تأكيد وإرسال"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
