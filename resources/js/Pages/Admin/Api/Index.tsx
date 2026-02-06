import React, { useMemo, useState, useEffect } from 'react'
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Breadcrumbs } from '@/components/breadcrumbs'
import { type BreadcrumbItem } from '@/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

type Endpoint = {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  label: string
  path: string
  category: string
}

// Comprehensive list of APIs from api.php
const presetEndpoints: Endpoint[] = [
  // Blog
  { method: 'GET', label: 'Get All Blogs', path: '/api/blogs', category: 'Blog' },
  { method: 'GET', label: 'Get Featured Blogs', path: '/api/blogs/featured', category: 'Blog' },
  { method: 'GET', label: 'Get Blog Categories', path: '/api/blogs/categories', category: 'Blog' },
  { method: 'GET', label: 'Get Blog Details', path: '/api/blogs/{slug}', category: 'Blog' },

  // Policy & Pages
  { method: 'GET', label: 'Get Page Details', path: '/api/pages/{slug}', category: 'Policy & Pages' },
  { method: 'GET', label: 'Get All Policies', path: '/api/policies', category: 'Policy & Pages' },
  { method: 'GET', label: 'Privacy Policy', path: '/api/policies/privacy', category: 'Policy & Pages' },
  { method: 'GET', label: 'Terms Policy', path: '/api/policies/terms', category: 'Policy & Pages' },
  { method: 'GET', label: 'Shipping Policy', path: '/api/policies/shipping', category: 'Policy & Pages' },
  { method: 'GET', label: 'Refund Policy', path: '/api/policies/refund', category: 'Policy & Pages' },
  { method: 'GET', label: 'Delivery Info', path: '/api/delivery-info', category: 'Policy & Pages' },

  // FAQ
  { method: 'GET', label: 'Get FAQs', path: '/api/faqs', category: 'FAQ' },

  // Company Info
  { method: 'GET', label: 'Company Info', path: '/api/company-info', category: 'Company Info' },
  { method: 'GET', label: 'Contact Info', path: '/api/company-info/contact', category: 'Company Info' },
  { method: 'GET', label: 'Social Links', path: '/api/company-info/social', category: 'Company Info' },

  // Testimonial
  { method: 'GET', label: 'Get Testimonials', path: '/api/testimonials', category: 'Testimonial' },

  // Category
  { method: 'GET', label: 'Get All Categories', path: '/api/categories', category: 'Category' },
  { method: 'GET', label: 'Get Category Products', path: '/api/products/{categories}', category: 'Category' },
  { method: 'GET', label: 'Get Category Details', path: '/api/categories/{categories}/details', category: 'Category' },
  { method: 'GET', label: 'Get Category By Slug', path: '/api/getcategorybyname/{slug}', category: 'Category' },

  // About Us
  { method: 'GET', label: 'Get About Us', path: '/api/aboutus', category: 'About Us' },

  // Product
  { method: 'GET', label: 'Featured Products', path: '/api/featured-products', category: 'Product' },
  { method: 'GET', label: 'Bestseller Products', path: '/api/bestseller-products', category: 'Product' },
  { method: 'GET', label: 'Product Details', path: '/api/getProductDetails/{slug}', category: 'Product' },
  { method: 'GET', label: 'Related Products', path: '/api/getRelatedProducts/{slug}', category: 'Product' },
  { method: 'GET', label: 'Get All Products', path: '/api/getallproducts', category: 'Product' },
  { method: 'GET', label: 'Recommended Products', path: '/api/recommended-products', category: 'Product' },

  // Banner
  { method: 'GET', label: 'Get Banners', path: '/api/getBanners', category: 'Banner' },
  { method: 'GET', label: 'Get Hero Banner', path: '/api/getheriBanner', category: 'Banner' },

  // Product Review
  { method: 'GET', label: 'Get Reviews', path: '/api/product-reviews', category: 'Product Review' },
  { method: 'GET', label: 'Get Review Stats', path: '/api/product-reviews/stats', category: 'Product Review' },
  { method: 'POST', label: 'Submit Review (Auth)', path: '/api/product-reviews', category: 'Product Review' },

  // Coupon
  { method: 'POST', label: 'Validate Coupon', path: '/api/coupons/validate', category: 'Coupon' },

  // Search
  { method: 'GET', label: 'Search Suggestions', path: '/api/search/suggestions', category: 'Search' },
  { method: 'GET', label: 'Category Filters', path: '/api/getcategoryfillters/{slug}', category: 'Search' },
  { method: 'GET', label: 'Bestseller Filters', path: '/api/getbestsellerfillters/bestsellers/', category: 'Search' },
  { method: 'GET', label: 'Featured Filters', path: '/api/getfeaturedfillters/featured/', category: 'Search' },
  { method: 'GET', label: 'Nav Items', path: '/api/navitems', category: 'Search' },
  { method: 'GET', label: 'Recommended Filters', path: '/api/get-recommended-filters', category: 'Search' },

  // Collection
  { method: 'GET', label: 'Collection Types', path: '/api/collection-types', category: 'Collection' },
  { method: 'GET', label: 'Get Collections', path: '/api/collections', category: 'Collection' },
  { method: 'GET', label: 'Featured Collections', path: '/api/collections/featured', category: 'Collection' },
  { method: 'GET', label: 'Search Collections', path: '/api/collections/search', category: 'Collection' },
  { method: 'GET', label: 'Collection Details', path: '/api/collections/{slug}', category: 'Collection' },

  // Auth (Customer)
  { method: 'POST', label: 'Forgot Password', path: '/api/forgot-password', category: 'Auth' },
  { method: 'POST', label: 'Check Change Token', path: '/api/change-token-check', category: 'Auth' },
  { method: 'POST', label: 'Change Password', path: '/api/changepassword', category: 'Auth' },
  { method: 'POST', label: 'Register', path: '/api/register', category: 'Auth' },
  { method: 'POST', label: 'Login', path: '/api/login', category: 'Auth' },
  { method: 'GET', label: 'Get Profile (Auth)', path: '/api/user', category: 'Auth' },
  { method: 'POST', label: 'Logout (Auth)', path: '/api/logout', category: 'Auth' },

  // Cart
  { method: 'POST', label: 'Add to Cart (Auth)', path: '/api/cart/add', category: 'Cart' },
  { method: 'POST', label: 'Wishlist to Cart (Auth)', path: '/api/wishcart/add', category: 'Cart' },
  { method: 'PUT', label: 'Update Cart (Auth)', path: '/api/cart/update', category: 'Cart' },
  { method: 'DELETE', label: 'Remove from Cart (Auth)', path: '/api/cart/remove', category: 'Cart' },
  { method: 'GET', label: 'Checkout Cart (Auth)', path: '/api/cart/checkout', category: 'Cart' },
  { method: 'GET', label: 'Cart Summary (Auth)', path: '/api/cart/summary', category: 'Cart' },
  { method: 'GET', label: 'Recommended for Cart (Auth)', path: '/api/recommended-products', category: 'Cart' },

  // Order
  { method: 'POST', label: 'Buy Now (Auth)', path: '/api/order/buy-now', category: 'Order' },
  { method: 'POST', label: 'Checkout (Auth)', path: '/api/order/checkout', category: 'Order' },
  { method: 'GET', label: 'List Orders (Auth)', path: '/api/orders', category: 'Order' },
  { method: 'GET', label: 'Order History (Auth)', path: '/api/orders/history', category: 'Order' },
  { method: 'GET', label: 'Order Details (Auth)', path: '/api/orderdetails/{orid}', category: 'Order' },
  { method: 'GET', label: 'Order PDF (Auth)', path: '/api/order/pdf/{orid}', category: 'Order' },

  // Payment
  { method: 'POST', label: 'Create Razorpay Order (Auth)', path: '/api/createrazorpayorder', category: 'Payment' },
  { method: 'POST', label: 'Save Pay Check (Auth)', path: '/api/paychecksave', category: 'Payment' },
  { method: 'GET', label: 'Payment Methods (Auth)', path: '/api/payment-methods', category: 'Payment' },

  // Address
  { method: 'GET', label: 'Get Addresses (Auth)', path: '/api/addresses', category: 'Address' },
  { method: 'GET', label: 'Get Addresses Ind (Auth)', path: '/api/addressesind', category: 'Address' },
  { method: 'POST', label: 'Create Address (Auth)', path: '/api/addresses', category: 'Address' },
  { method: 'PUT', label: 'Update Address (Auth)', path: '/api/addresses/{id}', category: 'Address' },
  { method: 'DELETE', label: 'Delete Address (Auth)', path: '/api/addresses/{id}', category: 'Address' },

  // Logs
  { method: 'POST', label: 'Guest Logs', path: '/api/guestlogs', category: 'Logs' },
  { method: 'POST', label: 'User Logs (Auth)', path: '/api/logs', category: 'Logs' },
  { method: 'POST', label: 'Attach Session (Auth)', path: '/api/logs/attach-session', category: 'Logs' },

  // Wishlist
  { method: 'GET', label: 'Get Wishlist (Auth)', path: '/api/wishlist', category: 'Wishlist' },
  { method: 'POST', label: 'Add to Wishlist (Auth)', path: '/api/wishlist', category: 'Wishlist' },
  { method: 'DELETE', label: 'Remove from Wishlist (Auth)', path: '/api/wishlist/{productId}', category: 'Wishlist' },
  { method: 'POST', label: 'Sync Wishlist (Auth)', path: '/api/sync-wishlist', category: 'Wishlist' },
  { method: 'POST', label: 'Check Wishlist (Auth)', path: '/api/checkwishlist', category: 'Wishlist' },
  { method: 'POST', label: 'Remove by ID (Auth)', path: '/api/wishlistremovebyid/{wishlist}', category: 'Wishlist' },
  { method: 'POST', label: 'Guest Add Wishlist', path: '/api/guest/wishlist', category: 'Wishlist' },
  { method: 'DELETE', label: 'Guest Remove Wishlist', path: '/api/guest/wishlist/{productId}', category: 'Wishlist' },
  { method: 'GET', label: 'Guest Get Wishlist', path: '/api/guest/wishlist', category: 'Wishlist' },
  { method: 'POST', label: 'Guest Check Wishlist', path: '/api/guest/checkwishlist', category: 'Wishlist' },

  // Recently Viewed
  { method: 'GET', label: 'Get Recently Viewed (Auth)', path: '/api/recently-viewed', category: 'Recently Viewed' },
  { method: 'POST', label: 'Store Recently Viewed (Auth)', path: '/api/recently-viewed', category: 'Recently Viewed' },
  { method: 'POST', label: 'Sync Recently Viewed (Auth)', path: '/api/sync-recently-viewed', category: 'Recently Viewed' },
  { method: 'POST', label: 'Guest Store Recently Viewed', path: '/api/guest/recently-viewed', category: 'Recently Viewed' },
  { method: 'GET', label: 'Guest Get Recently Viewed', path: '/api/guest/recently-viewed', category: 'Recently Viewed' },

  // Guest Data
  { method: 'POST', label: 'Claim Guest Data (Auth)', path: '/api/guest/claim', category: 'Guest Data' },

  // Refund
  { method: 'GET', label: 'Check Eligibility (Auth)', path: '/api/refund-eligibility', category: 'Refund' },
  { method: 'GET', label: 'Get Refunds (Auth)', path: '/api/refunds', category: 'Refund' },
  { method: 'POST', label: 'Create Refund (Auth)', path: '/api/refunds', category: 'Refund' },
  { method: 'GET', label: 'Check Razorpay Eligibility (Auth)', path: '/api/refunds/check-razorpay-eligibility', category: 'Refund' },
  { method: 'POST', label: 'Check Razorpay Status (Auth)', path: '/api/refunds/check-razorpay-status', category: 'Refund' },
  { method: 'GET', label: 'Get Refund Details (Auth)', path: '/api/refunds/{refund}', category: 'Refund' },
  { method: 'POST', label: 'Cancel Refund (Auth)', path: '/api/refunds/{refund}/cancel', category: 'Refund' },
  { method: 'GET', label: 'Credit Notes (Auth)', path: '/api/credit-notes', category: 'Refund' },
  { method: 'GET', label: 'Refund Statistics (Auth)', path: '/api/refund-statistics', category: 'Refund' },
  { method: 'GET', label: 'Return Orders (Auth)', path: '/api/return_orders/{order_id}', category: 'Refund' },
  { method: 'GET', label: 'Check Item Eligibility (Auth)', path: '/api/refunds-check-item-eligibility', category: 'Refund' },
  { method: 'GET', label: 'Get Refundable Items (Auth)', path: '/api/refunds-get-refundable-items', category: 'Refund' },

  // Admin Refund
  { method: 'GET', label: 'Admin Get Refunds', path: '/api/admin/refunds', category: 'Admin Refund' },
  { method: 'GET', label: 'Admin Refund Details', path: '/api/admin/refunds/{refund}', category: 'Admin Refund' },
  { method: 'POST', label: 'Admin Approve Refund', path: '/api/admin/refunds/{refund}/approve', category: 'Admin Refund' },
  { method: 'POST', label: 'Admin Reject Refund', path: '/api/admin/refunds/{refund}/reject', category: 'Admin Refund' },
  { method: 'POST', label: 'Admin Process Refund', path: '/api/admin/refunds/{refund}/process', category: 'Admin Refund' },
  { method: 'POST', label: 'Admin Retry Razorpay', path: '/api/admin/refunds/{refund}/retry-razorpay', category: 'Admin Refund' },
  { method: 'GET', label: 'Admin Refunds by Status', path: '/api/admin/refunds/status/{status}', category: 'Admin Refund' },
  { method: 'GET', label: 'Admin Refund Stats', path: '/api/admin/refunds/statistics', category: 'Admin Refund' },
  { method: 'GET', label: 'Admin Test Razorpay', path: '/api/admin/refunds/test-razorpay', category: 'Admin Refund' },
]

