import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, Plus, ListTree } from 'lucide-react';
import Swal from 'sweetalert2';

interface AboutUsSection {
  id: number;
  aboutus_id: number;
  section_title: string;
  order: number;
  status: 'active' | 'inactive';
}

interface AboutUs {
  id: number;
  page_title: string;
  description: string | null;
  image: string | null;
  status: 'active' | 'inactive';
  sections?: AboutUsSection[];
}

interface Props {
  aboutus: AboutUs[];
}

const Index: React.FC<Props> = ({ aboutus }) => {
  const { delete: destroy } = useForm();

  const handleDelete = (id: number) => {

    Swal.fire({
        title: 'Are you sure?',
        text: "Are you sure you want to delete this about us?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
        destroy(route('aboutus.destroy', id), {
            onSuccess: () => {
            Swal.fire({
                title: 'Deleted!',
                text: 'Your About Us has been deleted.',
                icon: 'success',
                timer: 3000,
                showConfirmButton: false
            });
            }
        });
        }
    });

  };

  return (
    <DashboardLayout title="About Us">
      <Head title="About Us" />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">About Us</h1>
        <Link href={route('aboutus.create')}>
          <Button className="cursor-pointer">
            <Plus className="h-4 w-4 mr-2" /> New
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sections</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {aboutus.map((a) => (
              <TableRow key={a.id}>
                <TableCell>{a.id}</TableCell>
                <TableCell>{a.page_title}</TableCell>
                <TableCell>{a.status}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{a.sections?.length ?? 0}</span>
                    <Link href={route('aboutus.sections.index', a.id)}>
                      <Button variant="outline" size="sm" className="cursor-pointer">
                        <ListTree className="h-4 w-4 mr-1" /> Manage
                      </Button>
                    </Link>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Link href={route('aboutus.edit', a.id)}>
                      <Button variant="outline" size="sm" className="cursor-pointer">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(a.id)} className="cursor-pointer text-red-600">
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


