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

type ProductHit = {
  id: number;
  name: string;
  price: number;
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
    if (e.key == 'Enter') return;
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
          } catch (_) {}
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

  async function checkout() {
    const payload = {
      customer: customerName ? { name: customerName } : null,
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
      payments: [{ method: 'cash', amount: total }],
    };
    const { data } = await axios.post('/pos/sales', payload);
    window.open(`/pos/sales/${data.saleId}/invoice`, '_blank');
    // reset
    setCart([]); setDiscountType(''); setDiscountValue(0); setTaxPercent(0); setCustomerName('');
  }

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Direct Sales', href: route('pos.index') },
];
  return (
    <DashboardLayout title="Direct Sales">    
    <div className="p-4 max-w-6xl mx-auto">
      <Head title="Direct Sales" />
      <div className="space-y-4 pb-6">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Order Management</h1>
                <p className="text-muted-foreground">Manage and track customer orders</p>
            </div>
        </div>
        <Breadcrumbs breadcrumbs={breadcrumbs} />
      </div>
      <Card className="rounded-md border gap-6 mb-2 ml-2">
        <div  className="flex gap-2  mb-4 ml-4 mt-4 mr-4">
          <Input value={barcode} onChange={e => setBarcode(e.target.value)} onKeyDown={scanAdd} placeholder="Scan barcode or enter SKU and press Enter" className="border px-3 py-2 w-1/2" />
          <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by code, name…" className="border px-3 py-2 w-full" />
          <Button onClick={search} variant="outline" className="cursor-pointer hover:bg-blue-900 bg-blue-600 text-white px-4 py-2">Search</Button>
          <Button onClick={() => setCameraEnabled(v => !v)} className="cursor-pointer hover:bg-gray-900 bg-gray-400 text-white px-4 py-2">{cameraEnabled ? 'Stop Camera' : 'Start Camera'}</Button>
        </div>
          {cameraEnabled ? <div id="pos-qr-region" className="mb-4 w-80 h-80 border" /> : null}
        <div className="grid grid-cols-2 gap-6 ">
          <div className='gap-6 rounded-md border ml-2 mb-2'>
            <h3 className="font-semibold mb-2 ml-2">Results</h3>
            <div className="space-y-2 rounded-md border ">
              {results.map(p => (
                <div key={p.id} className="border p-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-sm text-gray-500">Base: ₹{p.price.toFixed(2)}</div>
                    </div>
                    <Button onClick={() => addToCart(p)} className="text-sm bg-green-600 text-white px-2 py-1">Add</Button>
                  </div>
                  {p.variants?.length ? (
                    <div className="mt-2 grid grid-cols-2">
                      {p.variants.map(v => (
                        <Button key={v.id} className="border px-2 py-1 text-sm" onClick={() => addToCart(p, v)}>
                          {v.color || v.sku || v.id} - ₹{v.price.toFixed(2)} (Stock: {v.stock})
                        </Button>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
          <div className='mb-4 mr-4 mt-4 rounded-md'>
            <h3 className="font-semibold mb-2">Cart</h3>
            <div className="space-y-2 ">
              {cart.map(item => (
                <div key={item.key} className= "rounded-md border p-2 flex justify-between items-center">
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-500">{item.sku}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input type="number" min={1} value={item.qty}
                          onChange={e => setCart(prev => prev.map(x => x.key === item.key ? { ...x, qty: Number(e.target.value) } : x))}
                          className="border px-2 py-1 w-20" />
                    <div>₹{(item.price * item.qty).toFixed(2)}</div>
                    <Button className="text-red-600" onClick={() => setCart(prev => prev.filter(x => x.key !== item.key))}>✕</Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex gap-2">
                <select value={discountType} onChange={e => setDiscountType(e.target.value as any)} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1">
                  <option value="">No Discount</option>
                  <option value="percent">% Discount</option>
                  <option value="fixed">Fixed</option>
                </select>
                Discount
                <Input type="number" value={discountValue} onChange={e => setDiscountValue(Number(e.target.value))} className="border px-2 py-1 w-24" />
                Tax
                <Input type="number" value={taxPercent} onChange={e => setTaxPercent(Number(e.target.value))} className="border px-2 py-1 w-24" placeholder="Tax %" />
              </div>
              <div>
                <Input value={customerName} onChange={e => setCustomerName(e.target.value)} className="border px-2 py-1 w-full" placeholder="Customer name (optional)" />
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Discount</span><span>₹{discountAmt.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Tax</span><span>₹{taxAmt.toFixed(2)}</span></div>
                <div className="flex justify-between font-bold text-lg"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
              </div>
              <Button onClick={checkout} className="w-full cursor-pointer hover:bg-blue-900 bg-blue-600 text-white px-4 py-2">Checkout (Cash)</Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
    </DashboardLayout>
  );
}


