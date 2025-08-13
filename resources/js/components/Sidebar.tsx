import {
  Home,
  Barcode,
  Building,
  Settings,
  User,
  Captions,
  LogOutIcon,
  Video,
  Image,
  BadgePercent,
  MessageSquare,
  Palette,
  Ruler,
  FileText,
  Key
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, usePage } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import React, { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { Card } from "./ui/card";

type MenuItem = {
  icon: React.ComponentType<any>;
  label: string;
  path: string;
  isLogout?: boolean;
  subItems?: Array<{ icon: React.ComponentType<any>; label: string; path: string }>;
};

type MenuSection = {
  label: string;
  items: MenuItem[];
};

const Sidebar = () => {
  const { url, props } = usePage();
  const auth = (props as any)?.auth;
  const aboutusId = (props as any)?.aboutusId;

  const sections: MenuSection[] = useMemo(() => ([
    {
      label: 'Overview',
      items: [
        { icon: Home, label: 'Dashboard', path: '/dashboard' },
        
      ],
    },
    {
      label: 'Catalog',
      items: [
        { icon: Image, label: 'Banners', path: '/banners' },
        { icon: Building, label: 'Brands', path: '/brands' },
        { icon: Barcode, label: 'Products', path: '/products' },
        { icon: FileText, label: 'Product Bulk Upload', path: '/products/bulkupload' },
        { icon: Palette, label: 'Colors', path: '/colors' },
        { icon: Ruler, label: 'Sizes', path: '/sizes' },
				{
					icon: FileText,
					label: 'About Us',
					path: '/aboutus',
					subItems: [
						{ icon: FileText, label: 'Sections', path: aboutusId ? `/aboutus/${aboutusId}/sections` : '/aboutus' },
					],
				},
        {
          icon: Captions,
          label: 'Categories',
          path: '/categories',
          subItems: [
            { icon: Captions, label: 'Subcategories', path: '/subcategories' },
          ],
        },
      ],
    },
    {
      label: 'Marketing',
      items: [
        { icon: BadgePercent, label: 'Coupons', path: '/coupons' },
        { icon: MessageSquare, label: 'Testimonials', path: '/testimonials' },
        { icon: Video, label: 'Video Providers', path: '/video-providers' },
      ],
    },
    {
      label: 'Access Control',
      items: [
        { icon: User, label: 'User Management', path: '/users' },
        { icon: User, label: 'Roles', path: '/roles' },
        { icon: User, label: 'Permissions', path: '/permissions' },
      ],
    },
    {
      label: 'Account',
      items: [
        {
          icon: Settings,
          label: 'Settings',
          path: '/settings',
          subItems: [
            { icon: User, label: 'Profile', path: route('profile.edit') },
            { icon: Key, label: 'Password', path: route('password.edit') },
            { icon: Palette, label: 'Appearance', path: route('appearance') },
          ],
        },
        { icon: LogOutIcon, label: 'Logout', path: '/logout', isLogout: true },
      ],
    },
  ]), []);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Auto-open section containing current url
    const next: Record<string, boolean> = {};
    sections.forEach((section) => {
      next[section.label] = section.items.some((item) => {
        const active = url.startsWith(item.path) || item.subItems?.some((s) => url.startsWith(s.path));
        return active;
      });
    });
    setOpenSections((prev) => ({ ...prev, ...next }));
  }, [url, sections]);

  const toggleSection = (label: string) => {
    setOpenSections((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    Swal.fire({
      title: 'Logout?',
      text: 'You will be logged out of your account.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Logout',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        router.post(route('logout'));
      }
    });
  };

  const renderItem = (item: MenuItem) => {
    const Icon = item.icon;
    const isActive = url.startsWith(item.path) || item.subItems?.some((s) => url.startsWith(s.path));
    if (item.isLogout) {
      return (
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm transition-colors',
            'text-muted-foreground hover:text-foreground hover:bg-accent/20'
          )}
        >
          <Icon className="h-4 w-4" />
          <span>{item.label}</span>
        </button>
      );
    }
    return (
      <div>
        <Link
          href={item.path}
          className={cn(
            'flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
            isActive
              ? 'text-foreground font-semibold bg-accent/20 border border-accent/30 shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/10'
          )}
          aria-current={isActive ? 'page' : undefined}
        >
          <Icon className="h-4 w-4" />
          <span>{item.label}</span>
        </Link>
        {item.subItems && (
          <ul className="ml-6 mt-1 space-y-1">
            {item.subItems.map((sub) => (
              <li key={sub.path}>
                <Link
                  href={sub.path}
                  className={cn(
                    'flex w-full items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors',
                    url.startsWith(sub.path)
                      ? 'text-foreground bg-accent/10 border border-accent/20 shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/10'
                  )}
                  aria-current={url.startsWith(sub.path) ? 'page' : undefined}
                >
                  <sub.icon className="h-3.5 w-3.5" />
                  <span>{sub.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <Card className="fixed left-3 top-3 bottom-3 border-none rounded-lg w-68 bg-white text-foreground font-sans shadow-sm">
      <div className="flex h-full flex-col">
        {/* Brand */}
        <div className="px-5 pb-4 pt-5 bg-card">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">VS</div>
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-semibold">Admin</span>
              <span className="text-[11px] text-muted-foreground">VaranasiSaree</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {sections.map((section) => (
            <div key={section.label}>
              <button
                onClick={() => toggleSection(section.label)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs uppercase tracking-wide text-muted-foreground hover:text-foreground"
              >
                <span>{section.label}</span>
                <span className={cn('transition-transform', openSections[section.label] ? 'rotate-90' : '')}>›</span>
              </button>
              {openSections[section.label] && (
                <ul className="mt-2 space-y-2">
                  {section.items.map((item) => (
                    <li key={item.path}>{renderItem(item)}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </nav>

        {/* User Card */}
        <div className="mt-auto bg-card p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-base font-semibold">
              {auth?.user?.name ? String(auth.user.name).charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0">
              <div className="truncate text-base font-medium">{auth?.user?.name ?? 'User'}</div>
              <div className="truncate text-xs text-muted-foreground">{auth?.user?.email ?? ''}</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default Sidebar;
