import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axios from 'axios';
import { Html5Qrcode } from 'html5-qrcode';
import { format } from 'date-fns';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { type BreadcrumbItem } from '@/types';
import Swal from 'sweetalert2';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

type ProductHit = {
  id: number;
  name: string;
  price: number;
  slug: string;
  variants: { id: number; sku: string | null; price: number; stock: number; color: string | null }[];
};

type CartItem = {
  key: string;
  productId: number;
  variantId?: number | null;
  name: string;
  sku?: string | null;
  qty: number;
  price: number;
};

type SaleItemType = { id: number, name: string, quantity: number, price: number };
type SaleType = { id: number, invoice_number: string, customer?: { id: number, name: string }, items: SaleItemType[] };
type ReturnItemType = { sale_item_id: number, name: string, quantity: number, max: number, price: number };
type CreditNoteType = { id: number, amount: number, remaining_amount: number, reference: string, created_at: string };

export default function POSPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProductHit[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [barcode, setBarcode] = useState('');
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [discountType, setDiscountType] = useState<'percent' | 'fixed' | ''>('');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [taxPercent, setTaxPercent] = useState<number>(0);
  const [customerName, setCustomerName] = useState('');
  const [showReturn, setShowReturn] = useState(false);
  const [saleSearch, setSaleSearch] = useState('');
  const [sales, setSales] = useState<SaleType[]>([]);
  const [selectedSale, setSelectedSale] = useState<SaleType | null>(null);
  const [returnItems, setReturnItems] = useState<ReturnItemType[]>([]);
  const [processingReturn, setProcessingReturn] = useState(false);
  const { toast } = useToast();
  const [customerObj, setCustomerObj] = useState<{ id: number, name: string } | null>(null); // store fetched customer
  const [creditNotes, setCreditNotes] = useState<CreditNoteType[]>([]);
  const [creditNoteToUse, setCreditNoteToUse] = useState(0);
  const [attachPhone, setAttachPhone] = useState('');
  const [attachEmail, setAttachEmail] = useState('');
  const [attachName, setAttachName] = useState('');
  const [attachingCustomer, setAttachingCustomer] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  const subtotal = useMemo(() => cart.reduce((s, c) => s + c.price * c.qty, 0), [cart]);
  const discountAmt = useMemo(() => {
    if (!discountType) return 0;
    if (discountType === 'percent') return (subtotal * discountValue) / 100;
    return discountValue;
  }, [discountType, discountValue, subtotal]);
  const taxAmt = useMemo(() => ((Math.max(0, subtotal - discountAmt)) * taxPercent) / 100, [subtotal, discountAmt, taxPercent]);
  const total = useMemo(() => Math.max(0, subtotal - discountAmt) + taxAmt, [subtotal, discountAmt, taxAmt]);

  async function search() {
    if (!query.trim()) { setResults([]); return; }
    const { data } = await axios.get('/pos/products/search', { params: { q: query } });
    setResults(data);
  }

  function addToCart(p: ProductHit, variant?: ProductHit['variants'][number]) {
    const key = `${p.id}:${variant?.id ?? 'base'}`;
    const name = variant?.color ? `${p.name} - ${variant.color}` : p.name;
    const price = variant?.price ?? p.price;
    setCart(prev => {
      const existing = prev.find(x => x.key === key);
      if (existing) return prev.map(x => x.key === key ? { ...x, qty: x.qty + 1 } : x);
      return [...prev, {
        key,
        productId: p.id,
        variantId: variant?.id,
        name,
        sku: variant?.sku,
        qty: 1,
        price,
      }];
    });
  }

  async function scanAdd(e: React.KeyboardEvent<HTMLInputElement>) {
    // console.log(e.key);
    if (e.key !== 'Enter') return;
    const code = barcode.trim();
    if (!code) return;
    try {
      const { data } = await axios.get('/pos/scan', { params: { code } });
      if (!data) return;
      if (data.variantId) {
        // find product in results if present; otherwise minimal add
        setCart(prev => {
          const key = `${data.productId}:${data.variantId}`;
          const existing = prev.find(x => x.key === key);
          if (existing) return prev.map(x => x.key === key ? { ...x, qty: x.qty + 1 } : x);
          return [...prev, {
            key,
            productId: data.productId,
            variantId: data.variantId,
            name: data.name + (data.color ? ` - ${data.color}` : ''),
            sku: data.sku,
            qty: 1,
            price: data.price,
          }];
        });
      } else {
        setCart(prev => {
          const key = `${data.productId}:base`;
          const existing = prev.find(x => x.key === key);
          if (existing) return prev.map(x => x.key === key ? { ...x, qty: x.qty + 1 } : x);
          return [...prev, {
            key,
            productId: data.productId,
            name: data.name,
            qty: 1,
            price: data.price,
          }];
        });
      }
    } finally {
      setBarcode('');
    }
  }

  useEffect(() => {
    async function startCamera() {
      try {
        const id = 'pos-qr-region';
        if (!document.getElementById(id)) return;
        const html5Qrcode = new Html5Qrcode(id);
        scannerRef.current = html5Qrcode;
        await html5Qrcode.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: 250 },
          async (decodedText) => {
            setBarcode(decodedText);
            // trigger add to cart via scan API
            try {
              const { data } = await axios.get('/pos/scan', { params: { code: decodedText } });
              if (data) {
                if (data.variantId) {
                  setCart(prev => {
                    const key = `${data.productId}:${data.variantId}`;
                    const existing = prev.find(x => x.key === key);
                    if (existing) return prev.map(x => x.key === key ? { ...x, qty: x.qty + 1 } : x);
                    return [...prev, { key, productId: data.productId, variantId: data.variantId, name: data.name + (data.color ? ` - ${data.color}` : ''), sku: data.sku, qty: 1, price: data.price }];
                  });
                } else {
                  setCart(prev => {
                    const key = `${data.productId}:base`;
                    const existing = prev.find(x => x.key === key);
                    if (existing) return prev.map(x => x.key === key ? { ...x, qty: x.qty + 1 } : x);
                    return [...prev, { key, productId: data.productId, name: data.name, qty: 1, price: data.price }];
                  });
                }
              }
            } catch (_) { }
          },
          () => { /* ignore scan errors */ }
        );
      } catch (e) {
        setCameraEnabled(false);
      }
    }
    if (cameraEnabled) {
      startCamera();
    } else {
      if (scannerRef.current) {
        scannerRef.current.stop().finally(() => scannerRef.current?.clear());
        scannerRef.current = null;
      }
    }
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().finally(() => scannerRef.current?.clear());
        scannerRef.current = null;
      }
    };
  }, [cameraEnabled]);

  useEffect(() => {
    // Whenever customerName changes, fetch their details/credit notes if possible
    const load = async () => {
      if (!customerName || customerName.trim() === '') {
        setCustomerObj(null); setCreditNotes([]); setCreditNoteToUse(0); return;
      }
      // Fetch customer by name (if exists)
      try {
        const { data: customers } = await axios.get('/pos/customers/search', { params: { q: customerName } });
        if (customers[0]) {
          setCustomerObj(customers[0]);
          const notes = await axios.get('/pos/credit-notes', { params: { customer_id: customers[0].id } });
          setCreditNotes(notes.data || []);
        } else {
          setCustomerObj(null); setCreditNotes([]); setCreditNoteToUse(0);
        }
      } catch {
        setCustomerObj(null); setCreditNotes([]); setCreditNoteToUse(0);
      }
    };
    load();
  }, [customerName]);

  async function checkout() {
    let payCreditNote = Math.min(creditNoteToUse, creditNotes.reduce((a, n) => a + n.remaining_amount, 0), total);
    const needs = total - payCreditNote;
    const payments = [];
    if (payCreditNote > 0) payments.push({ method: 'credit_note', amount: payCreditNote });
    if (needs > 0) payments.push({ method: 'cash', amount: needs });
    const payload = {
      customer: customerObj ? { id: customerObj.id, name: customerName } : (customerName ? { name: customerName } : null),
      items: cart.map(c => ({
        product_id: c.productId,
        product_variant_id: c.variantId,
        name: c.name,
        sku: c.sku,
        quantity: c.qty,
        price: c.price,
      })),
      discount: discountType ? { type: discountType, value: discountValue } : null,
      tax: taxPercent ? { percent: taxPercent } : null,
      payments,
    };
    const { data } = await axios.post('/pos/sales', payload);
    window.open(`/pos/sales/${data.saleId}/invoice`, '_blank');
    setCart([]); setDiscountType(''); setDiscountValue(0); setTaxPercent(0); setCustomerName(''); setCreditNotes([]); setCreditNoteToUse(0); setCustomerObj(null);
  }

  async function fetchSales() {
    const { data } = await axios.get('/pos/sales/list', { params: { invoice_number: saleSearch } });
    setSales(data);
  }

  async function loadSaleItems(sale: SaleType) {
    setSelectedSale(sale);
    setReturnItems(sale.items.map(i => ({
      sale_item_id: i.id,
      name: i.name,
      quantity: 1,
      max: i.quantity,
      price: i.price
    })));
  }

  async function processReturn() {
    if (!selectedSale) return;
    setProcessingReturn(true);
    try {
      const { data } = await axios.post(`/pos/sales/${selectedSale.id}/return`, {
        items: returnItems.filter(r => r.quantity > 0).map(r => ({ sale_item_id: r.sale_item_id, quantity: r.quantity }))
      });
      toast({ title: 'Return processed', description: `Credit note issued for ₹${data.refundTotal}` });
      setShowReturn(false); setSelectedSale(null); setReturnItems([]); setSales([]); setSaleSearch('');
    } catch (e: any) {
      toast({ title: 'Error', description: e?.response?.data?.message || 'Failed to process return', variant: 'destructive' });
    } finally {
      setProcessingReturn(false);
    }
  }

  async function attachCustomerToSale() {
    if (!selectedSale) return;
    if (!attachPhone && !attachEmail) {
      toast({ title: 'Provide contact', description: 'Phone or Email is required to create customer', variant: 'destructive' });
      return;
    }
    setAttachingCustomer(true);
    try {
      const { data } = await axios.post(`/pos/sales/${selectedSale.id}/attach-customer`, {
        name: attachName || undefined,
        phone: attachPhone || undefined,
        email: attachEmail || undefined,
      });
      // Update selectedSale with attached customer
      setSelectedSale(prev => prev ? { ...prev, customer: { id: data.customer.id, name: data.customer.name } } : prev);
      toast({ title: 'Customer attached', description: 'Customer has been linked to this invoice.' });
    } catch (e: any) {
      toast({ title: 'Error', description: e?.response?.data?.message || 'Failed to attach customer', variant: 'destructive' });
    } finally {
      setAttachingCustomer(false);
    }
  }

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Direct Sales', href: route('pos.index') },
  ];
  return (
    <DashboardLayout title="Direct Sales">
      {/* Return Modal Trigger */}
      <Dialog open={showReturnModal} onOpenChange={setShowReturnModal}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle>Process Return/Refund</DialogTitle>
          </DialogHeader>
          {/* Sale Search and List */}
          {!selectedSale ? (
            <div>
              <div className="flex mb-2 gap-2">
                <Input value={saleSearch} onChange={e => setSaleSearch(e.target.value)} placeholder="Search Invoice Number..." />
                <Button className='cursor-pointer' onClick={fetchSales}>Search</Button>
              </div>
              <div className="max-h-60 overflow-y-auto border rounded">
                {sales.map(sale => (
                  <div key={sale.id} className="p-2 border-b flex justify-between items-center">
                    <div>
                      <div className="font-medium">{sale.invoice_number}</div>
                      <div className="text-xs text-gray-500">Customer: {sale.customer?.name}</div>
                    </div>
                    <Button size="sm" onClick={() => loadSaleItems(sale)}>Select</Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-2 font-medium">Invoice: {selectedSale.invoice_number} (Customer: {selectedSale.customer?.name})</div>
              {!selectedSale.customer && (
                <div className="mb-3 p-3 border rounded">
                  <div className="text-sm font-medium mb-2">Attach customer to proceed with return</div>
                  <div className="flex gap-2 mb-2">
                    <Input value={attachName} onChange={e => setAttachName(e.target.value)} placeholder="Name (optional)" />
                    <Input value={attachPhone} onChange={e => setAttachPhone(e.target.value)} placeholder="Phone" />
                    <Input value={attachEmail} onChange={e => setAttachEmail(e.target.value)} placeholder="Email" />
                    <Button onClick={attachCustomerToSale} disabled={attachingCustomer}>
                      {attachingCustomer ? 'Attaching...' : 'Attach Customer'}
                    </Button>
                  </div>
                  <div className="text-xs text-gray-500">Provide phone or email to create a new customer and link to this invoice.</div>
                </div>
              )}
              <div className="max-h-40 overflow-y-auto">
                {returnItems.map((r, idx) => (
                  <div key={r.sale_item_id} className="flex gap-2 items-center mb-2">
                    <span className="block w-40">{r.name}</span>
                    <Input type="number" min={0} max={r.max} value={r.quantity}
                      onChange={e => setReturnItems(ri => ri.map((x, i) => i === idx ? { ...x, quantity: Number(e.target.value) } : x))}
                      className="w-20" />
                    <span className="text-sm">/ {r.max} × ₹{r.price}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={() => setSelectedSale(null)} variant="outline">Back</Button>
                <Button onClick={processReturn} disabled={processingReturn || !returnItems.some(i => i.quantity > 0) || !selectedSale.customer}>
                  {processingReturn ? 'Processing...' : 'Confirm Return & Issue Credit Note'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Head title="Point of Sale System" />

        {/* Professional Header */}
        <div className="bg-white shadow-lg border-b-4 border-blue-500">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Point of Sale</h1>
                  <p className="text-sm text-blue-600 font-medium">Fast & Efficient Sales Management</p>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                {customerObj && (
                  <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                    <div className="text-sm font-medium text-green-800">Customer Selected</div>
                    <div className="text-xs text-green-600">{customerObj.name}</div>
                  </div>
                )}

                <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-4 py-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-700">Session Active</span>
                </div>

                <button
                  onClick={() => setShowReturnModal(true)}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2 shadow-md"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                  </svg>
                  <span>Returns/Refunds</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Container */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Enhanced Search Section */}
          <Card className="bg-white shadow-lg rounded-xl border border-gray-200 mb-6">
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h2 className="text-lg font-semibold text-gray-800">Product Search</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-4">
                  {/* Barcode Scanner */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Barcode Scanner</label>
                    <div className="relative">
                      <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h2M4 4h5m3 0h6m4 0h2M4 20h5M12 16v4" />
                      </svg>
                      <Input
                        value={barcode}
                        onChange={e => setBarcode(e.target.value)}
                        onKeyDown={scanAdd}
                        placeholder="Scan barcode or enter SKU and press Enter"
                        className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                  </div>

                  {/* Product Search */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Search</label>
                    <div className="flex space-x-3">
                      <div className="relative flex-1">
                        <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <Input
                          value={query}
                          onChange={e => setQuery(e.target.value)}
                          onKeyDown={e => e.key === 'Tab' && search()}
                          onBlur={search}
                          placeholder="Search by code, name, category..."
                          className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                      </div>
                      <Button
                        onClick={search}
                        className="h-12 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md cursor-pointer"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Search
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Camera Controls */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Camera Scanner</label>
                    <Button
                      onClick={() => setCameraEnabled(v => !v)}
                      className={`h-12 w-full transition-all duration-200 shadow-md ${cameraEnabled
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : 'bg-gray-600 hover:bg-gray-700 text-white'
                        }`}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      {cameraEnabled ? 'Stop Camera' : 'Start Camera Scanner'}
                    </Button>
                  </div>

                  {cameraEnabled && (
                    <div className="bg-gray-100 rounded-lg p-4 border-2 border-dashed border-gray-300">
                      <div className="text-center text-sm text-gray-600 mb-2">Camera Scanner Active</div>
                      <div id="pos-qr-region" className="w-full h-64 bg-black rounded-lg" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Product Results Section */}
            <div className="lg:col-span-2">
              <Card className="bg-white shadow-lg rounded-xl border border-gray-200">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <h3 className="text-lg font-semibold text-gray-800">Product Results</h3>
                    </div>
                    <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                      {results.length} items found
                    </div>
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {results.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <p className="text-lg font-medium">No products found</p>
                        <p className="text-sm">Try searching with different keywords</p>
                      </div>
                    ) : (
                      results.map(p => (
                        <div key={p.id} className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 text-lg">{p.name}</h4>
                              <div className="flex items-center space-x-4 mt-1">
                                <span className="text-sm text-gray-500">SKU: {p.slug}</span>
                                <span className="text-lg font-bold text-green-600">₹{p.price.toFixed(2)}</span>
                              </div>
                            </div>
                            <Button
                              onClick={() => addToCart(p)}
                              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md transition-all duration-200"
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                              Add to Cart
                            </Button>
                          </div>

                          {p.variants?.length ? (
                            <div className="border-t pt-3">
                              <p className="text-sm font-medium text-gray-700 mb-2">Available Variants:</p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {p.variants.map(v => (
                                  <Button
                                    key={v.id}
                                    variant="outline"
                                    className="text-xs h-auto p-2 justify-between hover:bg-blue-50 border-blue-200"
                                    onClick={() => addToCart(p, v)}
                                  >
                                    <div className="text-left">
                                      <div className="font-medium">{v.color || v.sku || `Variant ${v.id}`}</div>
                                      <div className="text-green-600 font-semibold">₹{v.price.toFixed(2)}</div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-xs text-gray-500">Stock:</div>
                                      <div className={`text-xs font-semibold ${v.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                        {v.stock}
                                      </div>
                                    </div>
                                  </Button>
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </Card>
            </div>
            {/* Cart Section */}
            <div className="lg:col-span-1">
              <Card className="bg-white shadow-lg rounded-xl border border-gray-200 sticky top-6">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m-2.4 0L3 3M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v8a2 2 0 01-2 2H9a2 2 0 01-2 2v-8m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                      </svg>
                      <h3 className="text-lg font-semibold text-gray-800">Shopping Cart</h3>
                    </div>
                    <div className="text-sm text-gray-500 bg-blue-50 px-3 py-1 rounded-full">
                      {cart.length} items
                    </div>
                  </div>

                  <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                    {cart.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m-2.4 0L3 3M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17" />
                        </svg>
                        <p className="font-medium">Cart is empty</p>
                        <p className="text-sm">Add products to get started</p>
                      </div>
                    ) : (
                      cart.map(item => (
                        <div key={item.key} className="bg-gradient-to-r from-blue-50 to-white border border-blue-200 rounded-lg p-3 hover:shadow-sm transition-shadow duration-200">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900">{item.name}</div>
                              <div className="text-xs text-gray-500">{item.sku}</div>
                              <div className="text-sm text-green-600 font-medium">₹{item.price.toFixed(2)} each</div>
                            </div>
                            <button
                              onClick={() => setCart(prev => prev.filter(x => x.key !== item.key))}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full p-1 transition-colors duration-200"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">Qty:</span>
                              <Input
                                type="number"
                                min={1}
                                value={item.qty}
                                onChange={e => setCart(prev => prev.map(x => x.key === item.key ? { ...x, qty: Number(e.target.value) } : x))}
                                className="w-16 h-8 text-center border-gray-300 focus:border-blue-500"
                              />
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-blue-600">₹{(item.price * item.qty).toFixed(2)}</div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Enhanced Discount & Tax Section */}
                  <div className="border-t pt-4 mt-4 space-y-4">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Discount</label>
                        <div className="flex space-x-2">
                          <select
                            value={discountType}
                            onChange={e => setDiscountType(e.target.value as any)}
                            className="flex-1 h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          >
                            <option value="">No Discount</option>
                            <option value="percent">Percentage (%)</option>
                            <option value="fixed">Fixed Amount (₹)</option>
                          </select>
                          <Input
                            type="number"
                            value={discountValue}
                            onChange={e => setDiscountValue(Number(e.target.value))}
                            placeholder={discountType === 'percent' ? '%' : '₹'}
                            className="w-24 border-gray-300 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tax</label>
                        <Input
                          type="number"
                          value={taxPercent}
                          onChange={e => setTaxPercent(Number(e.target.value))}
                          placeholder="Tax percentage"
                          className="w-full border-gray-300 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Customer Information</label>
                        <div className="flex space-x-2">
                          <Input
                            value={customerName}
                            onChange={e => setCustomerName(e.target.value)}
                            placeholder="Customer name (optional)"
                            className="flex-1 border-gray-300 focus:border-blue-500"
                          />
                          <Button
                            onClick={() => setShowCustomerModal(true)}
                            variant="outline"
                            className="px-4 border-blue-300 text-blue-600 hover:bg-blue-50"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Select
                          </Button>
                        </div>
                      </div>

                      {customerObj && !!creditNotes.length && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <label className="block text-sm font-medium text-green-800 mb-2">Available Credit Notes</label>
                          <div className="text-sm text-green-700 mb-2">
                            Total Available: ₹{creditNotes.reduce((a, n) => a + n.remaining_amount, 0).toFixed(2)}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              min={0}
                              max={Math.min(total, creditNotes.reduce((a, n) => a + n.remaining_amount, 0))}
                              value={creditNoteToUse}
                              onChange={e => setCreditNoteToUse(Number(e.target.value) || 0)}
                              className="flex-1 border-green-300 focus:border-green-500"
                              placeholder="Amount to use"
                            />
                            <span className="text-sm text-green-600 font-medium">Use Credit</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Enhanced Order Summary */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        Order Summary
                      </h4>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal ({cart.length} items)</span>
                        <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                      </div>
                      {discountAmt > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-orange-600">Discount ({discountType})</span>
                          <span className="text-orange-600 font-medium">-₹{discountAmt.toFixed(2)}</span>
                        </div>
                      )}
                      {taxAmt > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Tax ({taxPercent}%)</span>
                          <span className="font-medium">₹{taxAmt.toFixed(2)}</span>
                        </div>
                      )}
                      {creditNoteToUse > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-green-600">Credit Note Applied</span>
                          <span className="text-green-600 font-medium">-₹{creditNoteToUse.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="border-t border-gray-200 pt-2 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-gray-900">Total</span>
                          <span className="text-2xl font-bold text-blue-600">₹{Math.max(0, total - creditNoteToUse).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Checkout Button */}
                    <Button
                      onClick={checkout}
                      disabled={cart.length === 0}
                      className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Complete Sale - Cash Payment
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}


