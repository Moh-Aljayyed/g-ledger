export interface SectorProduct {
  code: string;
  nameAr: string;
  nameEn: string;
  category: string;
  unitType: string;
  costPrice: number;
  sellingPrice: number;
}

export const SECTOR_PRODUCTS: Record<string, SectorProduct[]> = {

  // ============ مطاعم وكافيهات ============
  RESTAURANT: [
    { code: "F001", nameAr: "وجبة برجر", nameEn: "Burger Meal", category: "مأكولات", unitType: "EA", costPrice: 15, sellingPrice: 35 },
    { code: "F002", nameAr: "وجبة دجاج", nameEn: "Chicken Meal", category: "مأكولات", unitType: "EA", costPrice: 12, sellingPrice: 30 },
    { code: "F003", nameAr: "بيتزا", nameEn: "Pizza", category: "مأكولات", unitType: "EA", costPrice: 10, sellingPrice: 25 },
    { code: "F004", nameAr: "سلطة", nameEn: "Salad", category: "مأكولات", unitType: "EA", costPrice: 5, sellingPrice: 15 },
    { code: "F005", nameAr: "شاورما", nameEn: "Shawarma", category: "مأكولات", unitType: "EA", costPrice: 8, sellingPrice: 18 },
    { code: "F006", nameAr: "فلافل", nameEn: "Falafel", category: "مأكولات", unitType: "EA", costPrice: 3, sellingPrice: 10 },
    { code: "F007", nameAr: "كبسة", nameEn: "Kabsa", category: "مأكولات", unitType: "EA", costPrice: 15, sellingPrice: 35 },
    { code: "F008", nameAr: "مندي", nameEn: "Mandi", category: "مأكولات", unitType: "EA", costPrice: 18, sellingPrice: 40 },
    { code: "F009", nameAr: "ساندويتش كلوب", nameEn: "Club Sandwich", category: "مأكولات", unitType: "EA", costPrice: 8, sellingPrice: 22 },
    { code: "F010", nameAr: "باستا", nameEn: "Pasta", category: "مأكولات", unitType: "EA", costPrice: 7, sellingPrice: 20 },
    { code: "B001", nameAr: "قهوة عربية", nameEn: "Arabic Coffee", category: "مشروبات", unitType: "EA", costPrice: 2, sellingPrice: 10 },
    { code: "B002", nameAr: "لاتيه", nameEn: "Latte", category: "مشروبات", unitType: "EA", costPrice: 3, sellingPrice: 15 },
    { code: "B003", nameAr: "كابتشينو", nameEn: "Cappuccino", category: "مشروبات", unitType: "EA", costPrice: 3, sellingPrice: 14 },
    { code: "B004", nameAr: "شاي", nameEn: "Tea", category: "مشروبات", unitType: "EA", costPrice: 1, sellingPrice: 5 },
    { code: "B005", nameAr: "عصير طازج", nameEn: "Fresh Juice", category: "مشروبات", unitType: "EA", costPrice: 4, sellingPrice: 12 },
    { code: "B006", nameAr: "مياه معدنية", nameEn: "Water", category: "مشروبات", unitType: "EA", costPrice: 0.5, sellingPrice: 3 },
    { code: "B007", nameAr: "مشروب غازي", nameEn: "Soft Drink", category: "مشروبات", unitType: "EA", costPrice: 1, sellingPrice: 5 },
    { code: "B008", nameAr: "سموذي", nameEn: "Smoothie", category: "مشروبات", unitType: "EA", costPrice: 5, sellingPrice: 18 },
    { code: "D001", nameAr: "كنافة", nameEn: "Kunafa", category: "حلويات", unitType: "EA", costPrice: 5, sellingPrice: 15 },
    { code: "D002", nameAr: "بسبوسة", nameEn: "Basbousa", category: "حلويات", unitType: "EA", costPrice: 3, sellingPrice: 10 },
    { code: "D003", nameAr: "آيس كريم", nameEn: "Ice Cream", category: "حلويات", unitType: "EA", costPrice: 3, sellingPrice: 12 },
    { code: "D004", nameAr: "تشيز كيك", nameEn: "Cheesecake", category: "حلويات", unitType: "EA", costPrice: 6, sellingPrice: 18 },
  ],

  // ============ تجاري ============
  COMMERCIAL: [
    { code: "P001", nameAr: "هاتف ذكي", nameEn: "Smartphone", category: "إلكترونيات", unitType: "EA", costPrice: 1000, sellingPrice: 1500 },
    { code: "P002", nameAr: "لابتوب", nameEn: "Laptop", category: "إلكترونيات", unitType: "EA", costPrice: 2000, sellingPrice: 3000 },
    { code: "P003", nameAr: "سماعات بلوتوث", nameEn: "Bluetooth Headphones", category: "إلكترونيات", unitType: "EA", costPrice: 50, sellingPrice: 120 },
    { code: "P004", nameAr: "شاحن سريع", nameEn: "Fast Charger", category: "إكسسوارات", unitType: "EA", costPrice: 15, sellingPrice: 40 },
    { code: "P005", nameAr: "كفر هاتف", nameEn: "Phone Case", category: "إكسسوارات", unitType: "EA", costPrice: 5, sellingPrice: 20 },
    { code: "P006", nameAr: "ساعة ذكية", nameEn: "Smart Watch", category: "إلكترونيات", unitType: "EA", costPrice: 200, sellingPrice: 400 },
    { code: "P007", nameAr: "كاميرا مراقبة", nameEn: "Security Camera", category: "أمن", unitType: "EA", costPrice: 80, sellingPrice: 180 },
    { code: "P008", nameAr: "طابعة", nameEn: "Printer", category: "مكتبية", unitType: "EA", costPrice: 300, sellingPrice: 500 },
    { code: "P009", nameAr: "حبر طابعة", nameEn: "Printer Ink", category: "مكتبية", unitType: "EA", costPrice: 30, sellingPrice: 70 },
    { code: "P010", nameAr: "ورق A4", nameEn: "A4 Paper (Ream)", category: "مكتبية", unitType: "EA", costPrice: 15, sellingPrice: 30 },
  ],

  // ============ صناعي ============
  INDUSTRIAL: [
    { code: "RM01", nameAr: "غزل قطن خام", nameEn: "Raw Cotton Yarn", category: "مواد خام", unitType: "KG", costPrice: 50, sellingPrice: 0 },
    { code: "RM02", nameAr: "غزل بوليستر", nameEn: "Polyester Yarn", category: "مواد خام", unitType: "KG", costPrice: 35, sellingPrice: 0 },
    { code: "RM03", nameAr: "أصباغ كيماوية", nameEn: "Chemical Dyes", category: "كيماويات", unitType: "KG", costPrice: 80, sellingPrice: 0 },
    { code: "RM04", nameAr: "أزرار بلاستيك", nameEn: "Plastic Buttons", category: "إكسسوارات", unitType: "EA", costPrice: 0.1, sellingPrice: 0 },
    { code: "RM05", nameAr: "سوست/زيبر", nameEn: "Zippers", category: "إكسسوارات", unitType: "EA", costPrice: 0.5, sellingPrice: 0 },
    { code: "FG01", nameAr: "تي شيرت رجالي", nameEn: "Men's T-Shirt", category: "منتجات تامة", unitType: "EA", costPrice: 25, sellingPrice: 60 },
    { code: "FG02", nameAr: "بنطلون جينز", nameEn: "Jeans", category: "منتجات تامة", unitType: "EA", costPrice: 40, sellingPrice: 100 },
    { code: "FG03", nameAr: "قميص رسمي", nameEn: "Formal Shirt", category: "منتجات تامة", unitType: "EA", costPrice: 30, sellingPrice: 80 },
    { code: "FG04", nameAr: "فستان نسائي", nameEn: "Women's Dress", category: "منتجات تامة", unitType: "EA", costPrice: 45, sellingPrice: 120 },
    { code: "PK01", nameAr: "كرتون تغليف", nameEn: "Packaging Box", category: "تغليف", unitType: "EA", costPrice: 2, sellingPrice: 0 },
  ],

  // ============ خدمي ============
  SERVICES: [
    { code: "S001", nameAr: "استشارة ساعة", nameEn: "Hourly Consultation", category: "استشارات", unitType: "HR", costPrice: 0, sellingPrice: 200 },
    { code: "S002", nameAr: "تصميم لوجو", nameEn: "Logo Design", category: "تصميم", unitType: "EA", costPrice: 0, sellingPrice: 500 },
    { code: "S003", nameAr: "تصميم موقع", nameEn: "Website Design", category: "تصميم", unitType: "EA", costPrice: 0, sellingPrice: 3000 },
    { code: "S004", nameAr: "إدارة سوشيال ميديا (شهر)", nameEn: "Social Media Mgmt (Month)", category: "تسويق", unitType: "EA", costPrice: 0, sellingPrice: 1500 },
    { code: "S005", nameAr: "تدقيق حسابات", nameEn: "Audit Service", category: "محاسبة", unitType: "EA", costPrice: 0, sellingPrice: 5000 },
    { code: "S006", nameAr: "ترجمة (صفحة)", nameEn: "Translation (Page)", category: "ترجمة", unitType: "EA", costPrice: 0, sellingPrice: 50 },
    { code: "S007", nameAr: "تدريب (يوم)", nameEn: "Training (Day)", category: "تدريب", unitType: "EA", costPrice: 0, sellingPrice: 1000 },
    { code: "S008", nameAr: "صيانة سنوية", nameEn: "Annual Maintenance", category: "صيانة", unitType: "EA", costPrice: 0, sellingPrice: 2000 },
  ],

  // ============ صيدليات ============
  MEDICAL_PHARMACY: [
    { code: "M001", nameAr: "باراسيتامول 500mg", nameEn: "Paracetamol 500mg", category: "أدوية", unitType: "EA", costPrice: 5, sellingPrice: 10 },
    { code: "M002", nameAr: "أموكسيسيلين 500mg", nameEn: "Amoxicillin 500mg", category: "أدوية", unitType: "EA", costPrice: 8, sellingPrice: 15 },
    { code: "M003", nameAr: "فيتامين C", nameEn: "Vitamin C", category: "مكملات", unitType: "EA", costPrice: 10, sellingPrice: 25 },
    { code: "M004", nameAr: "إيبوبروفين 400mg", nameEn: "Ibuprofen 400mg", category: "أدوية", unitType: "EA", costPrice: 6, sellingPrice: 12 },
    { code: "M005", nameAr: "أوميبرازول 20mg", nameEn: "Omeprazole 20mg", category: "أدوية", unitType: "EA", costPrice: 12, sellingPrice: 22 },
    { code: "M006", nameAr: "مرهم مضاد حيوي", nameEn: "Antibiotic Ointment", category: "أدوية", unitType: "EA", costPrice: 8, sellingPrice: 18 },
    { code: "M007", nameAr: "كمامات طبية (50 قطعة)", nameEn: "Medical Masks (50pc)", category: "مستلزمات", unitType: "EA", costPrice: 10, sellingPrice: 25 },
    { code: "M008", nameAr: "قفازات طبية (100 قطعة)", nameEn: "Medical Gloves (100pc)", category: "مستلزمات", unitType: "EA", costPrice: 15, sellingPrice: 30 },
    { code: "M009", nameAr: "جهاز قياس ضغط", nameEn: "Blood Pressure Monitor", category: "أجهزة", unitType: "EA", costPrice: 80, sellingPrice: 150 },
    { code: "M010", nameAr: "ميزان حرارة رقمي", nameEn: "Digital Thermometer", category: "أجهزة", unitType: "EA", costPrice: 15, sellingPrice: 35 },
    { code: "M011", nameAr: "كريم ترطيب", nameEn: "Moisturizing Cream", category: "تجميل", unitType: "EA", costPrice: 20, sellingPrice: 45 },
    { code: "M012", nameAr: "واقي شمس", nameEn: "Sunscreen", category: "تجميل", unitType: "EA", costPrice: 25, sellingPrice: 55 },
  ],

  // ============ مستشفيات ============
  MEDICAL_HOSPITAL: [
    { code: "H001", nameAr: "كشف طبي عام", nameEn: "General Consultation", category: "خدمات", unitType: "EA", costPrice: 0, sellingPrice: 150 },
    { code: "H002", nameAr: "كشف تخصصي", nameEn: "Specialist Consultation", category: "خدمات", unitType: "EA", costPrice: 0, sellingPrice: 300 },
    { code: "H003", nameAr: "أشعة سينية", nameEn: "X-Ray", category: "تشخيص", unitType: "EA", costPrice: 20, sellingPrice: 100 },
    { code: "H004", nameAr: "تحليل دم شامل", nameEn: "Complete Blood Count", category: "تحاليل", unitType: "EA", costPrice: 10, sellingPrice: 50 },
    { code: "H005", nameAr: "أشعة مقطعية CT", nameEn: "CT Scan", category: "تشخيص", unitType: "EA", costPrice: 100, sellingPrice: 500 },
    { code: "H006", nameAr: "غرفة تنويم (يوم)", nameEn: "Room (per day)", category: "تنويم", unitType: "EA", costPrice: 200, sellingPrice: 800 },
    { code: "H007", nameAr: "عملية جراحية بسيطة", nameEn: "Minor Surgery", category: "عمليات", unitType: "EA", costPrice: 500, sellingPrice: 3000 },
    { code: "H008", nameAr: "جلسة علاج طبيعي", nameEn: "Physiotherapy Session", category: "علاج", unitType: "EA", costPrice: 30, sellingPrice: 150 },
  ],

  // ============ عيادات ============
  MEDICAL_CLINIC: [
    { code: "C001", nameAr: "كشف أسنان", nameEn: "Dental Checkup", category: "أسنان", unitType: "EA", costPrice: 0, sellingPrice: 100 },
    { code: "C002", nameAr: "حشو أسنان", nameEn: "Dental Filling", category: "أسنان", unitType: "EA", costPrice: 20, sellingPrice: 150 },
    { code: "C003", nameAr: "تنظيف أسنان", nameEn: "Teeth Cleaning", category: "أسنان", unitType: "EA", costPrice: 10, sellingPrice: 100 },
    { code: "C004", nameAr: "كشف جلدية", nameEn: "Dermatology Visit", category: "جلدية", unitType: "EA", costPrice: 0, sellingPrice: 200 },
    { code: "C005", nameAr: "جلسة ليزر", nameEn: "Laser Session", category: "تجميل", unitType: "EA", costPrice: 50, sellingPrice: 300 },
    { code: "C006", nameAr: "كشف عيون", nameEn: "Eye Exam", category: "عيون", unitType: "EA", costPrice: 0, sellingPrice: 150 },
    { code: "C007", nameAr: "نظارة طبية", nameEn: "Prescription Glasses", category: "عيون", unitType: "EA", costPrice: 100, sellingPrice: 300 },
  ],

  // ============ معامل تحاليل ============
  MEDICAL_LAB: [
    { code: "L001", nameAr: "تحليل CBC", nameEn: "CBC Test", category: "دم", unitType: "EA", costPrice: 5, sellingPrice: 30 },
    { code: "L002", nameAr: "تحليل سكر صائم", nameEn: "Fasting Blood Sugar", category: "كيمياء", unitType: "EA", costPrice: 3, sellingPrice: 20 },
    { code: "L003", nameAr: "تحليل وظائف كبد", nameEn: "Liver Function Test", category: "كيمياء", unitType: "EA", costPrice: 10, sellingPrice: 50 },
    { code: "L004", nameAr: "تحليل وظائف كلى", nameEn: "Kidney Function Test", category: "كيمياء", unitType: "EA", costPrice: 10, sellingPrice: 50 },
    { code: "L005", nameAr: "تحليل غدة درقية", nameEn: "Thyroid Test (TSH)", category: "هرمونات", unitType: "EA", costPrice: 15, sellingPrice: 80 },
    { code: "L006", nameAr: "تحليل فيتامين D", nameEn: "Vitamin D Test", category: "هرمونات", unitType: "EA", costPrice: 20, sellingPrice: 100 },
    { code: "L007", nameAr: "تحليل بول كامل", nameEn: "Urinalysis", category: "بول", unitType: "EA", costPrice: 3, sellingPrice: 20 },
    { code: "L008", nameAr: "مسحة PCR", nameEn: "PCR Swab", category: "ميكروبيولوجي", unitType: "EA", costPrice: 30, sellingPrice: 150 },
  ],

  // ============ عقاري ============
  REAL_ESTATE: [
    { code: "RE01", nameAr: "شقة سكنية (إيجار شهري)", nameEn: "Apartment (Monthly Rent)", category: "إيجارات", unitType: "EA", costPrice: 0, sellingPrice: 3000 },
    { code: "RE02", nameAr: "مكتب إداري (إيجار شهري)", nameEn: "Office (Monthly Rent)", category: "إيجارات", unitType: "EA", costPrice: 0, sellingPrice: 5000 },
    { code: "RE03", nameAr: "محل تجاري (إيجار شهري)", nameEn: "Shop (Monthly Rent)", category: "إيجارات", unitType: "EA", costPrice: 0, sellingPrice: 8000 },
    { code: "RE04", nameAr: "عمولة بيع عقار", nameEn: "Property Sale Commission", category: "عمولات", unitType: "EA", costPrice: 0, sellingPrice: 10000 },
    { code: "RE05", nameAr: "رسوم إدارة عقار", nameEn: "Property Management Fee", category: "إدارة", unitType: "EA", costPrice: 0, sellingPrice: 500 },
    { code: "RE06", nameAr: "صيانة عامة", nameEn: "General Maintenance", category: "صيانة", unitType: "EA", costPrice: 200, sellingPrice: 500 },
  ],

  // ============ مقاولات ============
  CONTRACTING: [
    { code: "CT01", nameAr: "أسمنت (طن)", nameEn: "Cement (Ton)", category: "مواد بناء", unitType: "EA", costPrice: 300, sellingPrice: 0 },
    { code: "CT02", nameAr: "حديد تسليح (طن)", nameEn: "Rebar Steel (Ton)", category: "مواد بناء", unitType: "EA", costPrice: 3000, sellingPrice: 0 },
    { code: "CT03", nameAr: "رمل (متر مكعب)", nameEn: "Sand (m³)", category: "مواد بناء", unitType: "EA", costPrice: 50, sellingPrice: 0 },
    { code: "CT04", nameAr: "طوب (1000 قطعة)", nameEn: "Bricks (1000pc)", category: "مواد بناء", unitType: "EA", costPrice: 500, sellingPrice: 0 },
    { code: "CT05", nameAr: "دهان (جالون)", nameEn: "Paint (Gallon)", category: "تشطيبات", unitType: "EA", costPrice: 80, sellingPrice: 0 },
    { code: "CT06", nameAr: "بلاط سيراميك (م²)", nameEn: "Ceramic Tiles (m²)", category: "تشطيبات", unitType: "EA", costPrice: 30, sellingPrice: 0 },
    { code: "CT07", nameAr: "أنابيب PVC (متر)", nameEn: "PVC Pipes (meter)", category: "سباكة", unitType: "EA", costPrice: 5, sellingPrice: 0 },
    { code: "CT08", nameAr: "كابل كهربائي (متر)", nameEn: "Electric Cable (meter)", category: "كهرباء", unitType: "EA", costPrice: 3, sellingPrice: 0 },
  ],

  // ============ تقني/SaaS ============
  TECHNOLOGY: [
    { code: "T001", nameAr: "اشتراك شهري — أساسي", nameEn: "Monthly Subscription — Basic", category: "اشتراكات", unitType: "EA", costPrice: 0, sellingPrice: 99 },
    { code: "T002", nameAr: "اشتراك شهري — احترافي", nameEn: "Monthly Subscription — Pro", category: "اشتراكات", unitType: "EA", costPrice: 0, sellingPrice: 299 },
    { code: "T003", nameAr: "اشتراك سنوي", nameEn: "Annual Subscription", category: "اشتراكات", unitType: "EA", costPrice: 0, sellingPrice: 2999 },
    { code: "T004", nameAr: "تطوير تطبيق موبايل", nameEn: "Mobile App Development", category: "تطوير", unitType: "EA", costPrice: 0, sellingPrice: 15000 },
    { code: "T005", nameAr: "تطوير موقع ويب", nameEn: "Website Development", category: "تطوير", unitType: "EA", costPrice: 0, sellingPrice: 5000 },
    { code: "T006", nameAr: "استضافة سحابية (شهر)", nameEn: "Cloud Hosting (Month)", category: "استضافة", unitType: "EA", costPrice: 20, sellingPrice: 50 },
    { code: "T007", nameAr: "دعم فني (ساعة)", nameEn: "Technical Support (Hour)", category: "دعم", unitType: "HR", costPrice: 0, sellingPrice: 100 },
    { code: "T008", nameAr: "ترخيص برمجي", nameEn: "Software License", category: "تراخيص", unitType: "EA", costPrice: 0, sellingPrice: 500 },
  ],

  // ============ زراعي ============
  AGRICULTURAL: [
    { code: "AG01", nameAr: "بذور قمح (كجم)", nameEn: "Wheat Seeds (kg)", category: "بذور", unitType: "KG", costPrice: 5, sellingPrice: 0 },
    { code: "AG02", nameAr: "سماد عضوي (كجم)", nameEn: "Organic Fertilizer (kg)", category: "أسمدة", unitType: "KG", costPrice: 3, sellingPrice: 0 },
    { code: "AG03", nameAr: "مبيد حشري (لتر)", nameEn: "Pesticide (liter)", category: "مبيدات", unitType: "LTR", costPrice: 20, sellingPrice: 0 },
    { code: "AG04", nameAr: "تمور (كجم)", nameEn: "Dates (kg)", category: "محاصيل", unitType: "KG", costPrice: 10, sellingPrice: 30 },
    { code: "AG05", nameAr: "طماطم (كجم)", nameEn: "Tomatoes (kg)", category: "خضروات", unitType: "KG", costPrice: 2, sellingPrice: 5 },
    { code: "AG06", nameAr: "برتقال (كجم)", nameEn: "Oranges (kg)", category: "فواكه", unitType: "KG", costPrice: 3, sellingPrice: 7 },
    { code: "AG07", nameAr: "علف حيواني (كجم)", nameEn: "Animal Feed (kg)", category: "أعلاف", unitType: "KG", costPrice: 2, sellingPrice: 0 },
    { code: "AG08", nameAr: "حليب طازج (لتر)", nameEn: "Fresh Milk (liter)", category: "ألبان", unitType: "LTR", costPrice: 3, sellingPrice: 7 },
  ],

  // ============ بنوك ============
  BANKING: [
    { code: "BK01", nameAr: "رسوم فتح حساب", nameEn: "Account Opening Fee", category: "رسوم", unitType: "EA", costPrice: 0, sellingPrice: 100 },
    { code: "BK02", nameAr: "رسوم تحويل محلي", nameEn: "Local Transfer Fee", category: "رسوم", unitType: "EA", costPrice: 0, sellingPrice: 15 },
    { code: "BK03", nameAr: "رسوم تحويل دولي", nameEn: "International Transfer Fee", category: "رسوم", unitType: "EA", costPrice: 0, sellingPrice: 50 },
    { code: "BK04", nameAr: "رسوم بطاقة ائتمان سنوية", nameEn: "Annual Credit Card Fee", category: "بطاقات", unitType: "EA", costPrice: 0, sellingPrice: 300 },
  ],

  // ============ تأمين ============
  INSURANCE: [
    { code: "IN01", nameAr: "تأمين سيارات شامل", nameEn: "Comprehensive Car Insurance", category: "سيارات", unitType: "EA", costPrice: 0, sellingPrice: 3000 },
    { code: "IN02", nameAr: "تأمين سيارات طرف ثالث", nameEn: "Third Party Car Insurance", category: "سيارات", unitType: "EA", costPrice: 0, sellingPrice: 800 },
    { code: "IN03", nameAr: "تأمين صحي (فرد)", nameEn: "Health Insurance (Individual)", category: "صحي", unitType: "EA", costPrice: 0, sellingPrice: 2000 },
    { code: "IN04", nameAr: "تأمين صحي (عائلة)", nameEn: "Health Insurance (Family)", category: "صحي", unitType: "EA", costPrice: 0, sellingPrice: 5000 },
    { code: "IN05", nameAr: "تأمين ممتلكات", nameEn: "Property Insurance", category: "ممتلكات", unitType: "EA", costPrice: 0, sellingPrice: 4000 },
    { code: "IN06", nameAr: "تأمين سفر", nameEn: "Travel Insurance", category: "سفر", unitType: "EA", costPrice: 0, sellingPrice: 200 },
  ],

  // ============ غير ربحي ============
  NON_PROFIT: [
    { code: "NP01", nameAr: "تبرع عام", nameEn: "General Donation", category: "تبرعات", unitType: "EA", costPrice: 0, sellingPrice: 100 },
    { code: "NP02", nameAr: "كفالة يتيم (شهر)", nameEn: "Orphan Sponsorship (Month)", category: "كفالات", unitType: "EA", costPrice: 0, sellingPrice: 300 },
    { code: "NP03", nameAr: "سلة غذائية", nameEn: "Food Basket", category: "إغاثة", unitType: "EA", costPrice: 50, sellingPrice: 100 },
    { code: "NP04", nameAr: "رسوم عضوية سنوية", nameEn: "Annual Membership Fee", category: "عضويات", unitType: "EA", costPrice: 0, sellingPrice: 500 },
  ],

  // ============ تمويل جماعي ============
  CROWDFUNDING: [
    { code: "CF01", nameAr: "رسوم منصة (%)", nameEn: "Platform Fee (%)", category: "رسوم", unitType: "EA", costPrice: 0, sellingPrice: 100 },
    { code: "CF02", nameAr: "رسوم إدارة محفظة", nameEn: "Portfolio Management Fee", category: "إدارة", unitType: "EA", costPrice: 0, sellingPrice: 50 },
  ],
};
