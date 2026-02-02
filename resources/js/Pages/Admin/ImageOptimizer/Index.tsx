import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Image as ImageIcon,
    RefreshCw,
    Settings2,
    CheckCircle2,
    AlertCircle,
    Search,
    Filter,
    ArrowUpRight,
    Maximize,
    Minimize,
    Trash2
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { Breadcrumbs } from '@/components/breadcrumbs';

interface ImageFile {
    path: string;
    url: string;
    size: number;
    last_modified: number;
    extension: string;
}

interface OptimizationResult {
    path: string;
    new_path?: string;
    status: 'success' | 'error';
    message?: string;
}

export default function Index() {
    const [images, setImages] = useState<ImageFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDirectory, setFilterDirectory] = useState('all');

    // Optimization Settings
    const [format, setFormat] = useState<'webp' | 'original'>('webp');
    const [width, setWidth] = useState<number | ''>('');
    const [height, setHeight] = useState<number | ''>('');
    const [quality, setQuality] = useState(80);
    const [deleteOriginal, setDeleteOriginal] = useState(false);

    // Progress Control
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState<OptimizationResult[]>([]);

    const breadcrumbs = [
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Image Optimizer', href: '#' },
    ];

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        setLoading(true);
        try {
            const response = await axios.get(route('image-optimizer.get-images'));
            setImages(response.data);
        } catch (error: any) {
            toast.error('Failed to fetch images');
        } finally {
            setLoading(false);
        }
    };

    const toggleImageSelection = (path: string) => {
        setSelectedImages(prev =>
            prev.includes(path)
                ? prev.filter(p => p !== path)
                : [...prev, path]
        );
    };

    const selectAll = () => {
        setSelectedImages(filteredImages.map(img => img.path));
    };

    const clearSelection = () => {
        setSelectedImages([]);
    };

    const handleOptimize = async () => {
        if (selectedImages.length === 0) {
            toast.error('Please select at least one image');
            return;
        }

        setIsOptimizing(true);
        setProgress(0);
        setResults([]);

        // Batch processing if many images selected
        const batchSize = 5;
        const totalBatches = Math.ceil(selectedImages.length / batchSize);
        let allResults: OptimizationResult[] = [];

        for (let i = 0; i < totalBatches; i++) {
            const batch = selectedImages.slice(i * batchSize, (i + 1) * batchSize);
            try {
                const response = await axios.post(route('image-optimizer.optimize'), {
                    images: batch,
                    format,
                    width: width || null,
                    height: height || null,
                    quality,
                    delete_original: deleteOriginal
                });
                allResults = [...allResults, ...response.data.results];
                setResults([...allResults]);
                setProgress(Math.round(((i + 1) / totalBatches) * 100));
            } catch (error: any) {
                toast.error(`Error processing batch ${i + 1}`);
            }
        }

        setIsOptimizing(false);
        toast.success('Optimization process completed');
        fetchImages(); // Refresh image list
    };

    const filteredImages = images.filter(img => {
        const matchesSearch = img.path.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDir = filterDirectory === 'all' || img.path.startsWith(filterDirectory);
        return matchesSearch && matchesDir;
    });

    const directories = Array.from(new Set(images.map(img => img.path.split('/')[0])));

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <DashboardLayout title="Image Optimizer">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Image Optimizer</h1>
                    <p className="text-muted-foreground">
                        Batch convert images to WebP and resize them to improve project performance.
                    </p>
                    <div className="mt-4">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar Controls */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="border-primary/20 bg-primary/5">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Settings2 className="w-5 h-5" />
                                    Optimization Settings
                                </CardTitle>
                                <CardDescription>Configure conversion parameters</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Output Format</Label>
                                    <div className="flex gap-2">
                                        <Button
                                            variant={format === 'webp' ? 'default' : 'outline'}
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => setFormat('webp')}
                                        >
                                            WebP
                                        </Button>
                                        <Button
                                            variant={format === 'original' ? 'default' : 'outline'}
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => setFormat('original')}
                                        >
                                            Keep Original
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="width">Width (px)</Label>
                                        <Input
                                            id="width"
                                            type="number"
                                            placeholder="Auto"
                                            value={width}
                                            onChange={(e) => setWidth(e.target.value ? parseInt(e.target.value) : '')}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="height">Height (px)</Label>
                                        <Input
                                            id="height"
                                            type="number"
                                            placeholder="Auto"
                                            value={height}
                                            onChange={(e) => setHeight(e.target.value ? parseInt(e.target.value) : '')}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <Label>Quality ({quality}%)</Label>
                                    </div>
                                    <Slider
                                        value={[quality]}
                                        min={1}
                                        max={100}
                                        step={1}
                                        onValueChange={(val: number[]) => setQuality(val[0])}
                                    />
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <div className="space-y-0.5">
                                        <Label>Delete Originals</Label>
                                        <p className="text-xs text-muted-foreground">Remove old JPG/PNG files</p>
                                    </div>
                                    <Switch
                                        checked={deleteOriginal}
                                        onCheckedChange={setDeleteOriginal}
                                    />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className="w-full"
                                    size="lg"
                                    onClick={handleOptimize}
                                    disabled={isOptimizing || selectedImages.length === 0}
                                >
                                    {isOptimizing ? (
                                        <>
                                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                            Optimizing...
                                        </>
                                    ) : (
                                        <>
                                            <ImageIcon className="mr-2 h-4 w-4" />
                                            Optimize {selectedImages.length} Images
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>

                        {isOptimizing && (
                            <Card>
                                <CardContent className="pt-6 space-y-4">
                                    <div className="flex justify-between text-sm">
                                        <span>Overall Progress</span>
                                        <span className="font-bold">{progress}%</span>
                                    </div>
                                    <Progress value={progress} className="h-2" />
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Main Grid area */}
                    <div className="lg:col-span-3 space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-lg shadow-sm border">
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search images..."
                                        className="pl-8"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="icon" onClick={fetchImages}>
                                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                    </Button>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1">
                                <Badge variant="outline" className="cursor-pointer px-3 py-1 bg-primary/5 border-primary/20">
                                    {selectedImages.length} Selected
                                </Badge>
                                <Button variant="ghost" size="sm" onClick={selectAll}>Select All</Button>
                                <Button variant="ghost" size="sm" onClick={clearSelection}>Clear</Button>
                            </div>
                        </div>

                        {/* Directory Filters */}
                        <div className="flex gap-2 pb-2 overflow-x-auto">
                            <Button
                                variant={filterDirectory === 'all' ? 'secondary' : 'outline'}
                                size="sm"
                                onClick={() => setFilterDirectory('all')}
                            >
                                All
                            </Button>
                            {directories.map(dir => (dir &&
                                <Button
                                    key={dir}
                                    variant={filterDirectory === dir ? 'secondary' : 'outline'}
                                    size="sm"
                                    onClick={() => setFilterDirectory(dir)}
                                >
                                    {dir.charAt(0).toUpperCase() + dir.slice(1)}
                                </Button>
                            ))}
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                    <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg" />
                                ))}
                            </div>
                        ) : filteredImages.length > 0 ? (
                            <ScrollArea className="h-[600px] rounded-md border p-4 bg-gray-50/50">
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {filteredImages.map((img) => (
                                        <div
                                            key={img.path}
                                            className={`group relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${selectedImages.includes(img.path)
                                                ? 'border-primary ring-2 ring-primary/20'
                                                : 'border-transparent hover:border-muted-foreground/30'
                                                }`}
                                            onClick={() => toggleImageSelection(img.path)}
                                        >
                                            <img
                                                src={img.url}
                                                alt={img.path}
                                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                            />
                                            <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 text-[10px] text-white backdrop-blur-sm transform translate-y-full group-hover:translate-y-0 transition-transform">
                                                <div className="truncate">{img.path.split('/').pop()}</div>
                                                <div className="flex justify-between items-center mt-1">
                                                    <span className="opacity-70">{formatBytes(img.size)}</span>
                                                    <Badge variant="secondary" className="text-[8px] h-3 px-1 bg-white/20 hover:bg-white/30 text-white border-0">
                                                        {img.extension.toUpperCase()}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className={`absolute top-2 right-2 rounded-full p-1 shadow-lg transition-opacity ${selectedImages.includes(img.path) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                                }`}>
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedImages.includes(img.path)
                                                    ? 'bg-primary border-primary text-white'
                                                    : 'bg-white/50 border-white'
                                                    }`}>
                                                    {selectedImages.includes(img.path) && <CheckCircle2 className="w-3 h-3" />}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[400px] border-2 border-dashed rounded-lg bg-white">
                                <ImageIcon className="w-12 h-12 text-muted-foreground/50 mb-4" />
                                <h3 className="text-lg font-medium">No images found</h3>
                                <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
                            </div>
                        )}

                        {/* Recent Results */}
                        {results.length > 0 && (
                            <Card className="mt-6 overflow-hidden">
                                <CardHeader className="bg-muted/50">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-sm font-medium">Recent Optimization Results</CardTitle>
                                        <Badge variant="outline">{results.filter(r => r.status === 'success').length} Success</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <ScrollArea className="h-[200px]">
                                        <table className="w-full text-xs">
                                            <thead className="sticky top-0 bg-muted/30">
                                                <tr className="border-b">
                                                    <th className="text-left p-2 font-medium">Original Path</th>
                                                    <th className="text-left p-2 font-medium">Result</th>
                                                    <th className="text-right p-2 font-medium">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {results.map((result, idx) => (
                                                    <tr key={idx} className="border-b hover:bg-muted/10">
                                                        <td className="p-2 truncate max-w-[200px]">{result.path}</td>
                                                        <td className="p-2 truncate max-w-[200px] text-muted-foreground">
                                                            {result.status === 'success' ? result.new_path : result.message}
                                                        </td>
                                                        <td className="p-2 text-right">
                                                            {result.status === 'success' ? (
                                                                <span className="text-green-600 flex justify-end items-center gap-1">
                                                                    <CheckCircle2 className="w-3 h-3" /> Success
                                                                </span>
                                                            ) : (
                                                                <span className="text-red-600 flex justify-end items-center gap-1">
                                                                    <AlertCircle className="w-3 h-3" /> Error
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
