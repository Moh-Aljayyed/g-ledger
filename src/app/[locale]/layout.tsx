import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Providers } from "@/components/providers";
import { ChatWidget } from "@/components/chatbot/chat-widget";
import { PWAInstallPrompt } from "@/components/pwa-install";
import { MessengerButton } from "@/components/messenger-button";
import { AntiCopy } from "@/components/security/anti-copy";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "G-Ledger — حساب الأستاذ | General Ledger ERP",
  description: "نظام محاسبي سحابي متكامل يدعم 15 قطاع مختلف — صناعي، تجاري، طبي، مقاولات. فوترة إلكترونية متوافقة مع ETA مصر و ZATCA السعودية. ابدأ مجاناً!",
  keywords: [
    "برنامج محاسبة", "نظام محاسبي", "محاسبة سحابية", "ERP",
    "فوترة إلكترونية", "فاتورة إلكترونية", "ZATCA", "ETA",
    "برنامج محاسبة مجاني", "محاسبة عربي",
    "برنامج محاسبة سعودي", "برنامج محاسبة مصري",
    "شجرة حسابات", "ميزان مراجعة", "قائمة دخل",
    "إدارة مخزون", "مسير رواتب", "أصول ثابتة",
    "accounting software", "cloud accounting", "Arabic ERP",
    "e-invoice Egypt", "e-invoice Saudi", "ZATCA compliant",
    "G-Ledger", "general ledger",
  ],
  authors: [{ name: "G-Ledger" }],
  creator: "G-Ledger",
  publisher: "G-Ledger",
  openGraph: {
    type: "website",
    locale: "ar_SA",
    alternateLocale: "en_US",
    url: "https://g-ledger.com",
    siteName: "G-Ledger",
    title: "G-Ledger — حساب الأستاذ — لكل القطاعات",
    description: "نظام ERP محاسبي سحابي متكامل يدعم 15 قطاع. فوترة إلكترونية ETA + ZATCA. ابدأ مجاناً!",
    images: [
      {
        url: "https://g-ledger.com/og-image.svg",
        width: 1200,
        height: 630,
        alt: "G-Ledger — حساب الأستاذ — لكل القطاعات",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "G-Ledger — حساب الأستاذ — لكل القطاعات",
    description: "نظام ERP محاسبي سحابي. 15 قطاع. فوترة إلكترونية. ابدأ مجاناً!",
    images: ["https://g-ledger.com/og-image.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: "https://g-ledger.com",
    languages: {
      "ar": "https://g-ledger.com/ar",
      "en": "https://g-ledger.com/en",
    },
  },
  verification: {
    google: "JW2GH6wibHUUKJvhwR_AfALzmFcXdSJvOe3URT0FvWQ",
  },
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();
  const isRTL = locale === "ar";

  return (
    <html lang={locale} dir={isRTL ? "rtl" : "ltr"}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#021544" />
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/logo.svg" />
      </head>
      <body className="min-h-screen bg-background font-sans">
        <NextIntlClientProvider messages={messages}>
          <Providers>
            {children}
            <ChatWidget />
            <PWAInstallPrompt />
            <MessengerButton />
            <AntiCopy />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
