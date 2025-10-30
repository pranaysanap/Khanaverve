import AiChat from '@/components/ai-chat';
import { Sparkles } from 'lucide-react';

export default function AiPage() {
  return (
    <div className="container mx-auto px-4 py-8 h-[calc(100vh-10rem)] md:h-[calc(100vh-6rem)] flex flex-col items-center justify-center">
      <div className="w-full flex flex-col items-center text-center mb-8 animate-fade-in">
        {/* Chotu Avatar-like bot */}
        <div className="mb-3 rounded-full bg-gradient-to-br from-blue-400 via-primary to-pink-400 shadow-xl flex flex-col items-center justify-center h-24 w-24 md:h-32 md:w-32 border-4 border-primary relative animate-bounce-slow">
          <span className="absolute -top-2 -left-2 animate-ping rounded-full bg-primary/70 h-7 w-7"></span>
          <Sparkles className="h-12 w-12 md:h-16 md:w-16 text-white drop-shadow-lg mx-auto mt-6" />
          <span className="font-bold text-lg md:text-2xl text-white mb-2">chotu</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold mt-2 text-primary drop-shadow-lg">
          Meet Chotu!
        </h1>

        <p className="text-base md:text-xl text-muted-foreground mt-3 mb-2 max-w-lg">
          Your friendly AI assistant for food recommendations, tiffin vendor help, and more. Ask
          Chotu anything about your next meal!
        </p>

        <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary font-semibold text-xs tracking-wider mt-2">
          powered by Gemini AI
        </span>
      </div>

      <div className="w-full flex-grow flex flex-col justify-start">
        <AiChat />
      </div>
    </div>
  );
}
