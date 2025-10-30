"use client";

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Sparkles, User } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { aiChatbotAssistance } from '@/ai/flows/ai-chatbot-assistance';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

interface Message {
  role: 'user' | 'bot';
  content: string;
}

export default function AiChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Always scroll to the bottom (latest message) after new message
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTo({
          top: viewport.scrollHeight,
          behavior: 'smooth',
        });
      }
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const userMessage: Message = { role: 'user', content: input };
    const nextHistory = [...messages, userMessage];
    setMessages(nextHistory);
    setInput('');
    setIsLoading(true);
    try {
      const response = await aiChatbotAssistance({ query: userMessage.content, chatHistory: nextHistory });
      const botMessage: Message = { role: 'bot', content: response.reply };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = { role: 'bot', content: "I'm having a temporary issue. Please try again in a moment." };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    "Suggest a healthy tiffin",
    "Best rated vendor in Thane?",
    "What's on special at Annapurna?"
  ];

  return (
    <Card className="flex flex-col h-full max-w-2xl mx-auto mt-8">
      <CardContent className="flex-grow p-0">
        <div className="h-[32vh] md:h-[48vh] flex-shrink-0">
          <ScrollArea className="h-full" ref={scrollAreaRef}>
            <div className="p-4 space-y-4 min-h-[8vh] flex flex-col justify-end">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                  <p className="mb-4">Try one of these prompts to get started:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {quickPrompts.map(prompt => (
                      <Button key={prompt} variant="outline" size="sm" onClick={() => setInput(prompt)}>
                        {prompt}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      'flex items-start gap-3',
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {message.role === 'bot' && (
                      <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                        <AvatarFallback>
                          {/* Bot Icon with name */}
                          <span className="flex flex-col items-center"><Sparkles className="h-5 w-5 mb-0.5" />
                          <span className="text-[10px] mt-0.5 font-bold">chotu</span></span>
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        'max-w-xs md:max-w-md rounded-2xl p-3 text-sm',
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-none'
                          : 'bg-muted rounded-bl-none'
                      )}
                    >
                      {message.content}
                    </div>
                    {message.role === 'user' && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback><User /></AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex items-start gap-3 justify-start">
                  <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                    <AvatarFallback>
                      <span className="flex flex-col items-center"><Sparkles className="h-5 w-5 animate-pulse mb-0.5" />
                      <span className="text-[10px] mt-0.5 font-bold">chotu</span></span>
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-2xl p-3 text-sm rounded-bl-none">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce"></span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            autoComplete="off"
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
