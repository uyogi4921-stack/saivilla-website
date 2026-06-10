import React from 'react';
import { MessageCircle } from 'lucide-react';

const ChatButton = () => {
  const chatUrl = process.env.REACT_APP_CHATBOT_URL || 'https://saivilla-chatbot.vercel.app';

  return (
    <a
      href={chatUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with our property assistant"
      className="fixed bottom-5 left-5 z-50 group"
    >
      {/* Pulse ring */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30" />

      <span className="relative flex items-center gap-2 bg-[#25D366] hover:bg-[#1faf55] text-white rounded-full shadow-lg pl-3.5 pr-4 py-3 md:pl-4 md:pr-5 md:py-3.5 transition-all hover:scale-105">
        <MessageCircle className="w-5 h-5 md:w-6 md:h-6 fill-white" />
        <span className="text-sm md:text-base font-semibold whitespace-nowrap">Chat with us</span>
      </span>
    </a>
  );
};

export default ChatButton;
