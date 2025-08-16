import React, { useMemo, useState } from 'react'
import DashboardLayout from '@/Layouts/DashboardLayout'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { type BreadcrumbItem } from '@/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'


// Preset GET endpoints; extend as needed
const presetGetEndpoints = [
  { label: 'GET /api/testimonials', path: '/api/testimonials' },
  { label: 'GET /api/categories', path: '/api/categories' },
  { label: 'GET /api/featured-products', path: '/api/featured-products' },
  { label: 'GET /api/bestseller-products', path: '/api/bestseller-products' },
  { label: 'GET /api/getBanners', path: '/api/getBanners' },
  { label: 'GET /api/getheriBanner', path: '/api/getheriBanner' },
  { label: 'GET /api/getProductDetails/{slug}', path: '/api/getProductDetails/{slug}' },
  { label: 'GET /api/getRelatedProducts/{slug}', path: '/api/getRelatedProducts/{slug}' },
]

type QueryParam = { key: string; value: string }

export default function ApiIndex() {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'API Playground', href: route('api.playground') },
  ]

  const [baseUrl, setBaseUrl] = useState<string>(window.location.origin)
  const [selected, setSelected] = useState<string>(presetGetEndpoints[0]?.path ?? '')
  const [slug, setSlug] = useState<string>('')
  const [queryParams, setQueryParams] = useState<QueryParam[]>([])
  const [bearer, setBearer] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [status, setStatus] = useState<string>('')
  const [response, setResponse] = useState<string>('')

  const resolvedPath = useMemo(() => {
    if (selected.includes('{slug}')) return selected.replace('{slug}', slug || '')
    return selected
  }, [selected, slug])

  const finalUrl = useMemo(() => {
    const url = new URL(resolvedPath, baseUrl)
    for (const { key, value } of queryParams) {
      if (key) url.searchParams.append(key, value)
    }
    return url.toString()
  }, [baseUrl, resolvedPath, queryParams])

  const addParam = () => setQueryParams((prev) => [...prev, { key: '', value: '' }])
  const removeParam = (idx: number) => setQueryParams((prev) => prev.filter((_, i) => i !== idx))
  const updateParam = (idx: number, field: 'key' | 'value', value: string) =>
    setQueryParams((prev) => prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p)))

  const clearAll = () => {
    setSlug('')
    setQueryParams([])
    setBearer('')
    setResponse('')
    setStatus('')
  }

  const sendRequest = async () => {
    setLoading(true)
    setStatus('')
    setResponse('')
    try {
      const headers: Record<string, string> = { Accept: 'application/json' }
      if (bearer) headers['Authorization'] = `Bearer ${bearer}`
      const res = await fetch(finalUrl, { method: 'GET', headers })
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

  return (
    <DashboardLayout title="API Playground">
      <div className="space-y-4 pb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">API Playground</h1>
        </div>
        <Breadcrumbs breadcrumbs={breadcrumbs} />
      </div>

      <div className="bg-white rounded-md shadow-lg border border-gray-100 p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-600">Base URL</label>
            <Input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-600">Select GET Endpoint</label>
            <select
              className="border rounded px-2 py-2 text-sm w-full"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              {presetGetEndpoints.map((e) => (
                <option key={e.path} value={e.path}>
                  {e.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selected.includes('{slug}') && (
          <div className="space-y-2">
            <label className="text-sm text-gray-600">Slug</label>
            <Input placeholder="e.g., my-product-slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-600">Query Params</label>
            <Button variant="outline" className="cursor-pointer" onClick={addParam}>
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
                <Button className="col-span-2" variant="destructive" onClick={() => removeParam(idx)}>
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-600">Bearer Token (optional)</label>
          <Input placeholder="Paste token here" value={bearer} onChange={(e) => setBearer(e.target.value)} />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="cursor-pointer hover:bg-gray-100 text-black shadow-sm" onClick={sendRequest} disabled={loading}>
            {loading ? 'Sending…' : 'Send GET'}
          </Button>
          <Button variant="outline" className="cursor-pointer hover:bg-gray-100 text-black shadow-sm" onClick={clearAll}>
            Clear
          </Button>
          <a className="text-sm text-blue-600 underline" href={finalUrl} target="_blank" rel="noreferrer">
            Open in new tab
          </a>
        </div>

        <div className="space-y-2">
          <div className="text-sm text-gray-600">Final URL</div>
          <div className="font-mono text-sm break-all">{finalUrl}</div>
        </div>

        <div className="space-y-2">
          <div className="text-sm text-gray-600">Status</div>
          <div className="font-mono text-sm">{status || '-'}</div>
        </div>

        <div className="space-y-2">
          <div className="text-sm text-gray-600">Response</div>
          <pre className="bg-gray-50 p-3 rounded border overflow-auto text-sm max-h-[480px]">{response || ''}</pre>
        </div>
      </div>
    </DashboardLayout>
  )
}

