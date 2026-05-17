"use client";

import Editor from "@monaco-editor/react";
import { FileCode2, Pencil, RefreshCcw, Save, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { integrationsApi } from "@/services/integrations-api";
import { getApiErrorMessage } from "@/lib/api-client";
import { usePlatformStore } from "@/store/platform-store";
import { IntegrationFile } from "@/types/platform";
import { RouteGraph } from "@/features/visualization/RouteGraph";

export function RouteWorkspace({ integrationName }: { integrationName: string }) {
  const { selectedIntegration, routeGraph, setSelectedIntegration, setRouteGraph } = usePlatformStore();
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeFile, setActiveFile] = useState<IntegrationFile | null>(null);
  const [draftContent, setDraftContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("Open a file below to edit it inside this integration.");

  async function load() {
    setLoading(true);
    setLoadError(null);

    try {
      const detail = await integrationsApi.get(integrationName);
      setSelectedIntegration(detail);

      try {
        const graph = await integrationsApi.visualizeByName(integrationName);
        setRouteGraph(graph);
      } catch (graphError) {
        setRouteGraph({ nodes: [], edges: [] });
        setLoadError(`Files loaded, but route graph could not be generated: ${getApiErrorMessage(graphError)}`);
      }
    } catch (error) {
      setSelectedIntegration(undefined);
      setRouteGraph({ nodes: [], edges: [] });
      setLoadError(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load().catch(() => undefined);
  }, [integrationName]);

  const files = useMemo<IntegrationFile[]>(() => {
    if (!selectedIntegration) return [];
    if (selectedIntegration.files?.length) return selectedIntegration.files;

    if (selectedIntegration.sourceName && selectedIntegration.sourceContent) {
      const sourceName = selectedIntegration.sourceName;
      const lowerName = sourceName.toLowerCase();
      return [{
        name: sourceName.split("/").pop() ?? sourceName,
        path: sourceName,
        language: selectedIntegration.sourceLanguage,
        content: selectedIntegration.sourceContent,
        type: lowerName.includes("/routes/") ? "route" : "integration"
      }];
    }

    return [];
  }, [selectedIntegration]);

  const integrationFiles = files.filter((file) => file.type === "integration");
  const routeFiles = files.filter((file) => file.type === "route");

  function openEditor(file: IntegrationFile) {
    setActiveFile(file);
    setDraftContent(file.content);
    setMessage(`Editing ${file.path}.`);
  }

  function closeEditor() {
    setActiveFile(null);
    setDraftContent("");
    setMessage("Open a file below to edit it inside this integration.");
  }

  async function saveFile() {
    if (!activeFile) return;
    setSaving(true);
    setMessage(`Saving ${activeFile.path}...`);

    try {
      await integrationsApi.writeFile({
        path: activeFile.path,
        content: draftContent,
        commitMessage: `Update ${activeFile.path}`
      });
      setMessage(`Saved ${activeFile.path}.`);
      await load();
      setActiveFile((current) => current ? { ...current, content: draftContent } : current);
    } catch {
      setMessage(`Save failed for ${activeFile.path}. Check the backend GitLab write endpoint.`);
    } finally {
      setSaving(false);
    }
  }

  function renderFileGroup(title: string, group: IntegrationFile[]) {
    return (
      <div className="space-y-3">
        <div className="micro-label">{title}</div>
        {group.length === 0 ? (
          <div className="border border-[hsl(var(--line))] p-4 font-mono text-xs text-[hsl(var(--muted-ink))]">No files found.</div>
        ) : group.map((file) => (
          <div key={file.path} className="flex flex-wrap items-center justify-between gap-3 border border-[hsl(var(--line))] p-4">
            <div className="min-w-0">
              <div className="font-mono text-sm font-black">{file.name}</div>
              <div className="mt-1 truncate font-mono text-xs text-[hsl(var(--muted-ink))]">{file.path}</div>
              <div className="mt-2 font-mono text-[11px] font-black uppercase tracking-[0.14em] text-[hsl(var(--muted-ink))]">{file.language}</div>
            </div>
            <button onClick={() => openEditor(file)} className="btn-secondary"><Pencil className="h-4 w-4" />Edit</button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="section-title">{selectedIntegration?.name ?? integrationName}</h1>
          <p className="section-subtitle">View the integration config and route files, then edit them inside the selected integration.</p>
        </div>
        <button onClick={load} className="btn-secondary"><RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />Reload</button>
      </div>

      {loadError && (
        <div className="atlas-panel p-4 font-mono text-xs text-orange-700 dark:text-orange-300">{loadError}</div>
      )}

      <div className="atlas-panel p-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-mono text-xs text-[hsl(var(--muted-ink))]"><FileCode2 className="h-4 w-4" />{files.length} files</div>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {renderFileGroup("Integration Config", integrationFiles)}
          {renderFileGroup("Routes", routeFiles)}
        </div>
      </div>

      <div className="atlas-panel p-4"><div className="flex items-center gap-2 font-mono text-xs text-[hsl(var(--muted-ink))]"><Save className="h-4 w-4" />{message}</div></div>

      {activeFile && (
        <div className="atlas-panel overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[hsl(var(--line))] px-4 py-3">
            <div>
              <div className="micro-label">Editing</div>
              <div className="mt-1 font-mono text-sm font-black">{activeFile.name}</div>
              <div className="mt-1 font-mono text-xs text-[hsl(var(--muted-ink))]">{activeFile.path}</div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={closeEditor} className="btn-secondary"><X className="h-4 w-4" />Close</button>
              <button onClick={saveFile} disabled={saving} className="btn-primary"><Save className="h-4 w-4" />{saving ? "Saving" : "Save"}</button>
            </div>
          </div>
          <div className="p-4">
            <div className="overflow-hidden border border-[hsl(var(--line))] shadow-[5px_5px_0_rgba(30,28,23,0.12)]">
              <Editor height="680px" defaultLanguage={activeFile.language} language={activeFile.language} value={draftContent} options={{ minimap: { enabled: true }, automaticLayout: true, fontSize: 14, lineHeight: 23, fontFamily: "JetBrains Mono, Menlo, Monaco, Consolas, monospace", formatOnPaste: true, formatOnType: true }} onChange={(value) => setDraftContent(value ?? "")} />
            </div>
          </div>
        </div>
      )}
      <RouteGraph graph={routeGraph} />
    </div>
  );
}
