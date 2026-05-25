"use client";

import {
  AlertTriangle,
  Braces,
  CheckCircle2,
  Database,
  ExternalLink,
  FileJson2,
  Pencil,
  Plus,
  RefreshCcw,
  Save,
  Search,
  ShieldCheck,
  Trash2,
  X
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { getApiErrorMessage } from "@/lib/api-client";
import { schemaApi } from "@/services/schema-api";
import { ConfirmActionModal } from "@/components/ConfirmActionModal";
import { IntegrationSchemaPayload, IntegrationSchemaSummary, RouteSchemaEntry } from "@/types/schema";

interface PendingSchemaSave {
  mode: "create" | "update";
  form: SchemaFormState;
  payload: IntegrationSchemaPayload;
}

interface SchemaFormState {
  id?: number;
  routeIntegrationId?: number;
  metadataId?: number;
  routeId: string;
  path: string;
  uri: string;
  stripPrefix: string;
  validateSchema: boolean;
  type: string;
  version: string;
  baseVersion: string;
  base: boolean;
  enabled: boolean;
  validFrom: string;
  validTo: string;
  schemaJson: string;
}

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

function schemaLabel(row: RouteSchemaEntry | null | undefined): string {
  if (!row) return "schema";
  const schema = row.schema;
  return `${schema?.type ?? row.schemaId ?? "schema"} ${schema?.version ?? ""}`.trim();
}

function formSchemaLabel(form: SchemaFormState | null | undefined): string {
  if (!form) return "schema";
  return `${form.type || "schema"} ${form.version || ""}`.trim();
}

function schemaStatusClass(row: RouteSchemaEntry): string {
  const status = schemaStatus(row);
  if (status === "missing") return "text-orange-700 dark:text-orange-300";
  if (status === "enabled") return "text-teal-700 dark:text-teal-300";
  return "text-red-700 dark:text-red-300";
}

function localDateTimeValue(value?: string | null): string {
  if (value) return value.slice(0, 16);
  const now = new Date();
  now.setSeconds(0, 0);
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 16);
}

function blankForm(): SchemaFormState {
  return {
    routeId: "",
    path: "",
    uri: "",
    stripPrefix: "0",
    validateSchema: true,
    type: "",
    version: "",
    baseVersion: "",
    base: false,
    enabled: true,
    validFrom: localDateTimeValue(),
    validTo: "",
    schemaJson: JSON.stringify({ type: "object", properties: {} }, null, 2)
  };
}

function formFromRow(row: RouteSchemaEntry): SchemaFormState {
  const schema = row.schema;

  return {
    id: schema?.id,
    routeIntegrationId: row.routeIntegrationId,
    metadataId: row.metadataId,
    routeId: row.routeId ?? "",
    path: row.path ?? "",
    uri: row.uri ?? "",
    stripPrefix: String(row.stripPrefix ?? 0),
    validateSchema: row.validateSchema !== false,
    type: schema?.type ?? row.schemaId ?? "",
    version: schema?.version ?? "",
    baseVersion: schema?.baseVersion ?? "",
    base: Boolean(schema?.base),
    enabled: schema?.enabled !== false,
    validFrom: localDateTimeValue(schema?.validFrom),
    validTo: schema?.validTo ? schema.validTo.slice(0, 16) : "",
    schemaJson: prettyJson(schema?.schema ?? { type: "object", properties: {} })
  };
}

function formToPayload(form: SchemaFormState): IntegrationSchemaPayload {
  const stripPrefix = form.stripPrefix.trim() === "" ? null : Number(form.stripPrefix);

  return {
    routeId: form.routeId.trim() || null,
    path: form.path.trim() || null,
    uri: form.uri.trim() || null,
    stripPrefix: Number.isFinite(stripPrefix) ? stripPrefix : null,
    validateSchema: form.validateSchema,
    type: form.type.trim(),
    version: form.version.trim(),
    baseVersion: form.baseVersion.trim() || null,
    base: form.base,
    enabled: form.enabled,
    validFrom: form.validFrom,
    validTo: form.validTo.trim() || null,
    schema: JSON.parse(form.schemaJson)
  };
}

