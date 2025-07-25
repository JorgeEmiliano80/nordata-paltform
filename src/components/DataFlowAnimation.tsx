import { Database, ArrowRight, BarChart3 } from "lucide-react";

const DataFlowAnimation = () => {
  return (
    <div className="flex items-center justify-center space-x-8 my-12">
      {/* Data Source */}
      <div className="flex flex-col items-center space-y-2">
        <div className="w-16 h-16 bg-card border border-border rounded-lg flex items-center justify-center animate-float">
          <Database className="w-8 h-8 text-data-flow" />
        </div>
        <span className="text-sm text-muted-foreground">Data Source</span>
      </div>

      {/* Flow Animation */}
      <div className="relative w-24 h-2">
        <div className="absolute inset-0 bg-border rounded-full"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-data-flow to-primary rounded-full animate-data-flow"></div>
        <ArrowRight className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
      </div>

      {/* Processing */}
      <div className="flex flex-col items-center space-y-2">
        <div className="w-16 h-16 bg-card border border-border rounded-lg flex items-center justify-center animate-pulse-glow" style={{ animationDelay: '0.5s' }}>
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded"></div>
        </div>
        <span className="text-sm text-muted-foreground">Process</span>
      </div>

      {/* Flow Animation 2 */}
      <div className="relative w-24 h-2">
        <div className="absolute inset-0 bg-border rounded-full"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full animate-data-flow" style={{ animationDelay: '1s' }}></div>
        <ArrowRight className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
      </div>

      {/* Analytics */}
      <div className="flex flex-col items-center space-y-2">
        <div className="w-16 h-16 bg-card border border-border rounded-lg flex items-center justify-center animate-float" style={{ animationDelay: '1s' }}>
          <BarChart3 className="w-8 h-8 text-accent" />
        </div>
        <span className="text-sm text-muted-foreground">Analytics</span>
      </div>
    </div>
  );
};

export default DataFlowAnimation;