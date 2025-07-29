
import { Card, CardContent } from '@/components/ui/card';

const ClientsSection = () => {
  const clients = [
    {
      name: "Nordata",
      logo: "/lovable-uploads/9d59e48a-a65c-40af-8cf1-18a0437e602e.png",
      alt: "Nordata Logo"
    },
    {
      name: "EcoAutomotores",
      logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjUwIiBmaWxsPSIjMjJjNTVlIi8+CjxwYXRoIGQ9Ik0zMCA0MEM0MCAzMCA2MCAzMCA3MCA0MEM3MCA1MCA2MCA2MCA1MCA2MEM0MCA2MCAzMCA1MCAzMCA0MFoiIGZpbGw9IndoaXRlIi8+CjxyZWN0IHg9IjQ1IiB5PSI2NSIgd2lkdGg9IjEwIiBoZWlnaHQ9IjE1IiBmaWxsPSJ3aGl0ZSIvPgo8dGV4dCB4PSI1MCIgeT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjgiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiI+RWNvPC90ZXh0Pgo8L3N2Zz4K",
      alt: "EcoAutomotores Logo"
    },
    {
      name: "Rural Ruta 8",
      logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiByeD0iMTUiIGZpbGw9IiM4YjVjZjYiLz4KPHBhdGggZD0iTTMwIDMwSDcwVjQ1SDU1VjcwSDQ1VjQ1SDMwVjMwWiIgZmlsbD0id2hpdGUiLz4KPGNpcmNsZSBjeD0iNzAiIGN5PSI3MCIgcj0iOCIgZmlsbD0iIzIyYzU1ZSIvPgo8dGV4dCB4PSI1MCIgeT0iODUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjgiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiI+UlI4PC90ZXh0Pgo8L3N2Zz4K",
      alt: "Rural Ruta 8 Logo"
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
          <div className="absolute left-0 top-0 w-20 h-full bg-gradient-to-r from-background/50 to-transparent z-10" />
          <div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-background/50 to-transparent z-10" />
          
          {/* Scrolling container */}
          <div className="flex animate-scroll">
            {/* Primera repetición */}
            <div className="flex space-x-12 min-w-full">
              {clients.map((client, index) => (
                <div key={`first-${index}`} className="flex-shrink-0">
                  <Card className="w-40 h-28 flex items-center justify-center bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300">
                    <CardContent className="p-4">
                      <img 
                        src={client.logo} 
                        alt={client.alt}
                        className="w-16 h-16 object-contain mx-auto filter hover:brightness-110 transition-all duration-300"
                      />
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
            
            {/* Segunda repetición para loop continuo */}
            <div className="flex space-x-12 min-w-full">
              {clients.map((client, index) => (
                <div key={`second-${index}`} className="flex-shrink-0">
                  <Card className="w-40 h-28 flex items-center justify-center bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300">
                    <CardContent className="p-4">
                      <img 
                        src={client.logo} 
                        alt={client.alt}
                        className="w-16 h-16 object-contain mx-auto filter hover:brightness-110 transition-all duration-300"
                      />
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
