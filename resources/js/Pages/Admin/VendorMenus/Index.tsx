import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { BreadcrumbItem } from '@/types';
import { Edit, Trash2, Plus, GripVertical } from 'lucide-react';
import Swal from 'sweetalert2';
import { Switch } from '@/components/ui/switch';

interface MenuItem {
    id: number;
    label: string;
    path: string;
    icon: string;
    section: string;
    parent_id?: number;
    order: number;
    is_active: boolean;
    is_logout: boolean;
    children?: MenuItem[];
}

interface Props {
    menus: Record<string, MenuItem[]>;
}

interface VendorMenuFormData {
    label: string;
    path: string;
    icon: string;
    section: string;
    parent_id: string;
    is_logout: boolean;
    [key: string]: any;
}

export default function Index({ menus }: Props) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

    const form = useForm<VendorMenuFormData>({
        label: '',
        path: '',
        icon: '',
        section: 'Overview',
        parent_id: '',
        is_logout: false,
    });

    const sections = ['Overview', 'Catalog', 'Sales & Orders', 'Access Control', 'Account', 'Marketing', 'Content Management'];

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Vendor Sidebar', href: '/vendor-menus' },
    ];

    const handleCreate = () => {
        setEditingItem(null);
        form.reset();
        setIsDialogOpen(true);
    };

    const handleEdit = (item: MenuItem) => {
        setEditingItem(item);
        form.setData({
            label: item.label,
            path: item.path,
            icon: item.icon || '',
            section: item.section,
            parent_id: item.parent_id?.toString() || '',
            is_logout: item.is_logout,
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingItem) {
            form.put(route('vendor-menus.update', editingItem.id), {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    Swal.fire('Success', 'Menu item updated successfully', 'success');
                },
            });
        } else {
            form.post(route('vendor-menus.store'), {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    Swal.fire('Success', 'Menu item created successfully', 'success');
                },
            });
        }
    };

    const handleDelete = (id: number) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                form.delete(route('vendor-menus.destroy', id), {
                    onSuccess: () => {
                        Swal.fire('Deleted!', 'Menu item has been deleted.', 'success');
                    },
                });
            }
        });
    };

    // Helper to get all parent items for dropdown
    const getAllParents = () => {
        let parents: MenuItem[] = [];
        Object.values(menus).forEach(sectionItems => {
            parents = [...parents, ...sectionItems];
        });
        return parents;
    };

    return (
        <DashboardLayout title="Vendor Sidebar Management">
            <div className="space-y-4 pb-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Vendor Sidebar Management</h1>
                    <Button variant="outline" onClick={handleCreate} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 text-black shadow-sm">
                        <Plus className="h-4 w-4" />
                        Add Menu Item
                    </Button>
                </div>
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            <div className="space-y-6">
                {sections.map(section => (
                    <Card key={section} className="mb-6">
                        <CardHeader>
                            <CardTitle>{section}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Label</TableHead>
                                        <TableHead>Path</TableHead>
                                        <TableHead>Icon</TableHead>
                                        <TableHead>Sub-items</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {menus[section]?.map((item) => (
                                        <React.Fragment key={item.id}>
                                            <TableRow>
                                                <TableCell className="font-medium flex items-center gap-2">
                                                    {item.label}
                                                    {item.is_logout && <span className="text-xs text-red-500">(Logout)</span>}
                                                </TableCell>
                                                <TableCell>{item.path}</TableCell>
                                                <TableCell>{item.icon}</TableCell>
                                                <TableCell>
                                                    {item.children?.length ? (
                                                        <ul className="list-disc list-inside text-sm text-gray-600">
                                                            {item.children.map(child => (
                                                                <li key={child.id}>{child.label} ({child.path})</li>
                                                            ))}
                                                        </ul>
                                                    ) : '-'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="icon" className='cursor-pointer' onClick={() => handleEdit(item)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="text-red-500 cursor-pointer" onClick={() => handleDelete(item.id)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                            {/* Render Children Rows separately if needed, but nested list is cleaner for viewing */}
                                            {item.children?.map(child => (
                                                <TableRow key={child.id} className="bg-gray-50/50">
                                                    <TableCell className="pl-10 text-sm">↳ {child.label}</TableCell>
                                                    <TableCell className="text-sm">{child.path}</TableCell>
                                                    <TableCell className="text-sm">{child.icon}</TableCell>
                                                    <TableCell className="text-sm">-</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button variant="ghost" className='cursor-pointer' size="icon" onClick={() => handleEdit(child)}>
                                                                <Edit className="h-3 w-3" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="text-red-500 cursor-pointer" onClick={() => handleDelete(child.id)}>
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                    {(!menus[section] || menus[section].length === 0) && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-gray-500">No items in this section</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-white">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? 'Edit Menu Item' : 'Add Menu Item'}</DialogTitle>
                        <DialogDescription>
                            Configure the menu item details.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="label">Label</Label>
                            <Input
                                id="label"
                                value={form.data.label}
                                onChange={e => form.setData('label', e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="path">Path</Label>
                            <Input
                                id="path"
                                value={form.data.path}
                                onChange={e => form.setData('path', e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="icon">Icon Name (Lucide React)</Label>
                            <Input
                                id="icon"
                                value={form.data.icon}
                                onChange={e => form.setData('icon', e.target.value)}
                                placeholder="e.g. Home, Settings, ShoppingCart"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="section">Section</Label>
                            <Select
                                value={form.data.section}
                                onValueChange={value => form.setData('section', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select section" />
                                </SelectTrigger>
                                <SelectContent className='bg-white'>
                                    {sections.map(s => (
                                        <SelectItem key={s} value={s}>{s}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="parent_id">Parent Item (Optional)</Label>
                            <Select
                                value={form.data.parent_id}
                                onValueChange={value => form.setData('parent_id', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="None (Top level)" />
                                </SelectTrigger>
                                <SelectContent className='bg-white'>
                                    <SelectItem value="null">None</SelectItem>
                                    {getAllParents().map(p => (
                                        <SelectItem key={p.id} value={p.id.toString()}>{p.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="is_logout"
                                checked={form.data.is_logout}
                                onCheckedChange={checked => form.setData('is_logout', checked)}
                            />
                            <Label htmlFor="is_logout">Is Logout Button?</Label>
                        </div>

                        <DialogFooter>
                            <Button type="button" className='cursor-pointer hover:bg-red-100 text-black shadow-sm' variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" className='cursor-pointer hover:bg-gray-100 text-black shadow-sm' variant="outline" disabled={form.processing}>{editingItem ? 'Update' : 'Create'}</Button>
                        </DialogFooter>

                    </form>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
