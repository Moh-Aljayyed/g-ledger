import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Providers } from "@/components/providers";
import { ChatWidget } from "@/components/chatbot/chat-widget";
import { MessengerButton } from "@/components/messenger-button";
import { AntiCopy } from "@/components/security/anti-copy";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "المحاسب العام | General Ledger",
  description: "نظام محاسبي سحابي متعدد القطاعات",
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
      </head>
      <body className="min-h-screen bg-background font-sans">
        <NextIntlClientProvider messages={messages}>
          <Providers>
            {children}
            <ChatWidget />
            <MessengerButton />
            <AntiCopy />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
