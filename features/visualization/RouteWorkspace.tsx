"use client";

import Editor from "@monaco-editor/react";
import { FileCode2, GitBranch, Pencil, RefreshCcw, Save, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { integrationsApi } from "@/services/integrations-api";
import { getApiErrorMessage } from "@/lib/api-client";
import { usePlatformStore } from "@/store/platform-store";
import { IntegrationFile } from "@/types/platform";
import { RouteGraph } from "@/features/visualization/RouteGraph";
import { BranchPicker } from "@/components/BranchPicker";
import { ConfirmActionModal } from "@/components/ConfirmActionModal";

export function RouteWorkspace({
  integrationName,
}: {
  integrationName: string;
}) {
  const {
    selectedIntegration,
    routeGraph,
    branches,
    selectedBranch,
    setSelectedIntegration,
    setRouteGraph,
    setBranches,
    setSelectedBranch,
  } = usePlatformStore();

  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeFile, setActiveFile] = useState<IntegrationFile | null>(null);
  const [draftContent, setDraftContent] = useState("");
  const [commitMessage, setCommitMessage] = useState("");
  const [targetBranch, setTargetBranch] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [message, setMessage] = useState(
    "Choose a branch, then open a file below to edit it inside this integration.",
  );

  async function loadBranches() {
    try {
      const data = await integrationsApi.branches();
      setBranches(data);
      if (data.length > 0 && !data.includes(selectedBranch)) {
        setSelectedBranch(data[0]);
      }
    } catch {
      setBranches([]);
    }
  }

  async function load(branch = selectedBranch) {
    setLoading(true);
    setLoadError(null);

    try {
      const detail = await integrationsApi.get(integrationName, branch);
      setSelectedIntegration(detail);

      try {
        const graph = await integrationsApi.visualizeByName(
          integrationName,
          branch,
        );
        setRouteGraph(graph);
      } catch (graphError) {
        setRouteGraph({ nodes: [], edges: [] });
        setLoadError(
          `Files loaded from ${branch}, but route graph could not be generated: ${getApiErrorMessage(
            graphError,
          )}`,
        );
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
    void loadBranches();
  }, []);

  useEffect(() => {
    closeEditor();
    load(selectedBranch).catch(() => undefined);
  }, [integrationName, selectedBranch]);

  const files = useMemo<IntegrationFile[]>(() => {
    if (!selectedIntegration) return [];
    if (selectedIntegration.files?.length) return selectedIntegration.files;

    if (selectedIntegration.sourceName && selectedIntegration.sourceContent) {
      const sourceName = selectedIntegration.sourceName;
      const lowerName = sourceName.toLowerCase();

      return [
        {
          name: sourceName.split("/").pop() ?? sourceName,
          path: sourceName,
          language: selectedIntegration.sourceLanguage,
          content: selectedIntegration.sourceContent,
          type: lowerName.includes("/routes/") ? "route" : "integration",
        },
      ];
    }

    return [];
  }, [selectedIntegration]);

  const integrationFiles = files.filter((file) => file.type === "integration");
  const routeFiles = files.filter((file) => file.type === "route");

  function openEditor(file: IntegrationFile) {
    setActiveFile(file);
    setDraftContent(file.content);
    setCommitMessage(`Update ${file.path}`);
    setTargetBranch(selectedBranch);
    setMessage(`Editing ${file.path} from branch ${selectedBranch}.`);
  }

  function closeEditor() {
    setActiveFile(null);
    setDraftContent("");
    setCommitMessage("");
    setTargetBranch("");
    setMessage(
      "Choose a branch, then open a file below to edit it inside this integration.",
    );
  }

  function requestSaveFile() {
    if (!activeFile) return;

    if (!targetBranch.trim()) {
      setMessage("Choose a target branch before saving.");
      return;
    }

    if (!commitMessage.trim()) {
      setMessage("Commit message is required before saving.");
      return;
    }

    setConfirmSaveOpen(true);
  }

  async function confirmSaveFile() {
    if (!activeFile) return;

    setConfirmSaveOpen(false);
    setSaving(true);
    setMessage(`Saving ${activeFile.path} to ${targetBranch}...`);

    try {
      await integrationsApi.writeFile({
        path: activeFile.path,
        content: draftContent,
        branch: targetBranch,
        commitMessage,
      });

      setMessage(`Saved ${activeFile.path} to ${targetBranch}.`);

      if (targetBranch === selectedBranch) {
        await load(selectedBranch);
        setActiveFile((current) =>
          current ? { ...current, content: draftContent } : current,
        );
      }
    } catch (error) {
      setMessage(
        `Save failed for ${activeFile.path}: ${getApiErrorMessage(error)}`,
      );
    } finally {
      setSaving(false);
    }
  }

  function renderFileGroup(title: string, group: IntegrationFile[]) {
    return (
      <div className="space-y-3">
        <div className="micro-label">{title}</div>
        {group.length === 0 ? (
          <div className="border border-[hsl(var(--line))] p-4 font-mono text-xs text-[hsl(var(--muted-ink))]">
            No files found on branch {selectedBranch}.
          </div>
        ) : (
          group.map((file) => (
            <div
              key={file.path}
              className="flex flex-wrap items-center justify-between gap-3 border border-[hsl(var(--line))] bg-[hsl(var(--paper))] p-4 shadow-[3px_3px_0_rgba(30,28,23,0.10)]"
            >
              <div className="min-w-0">
                <div className="font-mono text-sm font-black">{file.name}</div>
                <div className="mt-1 truncate font-mono text-xs text-[hsl(var(--muted-ink))]">
                  {file.path}
                </div>
                <div className="mt-2 font-mono text-[11px] font-black uppercase tracking-[0.14em] text-[hsl(var(--muted-ink))]">
                  {file.language}
                </div>
              </div>
              <button
                onClick={() => openEditor(file)}
                className="btn-secondary"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </button>
            </div>
          ))
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="section-title">
          {selectedIntegration?.name ?? integrationName}
        </h1>
        <p className="section-subtitle">
          Select a Git branch, view the integration files from that branch, then
          save changes with a commit message.
        </p>
      </div>

      <div className="atlas-panel p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center border border-[hsl(var(--line))] bg-[hsl(var(--paper))] shadow-[3px_3px_0_rgba(30,28,23,0.12)]">
              <GitBranch className="h-5 w-5 text-orange-600" />
            </div>
            <div className="min-w-0">
              <div className="micro-label">Working branch</div>
              <p className="mt-1 truncate text-sm text-[hsl(var(--muted-ink))]">
                Files and graph are loaded from this branch.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="w-[260px]">
              <BranchPicker
                value={selectedBranch}
                branches={branches}
                onChange={setSelectedBranch}
                compact
              />
            </div>

            <button
              onClick={() => load(selectedBranch)}
              className="btn-secondary"
            >
              <RefreshCcw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Reload
            </button>
          </div>
        </div>
      </div>

      {loadError && (
        <div className="atlas-panel p-4 font-mono text-xs text-orange-700 dark:text-orange-300">
          {loadError}
        </div>
      )}

      <div className="atlas-panel p-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-[hsl(var(--muted-ink))]">
            <FileCode2 className="h-4 w-4" />
            <span>{files.length} files</span>
            <span className="border border-[hsl(var(--line))] bg-[hsl(var(--paper))] px-2 py-1 font-black">
              {selectedBranch}
            </span>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {renderFileGroup("Integration Config", integrationFiles)}
          {renderFileGroup("Routes", routeFiles)}
        </div>
      </div>

      <div className="atlas-panel p-4">
        <div className="flex items-center gap-2 font-mono text-xs text-[hsl(var(--muted-ink))]">
          <Save className="h-4 w-4" />
          {message}
        </div>
      </div>

      {activeFile && (
        <div className="atlas-panel overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[hsl(var(--line))] px-4 py-3">
            <div>
              <div className="micro-label">Editing</div>
              <div className="mt-1 font-mono text-sm font-black">
                {activeFile.name}
              </div>
              <div className="mt-1 font-mono text-xs text-[hsl(var(--muted-ink))]">
                {activeFile.path}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={closeEditor} className="btn-secondary">
                <X className="h-4 w-4" />
                Close
              </button>
              <button
                onClick={requestSaveFile}
                disabled={saving}
                className="btn-primary"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving" : "Save"}
              </button>
            </div>
          </div>

          <div className="border-b border-[hsl(var(--line))] bg-[hsl(var(--panel))] p-4">
            <div className="grid gap-3 lg:grid-cols-[260px_minmax(0,1fr)]">
              <BranchPicker
                label="Target branch"
                value={targetBranch || selectedBranch}
                branches={branches}
                onChange={setTargetBranch}
              />

              <label className="block">
                <span className="micro-label">Commit message</span>
                <input
                  value={commitMessage}
                  onChange={(event) => setCommitMessage(event.target.value)}
                  className="mt-2 w-full border border-[hsl(var(--line))] bg-[hsl(var(--paper))] px-3 py-3 font-mono text-sm text-[hsl(var(--ink))] outline-none shadow-[3px_3px_0_rgba(30,28,23,0.12)] placeholder:text-[hsl(var(--muted-ink))] focus:border-[hsl(var(--ink))]"
                  placeholder={`Update ${activeFile.path}`}
                />
              </label>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 font-mono text-[11px] text-[hsl(var(--muted-ink))]">
              <span className="border border-[hsl(var(--line))] bg-[hsl(var(--paper))] px-2 py-1">
                source: {selectedBranch}
              </span>
              <span className="border border-[hsl(var(--line))] bg-[hsl(var(--paper))] px-2 py-1">
                target: {targetBranch || selectedBranch}
              </span>
              <span className="border border-[hsl(var(--line))] bg-[hsl(var(--paper))] px-2 py-1">
                {activeFile.path}
              </span>
            </div>
          </div>

          <div className="p-4">
            <div className="overflow-hidden border border-[hsl(var(--line))] shadow-[5px_5px_0_rgba(30,28,23,0.12)]">
              <Editor
                height="680px"
                defaultLanguage={activeFile.language}
                language={activeFile.language}
                value={draftContent}
                options={{
                  minimap: { enabled: true },
                  automaticLayout: true,
                  fontSize: 14,
                  lineHeight: 23,
                  fontFamily:
                    "JetBrains Mono, Menlo, Monaco, Consolas, monospace",
                  formatOnPaste: true,
                  formatOnType: true,
                }}
                onChange={(value) => setDraftContent(value ?? "")}
              />
            </div>
          </div>
        </div>
      )}
      <ConfirmActionModal
        open={confirmSaveOpen}
        eyebrow="Confirm Git save"
        title="Save integration file?"
        description="This will write the edited file to Git using the selected target branch and commit message."
        confirmLabel="Confirm save"
        loading={saving}
        onCancel={() => setConfirmSaveOpen(false)}
        onConfirm={confirmSaveFile}
        items={[
          { label: "File", value: activeFile?.path },
          { label: "Source branch", value: selectedBranch },
          {
            label: "Target branch",
            value: targetBranch || selectedBranch,
            tone: targetBranch && targetBranch !== selectedBranch ? "warning" : "default",
          },
          { label: "Commit message", value: commitMessage },
        ]}
      />

      <RouteGraph graph={routeGraph} />
    </div>
  );
}
