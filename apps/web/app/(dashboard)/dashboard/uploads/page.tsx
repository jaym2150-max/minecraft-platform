'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Upload,
  File,
  X,
  Package,
  Download,
  Info,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Trash2,
  Loader2,
} from 'lucide-react';
import { Button } from '@mcp/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@mcp/ui/components/card';
import { Input } from '@mcp/ui/components/input';
import { Label } from '@mcp/ui/components/label';
import { Badge } from '@mcp/ui/components/badge';
import { toast } from 'sonner';
import { sdk } from '@/services/api';
import { Project, MinecraftVersion } from '@mcp/types';

// ── Types ──

interface UploadedFile {
  file: File;
  name: string;
  size: number;
  type: string;
}

interface Dependency {
  id: string;
  name: string;
  required: boolean;
}

// ── Constants ──

const modLoaders = ['Fabric', 'Forge', 'NeoForge', 'Quilt'];
const releaseTypes = ['Release', 'Beta', 'Alpha'];
const supportLevels = ['Active', 'Testing', 'Deprecated'];

// ── Page ──

export default function DashboardUploadsPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [versionNumber, setVersionNumber] = useState('');
  const [mcVersion, setMcVersion] = useState('');
  const [loader, setLoader] = useState('');
  const [releaseType, setReleaseType] = useState('Release');
  const [supportLevel, setSupportLevel] = useState('Active');
  const [changelog, setChangelog] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dependencies, setDependencies] = useState<Dependency[]>([
    { id: '1', name: 'Fabric API', required: true },
  ]);
  const [dependencyName, setDependencyName] = useState('');

  // SDK-driven data
  const [projects, setProjects] = useState<{ value: string; label: string }[]>([]);
  const [mcVersions, setMcVersions] = useState<string[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const fetchDropdownData = useCallback(async () => {
    setLoadingOptions(true);
    try {
      const [projRes, verRes] = await Promise.all([
        sdk.listProjects({ limit: 100, sort: 'updated' }),
        sdk.listMinecraftVersions(),
      ]);

      setProjects(
        (projRes.data ?? []).map((p: Project) => ({
          value: p.slug,
          label: p.title,
        })),
      );
      setMcVersions((verRes.data ?? []).map((v: MinecraftVersion) => v.version));
    } catch {
      // Fallback to empty arrays if API unavailable
      setProjects([]);
      setMcVersions([]);
    } finally {
      setLoadingOptions(false);
    }
  }, []);

  useEffect(() => {
    fetchDropdownData();
  }, [fetchDropdownData]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files).map((f) => ({
      file: f,
      name: f.name,
      size: f.size,
      type: f.type,
    }));
    setFiles((prev) => [...prev, ...dropped]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []).map((f) => ({
      file: f,
      name: f.name,
      size: f.size,
      type: f.type,
    }));
    setFiles((prev) => [...prev, ...selected]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const addDependency = () => {
    if (!dependencyName.trim()) return;
    setDependencies((prev) => [
      ...prev,
      { id: String(Date.now()), name: dependencyName.trim(), required: true },
    ]);
    setDependencyName('');
  };

  const removeDependency = (id: string) => {
    setDependencies((prev) => prev.filter((d) => d.id !== id));
  };

  const toggleDependencyRequired = (id: string) => {
    setDependencies((prev) => prev.map((d) => (d.id === id ? { ...d, required: !d.required } : d)));
  };

  const handlePublish = async () => {
    if (!selectedProject) {
      toast.error('Please select a project');
      return;
    }
    if (!versionNumber) {
      toast.error('Please enter a version number');
      return;
    }
    if (!mcVersion) {
      toast.error('Please select a Minecraft version');
      return;
    }
    if (!loader) {
      toast.error('Please select a mod loader');
      return;
    }
    if (files.length === 0) {
      toast.error('Please upload a file');
      return;
    }

    setUploading(true);
    try {
      const projectSlug = selectedProject;
      const projRes = await sdk.getProject(projectSlug);
      const projectId = projRes.data?.id ?? projRes.data?.slug;

      if (!projectId) {
        toast.error('Could not resolve project ID');
        setUploading(false);
        return;
      }

      // 1) Upload file bytes via multipart FormData to the server-managed
      //    upload endpoint. This creates a ProjectVersion stub and queues
      //    a virus scan — the fileUrl/hash are server-derived, not client-supplied.
      const uploadRes = await sdk.uploadFile(projectId, files[0].file);
      const uploadId = (uploadRes as any).data?.uploadId ?? (uploadRes as any).data?.id;
      if (!uploadId) {
        toast.error('Upload failed — no uploadId returned');
        setUploading(false);
        return;
      }

      // Optional: poll scan status until CLEAN (with timeout). The server
      // rejects createVersion while scanStatus !== CLEAN, so we wait briefly.
      const maxWaitMs = 30000;
      const pollIntervalMs = 2000;
      let elapsed = 0;
      while (elapsed < maxWaitMs) {
        try {
          const statusRes = await sdk.getUploadStatus(uploadId);
          const scanStatus = (statusRes as any).data?.scanStatus ?? (statusRes as any).data?.status;
          if (scanStatus === 'CLEAN' || scanStatus === 'completed') break;
          if (scanStatus === 'INFECTED' || scanStatus === 'ERROR' || scanStatus === 'failed') {
            toast.error(`File rejected by scanner: ${scanStatus}`);
            setUploading(false);
            return;
          }
        } catch {
          // Status endpoint may 404 briefly before worker picks up — keep polling
        }
        await new Promise((r) => setTimeout(r, pollIntervalMs));
        elapsed += pollIntervalMs;
      }

      const loaderMap: Record<string, string> = {
        Fabric: 'FABRIC',
        Forge: 'FORGE',
        NeoForge: 'NEOFORGE',
        Quilt: 'QUILT',
      };

      await sdk.createVersion(projectId, {
        version: versionNumber,
        uploadId,
        fileSize: files[0]?.size || 0,
        changelog: changelog || undefined,
        minecraftVersionId: mcVersion,
        loaders: loaderMap[loader] ? [loaderMap[loader]] : [loader.toUpperCase()],
        dependencies: dependencies.map((d) => ({
          projectId: d.id,
          required: d.required,
        })),
        status: releaseType === 'Release' ? 'APPROVED' : releaseType === 'Beta' ? 'BETA' : 'DRAFT',
      } as any);

      toast.success(
        `Version ${versionNumber} published to ${projects.find((p) => p.value === selectedProject)?.label || selectedProject}!`,
      );
      setFiles([]);
      setVersionNumber('');
      setMcVersion('');
      setLoader('');
      setChangelog('');
      setDependencies([]);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to publish version');
    } finally {
      setUploading(false);
    }
  };

  const totalFileSize = files.reduce((sum, f) => sum + f.size, 0);

  const isOverLimit = totalFileSize > 50 * 1024 * 1024;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Upload New Version</h1>
          <p className="text-muted-foreground mt-1">
            Publish a new release for one of your projects
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Project Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Project</CardTitle>
              <CardDescription>Choose which project to upload for</CardDescription>
            </CardHeader>
            <CardContent>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="border-input bg-background focus-visible:ring-ring h-10 w-full rounded-lg border px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 disabled:opacity-50"
                disabled={loadingOptions}
              >
                <option value="">
                  {loadingOptions ? 'Loading projects...' : 'Select a project...'}
                </option>
                {projects.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Upload File</CardTitle>
              <CardDescription>Upload your mod file (.jar, .zip)</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="hover:border-primary/50 group cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-colors"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <div className="bg-primary/5 group-hover:bg-primary/10 mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl transition-colors">
                  <Upload className="text-primary/60 group-hover:text-primary h-6 w-6 transition-colors" />
                </div>
                <p className="mb-1 font-medium">Drop your file here</p>
                <p className="text-muted-foreground mb-4 text-sm">or click to browse</p>
                <Button
                  variant="outline"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    document.getElementById('file-input')?.click();
                  }}
                >
                  Browse Files
                </Button>
                <input
                  id="file-input"
                  type="file"
                  className="hidden"
                  accept=".jar,.zip"
                  multiple
                  onChange={handleFileInput}
                />
              </div>

              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {files.map((file, i) => (
                    <div
                      key={i}
                      className="bg-card flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="bg-primary/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                          <File className="text-primary h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{file.name}</p>
                          <p className="text-muted-foreground text-xs">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => removeFile(i)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {isOverLimit && (
                    <div className="flex items-center gap-2 rounded-lg bg-red-500/10 p-2 text-xs text-red-500">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      Total file size exceeds the 50MB limit
                    </div>
                  )}
                  <p className="text-muted-foreground text-right text-xs">
                    Total: {(totalFileSize / 1024 / 1024).toFixed(2)} MB / 50 MB
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Version Details */}
          <Card>
            <CardHeader>
              <CardTitle>Version Details</CardTitle>
              <CardDescription>Specify version information and compatibility</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="version">Version Number</Label>
                  <Input
                    id="version"
                    placeholder="e.g. 1.0.0"
                    value={versionNumber}
                    onChange={(e) => setVersionNumber(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="release-type">Release Type</Label>
                  <select
                    id="release-type"
                    value={releaseType}
                    onChange={(e) => setReleaseType(e.target.value)}
                    className="border-input bg-background focus-visible:ring-ring h-10 w-full rounded-lg border px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1"
                  >
                    {releaseTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="mc-version">Minecraft Version</Label>
                  <select
                    id="mc-version"
                    value={mcVersion}
                    onChange={(e) => setMcVersion(e.target.value)}
                    className="border-input bg-background focus-visible:ring-ring h-10 w-full rounded-lg border px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 disabled:opacity-50"
                    disabled={loadingOptions}
                  >
                    <option value="">
                      {loadingOptions ? 'Loading versions...' : 'Select version...'}
                    </option>
                    {mcVersions.map((v) => (
                      <option key={v} value={v}>
                        MC {v}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loader">Mod Loader</Label>
                  <select
                    id="loader"
                    value={loader}
                    onChange={(e) => setLoader(e.target.value)}
                    className="border-input bg-background focus-visible:ring-ring h-10 w-full rounded-lg border px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1"
                  >
                    <option value="">Select loader...</option>
                    {modLoaders.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="support-level">Support Level</Label>
                <div className="flex gap-2">
                  {supportLevels.map((level) => (
                    <button
                      key={level}
                      onClick={() => setSupportLevel(level)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                        supportLevel === level
                          ? level === 'Active'
                            ? 'bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/30 dark:text-emerald-400'
                            : level === 'Testing'
                              ? 'bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/30 dark:text-amber-400'
                              : 'bg-muted text-muted-foreground ring-border ring-1'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="changelog">Changelog</Label>
                <textarea
                  id="changelog"
                  className="border-input bg-background focus-visible:ring-ring min-h-[160px] w-full resize-y rounded-lg border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1"
                  placeholder={`Describe what's new in this version...\n\nExample:\n- Added new feature X\n- Fixed crash when doing Y\n- Updated dependency to v2.0`}
                  value={changelog}
                  onChange={(e) => setChangelog(e.target.value)}
                />
                <div className="text-muted-foreground flex justify-between text-xs">
                  <span>Supports Markdown formatting</span>
                  <span>{changelog.length} characters</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dependencies */}
          <Card>
            <CardHeader>
              <CardTitle>Dependencies</CardTitle>
              <CardDescription>Add mods that this version depends on</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search for a mod..."
                  value={dependencyName}
                  onChange={(e) => setDependencyName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addDependency();
                    }
                  }}
                  className="flex-1"
                />
                <Button variant="outline" size="icon" onClick={addDependency}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {dependencies.length > 0 ? (
                <div className="space-y-2">
                  {dependencies.map((dep) => (
                    <div
                      key={dep.id}
                      className="bg-card group flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <Package className="text-muted-foreground h-4 w-4 shrink-0" />
                        <span className="text-sm font-medium">{dep.name}</span>
                        <Badge
                          variant={dep.required ? 'default' : 'outline'}
                          className="h-4 cursor-pointer px-1.5 text-[10px]"
                          onClick={() => toggleDependencyRequired(dep.id)}
                        >
                          {dep.required ? 'Required' : 'Optional'}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() => removeDependency(dep.id)}
                      >
                        <Trash2 className="text-destructive h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground py-6 text-center">
                  <Package className="mx-auto mb-2 h-8 w-8 opacity-40" />
                  <p className="text-sm">No dependencies added yet</p>
                  <p className="mt-1 text-xs">Search for mods above to add dependencies</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="outline"
              disabled={uploading}
              onClick={() => {
                releaseType !== 'Release' ? handlePublish() : setReleaseType('Alpha');
                toast.info('Set release type to Alpha to save as draft');
              }}
            >
              Save as Draft
            </Button>
            <Button onClick={handlePublish} disabled={uploading} className="min-w-[160px] gap-2">
              {uploading ? (
                <>
                  <span className="border-primary-foreground/30 border-t-primary-foreground h-4 w-4 animate-spin rounded-full border-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Publish Version
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Guidelines */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Info className="text-primary h-4 w-4" />
                <CardTitle className="text-sm">Upload Guidelines</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <span>
                  Maximum file size: <strong>50MB</strong>
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <span>
                  Allowed formats: <strong>.jar, .zip</strong>
                </span>
              </div>
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <span>
                  Files are scanned for <strong>malware</strong>
                </span>
              </div>
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <span>
                  Including source code is <strong>recommended</strong>
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Recent Uploads */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Download className="text-primary h-4 w-4" />
                <CardTitle className="text-sm">Recent Uploads</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {loadingOptions ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
                </div>
              ) : projects.length === 0 ? (
                <p className="text-muted-foreground py-4 text-center text-sm">No projects yet</p>
              ) : (
                <div className="space-y-3">
                  {projects.slice(0, 3).map((p) => (
                    <div
                      key={p.value}
                      className="hover:bg-muted/50 flex items-center gap-3 rounded-lg p-2 transition-colors"
                    >
                      <div className="bg-primary/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                        <Package className="text-primary h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{p.label}</p>
                        <p className="text-muted-foreground text-xs">Latest project</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
