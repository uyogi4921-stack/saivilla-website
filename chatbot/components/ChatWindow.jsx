'use client';

import { useEffect, useRef, useState } from 'react';
import { initialState, greetingMessages, process as runEngine } from '@/lib/engine';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import QuickReplies from './QuickReplies';
import ChatInput from './ChatInput';

const now = () =>
  new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase();

let _id = 0;
const nextId = () => ++_id;

export default function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [chips, setChips] = useState([]);
  const [typing, setTyping] = useState(false);
  const stateRef = useRef(initialState());
  const transcriptRef = useRef([]);
  const bottomRef = useRef(null);

  // Initial greeting with staggered delivery
  useEffect(() => {
    const { messages: greet, chips: greetChips } = greetingMessages();
    let cancelled = false;
    (async () => {
      setTyping(true);
      for (let i = 0; i < greet.length; i++) {
        await sleep(i === 0 ? 900 : 700);
        if (cancelled) return;
        pushBot(greet[i]);
      }
      setTyping(false);
      setChips(greetChips);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing, chips]);

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const pushBot = (msg) => {
    transcriptRef.current.push({ from: 'bot', ...(msg.text ? { text: msg.text } : { type: msg.type }) });
    setMessages((prev) => [...prev, { ...msg, id: nextId(), from: 'bot', time: now() }]);
  };

  const pushUser = (text) => {
    transcriptRef.current.push({ from: 'user', text });
    setMessages((prev) => [...prev, { id: nextId(), from: 'user', type: 'text', text, time: now() }]);
  };

  const logToServer = async (payload) => {
    try {
      await fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, transcript: transcriptRef.current, at: new Date().toISOString() }),
      });
    } catch {
      // Logging must never break the chat
    }
  };

  const handleInput = async (input) => {
    if (typing) return;
    pushUser(input.label || input.text);
    setChips([]);
    setTyping(true);

    await sleep(750 + Math.random() * 450);

    const result = runEngine(stateRef.current, input);
    stateRef.current = result.state;

    for (let i = 0; i < result.messages.length; i++) {
      if (i > 0) await sleep(650);
      pushBot(result.messages[i]);
    }

    setTyping(false);
    setChips(result.chips || []);

    if (result.log) logToServer(result.log);
  };

  return (
    <div className="flex flex-col h-dvh max-w-lg mx-auto bg-[#efe7dd] shadow-2xl">
      {/* Header */}
      <header className="bg-[#075E54] text-white px-4 py-2.5 flex items-center gap-3 shrink-0 z-10">
        <div className="w-10 h-10 rounded-full bg-[#d4af37] flex items-center justify-center font-black text-[#075E54] text-sm shrink-0">
          SV
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-[15px] leading-tight truncate">Sai Villa DreamHouse</h1>
          <p className="text-[12px] text-white/80 leading-tight">
            {typing ? 'typing…' : 'online · replies instantly'}
          </p>
        </div>
        <a href="tel:+919426319628" aria-label="Call us" className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1C10.61 21 3 13.39 3 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.25 1.01l-2.2 2.2z" />
          </svg>
        </a>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto chat-bg px-3 py-3">
        <div className="flex flex-col gap-1.5">
          {/* Encryption-style notice for authenticity */}
          <div className="self-center bg-[#FFF3C7] text-[#54656F] text-[11px] px-3 py-1.5 rounded-md shadow-sm text-center mb-1 max-w-[90%]">
            🏠 Official property assistant of Sai Villa DreamHouse Pvt. Ltd., Palanpur
          </div>

          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}

          {typing && <TypingIndicator />}

          {!typing && <QuickReplies chips={chips} onSelect={(chip) => handleInput({ id: chip.id, label: chip.label })} />}

          <div ref={bottomRef} />
        </div>
      </main>

      {/* Input */}
      <footer className="shrink-0">
        <ChatInput onSend={(text) => handleInput({ text })} disabled={typing} />
      </footer>
    </div>
  );
}
