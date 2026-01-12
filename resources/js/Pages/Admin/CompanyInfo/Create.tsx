import React from 'react';
import { useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Label } from "@/components/ui/label";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { type BreadcrumbItem } from '@/types';
import { Building2, Globe, Phone, Mail, Calendar, Clock } from 'lucide-react';
import Swal from "sweetalert2";

export default function Create() {
  const { data, setData, post, processing, errors } = useForm({
    company_name: '',
    gst_number: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    phone: '',
    email: '',
    support_email: '',
    facebook_url: '',
    instagram_url: '',
    youtube_url: '',
    twitter_url: '',
    linkedin_url: '',
    whatsapp_number: '',
    about_text: '',
    founded_year: '',
    business_hours: '',
    logo: null as File | null,
    additional_data: '',
  });

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Company Information', href: route('company-info.index') },
    { title: 'Create', href: route('company-info.create') },
  ];

  const [logoPreview, setLogoPreview] = React.useState<string | null>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setData('logo', file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setLogoPreview(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    post(route('company-info.store'), {
      onSuccess: () => {
        Swal.fire({
          title: 'Success!',
          text: 'Company information created successfully',
          icon: 'success',
          timer: 4000,
          showConfirmButton: false
        });
      }
    });
  };

  return (
    <DashboardLayout title="Create Company Information">
      <div className="space-y-4 pb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Create Company Information</h1>
        </div>
        <Breadcrumbs breadcrumbs={breadcrumbs} />
      </div>

      <div className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Primary company details and contact information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name *</Label>
                  <Input
                    id="company_name"
                    value={data.company_name}
                    onChange={e => setData('company_name', e.target.value)}
                    placeholder="Enter company name"
                  />
                  {errors.company_name && <p className="text-sm text-red-600">{errors.company_name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gst_number">GST Number</Label>
                  <Input
                    id="gst_number"
                    value={data.gst_number}
                    onChange={e => setData('gst_number', e.target.value)}
                    placeholder="Enter GST number"
                  />
                  {errors.gst_number && <p className="text-sm text-red-600">{errors.gst_number}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  value={data.address}
                  onChange={e => setData('address', e.target.value)}
                  placeholder="Enter company address"
                  rows={3}
                />
                {errors.address && <p className="text-sm text-red-600">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={data.city}
                    onChange={e => setData('city', e.target.value)}
                    placeholder="City"
                  />
                  {errors.city && <p className="text-sm text-red-600">{errors.city}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={data.state}
                    onChange={e => setData('state', e.target.value)}
                    placeholder="State"
                  />
                  {errors.state && <p className="text-sm text-red-600">{errors.state}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    value={data.country}
                    onChange={e => setData('country', e.target.value)}
                    placeholder="Country"
                  />
                  {errors.country && <p className="text-sm text-red-600">{errors.country}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postal_code">Postal Code *</Label>
                  <Input
                    id="postal_code"
                    value={data.postal_code}
                    onChange={e => setData('postal_code', e.target.value)}
                    placeholder="Postal Code"
                  />
                  {errors.postal_code && <p className="text-sm text-red-600">{errors.postal_code}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo">Company Logo</Label>
                <div className="space-y-4">
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                  />
                  {logoPreview && (
                    <div className="relative group">
                      <img
                        src={logoPreview}
                        alt="Company Logo"
                        className="w-32 h-32 object-contain rounded-md border transition-all duration-300 group-hover:w-40 group-hover:h-40 group-hover:shadow-lg group-hover:z-20 group-hover:relative"
                      />
                    </div>
                  )}
                </div>
                {errors.logo && <p className="text-sm text-red-600">{errors.logo}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Information
              </CardTitle>
              <CardDescription>
                Phone numbers and email addresses for customer contact.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={data.phone}
                    onChange={e => setData('phone', e.target.value)}
                    placeholder="Enter phone number"
                  />
                  {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
                  <Input
                    id="whatsapp_number"
                    value={data.whatsapp_number}
                    onChange={e => setData('whatsapp_number', e.target.value)}
                    placeholder="Enter WhatsApp number"
                  />
                  {errors.whatsapp_number && <p className="text-sm text-red-600">{errors.whatsapp_number}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={data.email}
                    onChange={e => setData('email', e.target.value)}
                    placeholder="Enter email address"
                  />
                  {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="support_email">Support Email</Label>
                  <Input
                    id="support_email"
                    type="email"
                    value={data.support_email}
                    onChange={e => setData('support_email', e.target.value)}
                    placeholder="Enter support email"
                  />
                  {errors.support_email && <p className="text-sm text-red-600">{errors.support_email}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Media */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Social Media
              </CardTitle>
              <CardDescription>
                Social media profiles and online presence.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="facebook_url">Facebook URL</Label>
                  <Input
                    id="facebook_url"
                    value={data.facebook_url}
                    onChange={e => setData('facebook_url', e.target.value)}
                    placeholder="https://facebook.com/company"
                  />
                  {errors.facebook_url && <p className="text-sm text-red-600">{errors.facebook_url}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagram_url">Instagram URL</Label>
                  <Input
                    id="instagram_url"
                    value={data.instagram_url}
                    onChange={e => setData('instagram_url', e.target.value)}
                    placeholder="https://instagram.com/company"
                  />
                  {errors.instagram_url && <p className="text-sm text-red-600">{errors.instagram_url}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitter_url">Twitter URL</Label>
                  <Input
                    id="twitter_url"
                    value={data.twitter_url}
                    onChange={e => setData('twitter_url', e.target.value)}
                    placeholder="https://twitter.com/company"
                  />
                  {errors.twitter_url && <p className="text-sm text-red-600">{errors.twitter_url}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                  <Input
                    id="linkedin_url"
                    value={data.linkedin_url}
                    onChange={e => setData('linkedin_url', e.target.value)}
                    placeholder="https://linkedin.com/company/company"
                  />
                  {errors.linkedin_url && <p className="text-sm text-red-600">{errors.linkedin_url}</p>}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="youtube_url">YouTube URL</Label>
                  <Input
                    id="youtube_url"
                    value={data.youtube_url}
                    onChange={e => setData('youtube_url', e.target.value)}
                    placeholder="https://youtube.com/channel/company"
                  />
                  {errors.youtube_url && <p className="text-sm text-red-600">{errors.youtube_url}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Additional Information
              </CardTitle>
              <CardDescription>
                Company history, business hours, and other details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="about_text">About Company</Label>
                <Textarea
                  id="about_text"
                  value={data.about_text}
                  onChange={e => setData('about_text', e.target.value)}
                  placeholder="Write about your company..."
                  rows={4}
                />
                {errors.about_text && <p className="text-sm text-red-600">{errors.about_text}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="founded_year">Founded Year</Label>
                  <Input
                    id="founded_year"
                    type="number"
                    value={data.founded_year}
                    onChange={e => setData('founded_year', e.target.value)}
                    placeholder="2023"
                    min="1800"
                    max={new Date().getFullYear()}
                  />
                  {errors.founded_year && <p className="text-sm text-red-600">{errors.founded_year}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business_hours">Business Hours</Label>
                  <Input
                    id="business_hours"
                    value={data.business_hours}
                    onChange={e => setData('business_hours', e.target.value)}
                    placeholder="Mon-Fri 9:00 AM - 6:00 PM"
                  />
                  {errors.business_hours && <p className="text-sm text-red-600">{errors.business_hours}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="additional_data">Additional Data (JSON)</Label>
                <Textarea
                  id="additional_data"
                  value={data.additional_data}
                  onChange={e => setData('additional_data', e.target.value)}
                  placeholder='{"key": "value"}'
                  rows={4}
                />
                <p className="text-sm text-gray-500">Optional: Enter additional data as JSON format</p>
                {errors.additional_data && <p className="text-sm text-red-600">{errors.additional_data}</p>}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button 
              variant="outline" 
              type="submit" 
              className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" 
              disabled={processing}
            >
              Save Company Information
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
