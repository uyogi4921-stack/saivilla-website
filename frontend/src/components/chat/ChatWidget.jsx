import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Phone } from 'lucide-react';
import axios from 'axios';
import { initialState, greetingMessages, process as runEngine } from '@/lib/chatEngine';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import QuickReplies from './QuickReplies';
import ChatInput from './ChatInput';

const now = () =>
  new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase();

let _id = 0;
const nextId = () => ++_id;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chips, setChips] = useState([]);
  const [typing, setTyping] = useState(false);
  const stateRef = useRef(initialState());
  const startedRef = useRef(false);
  const bottomRef = useRef(null);

  // Run the greeting the first time the widget opens
  useEffect(() => {
    if (!isOpen || startedRef.current) return;
    startedRef.current = true;
    const { messages: greet, chips: greetChips } = greetingMessages();
    let cancelled = false;
    (async () => {
      setTyping(true);
      for (let i = 0; i < greet.length; i++) {
        await sleep(i === 0 ? 800 : 650);
        if (cancelled) return;
        pushBot(greet[i]);
      }
      setTyping(false);
      setChips(greetChips);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing, chips, isOpen]);

  const pushBot = (msg) => {
    setMessages((prev) => [...prev, { ...msg, id: nextId(), from: 'bot', time: now() }]);
  };

  const pushUser = (text) => {
    setMessages((prev) => [...prev, { id: nextId(), from: 'user', type: 'text', text, time: now() }]);
  };

  // Bookings go through the same backend pipeline as the contact form,
  // so the team gets the usual email with an Excel attachment.
  const logToServer = async (payload) => {
    if (payload.type !== 'booking') return;
    const b = payload.data;
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'https://saivilla-backend.onrender.com';
      await axios.post(`${apiUrl}/api/inquiries/`, {
        name: b.name,
        email: b.email,
        phone: b.phone,
        propertyInterest: b.property.name,
        message: `Site visit booking via website chatbot — ${b.property.name} on ${b.date.label} at ${b.time}.`,
      }, { timeout: 90000 });
    } catch {
      // The visit details are still on screen; team follow-up happens by phone
    }
  };

  const handleInput = async (input) => {
    if (typing) return;
    pushUser(input.label || input.text);
    setChips([]);
    setTyping(true);

    await sleep(700 + Math.random() * 400);

    const result = runEngine(stateRef.current, input);
    stateRef.current = result.state;

    for (let i = 0; i < result.messages.length; i++) {
      if (i > 0) await sleep(600);
      pushBot(result.messages[i]);
    }

    setTyping(false);
    setChips(result.chips || []);

    if (result.log) logToServer(result.log);
  };

  return (
    <>
      {/* Floating launcher button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Chat with our property assistant"
          className="fixed bottom-5 left-5 z-[60] group"
        >
          <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30" />
          <span className="relative flex items-center gap-2 bg-[#25D366] hover:bg-[#1faf55] text-white rounded-full shadow-lg pl-3.5 pr-4 py-3 md:pl-4 md:pr-5 md:py-3.5 transition-all hover:scale-105">
            <MessageCircle className="w-5 h-5 md:w-6 md:h-6 fill-white" />
            <span className="text-sm md:text-base font-semibold whitespace-nowrap">Chat with us</span>
          </span>
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div
          className="fixed z-[70] inset-0 sm:inset-auto sm:bottom-5 sm:left-5 sm:w-[380px] sm:h-[min(620px,calc(100vh-100px))]
                     flex flex-col bg-[#efe7dd] sm:rounded-2xl overflow-hidden shadow-2xl animate-fade-in-up"
        >
          {/* Header */}
          <div className="bg-[#075E54] text-white px-4 py-2.5 flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-full bg-[#d4af37] flex items-center justify-center font-black text-[#075E54] text-xs shrink-0">
              SV
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-[14px] leading-tight truncate">Sai Villa DreamHouse</h3>
              <p className="text-[11px] text-white/80 leading-tight">
                {typing ? 'typing…' : 'online · replies instantly'}
              </p>
            </div>
            <a href="tel:+919426319628" aria-label="Call us" className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <Phone className="w-4 h-4" />
            </a>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto chat-wallpaper px-3 py-3">
            <div className="flex flex-col gap-1.5">
              <div className="self-center bg-[#FFF3C7] text-[#54656F] text-[11px] px-3 py-1.5 rounded-md shadow-sm text-center mb-1 max-w-[92%]">
                🏠 Official property assistant of SAIVILLA DREAMHOUSE PVT.LTD., Palanpur
              </div>

              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} />
              ))}

              {typing && <TypingIndicator />}

              {!typing && <QuickReplies chips={chips} onSelect={(chip) => handleInput({ id: chip.id, label: chip.label })} />}

              <div ref={bottomRef} />
            </div>
          </div>

          {/* Input */}
          <div className="shrink-0">
            <ChatInput onSend={(text) => handleInput({ text })} disabled={typing} />
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
