
import { BarChart3, Database, TrendingUp, Activity } from "lucide-react";

const DataAnimation = () => {
  return (
    <div className="relative w-full h-32 overflow-hidden">
      {/* Fondo con grid animado */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_35%,hsl(var(--primary)/0.1)_35%,hsl(var(--primary)/0.1)_65%,transparent_65%)] bg-[length:20px_20px] animate-pulse" />
      </div>
      
      {/* Elementos flotantes */}
      <div className="absolute top-4 left-4 animate-float">
        <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-lg">
          <Database className="w-6 h-6 text-white" />
        </div>
      </div>
      
      <div className="absolute top-6 right-8 animate-float" style={{ animationDelay: '0.5s' }}>
        <div className="w-10 h-10 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center shadow-lg">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
      </div>
      
      <div className="absolute bottom-4 left-12 animate-float" style={{ animationDelay: '1s' }}>
        <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-lg">
          <TrendingUp className="w-4 h-4 text-white" />
        </div>
      </div>
      
      <div className="absolute bottom-6 right-4 animate-float" style={{ animationDelay: '1.5s' }}>
        <div className="w-11 h-11 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center shadow-lg">
          <Activity className="w-5 h-5 text-white" />
        </div>
      </div>
      
      {/* Líneas conectoras animadas */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.7" />
          </linearGradient>
        </defs>
        <path 
          d="M60 40 Q150 20 280 50" 
          stroke="url(#lineGradient)" 
          strokeWidth="2" 
          fill="none" 
          className="animate-pulse"
        />
        <path 
          d="M80 100 Q200 80 320 90" 
          stroke="url(#lineGradient)" 
          strokeWidth="2" 
          fill="none" 
          className="animate-pulse"
          style={{ animationDelay: '0.5s' }}
        />
      </svg>
    </div>
  );
};

export default DataAnimation;
