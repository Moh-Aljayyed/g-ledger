import Link from "next/link";
import { LogoFull } from "@/components/logo";

export default function SLAPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border/50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/ar"><LogoFull size="sm" variant="dark" /></Link>
          <Link href="/ar/register" className="px-4 py-2 text-sm bg-[#0070F2] text-white rounded-lg hover:bg-[#005ed4] transition-colors">ابدأ مجاناً</Link>
        </div>
      </header>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-[#021544] mb-2">اتفاقية مستوى الخدمة (SLA)</h1>
        <p className="text-sm text-muted-foreground mb-8">آخر تحديث: مارس 2026</p>
        <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed space-y-8" dir="rtl">

          <p>
            تحدد هذه الاتفاقية مستوى الخدمة الذي تلتزم به شركة G-Ledger تجاه عملائها المشتركين. تُعتبر هذه الاتفاقية جزءاً لا يتجزأ من{" "}
            <Link href="/ar/legal/terms" className="text-[#0070F2] hover:underline">شروط الاستخدام</Link> وتُقرأ معها.
          </p>

          {/* 1. نطاق الخدمة */}
          <section>
            <h2 className="text-xl font-bold text-[#021544] mb-3">1. نطاق الخدمة</h2>
            <ul className="list-disc pr-6 space-y-2">
              <li>
                النظام متاح عبر الإنترنت على الموقع الإلكتروني{" "}
                <a href="https://g-ledger.com" className="text-[#0070F2] hover:underline" dir="ltr">g-ledger.com</a>{" "}
                ويمكن الوصول إليه من أي جهاز متصل بالإنترنت عبر متصفح ويب حديث.
              </li>
              <li>
                تشمل الخدمة جميع الموديولات المتاحة حسب الباقة المشترك فيها العميل، بما في ذلك: المحاسبة العامة، دفتر الأستاذ، القيود المحاسبية، الفوترة الإلكترونية، إدارة العملاء والموردين، المخزون، الأصول الثابتة، الرواتب، البنوك والنقدية، نقاط البيع، الإنتاج، المشاريع، إدارة علاقات العملاء (CRM)، والتقارير المالية.
              </li>
              <li>
                تشمل الخدمة أيضاً التحديثات الدورية للنظام، إصلاحات الأخطاء، وإضافة مميزات جديدة دون تكلفة إضافية ضمن الباقة المشترك فيها.
              </li>
              <li>
                الخدمة متاحة باللغة العربية وتدعم العمل في 29+ دولة حول العالم (14 دولة عربية و15 دولة عالمية) مع ضرائب وأنظمة فوترة إلكترونية مخصصة لكل دولة.
              </li>
            </ul>
          </section>

          {/* 2. وقت التشغيل المضمون */}
          <section>
            <h2 className="text-xl font-bold text-[#021544] mb-3">2. وقت التشغيل المضمون</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-lg font-bold text-blue-800 text-center">
                نضمن وقت تشغيل لا يقل عن 99.5% شهرياً
              </p>
            </div>
            <p className="mb-3">يُحسب وقت التشغيل كنسبة مئوية من إجمالي دقائق الشهر مطروحاً منها أوقات التعطل غير المخطط لها:</p>
            <div className="bg-gray-50 rounded-lg p-3 font-mono text-sm text-center mb-3" dir="ltr">
              Uptime % = ((Total Minutes - Unplanned Downtime) / Total Minutes) x 100
            </div>
            <p className="mb-2 font-semibold">لا يشمل حساب وقت التعطل الحالات التالية:</p>
            <ul className="list-disc pr-6 space-y-2">
              <li>
                <strong>الصيانة المجدولة:</strong> الأوقات المحددة مسبقاً للصيانة والتحديثات المعلن عنها مسبقاً.
              </li>
              <li>
                <strong>أعطال مزودي الطرف الثالث:</strong> أي انقطاع ناتج عن خدمات الاستضافة السحابية، شبكات توصيل المحتوى (CDN)، خدمات DNS، بوابات الدفع، أو أي مزود خدمة خارجي.
              </li>
              <li>
                <strong>القوة القاهرة:</strong> الكوارث الطبيعية، الحروب، الأوبئة، الأعطال الكهربائية واسعة النطاق، القرارات الحكومية، أو أي ظروف خارجة عن سيطرة الشركة.
              </li>
              <li>
                <strong>أعطال من جانب العميل:</strong> مشاكل في اتصال الإنترنت الخاص بالعميل، إعدادات المتصفح، أو أجهزة العميل.
              </li>
            </ul>
          </section>

          {/* 3. الصيانة */}
          <section>
            <h2 className="text-xl font-bold text-[#021544] mb-3">3. الصيانة</h2>

            <h3 className="text-base font-semibold text-[#021544] mb-2 mt-4">أ. الصيانة المجدولة</h3>
            <ul className="list-disc pr-6 space-y-2">
              <li>يتم إشعار المستخدمين بالصيانة المجدولة قبل 24 ساعة على الأقل عبر البريد الإلكتروني وإشعار داخل النظام.</li>
              <li>تُجرى الصيانة المجدولة عادةً في أوقات الحد الأدنى من الاستخدام (بين الساعة 2:00 و 5:00 صباحاً بتوقيت القاهرة).</li>
              <li>مدة الصيانة المجدولة لا تتجاوز عادةً 4 ساعات.</li>
              <li>وقت الصيانة المجدولة لا يُحتسب ضمن وقت التعطل عند حساب نسبة التشغيل.</li>
            </ul>

            <h3 className="text-base font-semibold text-[#021544] mb-2 mt-4">ب. الصيانة الطارئة</h3>
            <ul className="list-disc pr-6 space-y-2">
              <li>في الحالات الحرجة التي تهدد أمن النظام أو سلامة بيانات المستخدمين، قد تُجرى صيانة طارئة بدون إشعار مسبق.</li>
              <li>سيتم إشعار المستخدمين في أقرب وقت ممكن بعد بدء الصيانة الطارئة مع شرح السبب والوقت المتوقع للانتهاء.</li>
              <li>نسعى لتقليل وقت الصيانة الطارئة إلى أدنى حد ممكن.</li>
            </ul>
          </section>

          {/* 4. الدعم الفني */}
          <section>
            <h2 className="text-xl font-bold text-[#021544] mb-3">4. الدعم الفني</h2>
            <p className="mb-4">مستوى الدعم الفني يختلف حسب الباقة المشترك فيها:</p>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-[#021544] text-white">
                    <th className="border border-gray-300 px-4 py-3 text-right">الباقة</th>
                    <th className="border border-gray-300 px-4 py-3 text-right">قنوات الدعم</th>
                    <th className="border border-gray-300 px-4 py-3 text-right">وقت الاستجابة</th>
                    <th className="border border-gray-300 px-4 py-3 text-right">ساعات العمل</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white">
                    <td className="border border-gray-200 px-4 py-3 font-medium">المجانية</td>
                    <td className="border border-gray-200 px-4 py-3">شات بوت ذكي + بريد إلكتروني</td>
                    <td className="border border-gray-200 px-4 py-3">خلال 24 ساعة</td>
                    <td className="border border-gray-200 px-4 py-3">الشات بوت 24/7 — الإيميل أيام العمل</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-200 px-4 py-3 font-medium">الأساسية ($8)</td>
                    <td className="border border-gray-200 px-4 py-3">بريد إلكتروني + شات بوت</td>
                    <td className="border border-gray-200 px-4 py-3">خلال 12 ساعة</td>
                    <td className="border border-gray-200 px-4 py-3">الأحد — الخميس</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="border border-gray-200 px-4 py-3 font-medium">الاحترافية ($15)</td>
                    <td className="border border-gray-200 px-4 py-3">بريد إلكتروني + دعم مباشر بأولوية</td>
                    <td className="border border-gray-200 px-4 py-3">خلال 6 ساعات</td>
                    <td className="border border-gray-200 px-4 py-3">الأحد — الخميس + طوارئ الجمعة</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-200 px-4 py-3 font-medium">المؤسسية ($25)</td>
                    <td className="border border-gray-200 px-4 py-3">مدير حساب مخصص + دعم 24/7</td>
                    <td className="border border-gray-200 px-4 py-3">خلال ساعة واحدة</td>
                    <td className="border border-gray-200 px-4 py-3">24/7 على مدار الساعة</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 space-y-2">
              <p className="text-sm">
                <strong>تصنيف الأولوية:</strong> يتم تصنيف طلبات الدعم حسب الخطورة:
              </p>
              <ul className="list-disc pr-6 space-y-1 text-sm">
                <li><strong>حرج:</strong> النظام متوقف بالكامل أو فقدان بيانات — أولوية قصوى.</li>
                <li><strong>عالي:</strong> خلل يؤثر على وظيفة أساسية بدون حل بديل.</li>
                <li><strong>متوسط:</strong> خلل يؤثر على وظيفة مع وجود حل بديل.</li>
                <li><strong>منخفض:</strong> استفسار عام أو طلب تحسين.</li>
              </ul>
            </div>
          </section>

          {/* 5. النسخ الاحتياطي والاستعادة */}
          <section>
            <h2 className="text-xl font-bold text-[#021544] mb-3">5. النسخ الاحتياطي والاستعادة</h2>
            <ul className="list-disc pr-6 space-y-2">
              <li>
                <strong>النسخ الاحتياطي اليومي:</strong> يتم إجراء نسخ احتياطي تلقائي يومياً لجميع بيانات العملاء. النسخ مشفرة ومخزنة في مواقع جغرافية متعددة لضمان أقصى حماية.
              </li>
              <li>
                <strong>مدة الاحتفاظ:</strong> نحتفظ بآخر 30 نسخة احتياطية (أي ما يعادل آخر 30 يوماً)، مما يتيح الاستعادة إلى أي نقطة خلال الشهر الأخير.
              </li>
              <li>
                <strong>طلب الاستعادة:</strong> في حال حاجتك لاستعادة بياناتك من نسخة احتياطية (بسبب حذف خاطئ أو تلف بيانات)، يمكنك تقديم طلب عبر الدعم الفني وسيتم تنفيذه خلال 24 ساعة كحد أقصى.
              </li>
              <li>
                <strong>الاستعادة الذاتية:</strong> لبعض العمليات البسيطة (مثل استعادة قيد محذوف)، تتوفر أدوات استعادة ذاتية داخل النظام يمكنك استخدامها مباشرة.
              </li>
              <li>
                <strong>اختبار النسخ:</strong> نقوم باختبار النسخ الاحتياطية بشكل دوري للتأكد من قابلية الاستعادة وسلامة البيانات.
              </li>
            </ul>
          </section>

          {/* 6. التعويض */}
          <section>
            <h2 className="text-xl font-bold text-[#021544] mb-3">6. التعويض</h2>
            <p className="mb-4">
              إذا انخفض وقت التشغيل الفعلي عن النسبة المضمونة (99.5%) في أي شهر تقويمي، يحق للعميل الحصول على تعويض وفقاً للجدول التالي:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-[#021544] text-white">
                    <th className="border border-gray-300 px-4 py-3 text-right">نسبة التشغيل الفعلية</th>
                    <th className="border border-gray-300 px-4 py-3 text-right">نسبة التعويض</th>
                    <th className="border border-gray-300 px-4 py-3 text-right">مثال (اشتراك $100/شهر)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-yellow-50">
                    <td className="border border-gray-200 px-4 py-3">99.0% — 99.5%</td>
                    <td className="border border-gray-200 px-4 py-3 font-medium">10% من قيمة الشهر</td>
                    <td className="border border-gray-200 px-4 py-3">رصيد $10</td>
                  </tr>
                  <tr className="bg-orange-50">
                    <td className="border border-gray-200 px-4 py-3">95.0% — 99.0%</td>
                    <td className="border border-gray-200 px-4 py-3 font-medium">25% من قيمة الشهر</td>
                    <td className="border border-gray-200 px-4 py-3">رصيد $25</td>
                  </tr>
                  <tr className="bg-red-50">
                    <td className="border border-gray-200 px-4 py-3">أقل من 95.0%</td>
                    <td className="border border-gray-200 px-4 py-3 font-medium">50% من قيمة الشهر</td>
                    <td className="border border-gray-200 px-4 py-3">رصيد $50</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 space-y-2">
              <p className="font-semibold">شروط التعويض:</p>
              <ul className="list-disc pr-6 space-y-2">
                <li>
                  التعويض يُقدم كرصيد على حساب العميل يُخصم من فاتورة الشهر التالي، وليس كاسترداد نقدي.
                </li>
                <li>
                  يجب على العميل تقديم طلب التعويض خلال 15 يوماً من نهاية الشهر الذي حدث فيه التعطل.
                </li>
                <li>
                  الحد الأقصى للتعويض في أي شهر لا يتجاوز 50% من قيمة اشتراك ذلك الشهر.
                </li>
                <li>
                  لا يُستحق التعويض إذا كان التعطل ناتجاً عن الأسباب المستثناة المذكورة في قسم &quot;وقت التشغيل المضمون&quot;.
                </li>
                <li>
                  التعويض هو العلاج الوحيد والحصري للعميل في حال عدم تحقيق نسبة التشغيل المضمونة.
                </li>
              </ul>
            </div>
          </section>

          {/* 7. الإبلاغ */}
          <section>
            <h2 className="text-xl font-bold text-[#021544] mb-3">7. الإبلاغ عن الأعطال</h2>
            <ul className="list-disc pr-6 space-y-2">
              <li>
                في حال مواجهة أي عطل أو مشكلة في الوصول إلى النظام، يُرجى التواصل فوراً مع فريق الدعم الفني عبر:
              </li>
            </ul>
            <div className="bg-gray-50 rounded-lg p-4 mt-3 space-y-2">
              <p>
                <strong>البريد الإلكتروني:</strong>{" "}
                <a href="mailto:info@g-ledger.com" className="text-[#0070F2] hover:underline" dir="ltr">info@g-ledger.com</a>
              </p>
              <p>
                <strong>ماسنجر:</strong>{" "}
                <a href="https://www.facebook.com/share/1AqPXESyJr/" target="_blank" rel="noopener noreferrer" className="text-[#0070F2] hover:underline" dir="ltr">facebook.com/G-Ledger</a>
              </p>
            </div>
            <p className="mt-3">
              سنقوم بالتحقيق في المشكلة والرد عليك وفقاً لأوقات الاستجابة المحددة في جدول الدعم الفني أعلاه.
            </p>
          </section>

          {/* Navigation */}
          <div className="border-t border-gray-200 pt-8 mt-12 flex flex-wrap gap-4 text-sm">
            <Link href="/ar/legal/terms" className="text-[#0070F2] hover:underline">شروط الاستخدام</Link>
            <span className="text-gray-300">|</span>
            <Link href="/ar/legal/privacy" className="text-[#0070F2] hover:underline">سياسة الخصوصية</Link>
            <span className="text-gray-300">|</span>
            <Link href="/ar" className="text-[#0070F2] hover:underline">الرئيسية</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
