import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Download, Upload, FileText, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface UploadResults {
  success: number;
  errors: string[];
  warnings: string[];
}

export default function BulkUpload() {
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [results, setResults] = useState<UploadResults | null>(null);
    const [progress, setProgress] = useState(0);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {

      setFile(selectedFile);
      setResults(null);
    }
  };

  const downloadTemplate = () => {
    window.location.href = '/products/bulkupload/template';
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 200);

    try {
      const response = await fetch('/products/bulkupload', {
        method: 'POST',
        body: formData,
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });

      const data = await response.json();

      clearInterval(progressInterval);
      setProgress(100);
      setResults(data);
    } catch (error) {
      clearInterval(progressInterval);
      setResults({
        success: 0,
        errors: ['Upload failed. Please try again.'],
        warnings: []
      });
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  return (
    <DashboardLayout title="Bulk Product Upload">
      <Head title="Bulk Product Upload" />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bulk Product Upload</h1>
            <p className="text-muted-foreground">
              Upload multiple products with their variants, specifications, images, and videos using CSV file
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Products
              </CardTitle>
              <CardDescription>
                Select a CSV file containing your product data to upload in bulk
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file">CSV File</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
              </div>

              {file && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm font-medium">{file.name}</span>
                    <Badge variant="secondary">{(file.size / 1024).toFixed(1)} KB</Badge>
                  </div>
                </div>
              )}

              {uploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Uploading products...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}

              <Button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="w-full"
              >
                {uploading ? 'Uploading...' : 'Upload Products'}
              </Button>
            </CardContent>
          </Card>

          {/* Template Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Download Template
              </CardTitle>
              <CardDescription>
                Download the CSV template with sample data and required format
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Template includes:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Basic product information</li>
                  <li>• Product variants (colors, sizes, SKUs)</li>
                  <li>• Product specifications</li>
                  <li>• Image URLs for automatic download</li>
                  <li>• Video information (YouTube, Vimeo)</li>
                  <li>• Sample data for reference</li>
                </ul>
              </div>

              <Button
                onClick={downloadTemplate}
                variant="outline"
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Download CSV Template
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        {results && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {results.success > 0 ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                Upload Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="bg-green-500">
                    {results.success} Successful
                  </Badge>
                </div>
                {results.errors.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">
                      {results.errors.length} Errors
                    </Badge>
                  </div>
                )}
                {results.warnings.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                      {results.warnings.length} Warnings
                    </Badge>
                  </div>
                )}
              </div>

              {results.errors.length > 0 && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p className="font-medium">Errors occurred during upload:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {results.errors.map((error, index) => (
                          <li key={index} className="text-sm">{error}</li>
                        ))}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {results.warnings.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p className="font-medium">Warnings:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {results.warnings.map((warning, index) => (
                          <li key={index} className="text-sm">{warning}</li>
                        ))}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {results.success > 0 && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Successfully uploaded {results.success} products with all their variants, specifications, images, and videos.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Format Guide */}
        <Card>
          <CardHeader>
            <CardTitle>CSV Format Guide</CardTitle>
            <CardDescription>
              Understanding the CSV format for bulk product upload
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-2">Basic Fields</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li><strong>name:</strong> Product name</li>
                  <li><strong>description:</strong> Product description</li>
                  <li><strong>category_name:</strong> Category (will be created if not exists)</li>
                  <li><strong>subcategory_name:</strong> Subcategory</li>
                  <li><strong>brand_name:</strong> Brand name</li>
                  <li><strong>price:</strong> Base price</li>
                  <li><strong>discount:</strong> Discount percentage</li>
                  <li><strong>stock_quantity:</strong> Stock quantity</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Advanced Fields</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li><strong>specifications:</strong> Name:Value|Name:Value</li>
                  <li><strong>variants:</strong> Color-Size-SKU-Price-Discount-Stock</li>
                  <li><strong>images:</strong> URL1|URL2|URL3 (auto-downloaded)</li>
                  <li><strong>videos:</strong> Provider-VideoID-Title</li>
                  <li><strong>is_bestseller:</strong> true/false</li>
                  <li><strong>status:</strong> active/inactive</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
