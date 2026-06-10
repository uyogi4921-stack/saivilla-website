export default function TypingIndicator() {
  return (
    <div className="relative max-w-[85%] self-start">
      <div className="bg-white rounded-lg rounded-tl-none shadow-sm px-4 py-3 inline-flex items-center gap-1">
        <span className="typing-dot" />
        <span className="typing-dot" style={{ animationDelay: '0.2s' }} />
        <span className="typing-dot" style={{ animationDelay: '0.4s' }} />
      </div>
    </div>
  );
}
