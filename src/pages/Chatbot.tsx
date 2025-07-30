
import React from 'react';
import Navbar from '@/components/Navbar';
import ChatInterface from '@/components/ChatInterface';

const Chatbot = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <ChatInterface />
        </div>
      </div>
    </>
  );
};

export default Chatbot;
