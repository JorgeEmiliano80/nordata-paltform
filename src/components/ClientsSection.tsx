import { Card, CardContent } from '@/components/ui/card';

const ClientsSection = () => {
  const clients = [
    {
      name: "Starfly Empresa Aérea",
      logo: "/lovable-uploads/9d59e48a-a65c-40af-8cf1-18a0437e602e.png",
      alt: "Starfly Logo",
      description: "Industria Aérea"
    },
    {
      name: "EcoAutomotores",
      logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjUwIiBmaWxsPSIjMjJjNTVlIi8+CjxwYXRoIGQ9Ik0yNSAzNUw0MCAyNUw2MCAyNUw3NSAzNUw3NSA0NUw2MCA1NUw0MCA1NUwyNSA0NUwyNSAzNVoiIGZpbGw9IndoaXRlIi8+CjxjaXJjbGUgY3g9IjMwIiBjeT0iNjUiIHI9IjgiIGZpbGw9IndoaXRlIi8+CjxjaXJjbGUgY3g9IjcwIiBjeT0iNjUiIHI9IjgiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0zNSA0MEM0MCA0MCA2MCA0MCA2NSA0MEw2MCA0NUw0MCA0NUwzNSA0MFoiIGZpbGw9IiMyMmM1NWUiLz4KPHRleHQgeD0iNTAiIHk9IjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSI3IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtd2VpZ2h0PSJib2xkIj5FQ088L3RleHQ+Cjx0ZXh0IHg9IjUwIiB5PSI4OCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iNiIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIj5BVVRPUzwvdGV4dD4KPC9zdmc+",
      alt: "EcoAutomotores Logo",
      description: "Industria Automotriz"
    },
    {
      name: "Rural Ruta 8",
      logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiByeD0iMTUiIGZpbGw9IiM0ZmFmNGEiLz4KPHBhdGggZD0iTTIwIDMwSDgwVjQ1SDY1VjcwSDUwVjU1SDM1VjcwSDIwVjU1SDM1VjQ1SDIwVjMwWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTQwIDIwQzQ1IDIwIDQ1IDI1IDUwIDI1QzU1IDI1IDU1IDIwIDYwIDIwQzYwIDMwIDU1IDMwIDUwIDMwQzQ1IDMwIDQwIDMwIDQwIDIwWiIgZmlsbD0iIzIyYzU1ZSIvPgo8Y2lyY2xlIGN4PSIzMCIgY3k9IjM3IiByPSI0IiBmaWxsPSIjZmZkNzAwIi8+CjxjaXJjbGUgY3g9IjcwIiBjeT0iMzciIHI9IjQiIGZpbGw9IiNmZmQ3MDAiLz4KPGNpcmNsZSBjeD0iNTAiIGN5PSI2MiIgcj0iNSIgZmlsbD0iI2ZmZDcwMCIvPgo8dGV4dCB4PSI1MCIgeT0iODUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjgiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9ImJvbGQiPlJVUkFMPC90ZXh0Pgo8dGV4dCB4PSI1MCIgeT0iOTMiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjciIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiI+UlVUQSA4PC90ZXh0Pgo8L3N2Zz4K",
      alt: "Rural Ruta 8 Logo",
      description: "Agronegocio"
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Clientes que Confían en Nuestra Plataforma
          </h3>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Empresas líderes que han transformado sus datos en insights valiosos
          </p>
        </div>
        
        <div className="relative overflow-hidden">
          {/* Gradient masks */}
          <div className="absolute left-0 top-0 w-20 h-full bg-gradient-to-r from-background/80 to-transparent z-10" />
          <div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-background/80 to-transparent z-10" />
          
          {/* Scrolling container */}
          <div className="flex animate-scroll">
            {/* Primera repetición */}
            <div className="flex space-x-12 min-w-full">
              {clients.map((client, index) => (
                <div key={`first-${index}`} className="flex-shrink-0">
                  <Card className="w-48 h-32 flex flex-col items-center justify-center bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300">
                    <CardContent className="p-4 text-center">
                      <img 
                        src={client.logo} 
                        alt={client.alt}
                        className="w-12 h-12 object-contain mx-auto mb-2 filter hover:brightness-110 transition-all duration-300"
                      />
                      <h4 className="font-semibold text-sm text-foreground">{client.name}</h4>
                      <p className="text-xs text-muted-foreground">{client.description}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
            
            {/* Segunda repetición para loop continuo */}
            <div className="flex space-x-12 min-w-full">
              {clients.map((client, index) => (
                <div key={`second-${index}`} className="flex-shrink-0">
                  <Card className="w-48 h-32 flex flex-col items-center justify-center bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300">
                    <CardContent className="p-4 text-center">
                      <img 
                        src={client.logo} 
                        alt={client.alt}
                        className="w-12 h-12 object-contain mx-auto mb-2 filter hover:brightness-110 transition-all duration-300"
                      />
                      <h4 className="font-semibold text-sm text-foreground">{client.name}</h4>
                      <p className="text-xs text-muted-foreground">{client.description}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClientsSection;