type SchemaRouteRowHandlers = {
  saving: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onAdd: () => void;
};

function SchemaRouteRowActions({
  row,
  saving,
  onEdit,
  onDelete,
  onAdd,
}: { row: RouteSchemaEntry } & SchemaRouteRowHandlers) {
  const schema = row.schema;

  return (
    <div className="flex flex-wrap gap-2">
      {schema?.id ? (
        <>
          <button
            type="button"
            className="btn-secondary px-2.5 py-1.5 sm:px-3 sm:py-2"
            onClick={(event) => {
              event.stopPropagation();
              onEdit();
            }}
          >
            <Pencil className="h-3 w-3" /> Edit
          </button>
          <button
            type="button"
            className="btn-secondary px-2.5 py-1.5 text-red-700 dark:text-red-300 sm:px-3 sm:py-2"
            disabled={saving}
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-3 w-3" /> Delete
          </button>
        </>
      ) : (
        <button
          type="button"
          className="btn-secondary px-2.5 py-1.5 sm:px-3 sm:py-2"
          onClick={(event) => {
            event.stopPropagation();
            onAdd();
          }}
        >
          <Plus className="h-3 w-3" /> Add
        </button>
      )}
    </div>
  );
}

function SchemaRouteUri({ uri }: { uri: string | null | undefined }) {
  const href = externalHref(uri);

  if (!href) {
    return <span className="text-[hsl(var(--muted-ink))]">-</span>;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(event) => event.stopPropagation()}
      className="inline-flex max-w-full items-start gap-1 break-all font-mono text-[11px] text-sky-700 underline decoration-dotted underline-offset-4 hover:text-sky-900 dark:text-sky-300 dark:hover:text-sky-100 sm:text-xs"
      title={`Open ${uri} in a new tab`}
    >
      {uri}
      <ExternalLink className="mt-0.5 h-3 w-3 shrink-0" />
    </a>
  );
}

function SchemaRouteStateBadges({ row }: { row: RouteSchemaEntry }) {
  const schema = row.schema;

  return (
    <div className="flex flex-wrap gap-1.5 sm:gap-2">
      {schema?.base && (
        <span className="status-pill bg-[hsl(var(--amber))] text-slate-950">base</span>
      )}
      <span className={`status-pill ${schemaStatusClass(row)}`}>
        {schemaStatusLabel(row)}
      </span>
    </div>
  );
}

function SchemaRouteCard({
  row,
  saving,
  onSelect,
  onEdit,
  onDelete,
  onAdd,
}: { row: RouteSchemaEntry; onSelect: () => void } & SchemaRouteRowHandlers) {
  const schema = row.schema;

  return (
    <article
      onClick={onSelect}
      className="cursor-pointer border border-[hsl(var(--line))] bg-[hsl(var(--panel))] p-3 shadow-[3px_3px_0_rgba(30,28,23,0.08)] transition hover:border-[hsl(var(--ink))] hover:shadow-[5px_5px_0_rgba(245,158,11,0.35)] sm:p-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="micro-label">Route</div>
          <div className="break-words font-mono text-xs font-black sm:text-sm">
            {row.path || "No path"}
          </div>
          <div className="mt-1 break-all font-mono text-[10px] text-[hsl(var(--muted-ink))] sm:text-xs">
            {row.routeId || "No route_id"}
          </div>
        </div>
        <SchemaRouteStateBadges row={row} />
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="min-w-0">
          <div className="micro-label">URI</div>
          <SchemaRouteUri uri={row.uri} />
        </div>
        <div>
          <div className="micro-label">Schema</div>
          <div className="font-mono text-xs font-black">
            {schema?.type || "No schema match"}
          </div>
          <div className="mt-1 font-mono text-[10px] text-[hsl(var(--muted-ink))] sm:text-xs">
            {schema?.version || "No version"}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[hsl(var(--line))] pt-3">
        <span className="status-pill text-[10px] sm:text-[10px]">
          schema_id={row.schemaId || "-"}
        </span>
        <SchemaRouteRowActions
          row={row}
          saving={saving}
          onEdit={onEdit}
          onDelete={onDelete}
          onAdd={onAdd}
        />
      </div>
    </article>
  );
}

