"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// Knowledge base about the system
const KNOWLEDGE_BASE: { q: string[]; a: string }[] = [
  {
    q: ["كيف أضيف قيد", "إنشاء قيد", "قيد جديد", "اضافة قيد", "journal entry"],
    a: "لإضافة قيد يومي:\n1. اذهب إلى القيود اليومية من القائمة الجانبية\n2. اضغط '+ قيد جديد'\n3. اختر التاريخ واكتب الوصف\n4. أضف سطور القيد (حساب مدين وحساب دائن)\n5. تأكد أن إجمالي المدين = إجمالي الدائن\n6. اضغط 'حفظ كمسودة' ثم 'ترحيل'"
  },
  {
    q: ["شجرة الحسابات", "إضافة حساب", "chart of accounts", "حسابات"],
    a: "شجرة الحسابات تم إعدادها تلقائيًا حسب قطاعك. لإضافة حساب فرعي:\n1. اذهب إلى شجرة الحسابات\n2. اضغط '+ فرعي' بجانب الحساب الأب\n3. أدخل الرمز والاسم والنوع\n4. اضغط حفظ"
  },
  {
    q: ["فاتورة", "إنشاء فاتورة", "فاتورة مبيعات", "invoice", "فواتير"],
    a: "لإنشاء فاتورة إلكترونية:\n1. اذهب إلى الفواتير الإلكترونية\n2. اضغط '+ فاتورة جديدة'\n3. اختر النوع (مبيعات/مشتريات)\n4. أدخل بيانات المشتري والأصناف\n5. النظام يحسب الضريبة تلقائيًا\n6. احفظ ثم اضغط 'إرسال لمصلحة الضرائب'"
  },
  {
    q: ["ميزان المراجعة", "trial balance", "ميزان"],
    a: "ميزان المراجعة:\n1. اذهب إلى التقارير > ميزان المراجعة\n2. اختر التاريخ\n3. سيظهر لك جميع الحسابات بأرصدتها المدينة والدائنة\n4. إجمالي المدين يجب أن يساوي إجمالي الدائن"
  },
  {
    q: ["قائمة الدخل", "income statement", "أرباح", "خسائر"],
    a: "قائمة الدخل:\n1. اذهب إلى التقارير > قائمة الدخل\n2. اختر الفترة (من تاريخ - إلى تاريخ)\n3. ستظهر الإيرادات والمصروفات وصافي الربح/الخسارة"
  },
  {
    q: ["الميزانية", "balance sheet", "ميزانية عمومية", "المركز المالي"],
    a: "الميزانية العمومية:\n1. اذهب إلى التقارير > الميزانية العمومية\n2. اختر التاريخ\n3. ستظهر الأصول والخصوم وحقوق الملكية\n4. يجب أن تكون متوازنة: الأصول = الخصوم + حقوق الملكية"
  },
  {
    q: ["عميل", "إضافة عميل", "customer", "عملاء"],
    a: "لإضافة عميل:\n1. اذهب إلى المبيعات > العملاء\n2. اضغط '+ إضافة عميل'\n3. أدخل الرمز والاسم والرقم الضريبي\n4. حدد حد الائتمان وشروط الدفع"
  },
  {
    q: ["مورد", "إضافة مورد", "vendor", "موردون", "موردين"],
    a: "لإضافة مورد:\n1. اذهب إلى المشتريات > الموردون\n2. اضغط '+ إضافة مورد'\n3. أدخل البيانات (الرمز، الاسم، الرقم الضريبي)\n4. حدد شروط الدفع"
  },
  {
    q: ["راتب", "رواتب", "payroll", "مسير رواتب", "salary"],
    a: "لإعداد مسير الرواتب:\n1. أضف الموظفين أولاً من الموارد البشرية > الموظفون\n2. اذهب إلى مسير الرواتب\n3. اضغط 'إنشاء مسير' واختر الشهر\n4. النظام يحسب الرواتب + التأمينات (GOSI) تلقائيًا\n5. اضغط 'اعتماد' ثم 'صرف'\n6. يتم إنشاء قيد محاسبي تلقائياً"
  },
  {
    q: ["بنك", "حساب بنكي", "bank", "إيداع", "سحب", "تحويل"],
    a: "إدارة البنوك:\n1. اذهب إلى البنوك والنقدية\n2. أضف حساب بنكي جديد\n3. سجل الإيداعات والسحوبات\n4. استخدم التحويل بين الحسابات\n5. طابق الحركات مع كشف البنك\nكل حركة تنشئ قيد محاسبي تلقائياً"
  },
  {
    q: ["مخزون", "منتج", "بضاعة", "inventory", "stock", "product"],
    a: "إدارة المخزون:\n1. اذهب إلى المخزون\n2. أضف المنتجات (الكود، الاسم، السعر، الكمية)\n3. سجل حركات المخزون (وارد/صادر/تسوية)\n4. تابع تنبيهات نقص المخزون\n5. تابع الأصناف المنتهية الصلاحية"
  },
  {
    q: ["أصل ثابت", "أصول ثابتة", "إهلاك", "depreciation", "fixed asset"],
    a: "إدارة الأصول الثابتة:\n1. اذهب إلى الأصول الثابتة\n2. أضف الأصل (الاسم، التكلفة، العمر الإنتاجي)\n3. اختر طريقة الإهلاك (قسط ثابت/متناقص)\n4. شغّل الإهلاك الشهري\n5. يتم إنشاء قيد إهلاك تلقائياً"
  },
  {
    q: ["ضريبة", "ضرائب", "ض.ق.م", "VAT", "tax", "فوترة إلكترونية"],
    a: "إعدادات الضرائب:\n1. اذهب إلى إعدادات الضرائب\n2. اختر الدولة (مصر/السعودية)\n3. أدخل الرقم الضريبي وبيانات الشركة\n4. لمصر: أدخل Client ID و Secret من مصلحة الضرائب\n5. للسعودية: سجل جهازك عبر ZATCA OTP\n6. ابدأ بإرسال الفواتير الإلكترونية"
  },
  {
    q: ["اشتراك", "باقة", "ترقية", "subscription", "plan", "تخزين"],
    a: "الاشتراك والباقات:\n• تجربة مجانية: 512MB، 3 مستخدمين، سنة\n• أساسي ($29/شهر): 5GB، 5 مستخدمين\n• احترافي ($79/شهر): 20GB، 15 مستخدم\n• مؤسسي ($199/شهر): 100GB، غير محدود\nللترقية اذهب إلى الإعدادات"
  },
  {
    q: ["مساعدة", "help", "كيف", "ما هو", "شرح"],
    a: "أهلاً! أنا مساعدك في G-Ledger. يمكنني مساعدتك في:\n• إنشاء القيود المحاسبية\n• إصدار الفواتير الإلكترونية\n• إدارة العملاء والموردين\n• مسير الرواتب\n• إدارة المخزون والأصول\n• التقارير المالية\n\nاسألني عن أي شيء!"
  },
];

