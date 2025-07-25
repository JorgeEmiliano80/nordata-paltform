import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, MoreVertical, Plus, Clock, CheckCircle, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";

const PipelinesPage = () => {
  const pipelines = [
    {
      id: 1,
      name: "Sales Data ETL",
      status: "running",
      lastRun: "2 minutes ago",
      success: 245,
      failed: 2,
      duration: "3.2s"
    },
    {
      id: 2,
      name: "Customer Analytics",
      status: "completed",
      lastRun: "1 hour ago",
      success: 189,
      failed: 0,
      duration: "1.8s"
    },
    {
      id: 3,
      name: "Inventory Sync",
      status: "failed",
      lastRun: "3 hours ago",
      success: 156,
      failed: 12,
      duration: "5.1s"
    },
    {
      id: 4,
      name: "Marketing Metrics",
      status: "paused",
      lastRun: "1 day ago",
      success: 78,
      failed: 1,
      duration: "2.4s"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running": return "bg-data-flow text-primary-foreground";
      case "completed": return "bg-success text-primary-foreground";
      case "failed": return "bg-error text-primary-foreground";
      case "paused": return "bg-warning text-primary-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running": return <Play className="w-3 h-3" />;
      case "completed": return <CheckCircle className="w-3 h-3" />;
      case "failed": return <AlertCircle className="w-3 h-3" />;
      case "paused": return <Pause className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Data Pipelines</h1>
              <p className="text-muted-foreground">
                Manage and monitor your data processing workflows
              </p>
            </div>
            <Button variant="hero" className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Create Pipeline</span>
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Pipelines</p>
                    <p className="text-2xl font-bold">24</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Play className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Running</p>
                    <p className="text-2xl font-bold text-data-flow">8</p>
                  </div>
                  <div className="w-12 h-12 bg-data-flow/10 rounded-lg flex items-center justify-center">
                    <Play className="w-6 h-6 text-data-flow" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold text-success">15</p>
                  </div>
                  <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Failed</p>
                    <p className="text-2xl font-bold text-error">1</p>
                  </div>
                  <div className="w-12 h-12 bg-error/10 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-error" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pipelines List */}
          <Card>
            <CardHeader>
              <CardTitle>Active Pipelines</CardTitle>
              <CardDescription>
                Monitor and manage your data processing pipelines
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pipelines.map((pipeline) => (
                  <div key={pipeline.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/5 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                        <Play className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{pipeline.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Last run: {pipeline.lastRun}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          Success: <span className="text-success">{pipeline.success}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Failed: <span className="text-error">{pipeline.failed}</span>
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm font-medium">{pipeline.duration}</p>
                        <p className="text-xs text-muted-foreground">avg time</p>
                      </div>

                      <Badge className={`${getStatusColor(pipeline.status)} flex items-center space-x-1`}>
                        {getStatusIcon(pipeline.status)}
                        <span className="capitalize">{pipeline.status}</span>
                      </Badge>

                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PipelinesPage;