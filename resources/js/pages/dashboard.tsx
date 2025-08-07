import { Card } from "@/components/ui/card";
import { Package, ShoppingCart, Users, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { useEffect } from "react";
import Swal from "sweetalert2";

const salesData = [
    { name: "Jan", sales: 2400, orders: 145 },
    { name: "Feb", sales: 1398, orders: 89 },
    { name: "Mar", sales: 9800, orders: 456 },
    { name: "Apr", sales: 3908, orders: 234 },
    { name: "May", sales: 4800, orders: 298 },
    { name: "Jun", sales: 3800, orders: 267 },
  ];

  const topProducts = [
    { name: "Wireless Headphones", sales: 1234, revenue: "₹24,680" },
    { name: "Smart Watch", sales: 987, revenue: "₹19,740" },
    { name: "Laptop Stand", sales: 756, revenue: "₹15,120" },
    { name: "Phone Case", sales: 654, revenue: "₹13,080" },
    { name: "Bluetooth Speaker", sales: 543, revenue: "₹10,860" },
  ];

const Dashboard = () => {
  useEffect(() => {
    // Check if this is the first visit to the dashboard in this session
    const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome');

    if (!hasSeenWelcome) {
      // Show welcome message
      Swal.fire({
        title: 'Welcome to Dashboard!',
        text: 'You have successfully logged in to your account',
        icon: 'success',
        timer: 5000,
        showConfirmButton: false
      });

      // Mark that we've shown the welcome message
      sessionStorage.setItem('hasSeenWelcome', 'true');
    }
  }, []);

  // Determine the current time in Asia/Kolkata timezone
  const currentTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  const hour = new Date(currentTime).getHours();
  let greeting;

  // Set greeting based on the hour of the day
  if (hour < 12) {
    greeting = "Good Morning!";
  } else if (hour < 18) {
    greeting = "Good Afternoon!";
  } else {
    greeting = "Good Evening!";
  }

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-8">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-primary">{greeting}</h1>
            <p className="text-secondary-foreground">Welcome back to your Admin Application</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="glass-card px-4 py-2 rounded-lg hover-scale">
                <TrendingUp className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="glass-card p-6">
            <div className="flex items-start justify-between">
              <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <h2 className="text-2xl font-bold">₹84,368.00</h2>
              <p className="text-sm text-green-600 flex items-center mt-2">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                +12.5% from last month
              </p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <h2 className="text-2xl font-bold">1,489</h2>
                <p className="text-sm text-green-600 flex items-center mt-2">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    +8.2% from last month
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <ShoppingCart className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-start justify-between">
              <div>
              <p className="text-sm text-muted-foreground">Total Products</p>
              <h2 className="text-2xl font-bold">2,847</h2>
              <p className="text-sm text-blue-600 flex items-center mt-2">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                +156 new products
              </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-full">
              <Package className="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="glass-card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Customers</p>
              <h2 className="text-2xl font-bold">5,628</h2>
              <p className="text-sm text-red-600 flex items-center mt-2">
                <ArrowDownRight className="h-4 w-4 mr-1" />
                -2.1% from last month
              </p>
            </div>
            <div className="p-2 bg-orange-100 rounded-full">
              <Users className="h-4 w-4 text-orange-600" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="glass-card p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Sales & Orders Overview</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                  <XAxis dataKey="name" stroke="#888888" />
                  <YAxis stroke="#888888" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#8989DE"
                    strokeWidth={2}
                    dot={false}
                    name="Sales (₹)"
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={false}
                  name="Orders"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">Top Selling Products</h3>
            <div className="space-y-4">
            {topProducts.slice(0, 5).map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-muted rounded-full">
                    <Package className="h-4 w-4" />
                    </div>
                    <div>
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.sales} units sold</p>
                    </div>
                  </div>
                  <p className="font-medium text-green-600 text-sm">{product.revenue}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">Monthly Sales Breakdown</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <XAxis dataKey="name" stroke="#888888" />
                <YAxis stroke="#888888" />
                <Tooltip />
                <Bar dataKey="sales" fill="#8989DE" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <ShoppingCart className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">New Order #1234</p>
                  <p className="text-sm text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <p className="font-medium text-green-600">+₹150.00</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Package className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Product Added</p>
                  <p className="text-sm text-muted-foreground">4 hours ago</p>
                </div>
              </div>
              <p className="font-medium text-blue-600">New Item</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-full">
                  <Users className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium">New Customer</p>
                  <p className="text-sm text-muted-foreground">6 hours ago</p>
                </div>
              </div>
              <p className="font-medium text-orange-600">Registration</p>
            </div>
          </div>
        </Card>
      </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
