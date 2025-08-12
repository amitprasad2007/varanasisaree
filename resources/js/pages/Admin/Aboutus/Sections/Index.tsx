import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, Plus } from 'lucide-react';

interface AboutUs {
  id: number;
  page_title: string;
}

interface Section {
  id: number;
  section_title: string;
  order: number;
  status: 'active' | 'inactive';
}

interface Props {
  aboutus: AboutUs;
  sections: Section[];
}

const Index: React.FC<Props> = ({ aboutus, sections }) => {
  const { delete: destroy } = useForm();
  const handleDelete = (id: number) => {
    destroy(route('aboutus.sections.destroy', { aboutus: aboutus.id, section: id }));
  };

  return (
    <DashboardLayout title={`Sections - ${aboutus.page_title}`}>
      <Head title={`Sections - ${aboutus.page_title}`} />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Sections</h1>
        <Link href={route('aboutus.sections.create', aboutus.id)}>
          <Button className="cursor-pointer">
            <Plus className="h-4 w-4 mr-2" /> New Section
          </Button>
        </Link>
      </div>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sections.map((s) => (
              <TableRow key={s.id}>
                <TableCell>{s.id}</TableCell>
                <TableCell>{s.section_title}</TableCell>
                <TableCell>{s.order}</TableCell>
                <TableCell>{s.status}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Link href={route('aboutus.sections.edit', { aboutus: aboutus.id, section: s.id })}>
                      <Button variant="outline" size="sm" className="cursor-pointer">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(s.id)} className="cursor-pointer text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DashboardLayout>
  );
};

export default Index;


