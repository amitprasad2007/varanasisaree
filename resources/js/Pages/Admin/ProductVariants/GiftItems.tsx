import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Trash2, Plus, Edit2, Search, Gift, X, Loader2, Sparkles } from 'lucide-react';
import Swal from 'sweetalert2';

interface Product {
  id: number;
  name: string;
}

interface Color {
  name: string;
  hex_code: string | null;
}

interface Size {
  name: string;
}

interface ProductVariant {
  id: number;
  sku: string;
  price: number;
  color: Color | null;
  size: Size | null;
}

interface GiftItem {
  id: number;
  product_variant_id: number;
  product_id: number;
  product_type: 'main' | 'variant';
  offer_type: 'free' | 'discounted';
  offered_price: number;
  status: 'active' | 'inactive';
  start_date: string | null;
  end_date: string | null;
  min_spend: number | null;
  min_quantity: number | null;
  eligibility_text: string | null;
  gift_name: string;
  gift_image: string | null;
}

interface SearchResult {
  id: number;
  type: 'main' | 'variant';
  name: string;
  sku: string;
  price: number;
  image: string | null;
}

interface Props {
  product: Product;
  variant: ProductVariant;
  giftItems: GiftItem[];
}

export default function GiftItems({ product, variant, giftItems }: Props) {
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Search Autocomplete state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedGift, setSelectedGift] = useState<SearchResult | null>(null);

  const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
    product_id: '',
    product_type: 'main',
    offer_type: 'free',
    offered_price: '0',
    status: 'active',
    start_date: '',
    end_date: '',
    min_spend: '',
    min_quantity: '',
    eligibility_text: '',
  });

  // Handle Search Input Change
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`${route('product-variants.gift-items.search')}?query=${encodeURIComponent(searchQuery)}`);
        if (!response.ok) {
          throw new Error('Search failed');
        }
        const data = await response.json();
        setSearchResults(data);
      } catch (err) {
        console.error('Error fetching autocomplete results', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Handle choosing a search item
  const handleSelectGift = (gift: SearchResult) => {
    setSelectedGift(gift);
    setData((prev) => ({
      ...prev,
      product_id: gift.id.toString(),
      product_type: gift.type,
    }));
    setSearchQuery('');
    setSearchResults([]);
  };

  // Clear selected gift
  const handleClearSelectedGift = () => {
    setSelectedGift(null);
    setData((prev) => ({
      ...prev,
      product_id: '',
      product_type: 'main',
    }));
  };

  // Edit Gift Item Trigger
  const handleEdit = (gift: GiftItem) => {
    setEditingId(gift.id);
    setSelectedGift({
      id: gift.product_id,
      type: gift.product_type,
      name: gift.gift_name,
      sku: '',
      price: 0,
      image: gift.gift_image,
    });

    setData({
      product_id: gift.product_id.toString(),
      product_type: gift.product_type,
      offer_type: gift.offer_type,
      offered_price: gift.offered_price.toString(),
      status: gift.status,
      start_date: gift.start_date ? gift.start_date.substring(0, 16) : '',
      end_date: gift.end_date ? gift.end_date.substring(0, 16) : '',
      min_spend: gift.min_spend ? gift.min_spend.toString() : '',
      min_quantity: gift.min_quantity ? gift.min_quantity.toString() : '',
      eligibility_text: gift.eligibility_text || '',
    });
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setEditingId(null);
    setSelectedGift(null);
    reset();
  };

  // Form Submit (Store or Update)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!data.product_id) {
      Swal.fire({
        title: 'Error!',
        text: 'Please select a Gift Product first.',
        icon: 'error',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    if (editingId) {
      put(route('product-variants.gift-items.update', [product.id, variant.id, editingId]), {
        onSuccess: () => {
          Swal.fire({
            title: 'Success!',
            text: 'Gift item updated successfully',
            icon: 'success',
            timer: 3000,
            showConfirmButton: false,
          });
          handleCancelEdit();
        },
      });
    } else {
      post(route('product-variants.gift-items.store', [product.id, variant.id]), {
        onSuccess: () => {
          Swal.fire({
            title: 'Success!',
            text: 'Gift item added successfully',
            icon: 'success',
            timer: 3000,
            showConfirmButton: false,
          });
          setSelectedGift(null);
          reset();
        },
      });
    }
  };

  // Delete/Remove Association
  const handleDelete = (id: number) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to remove this gift item association?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, remove it!',
    }).then((result) => {
      if (result.isConfirmed) {
        destroy(route('product-variants.gift-items.destroy', [product.id, variant.id, id]), {
          onSuccess: () => {
            Swal.fire({
              title: 'Success!',
              text: 'Gift item removed successfully',
              icon: 'success',
              timer: 3000,
              showConfirmButton: false,
            });
          },
        });
      }
    });
  };

  return (
    <DashboardLayout title={`Manage Gift Items - ${variant.sku}`}>
      <Head title={`Manage Gift Items - ${variant.sku}`} />

      <div className="space-y-6 pb-12">
        {/* Top Header Section */}
        <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:items-center">
          <div>
            <Link
              href={route('product-variants.index', product.id)}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg py-1.5 px-3 w-fit mb-2 shadow-sm bg-white cursor-pointer hover:bg-gray-50 transition-all duration-150"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back to Variants List
            </Link>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center">
              <Gift className="w-6 h-6 mr-2 text-rose-500 animate-bounce" />
              Gift Items configuration
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Associate gift items for variant: <strong className="text-gray-700 font-semibold">{variant.sku}</strong> 
              {variant.color && ` (Color: ${variant.color.name})`} {variant.size && ` (Size: ${variant.size.name})`}
            </p>
          </div>
        </div>

        {/* Dashboard Grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration Form Column */}
          <div className="lg:col-span-1">
            <Card className="border border-rose-100 shadow-lg bg-gradient-to-br from-white to-rose-50/20">
              <CardHeader className="border-b border-rose-50 pb-4">
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center">
                  <Sparkles className="w-4 h-4 mr-2 text-rose-400" />
                  {editingId ? 'Edit Gift Configuration' : 'Add New Gift Item'}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  
                  {/* Autocomplete / Search Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex justify-between">
                      <span>Gift Product / Variant <span className="text-red-500">*</span></span>
                    </label>

                    {selectedGift ? (
                      <div className="flex items-center justify-between border border-rose-200 rounded-lg p-3 bg-rose-50/50 shadow-inner">
                        <div className="flex items-center space-x-3">
                          {selectedGift.image ? (
                            <img
                              src={selectedGift.image}
                              alt={selectedGift.name}
                              className="w-10 h-10 object-cover rounded-md border border-gray-200 shadow-sm"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center border border-gray-200">
                              <Gift className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-gray-800 line-clamp-1">{selectedGift.name}</p>
                            <div className="flex space-x-2 mt-0.5">
                              <Badge className="text-[10px] py-0 px-1.5" variant="secondary">
                                {selectedGift.type === 'variant' ? 'Variant' : 'Main'}
                              </Badge>
                              {selectedGift.sku && <span className="text-[10px] text-gray-500">SKU: {selectedGift.sku}</span>}
                            </div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleClearSelectedGift}
                          className="h-8 w-8 p-0 rounded-full hover:bg-rose-100 text-rose-500"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          {isSearching ? (
                            <Loader2 className="h-4 w-4 text-rose-400 animate-spin" />
                          ) : (
                            <Search className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                        <Input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search product name or SKU..."
                          className="pl-9 border-gray-200 focus:border-rose-400 focus:ring-rose-400"
                        />

                        {/* Search Dropdown Results */}
                        {searchResults.length > 0 && (
                          <div className="absolute z-10 w-full mt-1.5 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                            {searchResults.map((item) => (
                              <button
                                key={`${item.type}-${item.id}`}
                                type="button"
                                onClick={() => handleSelectGift(item)}
                                className="w-full flex items-center space-x-3 px-4 py-2.5 hover:bg-rose-50/50 text-left border-b border-gray-50 last:border-0 transition-colors duration-100"
                              >
                                {item.image ? (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-8 h-8 object-cover rounded border border-gray-200"
                                  />
                                ) : (
                                  <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center border border-gray-100">
                                    <Gift className="w-4 h-4 text-gray-400" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                                  <p className="text-xs text-gray-500 flex items-center space-x-2">
                                    <span>SKU: {item.sku}</span>
                                    <span>•</span>
                                    <span className="text-rose-600 font-medium">₹{item.price}</span>
                                    <span>•</span>
                                    <Badge className="text-[9px] py-0 px-1" variant="outline">
                                      {item.type === 'variant' ? 'Variant' : 'Main'}
                                    </Badge>
                                  </p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {errors.product_id && (
                      <p className="text-xs text-red-500 font-medium">{errors.product_id}</p>
                    )}
                  </div>

                  {/* Offer Type and Offered Price */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Offer Type</label>
                      <Select
                        value={data.offer_type}
                        onValueChange={(val) => {
                          setData((prev) => ({
                            ...prev,
                            offer_type: val,
                            offered_price: val === 'free' ? '0' : prev.offered_price,
                          }));
                        }}
                      >
                        <SelectTrigger className="border-gray-200">
                          <SelectValue placeholder="Select offer type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">FREE</SelectItem>
                          <SelectItem value="discounted">Discounted</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Offered Price (₹)</label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        disabled={data.offer_type === 'free'}
                        value={data.offered_price}
                        onChange={(e) => setData('offered_price', e.target.value)}
                        placeholder="0.00"
                        className="border-gray-200 disabled:bg-gray-50 focus:border-rose-400 focus:ring-rose-400"
                      />
                      {errors.offered_price && (
                        <p className="text-xs text-red-500 font-medium">{errors.offered_price}</p>
                      )}
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <Select
                      value={data.status}
                      onValueChange={(val) => setData('status', val)}
                    >
                      <SelectTrigger className="border-gray-200">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Start Date and End Date */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Start Date</label>
                      <Input
                        type="datetime-local"
                        value={data.start_date}
                        onChange={(e) => setData('start_date', e.target.value)}
                        className="border-gray-200 text-xs focus:border-rose-400 focus:ring-rose-400"
                      />
                      {errors.start_date && (
                        <p className="text-xs text-red-500 font-medium">{errors.start_date}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">End Date</label>
                      <Input
                        type="datetime-local"
                        value={data.end_date}
                        onChange={(e) => setData('end_date', e.target.value)}
                        className="border-gray-200 text-xs focus:border-rose-400 focus:ring-rose-400"
                      />
                      {errors.end_date && (
                        <p className="text-xs text-red-500 font-medium">{errors.end_date}</p>
                      )}
                    </div>
                  </div>

                  {/* Rules & Eligibility criteria */}
                  <div className="border-t border-gray-100 pt-4 space-y-4">
                    <h3 className="text-sm font-semibold text-gray-800 flex items-center">
                      Eligibility rules (Optional)
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[11px] font-medium text-gray-600">Min Spend (₹)</label>
                        <Input
                          type="number"
                          min="0"
                          value={data.min_spend}
                          onChange={(e) => setData('min_spend', e.target.value)}
                          placeholder="e.g. 999"
                          className="border-gray-200 focus:border-rose-400 focus:ring-rose-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-medium text-gray-600">Min Quantity</label>
                        <Input
                          type="number"
                          min="0"
                          value={data.min_quantity}
                          onChange={(e) => setData('min_quantity', e.target.value)}
                          placeholder="e.g. 2"
                          className="border-gray-200 focus:border-rose-400 focus:ring-rose-400"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-700">Eligibility display text</label>
                      <Input
                        type="text"
                        value={data.eligibility_text}
                        onChange={(e) => setData('eligibility_text', e.target.value)}
                        placeholder="e.g. Buy above ₹999 / Buy 2 items"
                        className="border-gray-200 focus:border-rose-400 focus:ring-rose-400"
                      />
                      {errors.eligibility_text && (
                        <p className="text-xs text-red-500 font-medium">{errors.eligibility_text}</p>
                      )}
                    </div>
                  </div>

                  {/* Form Submission buttons */}
                  <div className="flex items-center space-x-2 pt-2">
                    <Button
                      type="submit"
                      disabled={processing}
                      className="flex-1 bg-rose-600 hover:bg-rose-700 text-white cursor-pointer transition-colors shadow-md"
                    >
                      {editingId ? 'Update Gift' : 'Add Gift Item'}
                    </Button>
                    {editingId && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancelEdit}
                        className="cursor-pointer border-gray-300 hover:bg-gray-50 text-gray-600"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* List of associated Gift Items Column */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border border-gray-100">
              <CardHeader className="border-b border-gray-50 pb-4">
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center justify-between">
                  <span>Current Gift Items</span>
                  <Badge variant="outline" className="border-rose-200 text-rose-600 font-semibold bg-rose-50/55">
                    {giftItems.length} Gift{giftItems.length !== 1 ? 's' : ''} Associated
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {giftItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                    <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-4 animate-pulse">
                      <Gift className="w-8 h-8" />
                    </div>
                    <h3 className="text-base font-bold text-gray-800">No Gift Items Configured</h3>
                    <p className="text-sm text-gray-500 mt-1 max-w-sm">
                      Get started by searching and adding a product or variant as a gift item on the left panel.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="w-14"></TableHead>
                        <TableHead>Gift Product</TableHead>
                        <TableHead>Offer Details</TableHead>
                        <TableHead>Eligibility Criteria</TableHead>
                        <TableHead>Promo Period</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {giftItems.map((gift) => (
                        <TableRow key={gift.id} className="hover:bg-rose-50/10">
                          <TableCell>
                            {gift.gift_image ? (
                              <img
                                src={gift.gift_image}
                                alt={gift.gift_name}
                                className="w-10 h-10 object-cover rounded border border-gray-200 shadow-sm"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center border border-gray-200 text-gray-400">
                                <Gift className="w-5 h-5" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="font-semibold text-gray-900">
                            <div className="flex flex-col">
                              <span>{gift.gift_name}</span>
                              <span className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wider font-bold">
                                Type: {gift.product_type}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {gift.offer_type === 'free' ? (
                              <Badge className="bg-green-100 hover:bg-green-100 text-green-800 font-bold border-green-200">
                                FREE
                              </Badge>
                            ) : (
                              <div className="flex flex-col">
                                <span className="font-semibold text-gray-800">₹{gift.offered_price}</span>
                                <span className="text-[9px] text-gray-500">Discounted Price</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="max-w-[150px]">
                            {gift.eligibility_text ? (
                              <span className="text-xs text-gray-700 bg-gray-100 py-1 px-2 rounded font-medium inline-block">
                                {gift.eligibility_text}
                              </span>
                            ) : (
                              <div className="flex flex-col space-y-1">
                                {gift.min_spend && (
                                  <span className="text-[10px] text-gray-600 bg-gray-100 py-0.5 px-1.5 rounded inline-block w-fit">
                                    Spend: ₹{gift.min_spend}
                                  </span>
                                )}
                                {gift.min_quantity && (
                                  <span className="text-[10px] text-gray-600 bg-gray-100 py-0.5 px-1.5 rounded inline-block w-fit">
                                    Qty: {gift.min_quantity}+
                                  </span>
                                )}
                                {!gift.min_spend && !gift.min_quantity && (
                                  <span className="text-xs text-gray-400 italic">None</span>
                                )}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-gray-500 max-w-[140px]">
                            {gift.start_date || gift.end_date ? (
                              <div className="flex flex-col space-y-0.5">
                                {gift.start_date && (
                                  <span>Start: {new Date(gift.start_date).toLocaleDateString()}</span>
                                )}
                                {gift.end_date && (
                                  <span>End: {new Date(gift.end_date).toLocaleDateString()}</span>
                                )}
                              </div>
                            ) : (
                              <span className="italic text-gray-400 text-xs">Always Active</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={gift.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                              {gift.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1.5">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(gift)}
                                title="Edit Gift Rule"
                                className="h-8 w-8 p-0 cursor-pointer border-gray-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(gift.id)}
                                title="Remove Gift"
                                className="h-8 w-8 p-0 cursor-pointer border-gray-200 hover:bg-red-50 hover:border-red-200 text-red-500 hover:text-red-600 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
