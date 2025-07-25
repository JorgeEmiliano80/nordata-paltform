import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Database, Users, Clock, BarChart3, Activity } from "lucide-react";
import DataFlowAnimation from "@/components/DataFlowAnimation";
import Navbar from "@/components/Navbar";

const Dashboard = () => {
  const metrics = [
    { title: "Total Data Processed", value: "2.4TB", change: "+12%", icon: Database, color: "text-data-flow" },
    { title: "Active Pipelines", value: "24", change: "+3", icon: Activity, color: "text-primary" },
    { title: "Processing Time", value: "1.2s", change: "-0.3s", icon: Clock, color: "text-accent" },
    { title: "Success Rate", value: "99.8%", change: "+0.2%", icon: TrendingUp, color: "text-success" },
  ];

  const recentActivity = [
    { type: "Pipeline Created", name: "Customer Segmentation", time: "2 minutes ago", status: "success" },
    { type: "Data Processed", name: "Sales Report Q4", time: "15 minutes ago", status: "success" },
    { type: "Alert", name: "High Memory Usage", time: "1 hour ago", status: "warning" },
    { type: "Pipeline Completed", name: "Inventory Sync", time: "2 hours ago", status: "success" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor your data processing platform performance and insights
            </p>
          </div>

          {/* Data Flow Animation */}
          <Card className="mb-8 overflow-hidden">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Real-time Data Flow</h2>
                <p className="text-muted-foreground">Live visualization of your data pipeline</p>
              </div>
              <DataFlowAnimation />
            </CardContent>
          </Card>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {metrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-opacity-10 ${metric.color.replace('text-', 'bg-')}/10`}>
                        <Icon className={`w-6 h-6 ${metric.color}`} />
                      </div>
                      <span className={`text-sm font-medium ${metric.change.startsWith('+') ? 'text-success' : metric.change.startsWith('-') ? 'text-error' : 'text-muted-foreground'}`}>
                        {metric.change}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-1">{metric.value}</h3>
                      <p className="text-sm text-muted-foreground">{metric.title}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Chart Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Processing Volume</span>
                </CardTitle>
                <CardDescription>Data processed over the last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg flex items-center justify-center border border-border">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Chart visualization coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Recent Activity</span>
                </CardTitle>
                <CardDescription>Latest events in your data platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 border border-border rounded-lg">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.status === 'success' ? 'bg-success' : 
                        activity.status === 'warning' ? 'bg-warning' : 'bg-error'
                      }`}></div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.type}</p>
                        <p className="text-sm text-muted-foreground">{activity.name}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Activity
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks to get you started</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="hero" className="h-auto p-6 flex flex-col items-center space-y-3">
                  <Database className="w-8 h-8" />
                  <div className="text-center">
                    <p className="font-semibold">Upload Data</p>
                    <p className="text-sm opacity-90">Start processing new datasets</p>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto p-6 flex flex-col items-center space-y-3">
                  <Activity className="w-8 h-8" />
                  <div className="text-center">
                    <p className="font-semibold">Create Pipeline</p>
                    <p className="text-sm text-muted-foreground">Build new data workflows</p>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto p-6 flex flex-col items-center space-y-3">
                  <BarChart3 className="w-8 h-8" />
                  <div className="text-center">
                    <p className="font-semibold">View Analytics</p>
                    <p className="text-sm text-muted-foreground">Analyze processing insights</p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;