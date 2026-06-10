import React from 'react';

const TypingIndicator = () => (
  <div className="relative max-w-[85%] self-start">
    <div className="bg-white rounded-lg rounded-tl-none shadow-sm px-4 py-3 inline-flex items-center gap-1">
      <span className="chat-typing-dot" />
      <span className="chat-typing-dot" style={{ animationDelay: '0.2s' }} />
      <span className="chat-typing-dot" style={{ animationDelay: '0.4s' }} />
    </div>
  </div>
);

export default TypingIndicator;
