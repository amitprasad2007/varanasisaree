import React, { useMemo, useState } from 'react';
import axios from 'axios';

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

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">POS</h2>

      <div className="flex gap-2 mb-4">
        <input value={barcode} onChange={e => setBarcode(e.target.value)} onKeyDown={scanAdd} placeholder="Scan barcode or enter SKU and press Enter" className="border px-3 py-2 w-1/2" />
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by code, name…" className="border px-3 py-2 w-full" />
        <button onClick={search} className="bg-blue-600 text-white px-4 py-2">Search</button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2">Results</h3>
          <div className="space-y-2">
            {results.map(p => (
              <div key={p.id} className="border p-2">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-sm text-gray-500">Base: ₹{p.price.toFixed(2)}</div>
                  </div>
                  <button onClick={() => addToCart(p)} className="text-sm bg-green-600 text-white px-2 py-1">Add</button>
                </div>
                {p.variants?.length ? (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {p.variants.map(v => (
                      <button key={v.id} className="border px-2 py-1 text-sm" onClick={() => addToCart(p, v)}>
                        {v.color || v.sku || v.id} - ₹{v.price.toFixed(2)} (Stock: {v.stock})
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Cart</h3>
          <div className="space-y-2">
            {cart.map(item => (
              <div key={item.key} className="border p-2 flex justify-between items-center">
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-gray-500">{item.sku}</div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="number" min={1} value={item.qty}
                         onChange={e => setCart(prev => prev.map(x => x.key === item.key ? { ...x, qty: Number(e.target.value) } : x))}
                         className="border px-2 py-1 w-20" />
                  <div>₹{(item.price * item.qty).toFixed(2)}</div>
                  <button className="text-red-600" onClick={() => setCart(prev => prev.filter(x => x.key !== item.key))}>✕</button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex gap-2">
              <select value={discountType} onChange={e => setDiscountType(e.target.value as any)} className="border px-2 py-1">
                <option value="">No Discount</option>
                <option value="percent">% Discount</option>
                <option value="fixed">Fixed</option>
              </select>
              <input type="number" value={discountValue} onChange={e => setDiscountValue(Number(e.target.value))} className="border px-2 py-1 w-28" />
              <input type="number" value={taxPercent} onChange={e => setTaxPercent(Number(e.target.value))} className="border px-2 py-1 w-28" placeholder="Tax %" />
            </div>
            <div>
              <input value={customerName} onChange={e => setCustomerName(e.target.value)} className="border px-2 py-1 w-full" placeholder="Customer name (optional)" />
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Discount</span><span>₹{discountAmt.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Tax</span><span>₹{taxAmt.toFixed(2)}</span></div>
              <div className="flex justify-between font-bold text-lg"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
            </div>
            <button onClick={checkout} className="w-full bg-blue-700 text-white py-2">Checkout (Cash)</button>
          </div>
        </div>
      </div>
    </div>
  );
}


