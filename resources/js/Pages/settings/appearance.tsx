import { Head, Link } from '@inertiajs/react';

import AppearanceTabs from '@/components/appearance-tabs';
import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';

import DashboardLayout from '@/Layouts/DashboardLayout';
import SettingsLayout from '@/layouts/settings/layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Appearance settings', href: route('appearance') },
];

export default function Appearance() {
    return (
        <DashboardLayout title="Appearance settings">
            <Head title="Appearance settings" />
            <div className="space-y-4 pb-6">
            <div className="flex items-center mb-6 justify-between">
          <h1 className="text-2xl font-bold">Appearance settings</h1>
          <Link href={route('dashboard')}>
            <Button className="flex items-center gap-2 bg-primary cursor-pointer hover:bg-gray-100 text-black shadow-sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        <Breadcrumbs breadcrumbs={breadcrumbs} />
        </div>
            <div className="bg-white rounded-md shadow-lg border border-gray-100 p-6">
                <div className="space-y-6">
                    <HeadingSmall title="Appearance settings" description="Update your account's appearance settings" />
                    <AppearanceTabs />
                </div>
            </div>
        </DashboardLayout>
    );
}
