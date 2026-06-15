import Link from "next/link";
import { ArrowRight, Braces, Code2, GitBranch, Network, Pencil, Workflow } from "lucide-react";
import { APP_NAME, APP_TAGLINE } from "@/lib/brand";

const actions = [
  { icon: Network, title: "Visualize routes", text: "Load a Camel integration from Git through the backend and render its parsed route graph.", href: "/integrations" },
  { icon: Code2, title: "Edit integration source", text: "Select an integration and edit its Git-backed YAML or Java DSL inside the integration workspace.", href: "/integrations" },
  { icon: Braces, title: "View route schemas", text: "Inspect PostgreSQL-backed route metadata, validation flags, schema type/version, and full schema JSON.", href: "/schemas" },
  { icon: Pencil, title: "Edit schema", text: "Add or update route schema records in PostgreSQL — type, version, validation flags, and JSON payload.", href: "/schemas?add=1" },
  { icon: Workflow, title: "Open Karavan", text: "Launch Apache Camel Karavan from inside the workspace when NEXT_PUBLIC_KARAVAN_URL is configured.", href: "/karavan" },
  { icon: GitBranch, title: "View OpenAPI", text: "Open Swagger UI against the backend OpenAPI endpoint.", href: "/swagger" }
];

export default function HomePage() {
  return (
    <section className="space-y-7">
      <div className="atlas-panel atlas-cut p-8 lg:p-10">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className="status-pill bg-[hsl(var(--amber))] text-slate-950">{APP_NAME} · {APP_TAGLINE}</span>
          <span className="status-pill text-teal-700 dark:text-teal-300">Backend API Required</span>
        </div>
        <h1 className="max-w-5xl font-mono text-5xl font-black uppercase leading-[0.92] tracking-[-0.08em] text-[hsl(var(--ink))] sm:text-7xl">
          Integrations Management.
        </h1>
        <p className="mt-7 max-w-3xl text-base leading-8 text-[hsl(var(--muted-ink))]">
        Browse integrations, edit files, and explore routes.
                </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/integrations" className="btn-primary">View Integrations <ArrowRight className="h-4 w-4" /></Link>
          <Link href="/schemas" className="btn-secondary">View Schemas</Link>
          <Link href="/karavan" className="btn-secondary">Open Karavan</Link>
          <Link href="/swagger" className="btn-secondary">Open Swagger</Link>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {actions.map((item) => (
          <Link key={item.title} href={item.href} className="topology-card atlas-cut p-5">
            <div className="mb-5 flex h-11 w-11 items-center justify-center border border-slate-950 bg-amber-300 shadow-[3px_3px_0_rgba(30,28,23,0.22)]">
              <item.icon className="h-5 w-5 text-slate-950" />
            </div>
            <h3 className="font-mono text-sm font-black uppercase tracking-[-0.02em]">{item.title}</h3>
            <p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-ink))]">{item.text}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
