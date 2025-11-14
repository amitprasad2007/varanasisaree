import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SimpleBarChart, SimplePieChart } from '@/components/ui/simple-chart';
import { FileText, FileChartColumn, Download, Calendar, Filter, BarChart3, PieChart } from 'lucide-react';
import { router } from '@inertiajs/react';

interface MethodBreakdown { method: string; count: number; total: number; }
interface StatusBreakdown { status: string; count: number; total: number; }
interface DayBreakdown { day: string; count: number; total: number; }
interface CustomerBreakdown { customer_name: string; customer_email: string; count: number; total: number; }
interface AmountRangeBreakdown { range: string; count: number; }

const RefundReport: React.FC<{ stats: any }> = ({ stats }) => {
  const [dateFrom, setDateFrom] = useState(stats?.filters?.date_from || '');
  const [dateTo, setDateTo] = useState(stats?.filters?.date_to || '');

  const handleDateFilter = () => {
    router.get(route('refunds.report'), {
      date_from: dateFrom,
      date_to: dateTo
    });
  };

  const handleExport = (type: 'summary' | 'detailed') => {
    const params = new URLSearchParams({
      date_from: dateFrom,
      date_to: dateTo,
      type: type
    });
    window.location.href = route('refunds.export') + '?' + params.toString();
  };
  
  return (
    <DashboardLayout title="Refund Analytics Report">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <FileChartColumn className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Refunds Analytics & Reports</h1>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => handleExport('summary')} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Summary
          </Button>
          <Button onClick={() => handleExport('detailed')} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Detailed
          </Button>
        </div>
      </div>

      {/* Date Filter */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Date Range Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="grid gap-2">
              <Label htmlFor="date_from">From Date</Label>
              <Input
                id="date_from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date_to">To Date</Label>
              <Input
                id="date_to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <Button onClick={handleDateFilter}>
              <Calendar className="h-4 w-4 mr-2" />
              Apply Filter
            </Button>
          </div>
        </CardContent>
      </Card>
      {!stats ? (<div>Loading analytics ...</div>) : (
        <div className="space-y-8">
          {/* Enhanced Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader><CardTitle>Total Refunds</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_refunds}</div>
                <div className="text-sm text-gray-500">All time</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Completed Amount</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl text-green-700 font-bold">₹{Number(stats.completed_amount || 0).toLocaleString()}</div>
                <div className="text-sm text-gray-500">Successfully processed</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Pending Amount</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl text-yellow-600 font-bold">₹{Number(stats.pending_amount || 0).toLocaleString()}</div>
                <div className="text-sm text-gray-500">Awaiting approval</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Average Refund</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl text-blue-700 font-bold">₹{Number(stats.average_refund || 0).toLocaleString()}</div>
                <div className="text-sm text-gray-500">Per transaction</div>
              </CardContent>
            </Card>
          </div>

          {/* Processing Time Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Average Approval Time</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.processing_time_stats?.avg_approval_time 
                    ? `${Math.round(stats.processing_time_stats.avg_approval_time)} hours`
                    : 'N/A'
                  }
                </div>
                <div className="text-sm text-gray-500">From request to approval</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Average Completion Time</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.processing_time_stats?.avg_completion_time 
                    ? `${Math.round(stats.processing_time_stats.avg_completion_time)} hours`
                    : 'N/A'
                  }
                </div>
                <div className="text-sm text-gray-500">From approval to completion</div>
              </CardContent>
            </Card>
          </div>

          {/* Data Visualizations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Refund Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SimplePieChart
                  data={stats.breakdown_by_status.map((s: StatusBreakdown, index: number) => ({
                    label: s.status.replace('_', ' ').toUpperCase(),
                    value: s.count,
                    color: s.status === 'completed' ? '#10b981' :
                           s.status === 'approved' ? '#3b82f6' :
                           s.status === 'pending' ? '#f59e0b' :
                           s.status === 'rejected' ? '#ef4444' :
                           s.status === 'processing' ? '#8b5cf6' :
                           '#6b7280'
                  }))}
                />
              </CardContent>
            </Card>

            {/* Method Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Refund Methods Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleBarChart
                  data={stats.breakdown_by_method.map((m: MethodBreakdown) => ({
                    label: m.method.replace('_', ' ').toUpperCase(),
                    value: m.count,
                    color: m.method === 'credit_note' ? 'bg-blue-600' :
                           m.method === 'money' ? 'bg-green-600' :
                           m.method === 'razorpay' ? 'bg-purple-600' :
                           'bg-gray-600'
                  }))}
                />
              </CardContent>
            </Card>
          </div>

          {/* Amount Range Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Refund Amount Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleBarChart
                data={stats.breakdown_by_amount_range?.map((range: AmountRangeBreakdown) => ({
                  label: range.range,
                  value: range.count,
                  color: 'bg-indigo-600'
                })) || []}
                height={150}
              />
            </CardContent>
          </Card>

          {/* By Method */}
          <Card>
            <CardHeader><CardTitle>Breakdown by Refund Method</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Method</TableHead>
                    <TableHead>Count</TableHead>
                    <TableHead>Total Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.breakdown_by_method.map((m: MethodBreakdown) => (
                    <TableRow key={m.method}>
                      <TableCell>{m.method.replace('_',' ').toUpperCase()}</TableCell>
                      <TableCell>{m.count}</TableCell>
                      <TableCell>₹{m.total}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* By Status */}
          <Card>
            <CardHeader><CardTitle>Breakdown by Status</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Count</TableHead>
                    <TableHead>Total Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.breakdown_by_status.map((s: StatusBreakdown) => (
                    <TableRow key={s.status}>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          s.status === 'completed' ? 'bg-green-100 text-green-800' :
                          s.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                          s.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          s.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          s.status === 'processing' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {s.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell>{s.count}</TableCell>
                      <TableCell>₹{Number(s.total || 0).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* New Breakdown Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* By Amount Range */}
            <Card>
              <CardHeader><CardTitle>Breakdown by Amount Range</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Amount Range</TableHead>
                      <TableHead>Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.breakdown_by_amount_range?.map((range: AmountRangeBreakdown, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{range.range}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{range.count}</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{
                                  width: `${(range.count / Math.max(...stats.breakdown_by_amount_range.map((r: AmountRangeBreakdown) => r.count))) * 100}%`
                                }}
                              ></div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* By Source */}
            <Card>
              <CardHeader><CardTitle>Breakdown by Source</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium">POS Sales</span>
                    <span className="text-lg font-bold text-blue-700">{stats.breakdown_by_source?.pos_sales || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">Online Orders</span>
                    <span className="text-lg font-bold text-green-700">{stats.breakdown_by_source?.online_orders || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Customers */}
          {stats.breakdown_by_customer && stats.breakdown_by_customer.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Top Customers (Multiple Refunds)</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Refund Count</TableHead>
                      <TableHead>Total Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.breakdown_by_customer.map((customer: CustomerBreakdown, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{customer.customer_name}</TableCell>
                        <TableCell className="text-gray-600">{customer.customer_email}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                            {customer.count} refunds
                          </span>
                        </TableCell>
                        <TableCell className="font-bold">₹{Number(customer.total).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* By Day */}
          <Card>
            <CardHeader><CardTitle>Refunds per Day (last 30 days)</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Total Count</TableHead>
                    <TableHead>Total Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.breakdown_by_day.map((d: DayBreakdown) => (
                    <TableRow key={d.day}>
                      <TableCell>{d.day}</TableCell>
                      <TableCell>{d.count}</TableCell>
                      <TableCell>₹{Number(d.total).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
};

export default RefundReport;
