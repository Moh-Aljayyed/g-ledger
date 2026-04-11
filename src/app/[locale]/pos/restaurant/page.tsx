"use client";

import { useState, useMemo, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/trpc";

/**
 * Restaurant POS — floor map + tab management.
 *
 * Flow:
 *   1. Cashier sees all floors as tabs
 *   2. Tables displayed as colored cards (green=free, red=occupied)
 *   3. Click a free table → dialog to open a tab (guest count + order type)
 *   4. Click an occupied table → open the tab editor
 *   5. Tab editor: add items (with modifiers), send to kitchen, close → invoice
 */
export default function RestaurantPOSPage() {
  const pathname = usePathname();
  const isAr = pathname.startsWith("/ar");
  const [activeFloorId, setActiveFloorId] = useState<string | null>(null);
  const [selectedTabId, setSelectedTabId] = useState<string | null>(null);
  const [openTableDialog, setOpenTableDialog] = useState<{ tableId: string; tableName: string } | null>(null);
  const [takeawayDialog, setTakeawayDialog] = useState(false);

  const { data: floors } = trpc.restaurant.listFloors.useQuery();
  const { data: tables, refetch: refetchTables } = trpc.restaurant.listTables.useQuery(
    undefined,
    { refetchInterval: 5000 },
  );

  // Auto-select first floor
  const currentFloorId = activeFloorId ?? floors?.[0]?.id ?? null;
  const floorTables = useMemo(
    () => tables?.filter((t: any) => t.floorId === currentFloorId) ?? [],
    [tables, currentFloorId],
  );

  if (selectedTabId) {
    return (
      <TabEditor
        tabId={selectedTabId}
        isAr={isAr}
        onClose={() => {
          setSelectedTabId(null);
          refetchTables();
        }}
      />
    );
  }

  const t = {
    title: isAr ? "نقاط البيع — مطعم" : "POS — Restaurant",
    backToDashboard: isAr ? "← لوحة التحكم" : "← Dashboard",
    takeaway: isAr ? "طلب تيك-أواي" : "Takeaway Order",
    delivery: isAr ? "طلب دليفري" : "Delivery Order",
    noFloors: isAr ? "لا توجد طوابق — أنشئها من إعدادات المطعم" : "No floors yet — set them up in Restaurant Setup",
    free: isAr ? "فاضية" : "Free",
    occupied: isAr ? "مشغولة" : "Occupied",
    seats: isAr ? "مقاعد" : "seats",
  };

  if (!floors || floors.length === 0) {
    return (
      <div className="min-h-screen bg-[#f5f6f8] p-6">
        <div className="max-w-md mx-auto mt-20 bg-white rounded-2xl border border-border p-8 text-center shadow-lg">
          <div className="text-5xl mb-4">🍽️</div>
          <h2 className="text-xl font-bold text-[#021544] mb-2">{t.noFloors}</h2>
          <Link
            href={`/${isAr ? "ar" : "en"}/restaurant`}
            className="inline-block mt-4 px-6 py-3 bg-[#0070F2] text-white rounded-lg font-semibold text-sm"
          >
            {isAr ? "اذهب للإعدادات" : "Go to Setup"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/${isAr ? "ar" : "en"}/dashboard`}
              className="text-sm text-muted-foreground hover:text-[#021544]"
            >
              {t.backToDashboard}
            </Link>
            <div className="h-6 w-px bg-border" />
            <h1 className="text-lg font-bold text-[#021544]">{t.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTakeawayDialog(true)}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600"
            >
              🛍️ {t.takeaway}
            </button>
          </div>
        </div>

        {/* Floor tabs */}
        <div className="max-w-7xl mx-auto px-6 flex gap-1 overflow-x-auto">
          {floors.map((f: any) => (
            <button
              key={f.id}
              onClick={() => setActiveFloorId(f.id)}
              className={`px-5 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                currentFloorId === f.id
                  ? "border-[#0070F2] text-[#0070F2]"
                  : "border-transparent text-muted-foreground hover:text-[#021544]"
              }`}
            >
              {f.name}{" "}
              <span className="text-xs text-muted-foreground">
                ({tables?.filter((x: any) => x.floorId === f.id).length ?? 0})
              </span>
            </button>
          ))}
        </div>
      </header>

      {/* Floor grid */}
      <main className="max-w-7xl mx-auto p-6">
        {floorTables.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            {isAr ? "لا توجد طاولات في هذا الطابق" : "No tables on this floor"}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {floorTables.map((tbl: any) => {
              const openTab = tbl.tabs?.[0];
              const isOccupied = !!openTab;
              const itemCount = openTab?.items?.length ?? 0;
              const total = openTab ? Number(openTab.total) : 0;

              return (
                <button
                  key={tbl.id}
                  onClick={() => {
                    if (isOccupied) {
                      setSelectedTabId(openTab.id);
                    } else {
                      setOpenTableDialog({ tableId: tbl.id, tableName: tbl.name });
                    }
                  }}
                  className={`p-5 rounded-2xl border-2 transition-all hover:shadow-xl hover:-translate-y-0.5 text-start ${
                    isOccupied
                      ? "bg-red-50 border-red-300 hover:border-red-500"
                      : "bg-green-50 border-green-300 hover:border-green-500"
                  } ${tbl.shape === "ROUND" ? "rounded-full aspect-square flex flex-col items-center justify-center" : ""}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className={`text-2xl font-bold ${isOccupied ? "text-red-700" : "text-green-700"}`}>
                      {tbl.name}
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isOccupied ? "bg-red-500 text-white" : "bg-green-500 text-white"
                      }`}
                    >
                      {isOccupied ? t.occupied : t.free}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    👥 {tbl.capacity} {t.seats}
                  </div>
                  {isOccupied && (
                    <div className="mt-2 pt-2 border-t border-red-200 text-xs space-y-0.5">
                      <div className="font-semibold text-red-800">
                        {itemCount} {isAr ? "صنف" : "items"}
                      </div>
                      <div className="font-mono font-bold text-red-900">
                        {total.toFixed(2)}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </main>

      {openTableDialog && (
        <OpenTabDialog
          tableId={openTableDialog.tableId}
          tableName={openTableDialog.tableName}
          isAr={isAr}
          onClose={() => setOpenTableDialog(null)}
          onOpened={(tabId) => {
            setOpenTableDialog(null);
            setSelectedTabId(tabId);
            refetchTables();
          }}
        />
      )}

      {takeawayDialog && (
        <OpenTabDialog
          tableId={null}
          tableName=""
          isAr={isAr}
          onClose={() => setTakeawayDialog(false)}
          onOpened={(tabId) => {
            setTakeawayDialog(false);
            setSelectedTabId(tabId);
            refetchTables();
          }}
        />
      )}
    </div>
  );
}

// ============ OPEN TAB DIALOG ============
function OpenTabDialog({
  tableId,
  tableName,
  isAr,
  onClose,
  onOpened,
}: {
  tableId: string | null;
  tableName: string;
  isAr: boolean;
  onClose: () => void;
  onOpened: (tabId: string) => void;
}) {
  const [guestCount, setGuestCount] = useState(2);
  const [orderType, setOrderType] = useState<"DINE_IN" | "TAKEAWAY" | "DELIVERY">(
    tableId ? "DINE_IN" : "TAKEAWAY",
  );
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const openTab = trpc.restaurant.openTab.useMutation({
    onSuccess: (tab) => onOpened(tab.id),
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-[#021544] mb-4">
          {tableId
            ? isAr
              ? `فتح حساب — طاولة ${tableName}`
              : `Open Tab — Table ${tableName}`
            : isAr
              ? "طلب تيك-أواي / دليفري"
              : "Takeaway / Delivery Order"}
        </h2>

        <div className="space-y-4">
          {!tableId && (
            <div>
              <label className="block text-xs font-semibold text-[#021544] mb-1.5">
                {isAr ? "نوع الطلب" : "Order Type"}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setOrderType("TAKEAWAY")}
                  className={`py-3 rounded-lg font-semibold text-sm ${
                    orderType === "TAKEAWAY"
                      ? "bg-orange-500 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  🛍️ {isAr ? "تيك-أواي" : "Takeaway"}
                </button>
                <button
                  onClick={() => setOrderType("DELIVERY")}
                  className={`py-3 rounded-lg font-semibold text-sm ${
                    orderType === "DELIVERY"
                      ? "bg-blue-500 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  🛵 {isAr ? "دليفري" : "Delivery"}
                </button>
              </div>
            </div>
          )}

          {tableId && (
            <div>
              <label className="block text-xs font-semibold text-[#021544] mb-1.5">
                {isAr ? "عدد الضيوف" : "Guest Count"}
              </label>
              <input
                type="number"
                min={1}
                value={guestCount}
                onChange={(e) => setGuestCount(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#021544] mb-1.5">
              {isAr ? "اسم العميل (اختياري)" : "Customer Name (optional)"}
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-input bg-background outline-none"
            />
          </div>

          {(orderType === "TAKEAWAY" || orderType === "DELIVERY") && (
            <div>
              <label className="block text-xs font-semibold text-[#021544] mb-1.5">
                {isAr ? "رقم الهاتف" : "Phone"}
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                dir="ltr"
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background outline-none"
              />
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-lg border border-border text-sm font-semibold"
          >
            {isAr ? "إلغاء" : "Cancel"}
          </button>
          <button
            onClick={() =>
              openTab.mutate({
                tableId: tableId || undefined,
                orderType,
                guestCount,
                customerName: customerName || undefined,
                customerPhone: customerPhone || undefined,
              })
            }
            disabled={openTab.isPending}
            className="flex-1 py-3 rounded-lg bg-[#0070F2] text-white text-sm font-semibold disabled:opacity-50"
          >
            {openTab.isPending
              ? isAr
                ? "جاري الفتح..."
                : "Opening..."
              : isAr
                ? "فتح الحساب"
                : "Open Tab"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============ TAB EDITOR ============
function TabEditor({
  tabId,
  isAr,
  onClose,
}: {
  tabId: string;
  isAr: boolean;
  onClose: () => void;
}) {
  const { data: tab, refetch } = trpc.restaurant.getTab.useQuery({ id: tabId });
  const { data: productsData } = trpc.inventory.listProducts.useQuery();
  const [search, setSearch] = useState("");
  const [itemNotes, setItemNotes] = useState("");
  const [splitMode, setSplitMode] = useState(false);
  const [splitSelection, setSplitSelection] = useState<Set<string>>(new Set());
  const [printTab, setPrintTab] = useState(false);

  const products = useMemo(() => {
    const all = (productsData as any)?.products || productsData || [];
    if (!search) return all;
    const q = search.toLowerCase();
    return all.filter(
      (p: any) =>
        p.nameAr?.toLowerCase().includes(q) ||
        p.nameEn?.toLowerCase().includes(q) ||
        p.code?.toLowerCase().includes(q),
    );
  }, [productsData, search]);

  const addItem = trpc.restaurant.addItem.useMutation({ onSuccess: () => refetch() });
  const removeItem = trpc.restaurant.removeItem.useMutation({ onSuccess: () => refetch() });
  const sendToKitchen = trpc.restaurant.sendToKitchen.useMutation({ onSuccess: () => refetch() });
  const closeTab = trpc.restaurant.closeTab.useMutation({
    onSuccess: () => {
      alert(isAr ? "✓ تم إغلاق الحساب وإصدار الفاتورة" : "✓ Tab closed & invoice created");
      onClose();
    },
  });
  const voidTab = trpc.restaurant.voidTab.useMutation({
    onSuccess: () => {
      alert(isAr ? "✓ تم إلغاء الحساب" : "✓ Tab voided");
      onClose();
    },
  });
  const partialClose = trpc.restaurant.partialClose.useMutation({
    onSuccess: (res) => {
      setSplitSelection(new Set());
      if (res.fullyClosed) {
        alert(isAr ? "✓ تم إغلاق الحساب بالكامل" : "✓ Tab fully closed");
        onClose();
      } else {
        alert(isAr ? "✓ تم إصدار فاتورة الجزء المحدد" : "✓ Split invoice created");
        refetch();
      }
    },
  });

  if (!tab) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">{isAr ? "جاري التحميل..." : "Loading..."}</div>
      </div>
    );
  }

  const newItems = tab.items.filter((i: any) => i.status === "NEW");
  const sentItems = tab.items.filter((i: any) => i.status === "SENT");
  const readyItems = tab.items.filter((i: any) => i.status === "READY" || i.status === "SERVED");

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="text-sm text-muted-foreground hover:text-[#021544]"
            >
              {isAr ? "← رجوع" : "← Back"}
            </button>
            <div className="h-6 w-px bg-border" />
            <div>
              <h1 className="text-lg font-bold text-[#021544]">
                #{tab.tabNumber} —{" "}
                {tab.table ? `${isAr ? "طاولة" : "Table"} ${tab.table.name}` : tab.orderType}
              </h1>
              <div className="text-xs text-muted-foreground">
                👥 {tab.guestCount} · {tab.customerName || "—"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {newItems.length > 0 && (
              <button
                onClick={() => sendToKitchen.mutate({ tabId: tab.id })}
                className="px-4 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600"
              >
                🍳 {isAr ? `للمطبخ (${newItems.length})` : `Kitchen (${newItems.length})`}
              </button>
            )}
            <button
              onClick={() => setPrintTab(true)}
              className="px-4 py-2.5 bg-gray-100 text-[#021544] rounded-lg text-sm font-semibold hover:bg-gray-200 border border-border"
            >
              🖨️ {isAr ? "طباعة" : "Print"}
            </button>
            <button
              onClick={() => {
                const reason = prompt(
                  isAr ? "سبب إلغاء الحساب:" : "Reason for voiding this tab:",
                );
                if (reason && reason.trim()) {
                  if (confirm(isAr ? "تأكيد الإلغاء؟ لا يمكن التراجع." : "Confirm void? This cannot be undone.")) {
                    voidTab.mutate({ tabId: tab.id, reason: reason.trim() });
                  }
                }
              }}
              disabled={voidTab.isPending}
              className="px-4 py-2.5 bg-red-50 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-100 border border-red-200 disabled:opacity-50"
            >
              ✕ {isAr ? "إلغاء" : "Void"}
            </button>
            <button
              onClick={() => {
                setSplitMode((v) => !v);
                setSplitSelection(new Set());
              }}
              className={`px-4 py-2.5 rounded-lg text-sm font-semibold ${
                splitMode
                  ? "bg-purple-600 text-white hover:bg-purple-700"
                  : "bg-purple-100 text-purple-700 hover:bg-purple-200"
              }`}
            >
              ✂️ {isAr ? "تقسيم" : "Split"}
            </button>
            {splitMode && splitSelection.size > 0 && (
              <button
                onClick={() =>
                  partialClose.mutate({
                    tabId: tab.id,
                    itemIds: Array.from(splitSelection),
                    paymentMethod: "CASH",
                  })
                }
                disabled={partialClose.isPending}
                className="px-4 py-2.5 bg-purple-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
              >
                💳 {isAr ? `دفع المحدد (${splitSelection.size})` : `Pay Selected (${splitSelection.size})`}
              </button>
            )}
            {!splitMode && (
              <button
                onClick={() => {
                  if (tab.items.length === 0) {
                    alert(isAr ? "الحساب فارغ" : "Tab is empty");
                    return;
                  }
                  closeTab.mutate({ tabId: tab.id, paymentMethod: "CASH" });
                }}
                disabled={closeTab.isPending}
                className="px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
              >
                💳 {isAr ? "إغلاق ودفع" : "Close & Pay"}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu (left) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border p-5">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isAr ? "ابحث عن صنف..." : "Search menu..."}
            className="w-full px-4 py-3 rounded-lg border border-input bg-background outline-none mb-4"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[calc(100vh-260px)] overflow-y-auto">
            {products?.slice(0, 60).map((p: any) => (
              <button
                key={p.id}
                onClick={() =>
                  addItem.mutate({
                    tabId: tab.id,
                    productId: p.id,
                    quantity: 1,
                    notes: itemNotes || undefined,
                  })
                }
                className="p-3 rounded-xl border border-border hover:border-[#0070F2] hover:shadow-md transition-all text-start"
              >
                <div className="text-xs font-semibold text-[#021544] line-clamp-2 min-h-[2.5rem]">
                  {p.nameAr}
                </div>
                <div className="text-xs font-mono font-bold text-[#0070F2] mt-1">
                  {Number(p.sellingPrice).toFixed(2)}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tab summary (right) */}
        <div className="bg-white rounded-2xl border border-border p-5 sticky top-24 h-fit">
          <h3 className="font-bold text-[#021544] mb-3">
            {isAr ? "أصناف الحساب" : "Tab Items"}
          </h3>

          <div className="max-h-96 overflow-y-auto space-y-2 mb-4">
            {tab.items.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                {isAr ? "لا توجد أصناف — اضغط من القائمة" : "No items — tap from menu"}
              </div>
            )}

            {(() => {
              const toggleSelection = (id: string) => {
                const next = new Set(splitSelection);
                if (next.has(id)) next.delete(id);
                else next.add(id);
                setSplitSelection(next);
              };
              const renderRow = (it: any, removable?: boolean) => (
                <TabItemRow
                  key={it.id}
                  item={it}
                  onRemove={() => removeItem.mutate({ itemId: it.id })}
                  isAr={isAr}
                  removable={removable}
                  splitMode={splitMode}
                  selected={splitSelection.has(it.id)}
                  onToggleSelect={() => toggleSelection(it.id)}
                />
              );
              return (
                <>
                  {newItems.length > 0 && (
                    <>
                      <div className="text-[10px] font-bold text-orange-600 uppercase">
                        {isAr ? "جديد" : "New"} ({newItems.length})
                      </div>
                      {newItems.map((it: any) => renderRow(it, true))}
                    </>
                  )}
                  {sentItems.length > 0 && (
                    <>
                      <div className="text-[10px] font-bold text-blue-600 uppercase mt-3">
                        {isAr ? "في المطبخ" : "Sent"} ({sentItems.length})
                      </div>
                      {sentItems.map((it: any) => renderRow(it))}
                    </>
                  )}
                  {readyItems.length > 0 && (
                    <>
                      <div className="text-[10px] font-bold text-green-600 uppercase mt-3">
                        {isAr ? "جاهز" : "Ready"}
                      </div>
                      {readyItems.map((it: any) => renderRow(it))}
                    </>
                  )}
                </>
              );
            })()}
          </div>

          <div className="border-t border-border pt-3 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{isAr ? "المجموع الفرعي" : "Subtotal"}</span>
              <span className="font-mono font-semibold">{Number(tab.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{isAr ? "الضريبة" : "VAT"}</span>
              <span className="font-mono font-semibold">{Number(tab.vatAmount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-border/50 text-base font-bold text-[#021544]">
              <span>{isAr ? "الإجمالي" : "Total"}</span>
              <span className="font-mono">{Number(tab.total).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </main>

      {printTab && (
        <ThermalReceipt
          tab={tab}
          isAr={isAr}
          onClose={() => setPrintTab(false)}
        />
      )}
    </div>
  );
}

// ============ THERMAL RECEIPT (80mm) ============
function ThermalReceipt({ tab, isAr, onClose }: { tab: any; isAr: boolean; onClose: () => void }) {
  useEffect(() => {
    // Auto-open print dialog on mount
    const timer = setTimeout(() => {
      window.print();
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const activeItems = tab.items.filter((i: any) => i.status !== "VOIDED");

  return (
    <>
      <style jsx global>{`
        @media print {
          body > div:not(.thermal-receipt) { display: none !important; }
          .thermal-receipt { display: block !important; }
          @page { size: 80mm auto; margin: 0; }
        }
        @media screen {
          .thermal-receipt { display: none; }
        }
      `}</style>

      {/* Screen overlay with preview */}
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 print:hidden">
        <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl">
          <div className="p-6 text-center">
            <div className="text-4xl mb-2">🖨️</div>
            <div className="font-bold text-[#021544] mb-1">
              {isAr ? "جاري إرسال الإيصال للطابعة..." : "Sending receipt to printer..."}
            </div>
            <div className="text-xs text-muted-foreground mb-4">
              {isAr
                ? "افتح نافذة الطباعة من المتصفح لإكمال الطباعة"
                : "Complete printing from the browser print dialog"}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-[#0070F2] text-white rounded-lg font-semibold text-sm"
              >
                {isAr ? "طباعة" : "Print"}
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 border border-border rounded-lg font-semibold text-sm"
              >
                {isAr ? "إغلاق" : "Close"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Printable receipt content (hidden on screen, shown on print) */}
      <div
        className="thermal-receipt"
        style={{
          width: "80mm",
          fontFamily: '"Courier New", monospace',
          fontSize: "11px",
          padding: "5mm",
          color: "#000",
        }}
        dir={isAr ? "rtl" : "ltr"}
      >
        <div style={{ textAlign: "center", marginBottom: "8px" }}>
          <div style={{ fontSize: "16px", fontWeight: "bold" }}>G-LEDGER</div>
          <div style={{ fontSize: "10px" }}>{isAr ? "نقطة بيع مطعم" : "Restaurant POS"}</div>
          <div style={{ fontSize: "10px", marginTop: "4px" }}>
            {new Date().toLocaleString(isAr ? "ar-EG" : "en-US")}
          </div>
        </div>

        <div style={{ borderTop: "1px dashed #000", borderBottom: "1px dashed #000", padding: "4px 0", marginBottom: "6px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>{isAr ? "حساب" : "Tab"}:</span>
            <span style={{ fontWeight: "bold" }}>#{tab.tabNumber}</span>
          </div>
          {tab.table && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{isAr ? "طاولة" : "Table"}:</span>
              <span>{tab.table.name}</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>{isAr ? "النوع" : "Type"}:</span>
            <span>{tab.orderType}</span>
          </div>
          {tab.customerName && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{isAr ? "العميل" : "Customer"}:</span>
              <span>{tab.customerName}</span>
            </div>
          )}
        </div>

        <table style={{ width: "100%", fontSize: "10px", marginBottom: "6px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #000" }}>
              <th style={{ textAlign: "start" }}>{isAr ? "الصنف" : "Item"}</th>
              <th>{isAr ? "كمية" : "Qty"}</th>
              <th style={{ textAlign: "end" }}>{isAr ? "المبلغ" : "Total"}</th>
            </tr>
          </thead>
          <tbody>
            {activeItems.map((it: any) => (
              <tr key={it.id}>
                <td style={{ padding: "2px 0" }}>{it.product.nameAr}</td>
                <td style={{ textAlign: "center" }}>{Number(it.quantity)}</td>
                <td style={{ textAlign: "end" }}>{Number(it.totalPrice).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ borderTop: "1px dashed #000", paddingTop: "4px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>{isAr ? "المجموع" : "Subtotal"}:</span>
            <span>{Number(tab.subtotal).toFixed(2)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>{isAr ? "الضريبة" : "VAT"}:</span>
            <span>{Number(tab.vatAmount).toFixed(2)}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "14px",
              fontWeight: "bold",
              marginTop: "4px",
              paddingTop: "4px",
              borderTop: "2px solid #000",
            }}
          >
            <span>{isAr ? "الإجمالي" : "TOTAL"}:</span>
            <span>{Number(tab.total).toFixed(2)}</span>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "10px", fontSize: "9px" }}>
          {isAr ? "شكراً لزيارتكم" : "Thank you for your visit"}
          <br />
          g-ledger.com
        </div>
      </div>
    </>
  );
}

function TabItemRow({
  item,
  onRemove,
  isAr,
  removable,
  splitMode,
  selected,
  onToggleSelect,
}: {
  item: any;
  onRemove: () => void;
  isAr: boolean;
  removable?: boolean;
  splitMode?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
}) {
  const rowClass = splitMode
    ? `flex items-start gap-2 p-2 rounded-lg cursor-pointer transition-all ${
        selected ? "bg-purple-100 ring-2 ring-purple-400" : "bg-muted/30 hover:bg-muted/50"
      }`
    : "flex items-start gap-2 p-2 rounded-lg bg-muted/30";

  return (
    <div className={rowClass} onClick={splitMode ? onToggleSelect : undefined}>
      {splitMode && (
        <input
          type="checkbox"
          checked={!!selected}
          onChange={() => {}}
          className="mt-1 w-4 h-4 accent-purple-600"
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-[#021544] truncate">{item.product.nameAr}</div>
        <div className="text-[10px] text-muted-foreground">
          {Number(item.quantity)} × {Number(item.unitPrice).toFixed(2)}
          {item.station && <span className="ml-2">🍳 {item.station.name}</span>}
        </div>
        {item.notes && <div className="text-[10px] text-orange-600 italic">"{item.notes}"</div>}
      </div>
      <div className="text-xs font-mono font-bold text-[#021544]">
        {Number(item.totalPrice).toFixed(2)}
      </div>
      {!splitMode && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="text-red-500 hover:text-red-700 text-xs"
          title={isAr ? "حذف" : "Remove"}
        >
          ✕
        </button>
      )}
    </div>
  );
}
