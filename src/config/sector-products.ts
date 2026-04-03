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
  RESTAURANT: [
    { code: "F001", nameAr: "وجبة برجر", nameEn: "Burger Meal", category: "مأكولات", unitType: "EA", costPrice: 15, sellingPrice: 35 },
    { code: "F002", nameAr: "وجبة دجاج", nameEn: "Chicken Meal", category: "مأكولات", unitType: "EA", costPrice: 12, sellingPrice: 30 },
    { code: "F003", nameAr: "بيتزا", nameEn: "Pizza", category: "مأكولات", unitType: "EA", costPrice: 10, sellingPrice: 25 },
    { code: "F004", nameAr: "سلطة", nameEn: "Salad", category: "مأكولات", unitType: "EA", costPrice: 5, sellingPrice: 15 },
    { code: "F005", nameAr: "شاورما", nameEn: "Shawarma", category: "مأكولات", unitType: "EA", costPrice: 8, sellingPrice: 18 },
    { code: "F006", nameAr: "فلافل", nameEn: "Falafel", category: "مأكولات", unitType: "EA", costPrice: 3, sellingPrice: 10 },
    { code: "F007", nameAr: "كبسة", nameEn: "Kabsa", category: "مأكولات", unitType: "EA", costPrice: 15, sellingPrice: 35 },
    { code: "F008", nameAr: "مندي", nameEn: "Mandi", category: "مأكولات", unitType: "EA", costPrice: 18, sellingPrice: 40 },
    { code: "B001", nameAr: "قهوة عربية", nameEn: "Arabic Coffee", category: "مشروبات", unitType: "EA", costPrice: 2, sellingPrice: 10 },
    { code: "B002", nameAr: "لاتيه", nameEn: "Latte", category: "مشروبات", unitType: "EA", costPrice: 3, sellingPrice: 15 },
    { code: "B003", nameAr: "كابتشينو", nameEn: "Cappuccino", category: "مشروبات", unitType: "EA", costPrice: 3, sellingPrice: 14 },
    { code: "B004", nameAr: "شاي", nameEn: "Tea", category: "مشروبات", unitType: "EA", costPrice: 1, sellingPrice: 5 },
    { code: "B005", nameAr: "عصير طازج", nameEn: "Fresh Juice", category: "مشروبات", unitType: "EA", costPrice: 4, sellingPrice: 12 },
    { code: "B006", nameAr: "مياه معدنية", nameEn: "Water", category: "مشروبات", unitType: "EA", costPrice: 0.5, sellingPrice: 3 },
    { code: "B007", nameAr: "مشروب غازي", nameEn: "Soft Drink", category: "مشروبات", unitType: "EA", costPrice: 1, sellingPrice: 5 },
    { code: "D001", nameAr: "كنافة", nameEn: "Kunafa", category: "حلويات", unitType: "EA", costPrice: 5, sellingPrice: 15 },
    { code: "D002", nameAr: "بسبوسة", nameEn: "Basbousa", category: "حلويات", unitType: "EA", costPrice: 3, sellingPrice: 10 },
    { code: "D003", nameAr: "آيس كريم", nameEn: "Ice Cream", category: "حلويات", unitType: "EA", costPrice: 3, sellingPrice: 12 },
  ],
  COMMERCIAL: [
    { code: "P001", nameAr: "منتج 1", nameEn: "Product 1", category: "بضائع", unitType: "EA", costPrice: 10, sellingPrice: 20 },
    { code: "P002", nameAr: "منتج 2", nameEn: "Product 2", category: "بضائع", unitType: "EA", costPrice: 15, sellingPrice: 30 },
  ],
  MEDICAL_PHARMACY: [
    { code: "M001", nameAr: "باراسيتامول 500mg", nameEn: "Paracetamol 500mg", category: "أدوية", unitType: "EA", costPrice: 5, sellingPrice: 10 },
    { code: "M002", nameAr: "أموكسيسيلين 500mg", nameEn: "Amoxicillin 500mg", category: "أدوية", unitType: "EA", costPrice: 8, sellingPrice: 15 },
    { code: "M003", nameAr: "فيتامين C", nameEn: "Vitamin C", category: "مكملات", unitType: "EA", costPrice: 10, sellingPrice: 25 },
  ],
};
