import { Sidebar } from "@/components/layout/sidebar";
import { ChatWidget } from "@/components/chatbot/chat-widget";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-background">
        <div className="p-6 max-w-7xl mx-auto">{children}</div>
      </main>
      <ChatWidget />
    </div>
  );
}
