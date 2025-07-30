import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send } from 'lucide-react';
import Navbar from '@/components/Navbar';

const Chatbot = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card className="w-full max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>Chatbot</CardTitle>
              <CardDescription>Ask me anything!</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-start space-x-2">
                      <Avatar>
                        <AvatarImage src="https://github.com/shadcn.png" alt="Chatbot" />
                        <AvatarFallback>CB</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Chatbot</p>
                        <p className="text-sm text-muted-foreground">
                          Hello! How can I help you today?
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2 self-end">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-right">You</p>
                        <p className="text-sm text-muted-foreground text-right">
                          What is the meaning of life?
                        </p>
                      </div>
                      <Avatar>
                        <AvatarImage src="https://github.com/shadcn.png" alt="You" />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                </ScrollArea>
                <div className="flex items-center space-x-2">
                  <Input placeholder="Type your message here." />
                  <Button><Send className="w-4 h-4 mr-2" />Send</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Chatbot;
