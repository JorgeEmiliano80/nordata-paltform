
import React from 'react';
import Navbar from '@/components/Navbar';
import ChatInterface from '@/components/ChatInterface';
import { TrackingProvider } from '@/components/tracking/TrackingProvider';

const Chatbot = () => {
  return (
    <TrackingProvider module="chatbot">
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <ChatInterface />
        </div>
      </div>
    </TrackingProvider>
  );
};

export default Chatbot;
