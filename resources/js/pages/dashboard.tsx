
import { Card } from "@/Components/ui/card";
import { DollarSign, PieChart, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import DashboardLayout from "@/Layouts/DashboardLayout";

const data = [
  { name: "Jan", value: 2400 },
  { name: "Feb", value: 1398 },
  { name: "Mar", value: 9800 },
  { name: "Apr", value: 3908 },
  { name: "May", value: 4800 },
  { name: "Jun", value: 3800 },
];

const Dashboard = () => {
  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-8">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-primary">Good Morning!</h1>
            <p className="text-secondary-foreground">Welcome back to your financial overview</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="glass-card px-4 py-2 rounded-lg hover-scale">
              <DollarSign className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-card p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Balance</p>
                <h2 className="text-2xl font-bold">$24,563.00</h2>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <ArrowUpRight className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Income</p>
                <h2 className="text-2xl font-bold">$8,350.00</h2>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <DollarSign className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Expenses</p>
                <h2 className="text-2xl font-bold">$3,628.00</h2>
              </div>
              <div className="p-2 bg-red-100 rounded-full">
                <ArrowDownRight className="h-4 w-4 text-red-600" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="glass-card p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Spending Overview</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <XAxis dataKey="name" stroke="#888888" />
                  <YAxis stroke="#888888" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#8989DE"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-muted rounded-full">
                      <PieChart className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">Shopping</p>
                      <p className="text-sm text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                  <p className="font-medium text-red-500">-$150.00</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
