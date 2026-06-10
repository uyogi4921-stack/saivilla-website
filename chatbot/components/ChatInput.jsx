'use client';

import { useState } from 'react';

const SendIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
    <path d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z" />
  </svg>
);

export default function ChatInput({ onSend, disabled }) {
  const [text, setText] = useState('');

  const submit = (e) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText('');
  };

  return (
    <form onSubmit={submit} className="flex items-center gap-2 px-3 py-2 bg-[#f0f2f5]">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message"
        aria-label="Type a message"
        className="flex-1 bg-white rounded-full px-4 py-2.5 text-[14.5px] outline-none placeholder:text-gray-400"
      />
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        aria-label="Send message"
        className="w-11 h-11 rounded-full bg-[#25D366] hover:bg-[#1faf55] text-white flex items-center justify-center
                   shrink-0 transition-colors disabled:opacity-60 active:scale-95"
      >
        <SendIcon />
      </button>
    </form>
  );
}
