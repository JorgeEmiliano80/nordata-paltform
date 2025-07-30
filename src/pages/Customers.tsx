
import React from 'react';
import Navbar from '@/components/Navbar';
import CustomersList from '@/components/CustomersList';

const Customers = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <CustomersList />
        </div>
      </div>
    </>
  );
};

export default Customers;
