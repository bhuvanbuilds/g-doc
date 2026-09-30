import { TopBar } from "@/components/dashboard/top-bar";
import { UploadPanel } from "@/components/dashboard/upload-panel";
import { RecentTable } from "@/components/dashboard/recent-table";

export default function HomePage() {
  return (
    <div className="dot-matrix min-h-screen text-fg">
      <TopBar active="/home" />
      <main className="space-y-5 px-4 pb-16 pt-5 lg:px-8">
        <UploadPanel />
        <RecentTable limit={6} />
      </main>
    </div>
  );
}
