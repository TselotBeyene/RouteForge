import { RouteWorkspace } from "@/features/visualization/RouteWorkspace";

export default async function IntegrationDetailsPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  return <RouteWorkspace integrationName={decodeURIComponent(name)} />;
}
