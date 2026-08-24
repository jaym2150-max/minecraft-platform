'use client';

import { useState, useEffect, useCallback } from 'react';
import { Upload, File, X, Package, Download, Info, AlertTriangle, CheckCircle2, Plus, Trash2, Loader2 } from 'lucide-react';
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
      setMcVersions(
        (verRes.data ?? []).map((v: MinecraftVersion) => v.version),
      );
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
    const dropped = Array.from(e.dataTransfer.files).map(f => ({
      file: f,
      name: f.name,
      size: f.size,
      type: f.type,
    }));
    setFiles((prev) => [...prev, ...dropped]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []).map(f => ({
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
    setDependencies((prev) =>
      prev.map((d) => (d.id === id ? { ...d, required: !d.required } : d)),
    );
  };

  const handlePublish = async () => {
    if (!selectedProject) { toast.error('Please select a project'); return; }
    if (!versionNumber) { toast.error('Please enter a version number'); return; }
    if (!mcVersion) { toast.error('Please select a Minecraft version'); return; }
    if (!loader) { toast.error('Please select a mod loader'); return; }
    if (files.length === 0) { toast.error('Please upload a file'); return; }

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
        'Fabric': 'FABRIC',
        'Forge': 'FORGE',
        'NeoForge': 'NEOFORGE',
        'Quilt': 'QUILT',
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

      toast.success(`Version ${versionNumber} published to ${projects.find(p => p.value === selectedProject)?.label || selectedProject}!`);
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Upload New Version</h1>
            <p className="text-muted-foreground mt-1">Publish a new release for one of your projects</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
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
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                  disabled={loadingOptions}
                >
                  <option value="">
                    {loadingOptions ? 'Loading projects...' : 'Select a project...'}
                  </option>
                  {projects.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
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
                  className="border-2 border-dashed rounded-xl p-10 text-center hover:border-primary/50 transition-colors cursor-pointer group"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  <div className="h-14 w-14 rounded-2xl bg-primary/5 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/10 transition-colors">
                    <Upload className="h-6 w-6 text-primary/60 group-hover:text-primary transition-colors" />
                  </div>
                  <p className="font-medium mb-1">Drop your file here</p>
                  <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
                  <Button variant="outline" type="button" onClick={(e) => { e.stopPropagation(); document.getElementById('file-input')?.click(); }}>
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
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <File className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeFile(i)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {isOverLimit && (
                      <div className="flex items-center gap-2 text-xs text-red-500 bg-red-500/10 p-2 rounded-lg">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        Total file size exceeds the 50MB limit
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground text-right">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      {releaseTypes.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mc-version">Minecraft Version</Label>
                    <select
                      id="mc-version"
                      value={mcVersion}
                      onChange={(e) => setMcVersion(e.target.value)}
                      className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                      disabled={loadingOptions}
                    >
                      <option value="">
                        {loadingOptions ? 'Loading versions...' : 'Select version...'}
                      </option>
                      {mcVersions.map((v) => (
                        <option key={v} value={v}>MC {v}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="loader">Mod Loader</Label>
                    <select
                      id="loader"
                      value={loader}
                      onChange={(e) => setLoader(e.target.value)}
                      className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="">Select loader...</option>
                      {modLoaders.map((l) => (
                        <option key={l} value={l}>{l}</option>
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
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                          supportLevel === level
                            ? level === 'Active'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/30'
                              : level === 'Testing'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/30'
                              : 'bg-muted text-muted-foreground ring-1 ring-border'
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
                    className="w-full min-h-[160px] rounded-lg border border-input bg-background px-3 py-2 text-sm resize-y focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder={`Describe what's new in this version...\n\nExample:\n- Added new feature X\n- Fixed crash when doing Y\n- Updated dependency to v2.0`}
                    value={changelog}
                    onChange={(e) => setChangelog(e.target.value)}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
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
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addDependency(); } }}
                    className="flex-1"
                  />
                  <Button variant="outline" size="icon" onClick={addDependency}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {dependencies.length > 0 ? (
                  <div className="space-y-2">
                    {dependencies.map((dep) => (
                      <div key={dep.id} className="flex items-center justify-between p-3 rounded-lg border bg-card group">
                        <div className="flex items-center gap-3 min-w-0">
                          <Package className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="text-sm font-medium">{dep.name}</span>
                          <Badge
                            variant={dep.required ? 'default' : 'outline'}
                            className="text-[10px] h-4 px-1.5 cursor-pointer"
                            onClick={() => toggleDependencyRequired(dep.id)}
                          >
                            {dep.required ? 'Required' : 'Optional'}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeDependency(dep.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Package className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No dependencies added yet</p>
                    <p className="text-xs mt-1">Search for mods above to add dependencies</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
    <Button variant="outline" disabled={uploading} onClick={() => { releaseType !== 'Release' ? handlePublish() : setReleaseType('Alpha'); toast.info('Set release type to Alpha to save as draft'); }}>
      Save as Draft
    </Button>
              <Button onClick={handlePublish} disabled={uploading} className="gap-2 min-w-[160px]">
                {uploading ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
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
                  <Info className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm">Upload Guidelines</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span>Maximum file size: <strong>50MB</strong></span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span>Allowed formats: <strong>.jar, .zip</strong></span>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>Files are scanned for <strong>malware</strong></span>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>Including source code is <strong>recommended</strong></span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Uploads */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm">Recent Uploads</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {loadingOptions ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : projects.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No projects yet</p>
                ) : (
                  <div className="space-y-3">
                    {projects.slice(0, 3).map((p) => (
                      <div key={p.value} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Package className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{p.label}</p>
                          <p className="text-xs text-muted-foreground">Latest project</p>
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
