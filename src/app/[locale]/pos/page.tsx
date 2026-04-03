"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

// ============ TYPES ============
interface CartItem {
  productId: string;
  code: string;
  nameAr: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  discountType: "fixed" | "percent";
  vatRate: number;
  stock: number;
}

type PaymentMethod = "CASH" | "CARD" | "TRANSFER" | "CREDIT";

interface SplitPayment {
  cash: number;
  card: number;
}

interface HeldOrder {
  id: string;
  customerName: string;
  cart: CartItem[];
  notes: string;
  customerId: string;
  heldAt: string;
}

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

// ============ COMPONENT ============
export default function POSPage() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isRTL = pathname?.startsWith("/ar");
  const locale = isRTL ? "/ar" : "/en";
  const currency = (session?.user as any)?.currency ?? "SAR";
  const cashierName = (session?.user as any)?.name ?? "كاشير";
  const storeName = (session?.user as any)?.tenantName ?? "G-Ledger POS";

  // Check subscription — POS is Enterprise only
  const { data: usage } = trpc.subscription.getUsage.useQuery();
  const isPOSAllowed = usage?.plan === "BASIC" || usage?.plan === "PROFESSIONAL" || usage?.plan === "ENTERPRISE" || usage?.plan === "FREE_TRIAL";
  // Enterprise-only features
  const isEnterprise = usage?.plan === "ENTERPRISE";

  // If not subscribed at all (blocked), show upgrade message
  if (usage && usage.isBlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#1a1a2e" }}>
        <div className="text-center text-white max-w-md p-8">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold mb-2">{isRTL ? "نقاط البيع — باقة مؤسسي" : "POS — Enterprise Plan"}</h1>
          <p className="text-white/60 mb-6">{isRTL ? "نظام نقاط البيع الاحترافي متاح حصرياً للباقة المؤسسية. قم بالترقية للوصول لكل المميزات المتقدمة." : "The professional POS system is exclusively available on the Enterprise plan. Upgrade to access all advanced features."}</p>
          <div className="space-y-3">
            <Link href={`${locale}/settings`} className="block w-full py-3 bg-[#0070F2] text-white rounded-xl font-bold hover:bg-[#005ed4] transition-all">
              {isRTL ? "ترقية الآن" : "Upgrade Now"}
            </Link>
            <Link href={`${locale}/dashboard`} className="block w-full py-3 border border-white/20 text-white/60 rounded-xl hover:bg-white/5 transition-all">
              {isRTL ? "العودة للداشبورد" : "Back to Dashboard"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ---- State ----
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showOpenShift, setShowOpenShift] = useState(false);
  const [showCloseShift, setShowCloseShift] = useState(false);
  const [openingBalance, setOpeningBalance] = useState<number>(0);
  const [actualCash, setActualCash] = useState<number>(0);
  const [shiftSummary, setShiftSummary] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [heldOrders, setHeldOrders] = useState<HeldOrder[]>([]);
  const [showHeldOrders, setShowHeldOrders] = useState(false);
  const [splitPayment, setSplitPayment] = useState(false);
  const [splitAmounts, setSplitAmounts] = useState<SplitPayment>({ cash: 0, card: 0 });
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<ReceiptData | null>(null);
  const [overallDiscount, setOverallDiscount] = useState<number>(0);
  const [overallDiscountType, setOverallDiscountType] = useState<"fixed" | "percent">("percent");
  const [showOverallDiscount, setShowOverallDiscount] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const customerSearchRef = useRef<HTMLInputElement>(null);

  // ---- tRPC queries ----
  const { data: products, isLoading: productsLoading } = trpc.pos.getProducts.useQuery();
  const { data: searchResults } = trpc.pos.searchProducts.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length >= 1 }
  );
  const { data: shiftStatus, refetch: refetchShift } = trpc.pos.getShiftStatus.useQuery();
  const { data: dailySummary, refetch: refetchSummary } = trpc.pos.getDailySummary.useQuery();
  const { data: customers } = trpc.pos.getCustomers.useQuery();

  // ---- tRPC mutations ----
  const createSale = trpc.pos.createSale.useMutation({
    onSuccess: (data) => {
      const receiptData = data as any as ReceiptData;
      setReceipt(receiptData);
      setLastReceipt(receiptData);
      setShowReceipt(true);
      setCart([]);
      setAmountPaid(0);
      setNotes("");
      setSelectedCustomerId("");
      setCustomerSearch("");
      setPaymentMethod("CASH");
      setSplitPayment(false);
      setSplitAmounts({ cash: 0, card: 0 });
      setOverallDiscount(0);
      setOverallDiscountType("percent");
      refetchShift();
      refetchSummary();
      // Sound effect
      try { new Audio("/cha-ching.wav").play().catch(() => {}); } catch {}
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

  // ---- Live clock ----
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ---- Online/Offline detection ----
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    setIsOnline(navigator.onLine);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // ---- Load held orders from localStorage ----
  useEffect(() => {
    try {
      const stored = localStorage.getItem("pos-held-orders");
      if (stored) setHeldOrders(JSON.parse(stored));
    } catch {}
  }, []);

  // ---- Save held orders to localStorage ----
  useEffect(() => {
    try {
      localStorage.setItem("pos-held-orders", JSON.stringify(heldOrders));
    } catch {}
  }, [heldOrders]);

  // ---- Keyboard shortcuts ----
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      const tag = (e.target as HTMLElement)?.tagName;
      const isInput = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";

      if (e.key === "F1") { e.preventDefault(); newSale(); }
      if (e.key === "F2") { e.preventDefault(); if (cart.length > 0) completeSale(); }
      if (e.key === "F3") { e.preventDefault(); holdCurrentOrder(); }
      if (e.key === "F4") { e.preventDefault(); searchRef.current?.focus(); }
      if (e.key === "F5") { e.preventDefault(); if (lastReceipt) { setReceipt(lastReceipt); setShowReceipt(true); } }
      if (e.key === "Escape") {
        e.preventDefault();
        if (showReceipt) setShowReceipt(false);
        else if (showOpenShift) setShowOpenShift(false);
        else if (showCloseShift) { setShowCloseShift(false); setShiftSummary(null); }
        else if (showHeldOrders) setShowHeldOrders(false);
        else if (showShortcuts) setShowShortcuts(false);
      }
      // Barcode scanner: Enter in search
      if (e.key === "Enter" && isInput && (e.target as HTMLElement) === searchRef.current) {
        e.preventDefault();
        handleBarcodeSubmit();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  // ---- Categories ----
  const categories = useMemo(() => {
    const cats = Array.from(
      new Set((products ?? []).map((p: any) => p.category).filter(Boolean))
    ) as string[];
    return ["الكل", ...cats];
  }, [products]);

  // ---- Filter products ----
  const displayProducts = useMemo(() => {
    if (searchQuery.length >= 1) return searchResults ?? [];
    return (products ?? []).filter((p: any) =>
      activeCategory === "الكل" ? true : p.category === activeCategory
    );
  }, [searchQuery, searchResults, products, activeCategory]);

  // ---- Favorite products (top 8 by name for now, could be by sales count) ----
  const favoriteProducts = useMemo(() => {
    return (products ?? []).slice(0, 8);
  }, [products]);

  // ---- Cart calculations ----
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const lineDiscount =
        item.discountType === "percent"
          ? item.quantity * item.unitPrice * (item.discount / 100)
          : item.discount;
      return sum + (item.quantity * item.unitPrice - lineDiscount);
    }, 0);
  }, [cart]);

  const computedOverallDiscount = useMemo(() => {
    if (overallDiscountType === "percent") return subtotal * (overallDiscount / 100);
    return overallDiscount;
  }, [subtotal, overallDiscount, overallDiscountType]);

  const afterDiscount = subtotal - computedOverallDiscount;

  const totalVat = useMemo(() => {
    return cart.reduce((sum, item) => {
      const lineDiscount =
        item.discountType === "percent"
          ? item.quantity * item.unitPrice * (item.discount / 100)
          : item.discount;
      const net = item.quantity * item.unitPrice - lineDiscount;
      // Apply proportional overall discount
      const proportion = subtotal > 0 ? net / subtotal : 0;
      const itemOverallDisc = computedOverallDiscount * proportion;
      return sum + (net - itemOverallDisc) * (item.vatRate / 100);
    }, 0);
  }, [cart, subtotal, computedOverallDiscount]);

  const totalLineDiscounts = useMemo(() => {
    return cart.reduce((sum, item) => {
      const lineDiscount =
        item.discountType === "percent"
          ? item.quantity * item.unitPrice * (item.discount / 100)
          : item.discount;
      return sum + lineDiscount;
    }, 0);
  }, [cart]);

  const grandTotal = afterDiscount + totalVat;
  const changeAmount =
    paymentMethod === "CASH" ? Math.max(0, amountPaid - grandTotal) : 0;

  // ---- Filtered customers ----
  const filteredCustomers = useMemo(() => {
    if (!customers) return [];
    if (!customerSearch) return customers;
    const q = customerSearch.toLowerCase();
    return (customers as any[]).filter(
      (c) =>
        c.nameAr?.toLowerCase().includes(q) ||
        c.phone?.includes(q) ||
        c.code?.toLowerCase().includes(q)
    );
  }, [customers, customerSearch]);

  // ---- Actions ----
  const addToCart = useCallback(
    (product: any) => {
      // Sound
      try { new Audio("/beep.wav").play().catch(() => {}); } catch {}
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
        if (product.currentStock <= 0) return prev;
        return [
          ...prev,
          {
            productId: product.id,
            code: product.code,
            nameAr: product.nameAr,
            quantity: 1,
            unitPrice: product.sellingPrice,
            discount: 0,
            discountType: "fixed" as const,
            vatRate: product.vatRate,
            stock: product.currentStock,
          },
        ];
      });
    },
    []
  );

  const updateQuantity = useCallback((productId: string, delta: number) => {
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
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

  const updateLinePrice = useCallback((productId: string, price: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, unitPrice: price } : item
      )
    );
  }, []);

  const updateLineDiscount = useCallback(
    (productId: string, discount: number, type: "fixed" | "percent") => {
      setCart((prev) =>
        prev.map((item) =>
          item.productId === productId
            ? { ...item, discount, discountType: type }
            : item
        )
      );
    },
    []
  );

  const handleBarcodeSubmit = useCallback(() => {
    if (!searchQuery) return;
    const allProducts = searchResults ?? products ?? [];
    const match = (allProducts as any[]).find(
      (p) =>
        p.barcode === searchQuery ||
        p.code === searchQuery
    );
    if (match) {
      addToCart(match);
      setSearchQuery("");
      searchRef.current?.focus();
    }
  }, [searchQuery, searchResults, products, addToCart]);

  const completeSale = useCallback(() => {
    if (cart.length === 0) return;
    if (paymentMethod === "CASH" && !splitPayment && amountPaid < grandTotal) {
      alert("المبلغ المدفوع أقل من الإجمالي");
      return;
    }
    if (splitPayment && splitAmounts.cash + splitAmounts.card < grandTotal) {
      alert("مجموع المبالغ المقسمة أقل من الإجمالي");
      return;
    }
    if (paymentMethod === "CREDIT" && !selectedCustomerId) {
      alert("يرجى اختيار العميل للبيع الآجل");
      return;
    }

    const effectiveAmountPaid = splitPayment
      ? splitAmounts.cash + splitAmounts.card
      : paymentMethod === "CASH"
      ? amountPaid
      : grandTotal;

    createSale.mutate({
      items: cart.map((item) => {
        const lineDiscount =
          item.discountType === "percent"
            ? item.quantity * item.unitPrice * (item.discount / 100)
            : item.discount;
        return {
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: lineDiscount,
        };
      }),
      paymentMethod: splitPayment ? "CASH" : paymentMethod,
      customerId: paymentMethod === "CREDIT" ? selectedCustomerId : undefined,
      amountPaid: effectiveAmountPaid,
      notes: notes || undefined,
    });
  }, [
    cart, paymentMethod, amountPaid, grandTotal, selectedCustomerId,
    splitPayment, splitAmounts, notes, createSale,
  ]);

  const newSale = useCallback(() => {
    setShowReceipt(false);
    setReceipt(null);
    setCart([]);
    setAmountPaid(0);
    setNotes("");
    setShowNotes(false);
    setSelectedCustomerId("");
    setCustomerSearch("");
    setPaymentMethod("CASH");
    setSplitPayment(false);
    setSplitAmounts({ cash: 0, card: 0 });
    setOverallDiscount(0);
    setOverallDiscountType("percent");
    setShowOverallDiscount(false);
    searchRef.current?.focus();
  }, []);

  const holdCurrentOrder = useCallback(() => {
    if (cart.length === 0) return;
    const selectedCustomer = (customers as any[] | undefined)?.find(
      (c: any) => c.id === selectedCustomerId
    );
    const order: HeldOrder = {
      id: Date.now().toString(),
      customerName: selectedCustomer?.nameAr ?? "طلب محجوز",
      cart: [...cart],
      notes,
      customerId: selectedCustomerId,
      heldAt: new Date().toISOString(),
    };
    setHeldOrders((prev) => [...prev, order]);
    newSale();
  }, [cart, notes, selectedCustomerId, customers, newSale]);

  const restoreHeldOrder = useCallback(
    (order: HeldOrder) => {
      setCart(order.cart);
      setNotes(order.notes);
      setSelectedCustomerId(order.customerId);
      setHeldOrders((prev) => prev.filter((o) => o.id !== order.id));
      setShowHeldOrders(false);
    },
    []
  );

  const deleteHeldOrder = useCallback((orderId: string) => {
    setHeldOrders((prev) => prev.filter((o) => o.id !== orderId));
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  const printReceipt = useCallback(() => {
    window.print();
  }, []);

  // Auto-fill amount
  useEffect(() => {
    if (paymentMethod !== "CASH") setAmountPaid(grandTotal);
  }, [paymentMethod, grandTotal]);

  // ---- Helper: product initial color ----
  const getInitialColor = (name: string) => {
    const colors = [
      "#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6",
      "#EC4899", "#06B6D4", "#F97316", "#6366F1", "#14B8A6",
    ];
    const idx = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[idx];
  };

  // ---- Format time ----
  const formatTime = (d: Date) => {
    return d.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };
  const formatDate = (d: Date) => {
    return d.toLocaleDateString("ar-SA", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  };

  // ---- Locale link helper ----
  const localePath = isRTL ? "/ar" : "/en";

  return (
    <div
      className="h-screen select-none overflow-hidden flex flex-col"
      dir={isRTL ? "rtl" : "ltr"}
      style={{ background: "#1a1a2e", color: "#e5e7eb" }}
    >
      {/* ============================================================ */}
      {/*  PRINT STYLES                                                */}
      {/* ============================================================ */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden !important; }
          .receipt-print, .receipt-print * { visibility: visible !important; }
          .receipt-print {
            position: absolute; left: 0; top: 0;
            width: 80mm; margin: 0; padding: 8mm;
            background: white !important; color: black !important;
            border-radius: 0; box-shadow: none;
          }
          .receipt-print .no-print { display: none !important; }
        }
        /* Custom scrollbar for dark theme */
        .pos-scroll::-webkit-scrollbar { width: 6px; }
        .pos-scroll::-webkit-scrollbar-track { background: transparent; }
        .pos-scroll::-webkit-scrollbar-thumb { background: #374151; border-radius: 3px; }
        .pos-scroll::-webkit-scrollbar-thumb:hover { background: #4B5563; }
        /* Animation */
        @keyframes pos-bounce { 0%,100%{ transform: scale(1); } 50%{ transform: scale(1.15); } }
        .pos-bounce { animation: pos-bounce 0.3s ease; }
        @keyframes pos-slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .pos-slide-up { animation: pos-slide-up 0.25s ease; }
      `}</style>

      {/* ============================================================ */}
      {/*  HEADER BAR                                                  */}
      {/* ============================================================ */}
      <header
        className="flex items-center justify-between px-4 py-2 shrink-0"
        style={{ background: "#0f172a", borderBottom: "1px solid #1e293b" }}
      >
        {/* Left side */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm" style={{ background: "#0070F2" }}>
              GL
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-wide">G-Ledger POS</h1>
              <p className="text-[10px] text-gray-500">{storeName}</p>
            </div>
          </div>

          <div className="hidden md:block h-6 w-px bg-gray-700" />

          {/* Date/Time */}
          <div className="hidden md:flex flex-col items-start">
            <span className="text-[10px] text-gray-500">{formatDate(currentTime)}</span>
            <span className="text-xs font-mono text-gray-300">{formatTime(currentTime)}</span>
          </div>
        </div>

        {/* Center */}
        <div className="flex items-center gap-3">
          {/* Offline indicator */}
          {!isOnline && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-red-900/60 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] text-red-300 font-medium">غير متصل</span>
            </div>
          )}

          {/* Shift status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: shiftStatus?.isOpen ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)" }}>
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                shiftStatus?.isOpen ? "bg-emerald-400 animate-pulse" : "bg-red-400"
              }`}
            />
            <span className="text-xs">
              {shiftStatus?.isOpen
                ? `وردية مفتوحة (${shiftStatus.salesCount ?? 0} عملية)`
                : "لا توجد وردية"}
            </span>
          </div>

          {/* Daily sales badge */}
          {dailySummary && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: "rgba(0,112,242,0.1)" }}>
              <span className="text-[10px] text-gray-400">مبيعات اليوم</span>
              <span className="text-sm font-bold" style={{ color: "#00C9A7" }}>
                {formatCurrency(dailySummary.totalSales, currency)}
              </span>
              <span className="text-[10px] text-gray-500">({dailySummary.transactionsCount})</span>
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Cashier */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: "#1e293b" }}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: "#0070F2" }}>
              {cashierName.charAt(0)}
            </div>
            <span className="text-xs text-gray-300">{cashierName}</span>
          </div>

          {/* Shift buttons */}
          {!shiftStatus?.isOpen ? (
            <button
              onClick={() => setShowOpenShift(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:brightness-110"
              style={{ background: "#10B981", color: "white", minHeight: 36 }}
            >
              فتح وردية
            </button>
          ) : (
            <button
              onClick={() => setShowCloseShift(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:brightness-110"
              style={{ background: "#F59E0B", color: "#1a1a2e", minHeight: 36 }}
            >
              إغلاق الوردية
            </button>
          )}

          {/* Keyboard shortcuts */}
          <button
            onClick={() => setShowShortcuts(true)}
            className="p-2 rounded-lg transition-colors"
            style={{ background: "#1e293b" }}
            title="اختصارات لوحة المفاتيح"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="2" y="6" width="20" height="12" rx="2"/>
              <path d="M6 10h0m4 0h0m4 0h0m4 0h0M8 14h8"/>
            </svg>
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg transition-colors"
            style={{ background: "#1e293b" }}
            title="شاشة كاملة"
          >
            {isFullscreen ? (
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
              </svg>
            ) : (
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
              </svg>
            )}
          </button>

          {/* Back to dashboard */}
          <Link
            href={`${localePath}/dashboard`}
            className="p-2 rounded-lg transition-colors"
            style={{ background: "#1e293b" }}
            title="لوحة التحكم"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </Link>
        </div>
      </header>

      {/* ============================================================ */}
      {/*  MAIN CONTENT                                                */}
      {/* ============================================================ */}
      <div className="flex-1 flex overflow-hidden">
        {/* ========== LEFT PANEL - Products (65%) ========== */}
        <div className="flex flex-col" style={{ width: "65%", borderLeft: isRTL ? undefined : "1px solid #1e293b", borderRight: isRTL ? "1px solid #1e293b" : undefined }}>
          {/* Search bar */}
          <div className="p-3 shrink-0" style={{ background: "#16213e" }}>
            <div className="relative">
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z"/>
                </svg>
              </span>
              <input
                ref={searchRef}
                type="text"
                placeholder="بحث بالاسم، الكود، أو الباركود... (F4)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-10 py-3 text-base rounded-xl focus:outline-none focus:ring-2 transition-all"
                style={{
                  background: "#1e293b",
                  border: "1px solid #374151",
                  color: "white",
                  caretColor: "#0070F2",
                }}
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(""); searchRef.current?.focus(); }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-lg"
                >
                  ✕
                </button>
              )}
              {/* Barcode icon */}
              <span className="absolute left-10 top-1/2 -translate-y-1/2 text-gray-600">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2 4h2v16H2V4zm4 0h1v16H6V4zm3 0h2v16H9V4zm4 0h1v16h-1V4zm3 0h1v16h-1V4zm3 0h2v16h-2V4z"/>
                </svg>
              </span>
            </div>
          </div>

          {/* Category tabs */}
          <div
            className="flex gap-2 px-3 py-2 overflow-x-auto shrink-0"
            style={{ background: "#16213e", borderBottom: "1px solid #1e293b" }}
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setSearchQuery("");
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all"
                style={{
                  minHeight: 44,
                  background: activeCategory === cat ? "#0070F2" : "#1e293b",
                  color: activeCategory === cat ? "white" : "#9CA3AF",
                  border: activeCategory === cat ? "none" : "1px solid #374151",
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Favorites row */}
          {favoriteProducts.length > 0 && !searchQuery && activeCategory === "الكل" && (
            <div className="px-3 py-2 shrink-0" style={{ borderBottom: "1px solid #1e293b" }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] text-gray-500 font-medium">الأكثر مبيعا</span>
                <div className="flex-1 h-px bg-gray-800" />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {(favoriteProducts as any[]).map((product) => {
                  const inCart = cart.find((c) => c.productId === product.id);
                  return (
                    <button
                      key={`fav-${product.id}`}
                      onClick={() => addToCart(product)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg shrink-0 transition-all hover:brightness-110"
                      style={{
                        background: inCart ? "rgba(0,112,242,0.2)" : "#1e293b",
                        border: inCart ? "1px solid #0070F2" : "1px solid #374151",
                        minHeight: 44,
                      }}
                    >
                      <div
                        className="w-7 h-7 rounded-md flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ background: getInitialColor(product.nameAr) }}
                      >
                        {product.nameAr?.charAt(0)}
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-medium text-gray-200 whitespace-nowrap">{product.nameAr}</div>
                        <div className="text-[10px] font-bold" style={{ color: "#00C9A7" }}>
                          {formatCurrency(product.sellingPrice, currency)}
                        </div>
                      </div>
                      {inCart && (
                        <span className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center" style={{ background: "#0070F2", color: "white" }}>
                          {inCart.quantity}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Product grid */}
          <div className="flex-1 overflow-y-auto p-3 pos-scroll">
            {productsLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin w-10 h-10 border-4 rounded-full" style={{ borderColor: "#0070F2", borderTopColor: "transparent" }} />
              </div>
            ) : displayProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-600">
                <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="mb-3 text-gray-700">
                  <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4M4 7l8 4M4 7v10l8 4m0-10v10"/>
                </svg>
                <span className="text-sm">لا توجد منتجات</span>
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="mt-2 text-xs px-3 py-1 rounded-lg" style={{ background: "#0070F2", color: "white" }}>
                    مسح البحث
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {(displayProducts as any[]).map((product) => {
                  const inCart = cart.find((c) => c.productId === product.id);
                  const outOfStock = product.currentStock <= 0;
                  return (
                    <button
                      key={product.id}
                      onClick={() => !outOfStock && addToCart(product)}
                      disabled={outOfStock}
                      className={`relative rounded-xl p-3 text-right transition-all pos-slide-up ${
                        outOfStock ? "opacity-40 cursor-not-allowed" : "hover:brightness-110 active:scale-[0.97]"
                      }`}
                      style={{
                        minHeight: 110,
                        background: inCart ? "rgba(0,112,242,0.15)" : "#1f2937",
                        border: inCart
                          ? "2px solid #0070F2"
                          : outOfStock
                          ? "2px solid #374151"
                          : "2px solid transparent",
                      }}
                    >
                      {/* Product initial */}
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm mb-2"
                        style={{ background: getInitialColor(product.nameAr) }}
                      >
                        {product.nameAr?.charAt(0)}
                      </div>

                      {/* Stock badge */}
                      <span
                        className="absolute top-2 left-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{
                          background: outOfStock
                            ? "rgba(239,68,68,0.2)"
                            : product.currentStock <= 5
                            ? "rgba(245,158,11,0.2)"
                            : "rgba(16,185,129,0.2)",
                          color: outOfStock
                            ? "#EF4444"
                            : product.currentStock <= 5
                            ? "#F59E0B"
                            : "#10B981",
                        }}
                      >
                        {outOfStock ? "نفد" : product.currentStock}
                      </span>

                      {/* Cart quantity badge */}
                      {inCart && (
                        <span
                          className="absolute top-2 right-2 w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold pos-bounce"
                          style={{ background: "#0070F2", color: "white" }}
                        >
                          {inCart.quantity}
                        </span>
                      )}

                      <div className="text-sm font-semibold text-gray-200 line-clamp-2 leading-tight">
                        {product.nameAr}
                      </div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{product.code}</div>
                      <div className="text-sm font-bold mt-1" style={{ color: "#00C9A7" }}>
                        {formatCurrency(product.sellingPrice, currency)}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ========== RIGHT PANEL - Cart & Checkout (35%) ========== */}
        <div className="flex flex-col" style={{ width: "35%", background: "#16213e" }}>
          {/* Cart header with customer + held orders */}
          <div className="px-4 py-3 shrink-0" style={{ borderBottom: "1px solid #1e293b" }}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-white flex items-center gap-2">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                السلة
                <span className="text-xs text-gray-500 font-normal">
                  ({cart.length} {cart.length === 1 ? "صنف" : "أصناف"})
                </span>
              </h2>
              <div className="flex items-center gap-2">
                {/* Held orders */}
                <button
                  onClick={() => setShowHeldOrders(true)}
                  className="relative p-2 rounded-lg transition-colors"
                  style={{ background: "#1e293b" }}
                  title="الطلبات المحجوزة"
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
                  </svg>
                  {heldOrders.length > 0 && (
                    <span
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
                      style={{ background: "#F59E0B", color: "#1a1a2e" }}
                    >
                      {heldOrders.length}
                    </span>
                  )}
                </button>
                {/* Hold current */}
                {cart.length > 0 && (
                  <button
                    onClick={holdCurrentOrder}
                    className="px-2 py-1 rounded-lg text-[10px] font-medium transition-colors"
                    style={{ background: "#1e293b", color: "#F59E0B", border: "1px solid #F59E0B30" }}
                    title="تعليق الطلب (F3)"
                  >
                    تعليق
                  </button>
                )}
              </div>
            </div>

            {/* Customer selector */}
            <div className="relative">
              <input
                ref={customerSearchRef}
                type="text"
                placeholder="بحث عن عميل (اختياري)..."
                value={customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value);
                  setShowCustomerDropdown(true);
                }}
                onFocus={() => setShowCustomerDropdown(true)}
                className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 transition-all"
                style={{
                  background: "#1e293b",
                  border: selectedCustomerId ? "1px solid #0070F2" : "1px solid #374151",
                  color: "white",
                }}
              />
              {selectedCustomerId && (
                <button
                  onClick={() => { setSelectedCustomerId(""); setCustomerSearch(""); }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  ✕
                </button>
              )}
              {showCustomerDropdown && customerSearch && filteredCustomers.length > 0 && (
                <div
                  className="absolute z-30 w-full mt-1 rounded-lg shadow-xl max-h-40 overflow-y-auto pos-scroll"
                  style={{ background: "#1e293b", border: "1px solid #374151" }}
                >
                  {(filteredCustomers as any[]).slice(0, 10).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelectedCustomerId(c.id);
                        setCustomerSearch(c.nameAr + (c.phone ? ` (${c.phone})` : ""));
                        setShowCustomerDropdown(false);
                      }}
                      className="w-full px-3 py-2 text-right text-sm hover:bg-white/5 transition-colors flex items-center gap-2"
                    >
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: "#0070F2" }}>
                        {c.nameAr?.charAt(0)}
                      </div>
                      <div>
                        <span className="text-gray-200">{c.nameAr}</span>
                        {c.phone && <span className="text-[10px] text-gray-500 mr-2">{c.phone}</span>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto pos-scroll">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-600">
                <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="mb-3 text-gray-700">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                <span className="text-sm">السلة فارغة</span>
                <span className="text-xs mt-1 text-gray-700">اضغط على المنتجات لإضافتها</span>
              </div>
            ) : (
              <div>
                {cart.map((item) => {
                  const lineDiscount =
                    item.discountType === "percent"
                      ? item.quantity * item.unitPrice * (item.discount / 100)
                      : item.discount;
                  const lineNet = item.quantity * item.unitPrice - lineDiscount;
                  const lineVat = lineNet * (item.vatRate / 100);
                  const lineTotal = lineNet + lineVat;
                  return (
                    <div
                      key={item.productId}
                      className="px-4 py-3 pos-slide-up"
                      style={{ borderBottom: "1px solid #1e293b" }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div
                            className="w-8 h-8 rounded-md flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ background: getInitialColor(item.nameAr) }}
                          >
                            {item.nameAr?.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-200 truncate">
                              {item.nameAr}
                            </div>
                            <div className="text-[10px] text-gray-500">
                              {formatCurrency(item.unitPrice, currency)} × {item.quantity}
                              {lineDiscount > 0 && (
                                <span className="text-yellow-500 mr-1">
                                  (-{formatCurrency(lineDiscount, currency)})
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-left shrink-0">
                          <div className="text-sm font-bold" style={{ color: "#00C9A7" }}>
                            {formatCurrency(lineTotal, currency)}
                          </div>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center justify-between mt-2 gap-2">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateQuantity(item.productId, -1)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-lg font-bold transition-colors"
                            style={{ background: "#1e293b", color: "#9CA3AF" }}
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-bold text-sm text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, 1)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-lg font-bold transition-colors"
                            style={{ background: "#1e293b", color: "#9CA3AF" }}
                          >
                            +
                          </button>
                        </div>

                        {/* Line discount */}
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={item.discount || ""}
                            onChange={(e) =>
                              updateLineDiscount(
                                item.productId,
                                parseFloat(e.target.value) || 0,
                                item.discountType
                              )
                            }
                            placeholder="خصم"
                            className="w-14 px-1.5 py-1 text-center text-xs rounded-md focus:outline-none focus:ring-1"
                            style={{ background: "#1e293b", border: "1px solid #374151", color: "white" }}
                            min={0}
                          />
                          <button
                            onClick={() =>
                              updateLineDiscount(
                                item.productId,
                                item.discount,
                                item.discountType === "fixed" ? "percent" : "fixed"
                              )
                            }
                            className="px-1.5 py-1 rounded-md text-[10px] font-bold"
                            style={{
                              background: item.discountType === "percent" ? "#F59E0B20" : "#0070F220",
                              color: item.discountType === "percent" ? "#F59E0B" : "#0070F2",
                            }}
                          >
                            {item.discountType === "percent" ? "%" : currency}
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                          style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444" }}
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

          {/* Cart footer: totals + payment */}
          <div className="shrink-0" style={{ background: "#0f172a", borderTop: "1px solid #1e293b" }}>
            {/* Summary */}
            <div className="px-4 py-3 space-y-1.5">
              <div className="flex justify-between text-sm text-gray-400">
                <span>المجموع الفرعي</span>
                <span>{formatCurrency(subtotal, currency)}</span>
              </div>
              {totalLineDiscounts > 0 && (
                <div className="flex justify-between text-sm" style={{ color: "#F59E0B" }}>
                  <span>خصم الأصناف</span>
                  <span>-{formatCurrency(totalLineDiscounts, currency)}</span>
                </div>
              )}

              {/* Overall discount */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowOverallDiscount(!showOverallDiscount)}
                  className="text-xs flex items-center gap-1"
                  style={{ color: "#0070F2" }}
                >
                  <span>+</span> خصم إجمالي
                </button>
                {computedOverallDiscount > 0 && (
                  <span className="text-sm" style={{ color: "#F59E0B" }}>
                    -{formatCurrency(computedOverallDiscount, currency)}
                  </span>
                )}
              </div>
              {showOverallDiscount && (
                <div className="flex items-center gap-2 pos-slide-up">
                  <input
                    type="number"
                    value={overallDiscount || ""}
                    onChange={(e) => setOverallDiscount(parseFloat(e.target.value) || 0)}
                    className="flex-1 px-2 py-1.5 text-center text-sm rounded-lg focus:outline-none focus:ring-1"
                    style={{ background: "#1e293b", border: "1px solid #374151", color: "white" }}
                    min={0}
                    placeholder="0"
                  />
                  <button
                    onClick={() => setOverallDiscountType(overallDiscountType === "percent" ? "fixed" : "percent")}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold"
                    style={{
                      background: overallDiscountType === "percent" ? "#F59E0B20" : "#0070F220",
                      color: overallDiscountType === "percent" ? "#F59E0B" : "#0070F2",
                    }}
                  >
                    {overallDiscountType === "percent" ? "%" : currency}
                  </button>
                </div>
              )}

              <div className="flex justify-between text-sm text-gray-400">
                <span>ض.ق.م</span>
                <span>{formatCurrency(totalVat, currency)}</span>
              </div>

              {/* TOTAL */}
              <div className="flex justify-between items-center pt-2" style={{ borderTop: "1px solid #1e293b" }}>
                <span className="text-lg font-bold text-white">الإجمالي</span>
                <span className="font-black" style={{ fontSize: "2.5rem", lineHeight: 1, color: "#00C9A7" }}>
                  {formatCurrency(grandTotal, currency)}
                </span>
              </div>
            </div>

            {/* Notes */}
            <div className="px-4 pb-2">
              <button
                onClick={() => setShowNotes(!showNotes)}
                className="text-[10px] mb-1 flex items-center gap-1"
                style={{ color: "#6B7280" }}
              >
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                {notes ? "تعديل الملاحظات" : "إضافة ملاحظات"}
              </button>
              {showNotes && (
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ملاحظات..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 resize-none pos-slide-up"
                  style={{ background: "#1e293b", border: "1px solid #374151", color: "white" }}
                />
              )}
            </div>

            {/* Payment method buttons */}
            <div className="px-4 pb-3">
              <div className="grid grid-cols-4 gap-2 mb-3">
                {([
                  { key: "CASH" as const, label: "نقدي", icon: "\uD83D\uDCB5", bg: "#10B981", bgLight: "rgba(16,185,129,0.1)", color: "#10B981" },
                  { key: "CARD" as const, label: "بطاقة", icon: "\uD83D\uDCB3", bg: "#3B82F6", bgLight: "rgba(59,130,246,0.1)", color: "#3B82F6" },
                  { key: "TRANSFER" as const, label: "تحويل", icon: "\uD83C\uDFE6", bg: "#8B5CF6", bgLight: "rgba(139,92,246,0.1)", color: "#8B5CF6" },
                  { key: "CREDIT" as const, label: "آجل", icon: "\uD83D\uDCCB", bg: "#F97316", bgLight: "rgba(249,115,22,0.1)", color: "#F97316" },
                ] as const).map((pm) => (
                  <button
                    key={pm.key}
                    onClick={() => { setPaymentMethod(pm.key); setSplitPayment(false); }}
                    className="py-2.5 rounded-lg text-xs font-bold transition-all"
                    style={{
                      minHeight: 48,
                      background: paymentMethod === pm.key && !splitPayment ? pm.bg : pm.bgLight,
                      color: paymentMethod === pm.key && !splitPayment ? "white" : pm.color,
                      border: paymentMethod === pm.key && !splitPayment ? "none" : `1px solid ${pm.color}30`,
                    }}
                  >
                    <span className="block text-base mb-0.5">{pm.icon}</span>
                    {pm.label}
                  </button>
                ))}
              </div>

              {/* Split payment toggle */}
              <button
                onClick={() => {
                  setSplitPayment(!splitPayment);
                  if (!splitPayment) {
                    setSplitAmounts({ cash: 0, card: 0 });
                  }
                }}
                className="w-full mb-2 py-1.5 rounded-lg text-[10px] font-medium transition-colors"
                style={{
                  background: splitPayment ? "rgba(139,92,246,0.15)" : "#1e293b",
                  color: splitPayment ? "#A78BFA" : "#6B7280",
                  border: splitPayment ? "1px solid #8B5CF630" : "1px solid #374151",
                }}
              >
                {splitPayment ? "دفع مقسم (فعال)" : "تقسيم الدفع"}
              </button>

              {/* Split payment inputs */}
              {splitPayment && (
                <div className="mb-3 space-y-2 pos-slide-up">
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] text-gray-500 w-12">نقدي</label>
                    <input
                      type="number"
                      value={splitAmounts.cash || ""}
                      onChange={(e) => setSplitAmounts((prev) => ({ ...prev, cash: parseFloat(e.target.value) || 0 }))}
                      className="flex-1 px-3 py-2 rounded-lg text-sm font-bold text-center focus:outline-none focus:ring-1"
                      style={{ background: "#1e293b", border: "1px solid #374151", color: "white" }}
                      min={0}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] text-gray-500 w-12">بطاقة</label>
                    <input
                      type="number"
                      value={splitAmounts.card || ""}
                      onChange={(e) => setSplitAmounts((prev) => ({ ...prev, card: parseFloat(e.target.value) || 0 }))}
                      className="flex-1 px-3 py-2 rounded-lg text-sm font-bold text-center focus:outline-none focus:ring-1"
                      style={{ background: "#1e293b", border: "1px solid #374151", color: "white" }}
                      min={0}
                    />
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-gray-500">المجموع:</span>
                    <span style={{ color: splitAmounts.cash + splitAmounts.card >= grandTotal ? "#10B981" : "#EF4444" }}>
                      {formatCurrency(splitAmounts.cash + splitAmounts.card, currency)}
                    </span>
                  </div>
                </div>
              )}

              {/* Customer required for credit */}
              {paymentMethod === "CREDIT" && !selectedCustomerId && (
                <div className="mb-2 px-3 py-2 rounded-lg text-xs pos-slide-up" style={{ background: "rgba(249,115,22,0.1)", color: "#F97316", border: "1px solid #F9731630" }}>
                  يرجى اختيار عميل للبيع الآجل
                </div>
              )}

              {/* Cash amount + change */}
              {paymentMethod === "CASH" && !splitPayment && (
                <div className="mb-3 pos-slide-up">
                  <label className="text-[10px] text-gray-500 mb-1 block">المبلغ المدفوع</label>
                  <input
                    type="number"
                    value={amountPaid || ""}
                    onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2.5 rounded-lg text-lg font-bold text-center focus:outline-none focus:ring-2"
                    style={{ background: "#1e293b", border: "1px solid #374151", color: "white" }}
                    min={0}
                    step={0.01}
                  />
                  {/* Quick cash buttons */}
                  <div className="flex gap-1 mt-2">
                    {[grandTotal, Math.ceil(grandTotal / 10) * 10, Math.ceil(grandTotal / 50) * 50, Math.ceil(grandTotal / 100) * 100].filter((v, i, a) => v > 0 && a.indexOf(v) === i).slice(0, 4).map((val) => (
                      <button
                        key={val}
                        onClick={() => setAmountPaid(val)}
                        className="flex-1 py-1.5 rounded-md text-[10px] font-bold transition-colors"
                        style={{ background: "#1e293b", color: "#9CA3AF", border: "1px solid #374151" }}
                      >
                        {formatCurrency(val, currency)}
                      </button>
                    ))}
                  </div>
                  {amountPaid > grandTotal && grandTotal > 0 && (
                    <div className="flex justify-between mt-2 px-1">
                      <span className="text-sm font-medium" style={{ color: "#10B981" }}>الباقي:</span>
                      <span className="text-xl font-black" style={{ color: "#10B981" }}>
                        {formatCurrency(changeAmount, currency)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Complete sale button */}
              <button
                onClick={completeSale}
                disabled={cart.length === 0 || createSale.isPending}
                className="w-full py-4 rounded-xl text-lg font-black transition-all"
                style={{
                  minHeight: 56,
                  background: cart.length === 0 ? "#374151" : "#10B981",
                  color: cart.length === 0 ? "#6B7280" : "white",
                  cursor: cart.length === 0 ? "not-allowed" : "pointer",
                  boxShadow: cart.length > 0 ? "0 4px 20px rgba(16,185,129,0.3)" : "none",
                }}
              >
                {createSale.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                    جاري المعالجة...
                  </span>
                ) : (
                  <>اتمام البيع (F2) &mdash; {formatCurrency(grandTotal, currency)}</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  RECEIPT MODAL                                               */}
      {/* ============================================================ */}
      {showReceipt && receipt && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowReceipt(false)}>
          <div
            className="receipt-print bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto pos-slide-up"
            style={{ color: "#111" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 text-center">
              {/* Header */}
              <div className="mb-4">
                <div className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center font-black text-lg text-white mb-2" style={{ background: "#0070F2" }}>
                  GL
                </div>
                <h2 className="text-xl font-bold text-gray-800">{storeName}</h2>
                <p className="text-xs text-gray-400 mt-1">ايصال بيع</p>
              </div>

              <div className="border-t border-dashed border-gray-300 my-3" />

              <div className="text-right space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">رقم الإيصال:</span>
                  <span className="font-bold text-gray-800">{receipt.receiptNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">التاريخ:</span>
                  <span className="text-gray-700">{new Date(receipt.createdAt).toLocaleString("ar-SA")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">الكاشير:</span>
                  <span className="text-gray-700">{cashierName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">طريقة الدفع:</span>
                  <span className="text-gray-700">
                    {receipt.paymentMethod === "CASH" ? "نقدي"
                      : receipt.paymentMethod === "CARD" ? "بطاقة"
                      : receipt.paymentMethod === "TRANSFER" ? "تحويل"
                      : "آجل"}
                  </span>
                </div>
              </div>

              <div className="border-t border-dashed border-gray-300 my-3" />

              {/* Items table */}
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
                        <td className="py-1.5 text-right text-xs text-gray-700">{item.description}</td>
                        <td className="py-1.5 text-center text-gray-700">{item.quantity}</td>
                        <td className="py-1.5 text-center text-xs text-gray-600">
                          {formatCurrency(item.unitPrice, currency)}
                        </td>
                        <td className="py-1.5 text-left font-medium text-gray-800">
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
                  <span className="text-gray-700">{formatCurrency(receipt.subtotal, currency)}</span>
                </div>
                {receipt.totalDiscount > 0 && (
                  <div className="flex justify-between text-orange-600">
                    <span>الخصم:</span>
                    <span>-{formatCurrency(receipt.totalDiscount, currency)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">ض.ق.م:</span>
                  <span className="text-gray-700">{formatCurrency(receipt.totalVat, currency)}</span>
                </div>
                <div className="flex justify-between text-lg font-extrabold pt-2 border-t border-gray-200">
                  <span className="text-gray-800">الإجمالي:</span>
                  <span style={{ color: "#0070F2" }}>{formatCurrency(receipt.grandTotal, currency)}</span>
                </div>
                {receipt.paymentMethod === "CASH" && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-500">المدفوع:</span>
                      <span className="text-gray-700">{formatCurrency(receipt.amountPaid, currency)}</span>
                    </div>
                    {receipt.changeAmount > 0 && (
                      <div className="flex justify-between font-bold" style={{ color: "#10B981" }}>
                        <span>الباقي:</span>
                        <span>{formatCurrency(receipt.changeAmount, currency)}</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="border-t border-dashed border-gray-300 my-3" />

              {/* QR code placeholder */}
              <div className="flex justify-center my-3">
                <div className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <svg width="32" height="32" fill="none" stroke="#D1D5DB" strokeWidth="1.5" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="3" height="3"/>
                    <rect x="18" y="18" width="3" height="3"/>
                  </svg>
                </div>
              </div>

              <p className="text-xs text-gray-400 mb-4">شكرا لزيارتكم</p>

              {/* Action buttons */}
              <div className="no-print grid grid-cols-2 gap-2">
                <button
                  onClick={printReceipt}
                  className="py-3 rounded-xl font-bold text-sm transition-colors"
                  style={{ background: "#0070F2", color: "white", minHeight: 48 }}
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                      <rect x="6" y="14" width="12" height="8"/>
                    </svg>
                    طباعة
                  </span>
                </button>
                <button
                  onClick={newSale}
                  className="py-3 rounded-xl font-bold text-sm transition-colors"
                  style={{ background: "#10B981", color: "white", minHeight: 48 }}
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    بيع جديد (F1)
                  </span>
                </button>
                <button
                  onClick={() => {
                    /* WhatsApp share */
                    const text = `ايصال رقم: ${receipt.receiptNumber}\nالإجمالي: ${formatCurrency(receipt.grandTotal, currency)}\nالتاريخ: ${new Date(receipt.createdAt).toLocaleString("ar-SA")}`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
                  }}
                  className="py-3 rounded-xl font-bold text-sm transition-colors"
                  style={{ background: "#25D366", color: "white", minHeight: 48 }}
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
                    </svg>
                    واتساب
                  </span>
                </button>
                <button
                  onClick={() => {
                    /* Email - placeholder */
                    const subject = `ايصال ${receipt.receiptNumber}`;
                    const body = `ايصال رقم: ${receipt.receiptNumber}\nالإجمالي: ${formatCurrency(receipt.grandTotal, currency)}`;
                    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
                  }}
                  className="py-3 rounded-xl font-bold text-sm transition-colors"
                  style={{ background: "#6366F1", color: "white", minHeight: 48 }}
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                    بريد
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/*  OPEN SHIFT MODAL                                            */}
      {/* ============================================================ */}
      {showOpenShift && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowOpenShift(false)}>
          <div
            className="rounded-2xl w-full max-w-sm p-6 pos-slide-up"
            style={{ background: "#1f2937", color: "white" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-3" style={{ background: "rgba(16,185,129,0.15)" }}>
                <svg width="28" height="28" fill="none" stroke="#10B981" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 2v10l4.5 4.5"/>
                  <circle cx="12" cy="12" r="10"/>
                </svg>
              </div>
              <h3 className="text-lg font-bold">فتح وردية جديدة</h3>
              <p className="text-xs text-gray-500 mt-1">{cashierName} - {formatDate(currentTime)}</p>
            </div>
            <div className="mb-6">
              <label className="text-sm text-gray-400 mb-2 block">رصيد الصندوق الافتتاحي</label>
              <input
                type="number"
                value={openingBalance || ""}
                onChange={(e) => setOpeningBalance(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 rounded-xl text-lg font-bold text-center focus:outline-none focus:ring-2"
                style={{ background: "#374151", border: "1px solid #4B5563", color: "white" }}
                min={0}
                step={0.01}
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowOpenShift(false)}
                className="flex-1 py-3 rounded-xl font-medium transition-colors"
                style={{ background: "#374151", color: "#9CA3AF", minHeight: 48 }}
              >
                إلغاء
              </button>
              <button
                onClick={() => openShiftMutation.mutate({ openingBalance })}
                disabled={openShiftMutation.isPending}
                className="flex-1 py-3 rounded-xl font-bold transition-all hover:brightness-110"
                style={{ background: "#10B981", color: "white", minHeight: 48 }}
              >
                {openShiftMutation.isPending ? "جاري..." : "فتح الوردية"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/*  CLOSE SHIFT MODAL                                           */}
      {/* ============================================================ */}
      {showCloseShift && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => { if (!shiftSummary) setShowCloseShift(false); }}>
          <div
            className="rounded-2xl w-full max-w-md p-6 pos-slide-up max-h-[90vh] overflow-y-auto pos-scroll"
            style={{ background: "#1f2937", color: "white" }}
            onClick={(e) => e.stopPropagation()}
          >
            {!shiftSummary ? (
              <>
                <div className="text-center mb-6">
                  <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-3" style={{ background: "rgba(245,158,11,0.15)" }}>
                    <svg width="28" height="28" fill="none" stroke="#F59E0B" strokeWidth="2" viewBox="0 0 24 24">
                      <rect x="3" y="11" width="18" height="11" rx="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold">إغلاق الوردية</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    سيتم حساب ملخص الوردية بعد الإغلاق
                  </p>
                </div>

                {/* Actual cash input */}
                <div className="mb-6">
                  <label className="text-sm text-gray-400 mb-2 block">النقد الفعلي في الصندوق</label>
                  <input
                    type="number"
                    value={actualCash || ""}
                    onChange={(e) => setActualCash(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 rounded-xl text-lg font-bold text-center focus:outline-none focus:ring-2"
                    style={{ background: "#374151", border: "1px solid #4B5563", color: "white" }}
                    min={0}
                    step={0.01}
                    autoFocus
                    placeholder="0.00"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCloseShift(false)}
                    className="flex-1 py-3 rounded-xl font-medium transition-colors"
                    style={{ background: "#374151", color: "#9CA3AF", minHeight: 48 }}
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={() => closeShiftMutation.mutate()}
                    disabled={closeShiftMutation.isPending}
                    className="flex-1 py-3 rounded-xl font-bold transition-all hover:brightness-110"
                    style={{ background: "#F59E0B", color: "#1a1a2e", minHeight: 48 }}
                  >
                    {closeShiftMutation.isPending ? "جاري..." : "إغلاق الوردية"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-4">
                  <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-3" style={{ background: "rgba(16,185,129,0.15)" }}>
                    <svg width="28" height="28" fill="none" stroke="#10B981" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold">ملخص الوردية</h3>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl p-3" style={{ background: "#374151" }}>
                      <div className="text-[10px] text-gray-500">وقت الفتح</div>
                      <div className="text-xs font-medium mt-1">{new Date(shiftSummary.openedAt).toLocaleString("ar-SA")}</div>
                    </div>
                    <div className="rounded-xl p-3" style={{ background: "#374151" }}>
                      <div className="text-[10px] text-gray-500">وقت الإغلاق</div>
                      <div className="text-xs font-medium mt-1">{new Date(shiftSummary.closedAt).toLocaleString("ar-SA")}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl p-3" style={{ background: "#374151" }}>
                      <div className="text-[10px] text-gray-500">عدد العمليات</div>
                      <div className="text-xl font-bold mt-1">{shiftSummary.transactionsCount}</div>
                    </div>
                    <div className="rounded-xl p-3" style={{ background: "#374151" }}>
                      <div className="text-[10px] text-gray-500">الرصيد الافتتاحي</div>
                      <div className="text-sm font-bold mt-1">{formatCurrency(shiftSummary.openingBalance, currency)}</div>
                    </div>
                  </div>

                  {/* Payment breakdown */}
                  <div className="rounded-xl p-4 space-y-3" style={{ background: "#374151" }}>
                    <div className="text-[10px] text-gray-500 font-medium mb-2">التوزيع حسب طريقة الدفع</div>
                    {[
                      { label: "نقدي", value: shiftSummary.totalCash, color: "#10B981" },
                      { label: "بطاقة", value: shiftSummary.totalCard, color: "#3B82F6" },
                      { label: "تحويل", value: shiftSummary.totalTransfer, color: "#8B5CF6" },
                      { label: "آجل", value: shiftSummary.totalCredit, color: "#F97316" },
                    ].map((row) => (
                      <div key={row.label} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ background: row.color }} />
                          <span className="text-gray-400">{row.label}</span>
                        </div>
                        <span className="font-bold" style={{ color: row.color }}>
                          {formatCurrency(row.value, currency)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Total + cash balance */}
                  <div className="rounded-xl p-4" style={{ background: "rgba(0,112,242,0.1)", border: "1px solid #0070F230" }}>
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-bold text-white">إجمالي المبيعات</span>
                      <span className="text-2xl font-black" style={{ color: "#0070F2" }}>
                        {formatCurrency(shiftSummary.totalSales, currency)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">النقد المتوقع</span>
                      <span className="font-bold" style={{ color: "#10B981" }}>
                        {formatCurrency(shiftSummary.expectedCashBalance, currency)}
                      </span>
                    </div>
                    {actualCash > 0 && (
                      <>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-gray-400">النقد الفعلي</span>
                          <span className="font-bold">{formatCurrency(actualCash, currency)}</span>
                        </div>
                        <div className="flex justify-between items-center mt-2 pt-2" style={{ borderTop: "1px solid #374151" }}>
                          <span className="text-gray-400">الفرق</span>
                          <span
                            className="font-bold"
                            style={{
                              color: actualCash - shiftSummary.expectedCashBalance >= 0 ? "#10B981" : "#EF4444",
                            }}
                          >
                            {actualCash - shiftSummary.expectedCashBalance >= 0 ? "+" : ""}
                            {formatCurrency(actualCash - shiftSummary.expectedCashBalance, currency)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShiftSummary(null);
                    setShowCloseShift(false);
                    setActualCash(0);
                  }}
                  className="w-full mt-4 py-3 rounded-xl font-bold transition-all hover:brightness-110"
                  style={{ background: "#0070F2", color: "white", minHeight: 48 }}
                >
                  تم
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/*  HELD ORDERS MODAL                                           */}
      {/* ============================================================ */}
      {showHeldOrders && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowHeldOrders(false)}>
          <div
            className="rounded-2xl w-full max-w-md p-6 pos-slide-up max-h-[80vh] overflow-y-auto pos-scroll"
            style={{ background: "#1f2937", color: "white" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">الطلبات المحجوزة</h3>
              <button onClick={() => setShowHeldOrders(false)} className="text-gray-500 hover:text-white">✕</button>
            </div>

            {heldOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                <svg width="40" height="40" className="mx-auto mb-2 text-gray-700" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                </svg>
                <span className="text-sm">لا توجد طلبات محجوزة</span>
              </div>
            ) : (
              <div className="space-y-3">
                {heldOrders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-xl p-4"
                    style={{ background: "#374151", border: "1px solid #4B5563" }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm">{order.customerName}</span>
                      <span className="text-[10px] text-gray-500">
                        {new Date(order.heldAt).toLocaleTimeString("ar-SA")}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mb-3">
                      {order.cart.length} صنف &mdash;{" "}
                      {formatCurrency(
                        order.cart.reduce((s, i) => s + i.quantity * i.unitPrice, 0),
                        currency
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => restoreHeldOrder(order)}
                        className="flex-1 py-2 rounded-lg text-xs font-bold transition-colors"
                        style={{ background: "#0070F2", color: "white" }}
                      >
                        استعادة
                      </button>
                      <button
                        onClick={() => deleteHeldOrder(order.id)}
                        className="py-2 px-3 rounded-lg text-xs font-bold transition-colors"
                        style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444" }}
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/*  KEYBOARD SHORTCUTS MODAL                                    */}
      {/* ============================================================ */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowShortcuts(false)}>
          <div
            className="rounded-2xl w-full max-w-sm p-6 pos-slide-up"
            style={{ background: "#1f2937", color: "white" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">اختصارات لوحة المفاتيح</h3>
              <button onClick={() => setShowShortcuts(false)} className="text-gray-500 hover:text-white">✕</button>
            </div>
            <div className="space-y-3">
              {[
                { key: "F1", desc: "بيع جديد" },
                { key: "F2", desc: "اتمام البيع" },
                { key: "F3", desc: "تعليق الطلب" },
                { key: "F4", desc: "بحث المنتجات" },
                { key: "F5", desc: "طباعة آخر ايصال" },
                { key: "Esc", desc: "إغلاق / إلغاء" },
                { key: "Enter", desc: "بحث باركود (في حقل البحث)" },
              ].map((shortcut) => (
                <div key={shortcut.key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">{shortcut.desc}</span>
                  <kbd
                    className="px-2 py-1 rounded-md text-xs font-mono font-bold"
                    style={{ background: "#374151", border: "1px solid #4B5563" }}
                  >
                    {shortcut.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
