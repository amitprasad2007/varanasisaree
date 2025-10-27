import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, FileChartColumn } from 'lucide-react';

interface MethodBreakdown { method: string; count: number; total: number; }
interface StatusBreakdown { status: string; count: number; }
interface DayBreakdown { day: string; count: number; total: number; }

const RefundReport: React.FC<{ stats: any }> = ({ stats }) => {
  return (
    <DashboardLayout title="Refund Analytics Report">
      <div className="flex items-center mb-8 gap-2">
        <FileChartColumn className="h-7 w-7 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Refunds Analytics & Reports</h1>
      </div>
      {!stats ? (<div>Loading analytics ...</div>) : (
        <div className="space-y-8">
          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader><CardTitle>Total Refunds</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_refunds}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Total Complete Amount</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl text-green-700 font-bold">₹{stats.completed_amount}</div>
              </CardContent>
            </Card>
          </div>

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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.breakdown_by_status.map((s: StatusBreakdown) => (
                    <TableRow key={s.status}>
                      <TableCell>{s.status}</TableCell>
                      <TableCell>{s.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

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
                      <TableCell>₹{d.total}</TableCell>
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