type QueryParam = { key: string; value: string }

export default function ApiIndex() {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'API Playground', href: route('api.playground') },
  ]

  const [baseUrl, setBaseUrl] = useState<string>(window.location.origin)
  const [selectedPath, setSelectedPath] = useState<string>(presetEndpoints[0]?.path ?? '')
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('GET')
  const [slug, setSlug] = useState<string>('')
  const [queryParams, setQueryParams] = useState<QueryParam[]>([])
  const [bearer, setBearer] = useState<string>('')
  const [body, setBody] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [status, setStatus] = useState<string>('')
  const [response, setResponse] = useState<string>('')

  // Group endpoints by category
  const groupedEndpoints = useMemo(() => {
    const groups: Record<string, Endpoint[]> = {}
    presetEndpoints.forEach((ep) => {
      if (!groups[ep.category]) groups[ep.category] = []
      groups[ep.category].push(ep)
    })
    return groups
  }, [])

  // Update method when endpoint changes
  useEffect(() => {
    const endpoint = presetEndpoints.find(e => e.path === selectedPath)
    if (endpoint) {
      setMethod(endpoint.method)
    }
  }, [selectedPath])

  const resolvedPath = useMemo(() => {
    let path = selectedPath
    if (path.includes('{slug}')) path = path.replace('{slug}', slug || '')
    if (path.includes('{categories}')) path = path.replace('{categories}', slug || '')
    if (path.includes('{id}')) path = path.replace('{id}', slug || '')
    if (path.includes('{productId}')) path = path.replace('{productId}', slug || '')
    if (path.includes('{orid}')) path = path.replace('{orid}', slug || '')
    if (path.includes('{wishlist}')) path = path.replace('{wishlist}', slug || '')
    if (path.includes('{refund}')) path = path.replace('{refund}', slug || '')
    if (path.includes('{order_id}')) path = path.replace('{order_id}', slug || '')
    if (path.includes('{status}')) path = path.replace('{status}', slug || '')
    return path
  }, [selectedPath, slug])

  const finalUrl = useMemo(() => {
    try {
      const url = new URL(resolvedPath, baseUrl)
      for (const { key, value } of queryParams) {
        if (key) url.searchParams.append(key, value)
      }
      return url.toString()
    } catch (e) {
      return resolvedPath
    }
  }, [baseUrl, resolvedPath, queryParams])

  const addParam = () => setQueryParams((prev) => [...prev, { key: '', value: '' }])
  const removeParam = (idx: number) => setQueryParams((prev) => prev.filter((_, i) => i !== idx))
  const updateParam = (idx: number, field: 'key' | 'value', value: string) =>
    setQueryParams((prev) => prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p)))

  const clearAll = () => {
    setSlug('')
    setQueryParams([])
    setBearer('')
    setBody('')
    setResponse('')
    setStatus('')
  }

  const sendRequest = async () => {
    setLoading(true)
    setStatus('')
    setResponse('')
    try {
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
      if (bearer) headers['Authorization'] = `Bearer ${bearer}`

      const options: RequestInit = {
        method,
        headers,
      }

      if (method !== 'GET' && body) {
        try {
          // Validate JSON
          JSON.parse(body)
          options.body = body
        } catch (e) {
          alert('Invalid JSON body')
          setLoading(false)
          return
        }
      }

      const res = await fetch(finalUrl, options)
      const text = await res.text()
      setStatus(`${res.status} ${res.statusText}`)
      try {
        const json = JSON.parse(text)
        setResponse(JSON.stringify(json, null, 2))
      } catch {
        setResponse(text)
      }
    } catch (err: unknown) {
      setStatus('Request failed')
      setResponse(String(err))
    } finally {
      setLoading(false)
    }
  }

  const hasDynamicParam = selectedPath.includes('{')

  return (
    <DashboardLayout title="API Playground">
      <div className="space-y-4 pb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">API Playground</h1>
        </div>
        <Breadcrumbs breadcrumbs={breadcrumbs} />
      </div>

      <div className="bg-white rounded-md shadow-lg border border-gray-100 p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-3 space-y-2">
            <label className="text-sm text-gray-600">Base URL</label>
            <Input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm text-gray-600">Method</label>
            <select
              className="border rounded px-2 py-2 text-sm w-full h-10 bg-background"
              value={method}
              onChange={(e) => setMethod(e.target.value as any)}
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>
          <div className="md:col-span-7 space-y-2">
            <label className="text-sm text-gray-600">Select Endpoint</label>
            <select
              className="border rounded px-2 py-2 text-sm w-full h-10 bg-background"
              value={selectedPath}
              onChange={(e) => setSelectedPath(e.target.value)}
            >
              {Object.entries(groupedEndpoints).map(([category, endpoints]) => (
                <optgroup key={category} label={category}>
                  {endpoints.map((e) => (
                    <option key={e.path + e.method} value={e.path}>
                      [{e.method}] {e.label} ({e.path})
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>

        {hasDynamicParam && (
          <div className="space-y-2">
            <label className="text-sm text-gray-600">Dynamic Parameter (Slug/ID/Category etc.)</label>
            <Input placeholder="Enter value for {param}" value={slug} onChange={(e) => setSlug(e.target.value)} />
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-600">Query Params</label>
            <Button variant="outline" size="sm" className="cursor-pointer" onClick={addParam}>
              Add Param
            </Button>
          </div>
          <div className="space-y-2">
            {queryParams.map((p, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2">
                <Input
                  className="col-span-5"
                  placeholder="key"
                  value={p.key}
                  onChange={(e) => updateParam(idx, 'key', e.target.value)}
                />
                <Input
                  className="col-span-5"
                  placeholder="value"
                  value={p.value}
                  onChange={(e) => updateParam(idx, 'value', e.target.value)}
                />
                <Button className="col-span-2" variant="destructive" size="icon" onClick={() => removeParam(idx)}>
                  X
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-600">Bearer Token (optional)</label>
          <Input placeholder="Paste token here" value={bearer} onChange={(e) => setBearer(e.target.value)} />
        </div>

        {(method === 'POST' || method === 'PUT') && (
          <div className="space-y-2">
            <label className="text-sm text-gray-600">Request Body (JSON)</label>
            <Textarea
              placeholder='{"key": "value"}'
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="font-mono text-sm h-32"
            />
          </div>
        )}

        <div className="flex items-center gap-2 pt-4">
          <Button className="cursor-pointer min-w-[100px] primary" variant="outline" onClick={sendRequest} disabled={loading}>
            {loading ? 'Sending…' : `Send ${method}`}
          </Button>
          <Button variant="outline" className="cursor-pointer" onClick={clearAll}>
            Clear
          </Button>
          <a className="text-sm text-blue-600 underline ml-auto" href={finalUrl} target="_blank" rel="noreferrer">
            Open in new tab
          </a>
        </div>

        <div className="space-y-2">
          <div className="text-sm text-gray-600">Final URL</div>
          <div className="font-mono text-sm break-all bg-gray-50 p-2 rounded border">{finalUrl}</div>
        </div>

        <div className="space-y-2">
          <div className="text-sm text-gray-600">Status</div>
          <div className={`font-mono text-sm font-bold ${status.startsWith('2') ? 'text-green-600' : 'text-red-600'}`}>{status || '-'}</div>
        </div>

        <div className="space-y-2">
          <div className="text-sm text-gray-600">Response</div>
          <pre className="bg-gray-900 text-green-400 p-4 rounded border overflow-auto text-sm max-h-[600px] font-mono">{response || 'Waiting for response...'}</pre>
        </div>
      </div>
    </DashboardLayout>
  )
}

