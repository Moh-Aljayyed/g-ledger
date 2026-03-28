"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

// Types
interface CartItem {
  productId: string;
  code: string;
  nameAr: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  vatRate: number;
  stock: number;
}

type PaymentMethod = "CASH" | "CARD" | "TRANSFER" | "CREDIT";

interface ReceiptData {
  receiptNumber: string;
  subtotal: number;
  totalVat: number;
  totalDiscount: number;
  grandTotal: number;
  amountPaid: number;
  changeAmount: number;
  paymentMethod: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    vatAmount: number;
    totalAmount: number;
  }[];
  createdAt: Date;
}

export default function POSPage() {
  const { data: session } = useSession();
  const currency = (session?.user as any)?.currency ?? "SAR";

  // State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showOpenShift, setShowOpenShift] = useState(false);
  const [showCloseShift, setShowCloseShift] = useState(false);
  const [openingBalance, setOpeningBalance] = useState<number>(0);
  const [shiftSummary, setShiftSummary] = useState<any>(null);
  const [showCustomerSelect, setShowCustomerSelect] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // tRPC queries
  const { data: products, isLoading: productsLoading } = trpc.pos.getProducts.useQuery();
  const { data: searchResults } = trpc.pos.searchProducts.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length >= 1 }
  );
  const { data: shiftStatus, refetch: refetchShift } = trpc.pos.getShiftStatus.useQuery();
  const { data: dailySummary, refetch: refetchSummary } = trpc.pos.getDailySummary.useQuery();
  const { data: customers } = trpc.pos.getCustomers.useQuery();

  // tRPC mutations
  const createSale = trpc.pos.createSale.useMutation({
    onSuccess: (data) => {
      setReceipt(data as any);
      setShowReceipt(true);
      setCart([]);
      setAmountPaid(0);
      setNotes("");
      setSelectedCustomerId("");
      setPaymentMethod("CASH");
      refetchShift();
      refetchSummary();
    },
    onError: (err) => {
      alert(err.message);
    },
  });

  const openShiftMutation = trpc.pos.openShift.useMutation({
    onSuccess: () => {
      setShowOpenShift(false);
      setOpeningBalance(0);
      refetchShift();
    },
    onError: (err) => alert(err.message),
  });

  const closeShiftMutation = trpc.pos.closeShift.useMutation({
    onSuccess: (data) => {
      setShiftSummary(data);
      refetchShift();
    },
    onError: (err) => alert(err.message),
  });

  // Extract categories from products
  const categories = ["الكل", ...(
    Array.from(new Set((products ?? []).map((p: any) => p.category).filter(Boolean))) as string[]
  )];

  // Filter products
  const displayProducts = searchQuery.length >= 1
    ? (searchResults ?? [])
    : (products ?? []).filter((p: any) =>
        activeCategory === "الكل" ? true : p.category === activeCategory
      );

  // Cart calculations
  const subtotal = cart.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice - item.discount,
    0
  );
  const totalVat = cart.reduce((sum, item) => {
    const net = item.quantity * item.unitPrice - item.discount;
    return sum + net * (item.vatRate / 100);
  }, 0);
  const totalDiscount = cart.reduce((sum, item) => sum + item.discount, 0);
  const grandTotal = subtotal + totalVat;
  const changeAmount = paymentMethod === "CASH" ? Math.max(0, amountPaid - grandTotal) : 0;

  // Add product to cart
  const addToCart = useCallback(
    (product: any) => {
      setCart((prev) => {
        const existing = prev.find((item) => item.productId === product.id);
        if (existing) {
          if (existing.quantity >= product.currentStock) return prev;
          return prev.map((item) =>
            item.productId === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [
          ...prev,
          {
            productId: product.id,
            code: product.code,
            nameAr: product.nameAr,
            quantity: 1,
            unitPrice: product.sellingPrice,
            discount: 0,
            vatRate: product.vatRate,
            stock: product.currentStock,
          },
        ];
      });
    },
    []
  );

  // Update quantity
  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId !== productId) return item;
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null as any;
          if (newQty > item.stock) return item;
          return { ...item, quantity: newQty };
        })
        .filter(Boolean)
    );
  };

  // Remove from cart
  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  // Complete sale
  const completeSale = () => {
    if (cart.length === 0) return;
    if (paymentMethod === "CASH" && amountPaid < grandTotal) {
      alert("المبلغ المدفوع أقل من الإجمالي");
      return;
    }
    if (paymentMethod === "CREDIT" && !selectedCustomerId) {
      alert("يرجى اختيار العميل للبيع الآجل");
      return;
    }

    createSale.mutate({
      items: cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
      })),
      paymentMethod,
      customerId: paymentMethod === "CREDIT" ? selectedCustomerId : undefined,
      amountPaid: paymentMethod === "CASH" ? amountPaid : grandTotal,
      notes: notes || undefined,
    });
  };

  // Auto-fill amountPaid when payment method changes
  useEffect(() => {
    if (paymentMethod !== "CASH") {
      setAmountPaid(grandTotal);
    }
  }, [paymentMethod, grandTotal]);

  // Show customer select when CREDIT is chosen
  useEffect(() => {
    setShowCustomerSelect(paymentMethod === "CREDIT");
  }, [paymentMethod]);

  // Start new sale
  const newSale = () => {
    setShowReceipt(false);
    setReceipt(null);
    setCart([]);
    setAmountPaid(0);
    setNotes("");
    setSelectedCustomerId("");
    setPaymentMethod("CASH");
    searchRef.current?.focus();
  };

  // Print receipt
  const printReceipt = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 select-none overflow-hidden flex flex-col" dir="rtl">
      {/* ============ HEADER ============ */}
      <header className="flex items-center justify-between px-4 py-3 text-white" style={{ background: "#021544" }}>
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold tracking-wide">G-Ledger POS</h1>
          <span className="text-xs text-white/50">|</span>
          <span className="text-xs text-white/60">نقطة البيع</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Shift status */}
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                shiftStatus?.isOpen ? "bg-green-400 animate-pulse" : "bg-red-400"
              }`}
            />
            <span className="text-xs">
              {shiftStatus?.isOpen
                ? `وردية مفتوحة (${shiftStatus.salesCount ?? 0} عملية)`
                : "لا توجد وردية"}
            </span>
          </div>

          {/* Daily summary badge */}
          {dailySummary && (
            <div className="hidden md:flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5">
              <span className="text-[10px] text-white/60">مبيعات اليوم:</span>
              <span className="text-xs font-bold text-green-300">
                {formatCurrency(dailySummary.totalSales, currency)}
              </span>
              <span className="text-[10px] text-white/40">({dailySummary.transactionsCount} عملية)</span>
            </div>
          )}

          {/* Shift buttons */}
          {!shiftStatus?.isOpen ? (
            <button
              onClick={() => setShowOpenShift(true)}
              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg text-xs font-medium transition-colors"
            >
              فتح وردية
            </button>
          ) : (
            <button
              onClick={() => setShowCloseShift(true)}
              className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 rounded-lg text-xs font-medium transition-colors"
            >
              إغلاق الوردية
            </button>
          )}

          <Link
            href="/ar/dashboard"
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs transition-colors"
          >
            لوحة التحكم
          </Link>
        </div>
      </header>

      {/* ============ MAIN CONTENT ============ */}
      <div className="flex-1 flex overflow-hidden">
        {/* ============ LEFT PANEL - PRODUCTS (60%) ============ */}
        <div className="w-[60%] flex flex-col border-l border-gray-200">
          {/* Search */}
          <div className="p-3 bg-white border-b border-gray-200">
            <div className="relative">
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                &#x1F50D;
              </span>
              <input
                ref={searchRef}
                type="text"
                placeholder="بحث بالاسم، الكود، أو الباركود..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-3 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 p-3 bg-white border-b border-gray-200 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setSearchQuery("");
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                style={{ minHeight: 44 }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product grid */}
          <div className="flex-1 overflow-y-auto p-3">
            {productsLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
              </div>
            ) : displayProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <span className="text-4xl mb-2">📦</span>
                <span>لا توجد منتجات</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {(displayProducts as any[]).map((product) => {
                  const inCart = cart.find((c) => c.productId === product.id);
                  return (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className={`relative bg-white border-2 rounded-xl p-3 text-right transition-all hover:shadow-md active:scale-[0.97] ${
                        inCart
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                      style={{ minHeight: 100 }}
                    >
                      {/* Stock badge */}
                      <span
                        className={`absolute top-2 left-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          product.currentStock <= 5
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {product.currentStock}
                      </span>

                      {/* Cart quantity badge */}
                      {inCart && (
                        <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                          {inCart.quantity}
                        </span>
                      )}

                      <div className="mt-4">
                        <div className="text-sm font-semibold text-gray-800 line-clamp-2 leading-tight">
                          {product.nameAr}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-1">{product.code}</div>
                      </div>
                      <div className="text-base font-bold text-blue-700 mt-2">
                        {formatCurrency(product.sellingPrice, currency)}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ============ RIGHT PANEL - CART (40%) ============ */}
        <div className="w-[40%] bg-white flex flex-col">
          {/* Cart header */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-800">السلة</h2>
              <span className="text-sm text-gray-500">
                {cart.length} {cart.length === 1 ? "صنف" : "أصناف"}
              </span>
            </div>
          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <span className="text-4xl mb-2">🛒</span>
                <span className="text-sm">السلة فارغة</span>
                <span className="text-xs mt-1">اضغط على المنتجات لإضافتها</span>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {cart.map((item) => {
                  const lineNet = item.quantity * item.unitPrice - item.discount;
                  const lineVat = lineNet * (item.vatRate / 100);
                  const lineTotal = lineNet + lineVat;
                  return (
                    <div key={item.productId} className="px-4 py-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-800 truncate">
                            {item.nameAr}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {formatCurrency(item.unitPrice, currency)} x {item.quantity}
                          </div>
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-bold text-gray-800">
                            {formatCurrency(lineTotal, currency)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateQuantity(item.productId, -1)}
                            className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-600 transition-colors"
                          >
                            -
                          </button>
                          <span className="w-10 text-center font-bold text-base">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, 1)}
                            className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-600 transition-colors"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="w-9 h-9 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cart footer / totals / payment */}
          <div className="border-t border-gray-200 bg-gray-50">
            {/* Totals */}
            <div className="px-4 py-3 space-y-1.5">
              <div className="flex justify-between text-sm text-gray-600">
                <span>المجموع الفرعي</span>
                <span>{formatCurrency(subtotal, currency)}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-sm text-orange-600">
                  <span>الخصم</span>
                  <span>-{formatCurrency(totalDiscount, currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-gray-600">
                <span>ض.ق.م</span>
                <span>{formatCurrency(totalVat, currency)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-lg font-bold text-gray-800">الإجمالي</span>
                <span className="text-2xl md:text-3xl font-extrabold text-blue-700">
                  {formatCurrency(grandTotal, currency)}
                </span>
              </div>
            </div>

            {/* Payment method */}
            <div className="px-4 pb-3">
              <div className="grid grid-cols-4 gap-2 mb-3">
                <button
                  onClick={() => setPaymentMethod("CASH")}
                  className={`py-2.5 rounded-lg text-xs font-bold transition-all ${
                    paymentMethod === "CASH"
                      ? "bg-green-600 text-white ring-2 ring-green-300"
                      : "bg-green-50 text-green-700 hover:bg-green-100"
                  }`}
                  style={{ minHeight: 44 }}
                >
                  <span className="block text-base mb-0.5">&#x1F4B5;</span>
                  نقدي
                </button>
                <button
                  onClick={() => setPaymentMethod("CARD")}
                  className={`py-2.5 rounded-lg text-xs font-bold transition-all ${
                    paymentMethod === "CARD"
                      ? "bg-blue-600 text-white ring-2 ring-blue-300"
                      : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                  }`}
                  style={{ minHeight: 44 }}
                >
                  <span className="block text-base mb-0.5">&#x1F4B3;</span>
                  بطاقة
                </button>
                <button
                  onClick={() => setPaymentMethod("TRANSFER")}
                  className={`py-2.5 rounded-lg text-xs font-bold transition-all ${
                    paymentMethod === "TRANSFER"
                      ? "bg-purple-600 text-white ring-2 ring-purple-300"
                      : "bg-purple-50 text-purple-700 hover:bg-purple-100"
                  }`}
                  style={{ minHeight: 44 }}
                >
                  <span className="block text-base mb-0.5">&#x1F3E6;</span>
                  تحويل
                </button>
                <button
                  onClick={() => setPaymentMethod("CREDIT")}
                  className={`py-2.5 rounded-lg text-xs font-bold transition-all ${
                    paymentMethod === "CREDIT"
                      ? "bg-orange-600 text-white ring-2 ring-orange-300"
                      : "bg-orange-50 text-orange-700 hover:bg-orange-100"
                  }`}
                  style={{ minHeight: 44 }}
                >
                  <span className="block text-base mb-0.5">&#x1F4CB;</span>
                  آجل
                </button>
              </div>

              {/* Customer select for credit */}
              {showCustomerSelect && (
                <div className="mb-3">
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full px-3 py-2.5 border border-orange-300 rounded-lg text-sm bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">-- اختر العميل --</option>
                    {(customers ?? []).map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.nameAr} {c.phone ? `(${c.phone})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Amount paid (for cash) */}
              {paymentMethod === "CASH" && (
                <div className="mb-3">
                  <label className="text-xs text-gray-500 mb-1 block">المبلغ المدفوع</label>
                  <input
                    type="number"
                    value={amountPaid || ""}
                    onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-lg font-bold text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={0}
                    step={0.01}
                  />
                  {amountPaid > grandTotal && grandTotal > 0 && (
                    <div className="flex justify-between mt-2 px-1">
                      <span className="text-sm font-medium text-green-700">الباقي:</span>
                      <span className="text-lg font-extrabold text-green-600">
                        {formatCurrency(changeAmount, currency)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              <input
                type="text"
                placeholder="ملاحظات (اختياري)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* Complete sale button */}
              <button
                onClick={completeSale}
                disabled={cart.length === 0 || createSale.isPending}
                className={`w-full py-4 rounded-xl text-lg font-extrabold transition-all ${
                  cart.length === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white active:scale-[0.98] shadow-lg shadow-green-600/30"
                }`}
                style={{ minHeight: 56 }}
              >
                {createSale.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                    جاري المعالجة...
                  </span>
                ) : (
                  `اتمام البيع - ${formatCurrency(grandTotal, currency)}`
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============ RECEIPT MODAL ============ */}
      {showReceipt && receipt && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" id="receipt-printable">
            <div className="p-6 text-center">
              {/* Receipt header */}
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-800">G-Ledger POS</h2>
                <p className="text-xs text-gray-400 mt-1">ايصال بيع</p>
              </div>

              <div className="border-t border-dashed border-gray-300 my-3" />

              <div className="text-right space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">رقم الإيصال:</span>
                  <span className="font-bold">{receipt.receiptNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">التاريخ:</span>
                  <span>{new Date(receipt.createdAt).toLocaleString("ar-SA")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">طريقة الدفع:</span>
                  <span>
                    {receipt.paymentMethod === "CASH"
                      ? "نقدي"
                      : receipt.paymentMethod === "CARD"
                      ? "بطاقة"
                      : receipt.paymentMethod === "TRANSFER"
                      ? "تحويل"
                      : "آجل"}
                  </span>
                </div>
              </div>

              <div className="border-t border-dashed border-gray-300 my-3" />

              {/* Items */}
              <div className="text-right">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-500 text-xs">
                      <th className="text-right py-1">الصنف</th>
                      <th className="text-center py-1">الكمية</th>
                      <th className="text-center py-1">السعر</th>
                      <th className="text-left py-1">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {receipt.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-1.5 text-right text-xs">{item.description}</td>
                        <td className="py-1.5 text-center">{item.quantity}</td>
                        <td className="py-1.5 text-center text-xs">
                          {formatCurrency(item.unitPrice, currency)}
                        </td>
                        <td className="py-1.5 text-left font-medium">
                          {formatCurrency(item.totalAmount, currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-dashed border-gray-300 my-3" />

              {/* Totals */}
              <div className="text-right space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">المجموع:</span>
                  <span>{formatCurrency(receipt.subtotal, currency)}</span>
                </div>
                {receipt.totalDiscount > 0 && (
                  <div className="flex justify-between text-orange-600">
                    <span>الخصم:</span>
                    <span>-{formatCurrency(receipt.totalDiscount, currency)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">ض.ق.م:</span>
                  <span>{formatCurrency(receipt.totalVat, currency)}</span>
                </div>
                <div className="flex justify-between text-lg font-extrabold pt-2 border-t border-gray-200">
                  <span>الإجمالي:</span>
                  <span className="text-blue-700">{formatCurrency(receipt.grandTotal, currency)}</span>
                </div>
                {receipt.paymentMethod === "CASH" && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-500">المدفوع:</span>
                      <span>{formatCurrency(receipt.amountPaid, currency)}</span>
                    </div>
                    {receipt.changeAmount > 0 && (
                      <div className="flex justify-between text-green-600 font-bold">
                        <span>الباقي:</span>
                        <span>{formatCurrency(receipt.changeAmount, currency)}</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="border-t border-dashed border-gray-300 my-4" />

              <p className="text-xs text-gray-400 mb-4">شكرا لزيارتكم</p>

              {/* Actions */}
              <div className="flex gap-3 print:hidden">
                <button
                  onClick={printReceipt}
                  className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
                  style={{ minHeight: 48 }}
                >
                  طباعة
                </button>
                <button
                  onClick={newSale}
                  className="flex-1 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition-colors"
                  style={{ minHeight: 48 }}
                >
                  بيع جديد
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ OPEN SHIFT MODAL ============ */}
      {showOpenShift && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">فتح وردية جديدة</h3>
            <div className="mb-4">
              <label className="text-sm text-gray-600 mb-1 block">رصيد الصندوق الافتتاحي</label>
              <input
                type="number"
                value={openingBalance || ""}
                onChange={(e) => setOpeningBalance(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-lg font-bold text-center focus:outline-none focus:ring-2 focus:ring-green-500"
                min={0}
                step={0.01}
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowOpenShift(false)}
                className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                style={{ minHeight: 48 }}
              >
                إلغاء
              </button>
              <button
                onClick={() => openShiftMutation.mutate({ openingBalance })}
                disabled={openShiftMutation.isPending}
                className="flex-1 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition-colors"
                style={{ minHeight: 48 }}
              >
                {openShiftMutation.isPending ? "جاري..." : "فتح الوردية"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ CLOSE SHIFT MODAL ============ */}
      {showCloseShift && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            {!shiftSummary ? (
              <>
                <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
                  إغلاق الوردية
                </h3>
                <p className="text-sm text-gray-500 text-center mb-6">
                  هل أنت متأكد من إغلاق الوردية الحالية؟
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCloseShift(false)}
                    className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                    style={{ minHeight: 48 }}
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={() => closeShiftMutation.mutate()}
                    disabled={closeShiftMutation.isPending}
                    className="flex-1 py-3 rounded-xl bg-orange-600 text-white font-bold hover:bg-orange-700 transition-colors"
                    style={{ minHeight: 48 }}
                  >
                    {closeShiftMutation.isPending ? "جاري..." : "إغلاق الوردية"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
                  ملخص الوردية
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">وقت الفتح:</span>
                    <span>{new Date(shiftSummary.openedAt).toLocaleString("ar-SA")}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">وقت الإغلاق:</span>
                    <span>{new Date(shiftSummary.closedAt).toLocaleString("ar-SA")}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">عدد العمليات:</span>
                    <span className="font-bold">{shiftSummary.transactionsCount}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">الرصيد الافتتاحي:</span>
                    <span>{formatCurrency(shiftSummary.openingBalance, currency)}</span>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">نقدي:</span>
                      <span className="font-medium text-green-700">
                        {formatCurrency(shiftSummary.totalCash, currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">بطاقة:</span>
                      <span className="font-medium text-blue-700">
                        {formatCurrency(shiftSummary.totalCard, currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">تحويل:</span>
                      <span className="font-medium text-purple-700">
                        {formatCurrency(shiftSummary.totalTransfer, currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">آجل:</span>
                      <span className="font-medium text-orange-700">
                        {formatCurrency(shiftSummary.totalCredit, currency)}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <span className="font-bold text-gray-800">إجمالي المبيعات:</span>
                    <span className="text-xl font-extrabold text-blue-700">
                      {formatCurrency(shiftSummary.totalSales, currency)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-800">الرصيد النقدي المتوقع:</span>
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(shiftSummary.expectedCashBalance, currency)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShiftSummary(null);
                    setShowCloseShift(false);
                  }}
                  className="w-full mt-4 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
                  style={{ minHeight: 48 }}
                >
                  تم
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ============ PRINT STYLES ============ */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt-printable,
          #receipt-printable * {
            visibility: visible;
          }
          #receipt-printable {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
            margin: 0;
            padding: 10mm;
            border-radius: 0;
            box-shadow: none;
          }
        }
      `}</style>
    </div>
  );
}
