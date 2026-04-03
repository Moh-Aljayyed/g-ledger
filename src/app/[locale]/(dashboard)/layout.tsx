import { Sidebar } from "@/components/layout/sidebar";
import { ChatWidget } from "@/components/chatbot/chat-widget";
import { PlanGate } from "@/components/plan-gate";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-background lg:mr-0 min-w-0">
        <div className="p-4 md:p-6 max-w-7xl mx-auto pt-16 lg:pt-6"><PlanGate>{children}</PlanGate></div>
      </main>
      <ChatWidget />
    </div>
  );
}
