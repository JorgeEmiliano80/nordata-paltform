
import React from 'react';
import Navbar from '@/components/Navbar';
import CustomersList from '@/components/CustomersList';
import AdvancedSegmentationDashboard from '@/components/customers/AdvancedSegmentationDashboard';
import { TrackedTabs, TrackedTabsTrigger, TabsContent, TabsList } from '@/components/tracking/TrackedTabs';
import { TrackingProvider } from '@/components/tracking/TrackingProvider';

const Customers = () => {
  return (
    <TrackingProvider module="customers">
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <TrackedTabs defaultValue="list" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TrackedTabsTrigger value="list" trackingName="Lista de Clientes">
                Lista de Clientes
              </TrackedTabsTrigger>
              <TrackedTabsTrigger value="segmentation" trackingName="Segmentación Avanzada">
                Segmentación Avanzada
              </TrackedTabsTrigger>
            </TabsList>
            
            <TabsContent value="list" className="space-y-4">
              <CustomersList />
            </TabsContent>
            
            <TabsContent value="segmentation" className="space-y-4">
              <AdvancedSegmentationDashboard />
            </TabsContent>
          </TrackedTabs>
        </div>
      </div>
    </TrackingProvider>
  );
};

export default Customers;