function findAnswer(question: string): string {
  const q = question.toLowerCase().trim();

  for (const entry of KNOWLEDGE_BASE) {
    for (const keyword of entry.q) {
      if (q.includes(keyword.toLowerCase())) {
        return entry.a;
      }
    }
  }

  return "عذرًا، لم أفهم سؤالك. يمكنك أن تسألني عن:\n• القيود المحاسبية\n• الفواتير الإلكترونية\n• العملاء والموردين\n• الرواتب\n• المخزون\n• الأصول الثابتة\n• التقارير المالية\n• الضرائب\n\nأو اكتب 'مساعدة' للمزيد.";
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "أهلاً! أنا مساعدك في G-Ledger 👋\nكيف يمكنني مساعدتك؟" },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setInput("");

    // Simulate typing delay
    setTimeout(() => {
      const answer = findAnswer(userMessage);
      setMessages(prev => [...prev, { role: "assistant", content: answer }]);
    }, 500);
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110"
        style={{ background: "linear-gradient(135deg, #021544, #0070F2)" }}
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 left-6 z-50 w-80 h-[450px] bg-white rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 text-white flex items-center gap-3" style={{ background: "linear-gradient(135deg, #021544, #0070F2)" }}>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
            </div>
            <div>
              <div className="text-sm font-bold">مساعد G-Ledger</div>
              <div className="text-[10px] text-white/60">متصل الآن</div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm whitespace-pre-line ${
                  msg.role === "user"
                    ? "bg-[#0070F2] text-white rounded-tl-none"
                    : "bg-gray-100 text-gray-800 rounded-tr-none"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="اكتب سؤالك هنا..."
                className="flex-1 px-3 py-2 rounded-lg border border-input bg-gray-50 text-sm outline-none focus:ring-1 focus:ring-[#0070F2]"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="px-3 py-2 rounded-lg bg-[#0070F2] text-white disabled:opacity-50 transition-all"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