export function SchemaRoutesWorkspace() {
  const searchParams = useSearchParams();
  const openedAddFromQuery = useRef(false);
  const [rows, setRows] = useState<RouteSchemaEntry[]>([]);
  const [selected, setSelected] = useState<RouteSchemaEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [schemaType, setSchemaType] = useState("all");
  const [version, setVersion] = useState("all");
  const [enabled, setEnabled] = useState("all");
  const [schemaForm, setSchemaForm] = useState<SchemaFormState | null>(null);
  const [pendingSchemaSave, setPendingSchemaSave] = useState<PendingSchemaSave | null>(null);
  const [pendingDeleteRow, setPendingDeleteRow] = useState<RouteSchemaEntry | null>(null);

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

  function openAddSchema() {
    setSelected(null);
    setFormError(null);
    setSuccessMessage(null);
    setSchemaForm(blankForm());
  }

  useEffect(() => {
    if (openedAddFromQuery.current) return;
    if (searchParams.get("add") !== "1") return;

    openedAddFromQuery.current = true;
    setSelected(null);
    setFormError(null);
    setSuccessMessage(null);
    setSchemaForm(blankForm());
  }, [searchParams]);

  function openEditSchema(row: RouteSchemaEntry) {
    setFormError(null);
    setSuccessMessage(null);
    setSelected(null);
    setSchemaForm(formFromRow(row));
  }

  function openAddForExistingRoute(row: RouteSchemaEntry) {
    setFormError(null);
    setSuccessMessage(null);
    setSelected(null);
    setSchemaForm(formFromRow(row));
  }

  function saveSchema(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!schemaForm) return;

    setFormError(null);
    setSuccessMessage(null);

    try {
      if (!schemaForm.type.trim()) throw new Error("Schema type is required.");
      if (!schemaForm.version.trim()) throw new Error("Schema version is required.");
      if (!schemaForm.validFrom.trim()) throw new Error("Valid from is required.");

      const isCreatingNewRoute = !schemaForm.id && !schemaForm.routeIntegrationId;
      if (isCreatingNewRoute) {
        if (!schemaForm.routeId.trim()) throw new Error("Route ID is required when creating a new route/schema entry.");
        if (!schemaForm.path.trim()) throw new Error("Route path is required when creating a new route/schema entry.");
        if (!schemaForm.uri.trim()) throw new Error("Route URL is required when creating a new route/schema entry.");
      }

      const payload = formToPayload(schemaForm);

      if (!schemaForm.id && schemaForm.routeIntegrationId) {
        // This route already exists in the database. The existing backend add endpoint
        // creates a route only when routeId is provided, and rejects duplicate routes.
        // Clear route fields so it creates only the missing schema that matches schema_id.
        payload.routeId = null;
        payload.path = null;
        payload.uri = null;
        payload.stripPrefix = null;
        payload.validateSchema = null;
      }

      setPendingSchemaSave({
        mode: schemaForm.id ? "update" : "create",
        form: schemaForm,
        payload,
      });
    } catch (saveError) {
      setFormError(getApiErrorMessage(saveError));
    }
  }

  async function confirmSchemaSave() {
    if (!pendingSchemaSave) return;

    setSaving(true);
    setFormError(null);
    setSuccessMessage(null);

    try {
      if (pendingSchemaSave.mode === "update" && pendingSchemaSave.form.id) {
        await schemaApi.updateSchema(pendingSchemaSave.form.id, pendingSchemaSave.payload);
        setSuccessMessage("Schema updated successfully.");
      } else {
        await schemaApi.createSchema(pendingSchemaSave.payload);
        setSuccessMessage("Schema created successfully.");
      }

      setPendingSchemaSave(null);
      setSchemaForm(null);
      await load();
    } catch (saveError) {
      setFormError(getApiErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  }

  function requestDeleteSchema(row: RouteSchemaEntry) {
    if (!row.schema?.id) return;
    setPendingDeleteRow(row);
  }

  async function confirmDeleteSchema() {
    const schemaId = pendingDeleteRow?.schema?.id;
    if (!schemaId) return;

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await schemaApi.deleteSchema(schemaId);
      setSelected(null);
      setSchemaForm(null);
      setPendingDeleteRow(null);
      setSuccessMessage("Schema deleted successfully.");
      await load();
    } catch (deleteError) {
      setError(getApiErrorMessage(deleteError));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="section-title">Route Schemas</h1>
          <p className="section-subtitle">
            View API routes from PostgreSQL, inspect linked JSON schemas, and add, edit, or delete route/schema records through the backend.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button onClick={openAddSchema} className="btn-primary">
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Add Schema
          </button>
          <button onClick={load} className="btn-secondary">
            <RefreshCcw className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="atlas-panel p-4 text-sm text-orange-700 dark:text-orange-300">
          <div className="mb-1 flex items-center gap-2 font-mono text-xs font-black uppercase tracking-[0.14em]">
            <AlertTriangle className="h-4 w-4" /> Schema API unavailable
          </div>
          {error}
        </div>
      )}

      {successMessage && (
        <div className="atlas-panel p-4 text-sm text-teal-700 dark:text-teal-300">
          <div className="flex items-center gap-2 font-mono text-xs font-black uppercase tracking-[0.14em]">
            <CheckCircle2 className="h-4 w-4" /> {successMessage}
          </div>
        </div>
      )}

      <div className="atlas-panel p-4 sm:p-5">
        <div className="mb-4 grid gap-3 xl:grid-cols-[minmax(0,1fr)_220px_180px_170px]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[hsl(var(--muted-ink))] sm:left-3 sm:h-4 sm:w-4" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter by route, URI, schema ID, type, or version"
              className="input-clean w-full pl-9 sm:pl-10"
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

        <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] text-[hsl(var(--muted-ink))] sm:gap-3 sm:text-xs">
          <span className="inline-flex items-center gap-1.5 sm:gap-2"><Database className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> {filtered.length} of {rows.length} routes shown</span>
          <span className="status-pill text-teal-700 dark:text-teal-300">{matchedSchemas} schema matches</span>
          {missingSchemas > 0 && <span className="status-pill text-orange-700 dark:text-orange-300">{missingSchemas} missing schemas</span>}
        </div>
      </div>

      <div className="atlas-panel overflow-hidden">
        <div className="space-y-3 p-3 sm:p-4 lg:hidden">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-[hsl(var(--muted-ink))]">
              {loading ? "Loading route schemas..." : "No route schema rows matched the current filters."}
            </div>
          ) : (
            filtered.map((row, index) => (
              <SchemaRouteCard
                key={`${row.metadataId ?? "meta"}-${row.path ?? "path"}-${row.uri ?? "uri"}-${index}`}
                row={row}
                saving={saving}
                onSelect={() => setSelected(row)}
                onEdit={() => openEditSchema(row)}
                onDelete={() => requestDeleteSchema(row)}
                onAdd={() => openAddForExistingRoute(row)}
              />
            ))
          )}
        </div>

        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[1080px] border-collapse text-left text-sm">
            <thead className="border-b border-[hsl(var(--line))] bg-[hsl(var(--panel))] font-mono text-[11px] uppercase tracking-[0.14em] text-[hsl(var(--muted-ink))]">
              <tr>
                <th className="px-4 py-3">Route</th>
                <th className="px-4 py-3">URI</th>
                <th className="px-4 py-3">Schema ID</th>
                <th className="px-4 py-3">Schema</th>
                <th className="px-4 py-3">State</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[hsl(var(--muted-ink))]">
                    {loading ? "Loading route schemas..." : "No route schema rows matched the current filters."}
                  </td>
                </tr>
              ) : (
                filtered.map((row, index) => (
                  <tr
                    key={`${row.metadataId ?? "meta"}-${row.path ?? "path"}-${row.uri ?? "uri"}-${index}`}
                    onClick={() => setSelected(row)}
                    className="cursor-pointer border-b border-[hsl(var(--line))] transition hover:bg-amber-300/10"
                  >
                    <td className="px-4 py-4 align-top">
                      <div className="font-mono text-sm font-black">{row.path || "No path"}</div>
                      <div className="mt-1 font-mono text-xs text-[hsl(var(--muted-ink))]">
                        {row.routeId || "No route_id"}
                      </div>
                    </td>
                    <td className="max-w-[360px] px-4 py-4 align-top">
                      <SchemaRouteUri uri={row.uri} />
                    </td>
                    <td className="px-4 py-4 align-top">
                      <span className="status-pill">schema_id={row.schemaId || "-"}</span>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="font-mono text-xs font-black">
                        {row.schema?.type || "No schema match"}
                      </div>
                      <div className="mt-1 font-mono text-xs text-[hsl(var(--muted-ink))]">
                        {row.schema?.version || "No version"}
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <SchemaRouteStateBadges row={row} />
                    </td>
                    <td className="px-4 py-4 align-top">
                      <SchemaRouteRowActions
                        row={row}
                        saving={saving}
                        onEdit={() => openEditSchema(row)}
                        onDelete={() => requestDeleteSchema(row)}
                        onAdd={() => openAddForExistingRoute(row)}
                      />
                    </td>
                  </tr>
                ))
              )}
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
              <div className="flex flex-wrap gap-2">
                {selected.schema?.id && (
                  <>
                    <button onClick={() => openEditSchema(selected)} className="btn-primary">
                      <Pencil className="h-4 w-4" /> Edit schema
                    </button>
                    <button onClick={() => requestDeleteSchema(selected)} className="btn-secondary text-red-700 dark:text-red-300" disabled={saving}>
                      <Trash2 className="h-4 w-4" /> Delete
                    </button>
                  </>
                )}
                <button onClick={() => setSelected(null)} className="btn-secondary"><X className="h-4 w-4" />Close</button>
              </div>
            </div>

            <div className="max-h-[72vh] overflow-auto p-5">
              <div className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div className="border border-[hsl(var(--line))] bg-[hsl(var(--panel))] p-4">
                  <div className="micro-label">Schema ID</div>
                  <div className="mt-2 font-mono text-sm font-black">{selected.schemaId || "-"}</div>
                </div>
                <div className="border border-[hsl(var(--line))] bg-[hsl(var(--panel))] p-4">
                  <div className="micro-label">Validation</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="status-pill"><ShieldCheck className="h-3 w-3" /> {selected.validateSchema ? "On" : "Off"}</span>
                    <span className="status-pill">strip={selected.stripPrefix ?? "-"}</span>
                  </div>
                </div>
                <div className="border border-[hsl(var(--line))] bg-[hsl(var(--panel))] p-4">
                  <div className="micro-label">Schema</div>
                  <div className="mt-2 font-mono text-sm font-black">{selected.schema?.type || "Missing"}</div>
                  <div className="mt-1 font-mono text-xs text-[hsl(var(--muted-ink))]">{selected.schema?.version || "No version"}</div>
                </div>
                <div className="border border-[hsl(var(--line))] bg-[hsl(var(--panel))] p-4">
                  <div className="micro-label">State</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selected.schema?.base && <span className="status-pill bg-[hsl(var(--amber))] text-slate-950">base</span>}
                    <span className={`status-pill ${schemaStatusClass(selected)}`}>{schemaStatusLabel(selected)}</span>
                  </div>
                </div>
              </div>

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

      {schemaForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" onClick={() => setSchemaForm(null)}>
          <form className="max-h-[92vh] w-full max-w-5xl overflow-hidden border border-[hsl(var(--ink))] bg-[hsl(var(--paper))] shadow-[8px_8px_0_rgba(15,23,42,0.95)]" onSubmit={saveSchema} onClick={(event) => event.stopPropagation()}>
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[hsl(var(--line))] bg-[hsl(var(--panel))] p-5">
              <div>
                <div className="micro-label flex items-center gap-2"><FileJson2 className="h-4 w-4" /> {schemaForm.id ? "Edit schema" : "Add schema"}</div>
                <h2 className="mt-2 font-mono text-2xl font-black uppercase tracking-[-0.05em]">
                  {schemaForm.id ? `${schemaForm.type || "Schema"} ${schemaForm.version || ""}` : "New integration schema"}
                </h2>
              </div>
              <button type="button" onClick={() => setSchemaForm(null)} className="btn-secondary"><X className="h-4 w-4" /> Close</button>
            </div>

            <div className="max-h-[72vh] overflow-auto p-5">
              {formError && (
                <div className="mb-4 border border-orange-500 bg-orange-300/10 p-3 text-sm text-orange-700 dark:text-orange-300">
                  <div className="mb-1 flex items-center gap-2 font-mono text-xs font-black uppercase tracking-[0.14em]"><AlertTriangle className="h-4 w-4" /> Could not save schema</div>
                  {formError}
                </div>
              )}

              <div className="mb-5 border border-[hsl(var(--line))] bg-[hsl(var(--panel))] p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="micro-label">Route details</div>
                  </div>
                  {schemaForm.routeIntegrationId && <span className="status-pill">route_id={schemaForm.routeIntegrationId}</span>}
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <label className="block">
                    <span className="micro-label">Route ID</span>
                    <input
                      value={schemaForm.routeId}
                      onChange={(event) => setSchemaForm({ ...schemaForm, routeId: event.target.value })}
                      className="input-clean mt-2 w-full"
                      placeholder="eirp_route"
                    />
                  </label>

                  <label className="block xl:col-span-1">
                    <span className="micro-label">Path</span>
                    <input
                      value={schemaForm.path}
                      onChange={(event) => setSchemaForm({ ...schemaForm, path: event.target.value })}
                      className="input-clean mt-2 w-full"
                      placeholder="/api/eirp/**"
                    />
                  </label>

                  <label className="block md:col-span-2">
                    <span className="micro-label">URL / URI</span>
                    <input
                      value={schemaForm.uri}
                      onChange={(event) => setSchemaForm({ ...schemaForm, uri: event.target.value })}
                      className="input-clean mt-2 w-full"
                      placeholder="http://service.172.16.0.180.nip.io"
                    />
                  </label>

                  <label className="block">
                    <span className="micro-label">Strip prefix</span>
                    <input
                      type="number"
                      min="0"
                      value={schemaForm.stripPrefix}
                      onChange={(event) => setSchemaForm({ ...schemaForm, stripPrefix: event.target.value })}
                      className="input-clean mt-2 w-full"
                    />
                  </label>

                  <label className="flex items-center gap-3 border border-[hsl(var(--line))] bg-[hsl(var(--paper))] p-4 font-mono text-xs font-black uppercase tracking-[0.14em]">
                    <input
                      type="checkbox"
                      checked={schemaForm.validateSchema}
                      onChange={(event) => setSchemaForm({ ...schemaForm, validateSchema: event.target.checked })}
                      className="h-4 w-4"
                    />
                    Validate schema
                  </label>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <label className="block">
                  <span className="micro-label">Type</span>
                  <input
                    value={schemaForm.type}
                    onChange={(event) => setSchemaForm({ ...schemaForm, type: event.target.value })}
                    className="input-clean mt-2 w-full"
                    placeholder="registration"
                    required
                  />
                </label>

                <label className="block">
                  <span className="micro-label">Version</span>
                  <input
                    value={schemaForm.version}
                    onChange={(event) => setSchemaForm({ ...schemaForm, version: event.target.value })}
                    className="input-clean mt-2 w-full"
                    placeholder="v1"
                    required
                  />
                </label>

                <label className="block">
                  <span className="micro-label">Base version</span>
                  <input
                    value={schemaForm.baseVersion}
                    onChange={(event) => setSchemaForm({ ...schemaForm, baseVersion: event.target.value })}
                    className="input-clean mt-2 w-full"
                    placeholder="Optional"
                  />
                </label>

                <label className="block">
                  <span className="micro-label">Valid from</span>
                  <input
                    type="datetime-local"
                    value={schemaForm.validFrom}
                    onChange={(event) => setSchemaForm({ ...schemaForm, validFrom: event.target.value })}
                    className="input-clean mt-2 w-full"
                    required
                  />
                </label>

                <label className="block">
                  <span className="micro-label">Valid to</span>
                  <input
                    type="datetime-local"
                    value={schemaForm.validTo}
                    onChange={(event) => setSchemaForm({ ...schemaForm, validTo: event.target.value })}
                    className="input-clean mt-2 w-full"
                  />
                </label>

                <label className="flex items-center gap-3 border border-[hsl(var(--line))] bg-[hsl(var(--panel))] p-4 font-mono text-xs font-black uppercase tracking-[0.14em]">
                  <input
                    type="checkbox"
                    checked={schemaForm.base}
                    onChange={(event) => setSchemaForm({ ...schemaForm, base: event.target.checked })}
                    className="h-4 w-4"
                  />
                  Base schema
                </label>

                <label className="flex items-center gap-3 border border-[hsl(var(--line))] bg-[hsl(var(--panel))] p-4 font-mono text-xs font-black uppercase tracking-[0.14em]">
                  <input
                    type="checkbox"
                    checked={schemaForm.enabled}
                    onChange={(event) => setSchemaForm({ ...schemaForm, enabled: event.target.checked })}
                    className="h-4 w-4"
                  />
                  Enabled
                </label>
              </div>

              <label className="mt-5 block">
                <span className="micro-label flex items-center gap-2"><Braces className="h-4 w-4" /> Schema JSON</span>
                <textarea
                  value={schemaForm.schemaJson}
                  onChange={(event) => setSchemaForm({ ...schemaForm, schemaJson: event.target.value })}
                  className="mt-2 min-h-[360px] w-full border border-[hsl(var(--line))] bg-slate-950 p-4 font-mono text-xs leading-6 text-slate-100 outline-none focus:border-[hsl(var(--amber))]"
                  spellCheck={false}
                  required
                />
              </label>
            </div>

            <div className="flex flex-wrap justify-end gap-3 border-t border-[hsl(var(--line))] bg-[hsl(var(--panel))] p-5">
              <button type="button" onClick={() => setSchemaForm(null)} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">
                <Save className="h-4 w-4" /> {saving ? "Saving..." : schemaForm.id ? "Save changes" : "Create schema"}
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmActionModal
        open={Boolean(pendingSchemaSave)}
        eyebrow={pendingSchemaSave?.mode === "update" ? "Confirm schema update" : "Confirm schema create"}
        title={pendingSchemaSave?.mode === "update" ? "Save schema changes?" : "Create schema?"}
        description={
          pendingSchemaSave?.mode === "update"
            ? "This will update the schema and route values through the backend."
            : "This will create the schema/route record through the backend."
        }
        confirmLabel={pendingSchemaSave?.mode === "update" ? "Confirm update" : "Create schema"}
        loading={saving}
        onCancel={() => setPendingSchemaSave(null)}
        onConfirm={confirmSchemaSave}
        items={[
          { label: "Route ID", value: pendingSchemaSave?.form.routeId },
          { label: "Path", value: pendingSchemaSave?.form.path },
          { label: "URI", value: pendingSchemaSave?.form.uri },
          { label: "Schema", value: formSchemaLabel(pendingSchemaSave?.form) },
          { label: "Validation", value: pendingSchemaSave?.form.validateSchema ? "On" : "Off" },
          { label: "State", value: pendingSchemaSave?.form.enabled ? "Enabled" : "Inactive", tone: pendingSchemaSave?.form.enabled ? "success" : "warning" },
        ]}
      />

      <ConfirmActionModal
        open={Boolean(pendingDeleteRow)}
        eyebrow="Confirm delete"
        title="Delete schema?"
        description="This will call the backend delete endpoint. The backend decides which linked route or metadata records are also removed."
        confirmLabel="Delete schema"
        confirmTone="danger"
        loading={saving}
        onCancel={() => setPendingDeleteRow(null)}
        onConfirm={confirmDeleteSchema}
        items={[
          { label: "Schema", value: schemaLabel(pendingDeleteRow), tone: "danger" },
          { label: "Route", value: pendingDeleteRow?.path || pendingDeleteRow?.routeId },
          { label: "URI", value: pendingDeleteRow?.uri },
          { label: "Schema ID", value: pendingDeleteRow?.schemaId },
        ]}
      />

    </div>
  );
}
