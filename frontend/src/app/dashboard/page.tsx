import { Logo } from "@/components/brand/logo";

export default function DashboardPage() {
  return (
    <main className="min-h-screen">
      <header className="flex h-14 items-center border-b border-line px-6">
        <Logo />
      </header>
      <div className="p-6 text-[14px] text-muted">
        Dashboard: summary and upload go here next.
      </div>
    </main>
  );
}
