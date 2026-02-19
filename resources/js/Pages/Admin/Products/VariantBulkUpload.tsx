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
import axios from 'axios';

interface UploadResults {
    success: number;
    errors: string[];
    warnings: string[];
}

export default function VariantBulkUpload() {
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
        window.location.href = '/variants/bulkupload/template';
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
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            const response = await axios.post('/variants/bulkupload', formData, {
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true,
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setProgress(Math.min(percentCompleted, 100));
                    }
                },
            });
            const data = response.data;
            clearInterval(progressInterval);
            setProgress(100);
            setResults(data);
        } catch (error: any) {
            clearInterval(progressInterval);
            setResults({
                success: 0,
                errors: [error.response?.data?.message || 'Upload failed. Please try again.'],
                warnings: []
            });
        } finally {
            setUploading(false);
            setTimeout(() => setProgress(0), 1000);
        }
    };

    return (
        <DashboardLayout title="Bulk Variant Upload">
            <Head title="Bulk Variant Upload" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Bulk Variant Upload</h1>
                        <p className="text-muted-foreground">
                            Upload multiple product variants with their colors, sizes, and multiple images using CSV file
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Upload Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Upload className="h-5 w-5" />
                                Upload Variants
                            </CardTitle>
                            <CardDescription>
                                Select a CSV file containing your variant data to upload in bulk
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
                                    className="w-full cursor-pointer"
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
                                        <span>Uploading variants...</span>
                                        <span>{progress}%</span>
                                    </div>
                                    <Progress value={progress} className="w-full" />
                                </div>
                            )}

                            <Button
                                onClick={handleUpload}
                                disabled={!file || uploading}
                                variant="outline"
                                className="w-full cursor-pointer rounded-lg bg-primary text-primary-foreground hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                {uploading ? 'Uploading...' : 'Upload Variants'}
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
                                    <li>• SKU (Unique identifier)</li>
                                    <li>• Color and Size mapping</li>
                                    <li>• Main Product mapping (by Title)</li>
                                    <li>• Price and Comparison Price</li>
                                    <li>• Inventory tracking</li>
                                    <li>• Multiple Image URLs (pipe-separated)</li>
                                </ul>
                            </div>

                            <Button
                                onClick={downloadTemplate}
                                variant="outline"
                                className="w-full cursor-pointer rounded-lg bg-primary text-primary-foreground hover:bg-gray-100 dark:hover:bg-gray-800"
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
                                        Successfully uploaded {results.success} variants with their images.
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
                            Understanding the CSV format for bulk variant upload
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <h4 className="font-medium mb-2">Required Fields</h4>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                    <li><strong>SKU:</strong> Unique identifier for the variant</li>
                                    <li><strong>Main Product Title:</strong> Title of the product to associate with</li>
                                    <li><strong>Variant Price:</strong> Current selling price</li>
                                    <li><strong>Variant Inventory Qty:</strong> Stock level</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-medium mb-2">Optional Fields</h4>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                    <li><strong>color:</strong> Product color</li>
                                    <li><strong>size:</strong> Product size</li>
                                    <li><strong>Variant Compare At Price:</strong> Original price for discount display</li>
                                    <li><strong>Image Src:</strong> Pipe-separated URLs (e.g. url1|url2)</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
