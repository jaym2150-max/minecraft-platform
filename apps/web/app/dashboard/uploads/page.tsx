'use client';

import { useState } from 'react';
import { Upload, File, X } from 'lucide-react';
import { Button } from '@mcp/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@mcp/ui/components/card';
import { Input } from '@mcp/ui/components/input';
import { Label } from '@mcp/ui/components/label';

export default function DashboardUploadsPage() {
  const [files, setFiles] = useState<File[]>([]);

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Upload New Version</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* File Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Upload File</CardTitle>
                <CardDescription>Upload your mod file (.jar, .zip)</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className="border-2 border-dashed rounded-xl p-12 text-center hover:border-primary/50 transition-colors cursor-pointer"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    setFiles(Array.from(e.dataTransfer.files));
                  }}
                >
                  <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                  <p className="font-medium mb-1">Drop your file here</p>
                  <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
                  <Button variant="outline" asChild>
                    <label>
                      Browse Files
                      <input
                        type="file"
                        className="hidden"
                        accept=".jar,.zip"
                        onChange={(e) => setFiles(Array.from(e.target.files || []))}
                      />
                    </label>
                  </Button>
                </div>

                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {files.map((file, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <File className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setFiles(files.filter((_, j) => j !== i))}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Version Details */}
            <Card>
              <CardHeader>
                <CardTitle>Version Details</CardTitle>
                <CardDescription>Specify version information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="version">Version Number</Label>
                    <Input id="version" placeholder="e.g. 1.0.0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mc-version">Minecraft Version</Label>
                    <Input id="mc-version" placeholder="e.g. 1.21.1" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="changelog">Changelog</Label>
                  <textarea
                    id="changelog"
                    className="w-full min-h-[120px] rounded-lg border bg-background px-3 py-2 text-sm resize-y"
                    placeholder="Describe what's new in this version..."
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button variant="outline">Save as Draft</Button>
              <Button>Publish Version</Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload Rules</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>• Maximum file size: 50MB</p>
                <p>• Allowed formats: .jar, .zip</p>
                <p>• Files are scanned for malware</p>
                <p>• Read our upload guidelines</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
