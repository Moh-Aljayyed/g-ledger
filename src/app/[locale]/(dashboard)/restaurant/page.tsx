"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { trpc } from "@/lib/trpc";

type Tab = "floors" | "tables" | "stations" | "modifiers";

export default function RestaurantSetupPage() {
  const pathname = usePathname();
  const isAr = pathname.startsWith("/ar");
  const [tab, setTab] = useState<Tab>("floors");

  const t = {
    title: isAr ? "إعدادات المطعم" : "Restaurant Setup",
    subtitle: isAr
      ? "أدر الطوابق، الطاولات، محطات المطبخ، والإضافات (Modifiers)"
      : "Manage floors, tables, kitchen stations, and modifiers",
    tabs: {
      floors: isAr ? "الطوابق والأقسام" : "Floors",
      tables: isAr ? "الطاولات" : "Tables",
      stations: isAr ? "محطات المطبخ" : "Kitchen Stations",
      modifiers: isAr ? "الإضافات" : "Modifiers",
    },
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#021544]">{t.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t.subtitle}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border">
        {(["floors", "tables", "stations", "modifiers"] as Tab[]).map((k) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === k
                ? "border-[#0070F2] text-[#0070F2]"
                : "border-transparent text-muted-foreground hover:text-[#021544]"
            }`}
          >
            {t.tabs[k]}
          </button>
        ))}
      </div>

      {tab === "floors" && <FloorsPanel isAr={isAr} />}
      {tab === "tables" && <TablesPanel isAr={isAr} />}
      {tab === "stations" && <StationsPanel isAr={isAr} />}
      {tab === "modifiers" && <ModifiersPanel isAr={isAr} />}
    </div>
  );
}

// ============ FLOORS ============
function FloorsPanel({ isAr }: { isAr: boolean }) {
  const { data: floors, refetch } = trpc.restaurant.listFloors.useQuery();
  const [name, setName] = useState("");

  const create = trpc.restaurant.createFloor.useMutation({
    onSuccess: () => {
      setName("");
      refetch();
    },
  });
  const del = trpc.restaurant.deleteFloor.useMutation({ onSuccess: () => refetch() });

  return (
    <div className="max-w-2xl space-y-4">
      <div className="bg-card rounded-xl border border-border p-5">
        <h2 className="text-base font-semibold text-[#021544] mb-3">
          {isAr ? "إضافة طابق جديد" : "Add New Floor"}
        </h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={isAr ? "مثال: الدور الأرضي، الشرفة، VIP" : "e.g. Ground Floor, Terrace, VIP"}
            className="flex-1 px-4 py-2.5 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-[#0070F2]/20"
          />
          <button
            onClick={() => name && create.mutate({ name, displayOrder: 0 })}
            disabled={!name || create.isPending}
            className="px-5 py-2.5 bg-[#0070F2] text-white rounded-lg text-sm font-semibold disabled:opacity-50"
          >
            {isAr ? "إضافة" : "Add"}
          </button>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border">
        <div className="p-5 border-b border-border">
          <h2 className="text-base font-semibold text-[#021544]">
            {isAr ? "الطوابق الحالية" : "Current Floors"}{" "}
            <span className="text-xs text-muted-foreground font-normal">
              ({floors?.length ?? 0})
            </span>
          </h2>
        </div>
        <div className="divide-y divide-border/50">
          {floors?.map((f: any) => (
            <div key={f.id} className="flex items-center justify-between p-4">
              <div>
                <div className="font-medium text-[#021544]">{f.name}</div>
                <div className="text-xs text-muted-foreground">
                  {f.tables?.length ?? 0} {isAr ? "طاولة" : "tables"}
                </div>
              </div>
              <button
                onClick={() => del.mutate({ id: f.id })}
                className="text-xs text-red-600 hover:bg-red-50 px-3 py-1 rounded"
              >
                {isAr ? "حذف" : "Delete"}
              </button>
            </div>
          ))}
          {(!floors || floors.length === 0) && (
            <div className="p-6 text-center text-sm text-muted-foreground">
              {isAr ? "لا توجد طوابق بعد — أضف أول طابق" : "No floors yet — add your first"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============ TABLES ============
function TablesPanel({ isAr }: { isAr: boolean }) {
  const { data: floors } = trpc.restaurant.listFloors.useQuery();
  const { data: tables, refetch } = trpc.restaurant.listTables.useQuery();
  const [name, setName] = useState("");
  const [floorId, setFloorId] = useState("");
  const [capacity, setCapacity] = useState(4);
  const [shape, setShape] = useState<"SQUARE" | "ROUND" | "RECT">("SQUARE");

  const create = trpc.restaurant.createTable.useMutation({
    onSuccess: () => {
      setName("");
      setCapacity(4);
      refetch();
    },
  });
  const del = trpc.restaurant.deleteTable.useMutation({ onSuccess: () => refetch() });

  if (!floors || floors.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center max-w-2xl">
        <p className="text-sm text-amber-700 font-medium">
          {isAr
            ? "⚠️ أنشئ طابقاً واحداً على الأقل قبل إضافة الطاولات"
            : "⚠️ Create at least one floor before adding tables"}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-4">
      <div className="bg-card rounded-xl border border-border p-5">
        <h2 className="text-base font-semibold text-[#021544] mb-3">
          {isAr ? "إضافة طاولة جديدة" : "Add New Table"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={isAr ? "اسم الطاولة (T1)" : "Table name (T1)"}
            className="px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none"
          />
          <select
            value={floorId}
            onChange={(e) => setFloorId(e.target.value)}
            className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
          >
            <option value="">{isAr ? "اختر الطابق" : "Select floor"}</option>
            {floors.map((f: any) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={capacity}
            min={1}
            onChange={(e) => setCapacity(parseInt(e.target.value) || 1)}
            placeholder={isAr ? "عدد المقاعد" : "Capacity"}
            className="px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none"
          />
          <select
            value={shape}
            onChange={(e) => setShape(e.target.value as any)}
            className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
          >
            <option value="SQUARE">{isAr ? "مربعة" : "Square"}</option>
            <option value="ROUND">{isAr ? "دائرية" : "Round"}</option>
            <option value="RECT">{isAr ? "مستطيلة" : "Rectangle"}</option>
          </select>
        </div>
        <button
          onClick={() => {
            if (name && floorId) {
              create.mutate({ name, floorId, capacity, shape });
            }
          }}
          disabled={!name || !floorId || create.isPending}
          className="mt-3 px-5 py-2.5 bg-[#0070F2] text-white rounded-lg text-sm font-semibold disabled:opacity-50"
        >
          {isAr ? "إضافة الطاولة" : "Add Table"}
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border">
        <div className="p-5 border-b border-border">
          <h2 className="text-base font-semibold text-[#021544]">
            {isAr ? "الطاولات" : "Tables"}{" "}
            <span className="text-xs text-muted-foreground font-normal">
              ({tables?.length ?? 0})
            </span>
          </h2>
        </div>
        <div className="divide-y divide-border/50">
          {tables?.map((tbl: any) => (
            <div key={tbl.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 flex items-center justify-center bg-[#0070F2]/10 text-[#0070F2] font-bold text-sm ${
                    tbl.shape === "ROUND" ? "rounded-full" : "rounded-lg"
                  }`}
                >
                  {tbl.name}
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    {floors.find((f: any) => f.id === tbl.floorId)?.name} ·{" "}
                    {isAr ? `${tbl.capacity} مقاعد` : `${tbl.capacity} seats`}
                  </div>
                </div>
              </div>
              <button
                onClick={() => del.mutate({ id: tbl.id })}
                className="text-xs text-red-600 hover:bg-red-50 px-3 py-1 rounded"
              >
                {isAr ? "حذف" : "Delete"}
              </button>
            </div>
          ))}
          {(!tables || tables.length === 0) && (
            <div className="p-6 text-center text-sm text-muted-foreground">
              {isAr ? "لا توجد طاولات بعد" : "No tables yet"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============ STATIONS ============
function StationsPanel({ isAr }: { isAr: boolean }) {
  const { data: stations, refetch } = trpc.restaurant.listStations.useQuery();
  const [name, setName] = useState("");
  const [printerName, setPrinterName] = useState("");
  const [displayColor, setDisplayColor] = useState("#0070F2");

  const create = trpc.restaurant.createStation.useMutation({
    onSuccess: () => {
      setName("");
      setPrinterName("");
      refetch();
    },
  });
  const del = trpc.restaurant.deleteStation.useMutation({ onSuccess: () => refetch() });

  return (
    <div className="max-w-2xl space-y-4">
      <div className="bg-card rounded-xl border border-border p-5">
        <h2 className="text-base font-semibold text-[#021544] mb-1">
          {isAr ? "محطات المطبخ" : "Kitchen Stations"}
        </h2>
        <p className="text-xs text-muted-foreground mb-3">
          {isAr
            ? "كل محطة تطبع طلباتها على طابعة محددة (مثلاً: الجريل، السلطات، البار)"
            : "Each station routes its orders to a specific printer (e.g. Grill, Salads, Bar)"}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={isAr ? "الاسم (الجريل)" : "Name (Grill)"}
            className="px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none"
          />
          <input
            type="text"
            value={printerName}
            onChange={(e) => setPrinterName(e.target.value)}
            placeholder={isAr ? "طابعة (اختياري)" : "Printer (optional)"}
            className="px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none"
          />
          <input
            type="color"
            value={displayColor}
            onChange={(e) => setDisplayColor(e.target.value)}
            className="h-10 rounded-lg border border-input bg-background"
          />
        </div>
        <button
          onClick={() => name && create.mutate({ name, printerName: printerName || undefined, displayColor })}
          disabled={!name || create.isPending}
          className="mt-3 px-5 py-2.5 bg-[#0070F2] text-white rounded-lg text-sm font-semibold disabled:opacity-50"
        >
          {isAr ? "إضافة المحطة" : "Add Station"}
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border">
        <div className="p-5 border-b border-border">
          <h2 className="text-base font-semibold text-[#021544]">
            {isAr ? "المحطات الحالية" : "Current Stations"}
          </h2>
        </div>
        <div className="divide-y divide-border/50">
          {stations?.map((s: any) => (
            <div key={s.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: s.displayColor || "#0070F2" }}
                >
                  {s.name.slice(0, 2)}
                </div>
                <div>
                  <div className="font-medium text-[#021544]">{s.name}</div>
                  {s.printerName && (
                    <div className="text-xs text-muted-foreground">🖨️ {s.printerName}</div>
                  )}
                </div>
              </div>
              <button
                onClick={() => del.mutate({ id: s.id })}
                className="text-xs text-red-600 hover:bg-red-50 px-3 py-1 rounded"
              >
                {isAr ? "حذف" : "Delete"}
              </button>
            </div>
          ))}
          {(!stations || stations.length === 0) && (
            <div className="p-6 text-center text-sm text-muted-foreground">
              {isAr ? "لا توجد محطات بعد" : "No stations yet"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============ MODIFIERS ============
function ModifiersPanel({ isAr }: { isAr: boolean }) {
  const { data: groups, refetch } = trpc.restaurant.listModifierGroups.useQuery();
  const [groupName, setGroupName] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [modName, setModName] = useState("");
  const [modPrice, setModPrice] = useState(0);

  const createGroup = trpc.restaurant.createModifierGroup.useMutation({
    onSuccess: () => {
      setGroupName("");
      refetch();
    },
  });
  const addMod = trpc.restaurant.addModifier.useMutation({
    onSuccess: () => {
      setModName("");
      setModPrice(0);
      refetch();
    },
  });
  const delGroup = trpc.restaurant.deleteModifierGroup.useMutation({
    onSuccess: () => refetch(),
  });

  return (
    <div className="max-w-3xl space-y-4">
      <div className="bg-card rounded-xl border border-border p-5">
        <h2 className="text-base font-semibold text-[#021544] mb-1">
          {isAr ? "مجموعة إضافات جديدة" : "New Modifier Group"}
        </h2>
        <p className="text-xs text-muted-foreground mb-3">
          {isAr
            ? "مثال: 'الحجم' (صغير، وسط، كبير) أو 'الإضافات' (جبنة، مشروم، لحم)"
            : "e.g. 'Size' (Small, Medium, Large) or 'Extras' (Cheese, Mushroom, Bacon)"}
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder={isAr ? "اسم المجموعة" : "Group name"}
            className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none"
          />
          <button
            onClick={() => groupName && createGroup.mutate({ name: groupName, minSelect: 0, maxSelect: 1, isRequired: false })}
            disabled={!groupName || createGroup.isPending}
            className="px-5 py-2.5 bg-[#0070F2] text-white rounded-lg text-sm font-semibold disabled:opacity-50"
          >
            {isAr ? "إضافة" : "Add"}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {groups?.map((g: any) => (
          <div key={g.id} className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-[#021544]">{g.name}</h3>
              <button
                onClick={() => delGroup.mutate({ id: g.id })}
                className="text-xs text-red-600 hover:bg-red-50 px-3 py-1 rounded"
              >
                {isAr ? "حذف المجموعة" : "Delete Group"}
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {g.modifiers?.map((m: any) => (
                <span
                  key={m.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0070F2]/10 text-[#0070F2] text-xs font-medium"
                >
                  {m.name}
                  {Number(m.priceAdjust) > 0 && <span>+{Number(m.priceAdjust)}</span>}
                </span>
              ))}
              {(!g.modifiers || g.modifiers.length === 0) && (
                <span className="text-xs text-muted-foreground italic">
                  {isAr ? "لا توجد إضافات بعد" : "No modifiers yet"}
                </span>
              )}
            </div>

            {selectedGroupId === g.id ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={modName}
                  onChange={(e) => setModName(e.target.value)}
                  placeholder={isAr ? "اسم الإضافة" : "Modifier name"}
                  className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none"
                />
                <input
                  type="number"
                  value={modPrice}
                  onChange={(e) => setModPrice(parseFloat(e.target.value) || 0)}
                  placeholder={isAr ? "السعر" : "Price"}
                  className="w-24 px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none"
                />
                <button
                  onClick={() => {
                    if (modName) {
                      addMod.mutate({ groupId: g.id, name: modName, priceAdjust: modPrice });
                    }
                  }}
                  disabled={!modName || addMod.isPending}
                  className="px-4 py-2 bg-[#0070F2] text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                >
                  {isAr ? "حفظ" : "Save"}
                </button>
                <button
                  onClick={() => setSelectedGroupId(null)}
                  className="px-3 py-2 text-xs text-muted-foreground"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSelectedGroupId(g.id)}
                className="text-xs text-[#0070F2] font-semibold"
              >
                + {isAr ? "إضافة عنصر جديد" : "Add modifier"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
