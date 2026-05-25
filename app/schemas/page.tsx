import { Suspense } from "react";
import { SchemaRoutesWorkspace } from "@/features/schemas/SchemaRoutesWorkspace";

export default function SchemasPage() {
  return (
    <Suspense fallback={<div className="min-h-[40vh] animate-pulse rounded bg-[hsl(var(--panel))]" />}>
      <SchemaRoutesWorkspace />
    </Suspense>
  );
}
