import { Home,Barcode, Building, Settings, User, CreditCard, Bell,Captions,LogOutIcon  } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, usePage } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import Swal from 'sweetalert2';

const menuItems = [
  { icon: Home, label: "Dashboard", path: "/dashboard" },
  {
    icon: CreditCard,
    label: "Categories",
    path: "/categories",
    subItems: [
      { icon:Captions, label: "SubCategories", path: "/subcategories" }
    ]
  },
  { icon: Building, label: "Brands", path: "/brands" },
  { icon: Barcode, label: "Products", path: "/products",},
  { icon: User, label: "Profile", path: "/profile" },
  { icon: Settings, label: "Settings", path: "/settings" },
  { icon: LogOutIcon, label: "Logout", path: "/logout", isLogout: true },
];

const Sidebar = () => {
  const { url } = usePage();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();

    // Show confirmation dialog
    Swal.fire({
      title: 'Are you sure?',
      text: "You will be logged out of your account",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        // Show loading state
        const loadingAlert = Swal.fire({
          title: 'Logging out...',
          text: 'Please wait',
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false
        });

        // Perform logout
        router.post(route('logout'), {}, {
          onSuccess: () => {
            // Show success message
            Swal.fire({
              title: 'Logged Out!',
              text: 'You have been successfully logged out',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
          }
        });
      }
    });
  };

  return (
    <div className="fixed left-0 top-0 h-full w-64 glass-card border-r border-white/10">
      <div className="flex flex-col h-full">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-primary">Finance</h2>
        </div>

        <nav className="flex-1 px-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = url.startsWith(item.path);
              const isSubItemActive = item.subItems?.some(subItem =>
                url.startsWith(subItem.path)
              );

              return (
                <li key={item.path}>
                  {item.isLogout ? (
                    <button
                      onClick={handleLogout}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 cursor-pointer rounded-lg transition-all duration-200 w-full",
                        "hover:bg-white/35",
                        "text-secondary"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </button>
                  ) : (
                    <Link
                      href={item.path}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                        "hover:bg-white/35",
                        isActive ? "bg-white/35" : "text-secondary"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  )}
                  {item.subItems && (
                    <ul className="ml-9 mt-1 space-y-1">
                      {item.subItems.map((subItem) => (
                        <li key={subItem.path}>
                          <Link
                            href={subItem.path}
                            className={cn(
                              "flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm",
                              "hover:bg-white/35",
                              url.startsWith(subItem.path) ? "bg-white/35" : "text-secondary"
                            )}
                          > <subItem.icon className="h-5 w-5" />
                            {subItem.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 mt-auto">
          <div className="flex items-center gap-3 px-4 py-3">
            <User className="h-8 w-8 rounded-full bg-accent p-1" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">John Doe</span>
              <span className="text-xs text-secondary">Premium User</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;