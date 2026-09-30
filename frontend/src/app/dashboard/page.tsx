import { TopBar } from "@/components/dashboard/top-bar";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export default function DashboardPage() {
  return (
    <div className="dot-matrix min-h-screen text-fg">
      <TopBar active="/dashboard" />
      <main className="px-4 pb-16 pt-6 lg:px-8">
        <DashboardView />
      </main>
    </div>
  );
}
