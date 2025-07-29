
import { Brain, Zap, Network, TrendingUp, Database, BarChart3 } from "lucide-react";

const BrainAnimation = () => {
  return (
    <div className="relative w-96 h-96 flex items-center justify-center">
      {/* Central Brain */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-xl animate-pulse-glow">
          <Brain className="w-10 h-10 text-white" />
        </div>
      </div>

      {/* Data Points */}
      <div className="absolute top-8 left-16 animate-float">
        <div className="w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center shadow-lg">
          <Database className="w-6 h-6 text-white" />
        </div>
      </div>

      <div className="absolute top-8 right-16 animate-float" style={{ animationDelay: '0.5s' }}>
        <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-lg">
          <BarChart3 className="w-6 h-6 text-white" />
        </div>
      </div>

      <div className="absolute bottom-8 left-16 animate-float" style={{ animationDelay: '1s' }}>
        <div className="w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center shadow-lg">
          <Network className="w-6 h-6 text-white" />
        </div>
      </div>

      <div className="absolute bottom-8 right-16 animate-float" style={{ animationDelay: '1.5s' }}>
        <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-lg">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
      </div>

      <div className="absolute top-1/2 left-4 transform -translate-y-1/2 animate-float" style={{ animationDelay: '2s' }}>
        <div className="w-10 h-10 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center shadow-lg">
          <Zap className="w-5 h-5 text-white" />
        </div>
      </div>

      <div className="absolute top-1/2 right-4 transform -translate-y-1/2 animate-float" style={{ animationDelay: '2.5s' }}>
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-lg">
          <Zap className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Connecting Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <linearGradient id="brainGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
            <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.8" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Lines connecting to brain */}
        <path 
          d="M 80 56 Q 120 80 192 192" 
          stroke="url(#brainGradient)" 
          strokeWidth="2" 
          fill="none" 
          className="animate-pulse"
          filter="url(#glow)"
        />
        <path 
          d="M 320 56 Q 280 80 208 192" 
          stroke="url(#brainGradient)" 
          strokeWidth="2" 
          fill="none" 
          className="animate-pulse"
          style={{ animationDelay: '0.5s' }}
          filter="url(#glow)"
        />
        <path 
          d="M 80 340 Q 120 320 192 208" 
          stroke="url(#brainGradient)" 
          strokeWidth="2" 
          fill="none" 
          className="animate-pulse"
          style={{ animationDelay: '1s' }}
          filter="url(#glow)"
        />
        <path 
          d="M 320 340 Q 280 320 208 208" 
          stroke="url(#brainGradient)" 
          strokeWidth="2" 
          fill="none" 
          className="animate-pulse"
          style={{ animationDelay: '1.5s' }}
          filter="url(#glow)"
        />
        <path 
          d="M 40 200 Q 100 180 180 192" 
          stroke="url(#brainGradient)" 
          strokeWidth="2" 
          fill="none" 
          className="animate-pulse"
          style={{ animationDelay: '2s' }}
          filter="url(#glow)"
        />
        <path 
          d="M 360 200 Q 300 180 220 192" 
          stroke="url(#brainGradient)" 
          strokeWidth="2" 
          fill="none" 
          className="animate-pulse"
          style={{ animationDelay: '2.5s' }}
          filter="url(#glow)"
        />
        
        {/* Neural network style connections */}
        <path 
          d="M 80 56 Q 200 30 320 56" 
          stroke="url(#brainGradient)" 
          strokeWidth="1" 
          fill="none" 
          className="animate-pulse"
          style={{ animationDelay: '3s' }}
          filter="url(#glow)"
        />
        <path 
          d="M 80 340 Q 200 370 320 340" 
          stroke="url(#brainGradient)" 
          strokeWidth="1" 
          fill="none" 
          className="animate-pulse"
          style={{ animationDelay: '3.5s' }}
          filter="url(#glow)"
        />
        <path 
          d="M 40 200 Q 200 160 360 200" 
          stroke="url(#brainGradient)" 
          strokeWidth="1" 
          fill="none" 
          className="animate-pulse"
          style={{ animationDelay: '4s' }}
          filter="url(#glow)"
        />
      </svg>

      {/* Data particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.7s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-primary rounded-full animate-pulse" style={{ animationDelay: '1.2s' }} />
        <div className="absolute bottom-1/3 right-1/4 w-1 h-1 bg-accent rounded-full animate-pulse" style={{ animationDelay: '1.7s' }} />
      </div>
    </div>
  );
};

export default BrainAnimation;
