"use client";

import { AlertTriangle, Braces, CheckCircle2, Database, ExternalLink, FileJson2, RefreshCcw, Search, ShieldCheck, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getApiErrorMessage } from "@/lib/api-client";
import { schemaApi } from "@/services/schema-api";
import { RouteSchemaEntry } from "@/types/schema";

function asText(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

function prettyJson(value: unknown): string {
  if (value === null || value === undefined || value === "") return "No schema JSON returned.";
  if (typeof value === "string") {
    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  }
  return JSON.stringify(value, null, 2);
}

function unique(values: Array<string | undefined>): string[] {
  return Array.from(new Set(values.filter(Boolean) as string[])).sort((a, b) => a.localeCompare(b));
}

function externalHref(uri: string | null | undefined): string | null {
  const trimmed = uri?.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `http://${trimmed}`;
}

function schemaStatus(row: RouteSchemaEntry): "missing" | "enabled" | "inactive" {
  if (!row.schema) return "missing";
  return row.schema.enabled ? "enabled" : "inactive";
}

function schemaStatusLabel(row: RouteSchemaEntry): string {
  const status = schemaStatus(row);
  if (status === "missing") return "Missing schema";
  if (status === "enabled") return "Enabled";
  return "Inactive";
}

function schemaStatusClass(row: RouteSchemaEntry): string {
  const status = schemaStatus(row);
  if (status === "missing") return "text-orange-700 dark:text-orange-300";
  if (status === "enabled") return "text-teal-700 dark:text-teal-300";
  return "text-red-700 dark:text-red-300";
}

export function SchemaRoutesWorkspace() {
  const [rows, setRows] = useState<RouteSchemaEntry[]>([]);
  const [selected, setSelected] = useState<RouteSchemaEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [schemaType, setSchemaType] = useState("all");
  const [version, setVersion] = useState("all");
  const [enabled, setEnabled] = useState("all");

  async function load() {
    setLoading(true);
    setError(null);

    try {
      const data = await schemaApi.listRoutes();
      setRows(Array.isArray(data) ? data : []);
    } catch (apiError) {
      setRows([]);
      setError(getApiErrorMessage(apiError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const typeOptions = useMemo(() => unique(rows.map((row) => row.schema?.type)), [rows]);
  const versionOptions = useMemo(() => unique(rows.map((row) => row.schema?.version)), [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return rows.filter((row) => {
      const schema = row.schema;
      const matchesQuery = !q || [row.path, row.uri, row.routeId, row.schemaId, schema?.type, schema?.version]
        .map(asText)
        .some((value) => value.toLowerCase().includes(q));
      const matchesType = schemaType === "all" || schema?.type === schemaType;
      const matchesVersion = version === "all" || schema?.version === version;
      const matchesEnabled = enabled === "all" || String(Boolean(schema?.enabled)) === enabled;

      return matchesQuery && matchesType && matchesVersion && matchesEnabled;
    });
  }, [rows, query, schemaType, version, enabled]);

  const matchedSchemas = rows.filter((row) => row.schema).length;
  const missingSchemas = rows.length - matchedSchemas;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="section-title">Route Schemas</h1>
          <p className="section-subtitle">
            View API routes from PostgreSQL and inspect the JSON schema linked to each route.
          </p>
        </div>
        <button onClick={load} className="btn-secondary">
          <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {error && (
        <div className="atlas-panel p-4 text-sm text-orange-700 dark:text-orange-300">
          <div className="mb-1 flex items-center gap-2 font-mono text-xs font-black uppercase tracking-[0.14em]">
            <AlertTriangle className="h-4 w-4" /> Schema API unavailable
          </div>
          {error}
        </div>
      )}

      <div className="atlas-panel p-5">
        <div className="mb-4 grid gap-3 xl:grid-cols-[minmax(0,1fr)_220px_180px_170px]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-ink))]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter by route, URI, schema ID, type, or version"
              className="input-clean w-full pl-10"
            />
          </label>

          <select value={schemaType} onChange={(event) => setSchemaType(event.target.value)} className="input-clean">
            <option value="all">All schema types</option>
            {typeOptions.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>

          <select value={version} onChange={(event) => setVersion(event.target.value)} className="input-clean">
            <option value="all">All versions</option>
            {versionOptions.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>

          <select value={enabled} onChange={(event) => setEnabled(event.target.value)} className="input-clean">
            <option value="all">All statuses</option>
            <option value="true">Enabled only</option>
            <option value="false">Inactive or missing</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-[hsl(var(--muted-ink))]">
          <span className="inline-flex items-center gap-2"><Database className="h-4 w-4" /> {filtered.length} of {rows.length} routes shown</span>
          <span className="status-pill text-teal-700 dark:text-teal-300">{matchedSchemas} schema matches</span>
          {missingSchemas > 0 && <span className="status-pill text-orange-700 dark:text-orange-300">{missingSchemas} missing schemas</span>}
        </div>
      </div>

      <div className="atlas-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead className="border-b border-[hsl(var(--line))] bg-[hsl(var(--panel))] font-mono text-[11px] uppercase tracking-[0.14em] text-[hsl(var(--muted-ink))]">
              <tr>
                <th className="px-4 py-3">Route</th>
                <th className="px-4 py-3">URI</th>
                <th className="px-4 py-3">Schema ID</th>
                <th className="px-4 py-3">Schema</th>
                <th className="px-4 py-3">State</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[hsl(var(--muted-ink))]">
                    {loading ? "Loading route schemas..." : "No route schema rows matched the current filters."}
                  </td>
                </tr>
              ) : filtered.map((row, index) => {
                const schema = row.schema;
                return (
                  <tr
                    key={`${row.metadataId ?? "meta"}-${row.path ?? "path"}-${row.uri ?? "uri"}-${index}`}
                    onClick={() => setSelected(row)}
                    className="cursor-pointer border-b border-[hsl(var(--line))] transition hover:bg-amber-300/10"
                  >
                    <td className="px-4 py-4 align-top">
                      <div className="font-mono text-sm font-black">{row.path || "No path"}</div>
                      <div className="mt-1 font-mono text-xs text-[hsl(var(--muted-ink))]">{row.routeId || "No route_id"}</div>
                    </td>
                    <td className="px-4 py-4 align-top font-mono text-xs">
                      {externalHref(row.uri) ? (
                        <a
                          href={externalHref(row.uri) ?? undefined}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(event) => event.stopPropagation()}
                          className="inline-flex max-w-[360px] items-center gap-1 break-all text-sky-700 underline decoration-dotted underline-offset-4 hover:text-sky-900 dark:text-sky-300 dark:hover:text-sky-100"
                          title={`Open ${row.uri} in a new tab`}
                        >
                          {row.uri}
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                      ) : "-"}
                    </td>
                    <td className="px-4 py-4 align-top">
                      <span className="status-pill">schema_id={row.schemaId || "-"}</span>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="font-mono text-xs font-black">{schema?.type || "No schema match"}</div>
                      <div className="mt-1 font-mono text-xs text-[hsl(var(--muted-ink))]">{schema?.version ? `v${schema.version}` : "No version"}</div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex flex-wrap gap-2">
                        {schema?.base && <span className="status-pill bg-[hsl(var(--amber))] text-slate-950">base</span>}
                        <span className={`status-pill ${schemaStatusClass(row)}`}>
                          {schemaStatusLabel(row)}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="max-h-[90vh] w-full max-w-6xl overflow-hidden border border-[hsl(var(--ink))] bg-[hsl(var(--paper))] shadow-[8px_8px_0_rgba(15,23,42,0.95)]" onClick={(event) => event.stopPropagation()}>
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[hsl(var(--line))] bg-[hsl(var(--panel))] p-5">
              <div className="min-w-0">
                <div className="micro-label flex items-center gap-2"><FileJson2 className="h-4 w-4" /> Schema details</div>
                <h2 className="mt-2 break-all font-mono text-2xl font-black uppercase tracking-[-0.05em]">{selected.path || selected.routeId || "Route schema"}</h2>
                {externalHref(selected.uri) ? (
                  <a
                    href={externalHref(selected.uri) ?? undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 break-all font-mono text-xs text-sky-700 underline decoration-dotted underline-offset-4 hover:text-sky-900 dark:text-sky-300 dark:hover:text-sky-100"
                  >
                    {selected.uri}
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                ) : (
                  <p className="mt-2 font-mono text-xs text-[hsl(var(--muted-ink))]">No URI</p>
                )}
              </div>
              <button onClick={() => setSelected(null)} className="btn-secondary"><X className="h-4 w-4" />Close</button>
            </div>

            <div className="max-h-[72vh] overflow-auto p-5">
              <div className="overflow-hidden border border-[hsl(var(--line))] shadow-[5px_5px_0_rgba(30,28,23,0.12)]">
                <div className="flex items-center justify-between border-b border-[hsl(var(--line))] bg-[hsl(var(--panel))] px-4 py-3">
                  <div className="micro-label flex items-center gap-2"><Braces className="h-4 w-4" /> Full schema JSON</div>
                </div>
                <pre className="max-h-[46vh] overflow-auto bg-slate-950 p-4 text-xs leading-6 text-slate-100">
                  {prettyJson(selected.schema?.schema)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
