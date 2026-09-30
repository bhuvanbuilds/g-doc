import { TopBar } from "@/components/dashboard/top-bar";
import { InvestigationView } from "@/components/investigation/investigation-view";

export default async function InvestigationPage({ params }: PageProps<"/investigate/[id]">) {
  const { id } = await params;
  return (
    <div className="dot-matrix min-h-screen text-fg">
      <TopBar />
      <main className="px-4 pb-20 lg:px-8">
        <InvestigationView id={id} />
      </main>
    </div>
  );
}
