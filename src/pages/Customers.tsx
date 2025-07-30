
import React from 'react';
import Navbar from '@/components/Navbar';
import CustomersList from '@/components/CustomersList';
import AdvancedSegmentationDashboard from '@/components/customers/AdvancedSegmentationDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Customers = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Tabs defaultValue="list" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list">Lista de Clientes</TabsTrigger>
              <TabsTrigger value="segmentation">Segmentación Avanzada</TabsTrigger>
            </TabsList>
            
            <TabsContent value="list" className="space-y-4">
              <CustomersList />
            </TabsContent>
            
            <TabsContent value="segmentation" className="space-y-4">
              <AdvancedSegmentationDashboard />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default Customers;
