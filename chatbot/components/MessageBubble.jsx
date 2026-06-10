import PropertyCard from './PropertyCard';

const Tail = ({ outgoing }) => (
  <svg
    viewBox="0 0 8 13"
    width="8"
    height="13"
    className={`absolute top-0 ${outgoing ? '-right-2 text-[#d9fdd3]' : '-left-2 text-white scale-x-[-1]'}`}
  >
    <path fill="currentColor" d="M0 0h8v13C8 6 4 2 0 0z" />
  </svg>
);

const Ticks = () => (
  <svg viewBox="0 0 16 11" width="16" height="11" className="inline-block ml-1 text-[#53bdeb]">
    <path
      fill="currentColor"
      d="M11.07.65l-.55-.42a.4.4 0 00-.56.08L5.6 5.95 4.07 4.5a.4.4 0 00-.57.02l-.49.52a.4.4 0 00.02.57l2.3 2.16a.4.4 0 00.59-.05l5.23-6.51a.4.4 0 00-.08-.56zm4.3 0l-.55-.42a.4.4 0 00-.56.08l-4.36 5.64-.42-.4-.95 1.18.84.8a.4.4 0 00.59-.06l5.49-6.26a.4.4 0 00-.08-.56z"
    />
  </svg>
);

export default function MessageBubble({ message }) {
  const outgoing = message.from === 'user';

  // Property results render as a card stack, full width
  if (message.type === 'properties') {
    return (
      <div className="flex flex-col gap-2 my-1 max-w-[92%]">
        {message.properties.map((p) => (
          <PropertyCard key={p.id} property={p} />
        ))}
      </div>
    );
  }

  if (message.type === 'booking') {
    const b = message.booking;
    return (
      <div className="relative max-w-[85%] self-start">
        <Tail outgoing={false} />
        <div className="bg-white rounded-lg rounded-tl-none shadow-sm px-3 py-3 text-sm">
          <p className="font-bold text-[#075E54] mb-2 flex items-center gap-1.5">✅ Site Visit Confirmed</p>
          <div className="space-y-1 text-gray-700">
            <p>{b.property.emoji} <span className="font-semibold">{b.property.name}</span></p>
            <p className="text-gray-500 text-xs">{b.property.area}</p>
            <p className="pt-1">📅 {b.date.label} &nbsp;·&nbsp; 🕐 {b.time}</p>
            <p>👤 {b.name} &nbsp;·&nbsp; 📱 +91 {b.phone.replace(/(\d{5})(\d{5})/, '$1 $2')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (message.type === 'handoff') {
    return (
      <div className="self-center my-2 bg-[#FFF3C7] text-[#54656F] text-xs px-4 py-2 rounded-lg shadow-sm text-center max-w-[80%]">
        🔔 Connecting you to our team — conversation shared with a human agent
      </div>
    );
  }

  return (
    <div className={`relative max-w-[85%] ${outgoing ? 'self-end' : 'self-start'}`}>
      <Tail outgoing={outgoing} />
      <div
        className={`px-3 py-2 text-[14.5px] leading-snug shadow-sm rounded-lg ${
          outgoing ? 'bg-[#d9fdd3] rounded-tr-none' : 'bg-white rounded-tl-none'
        }`}
      >
        <span className="whitespace-pre-wrap text-[#111b21]">{message.text}</span>
        <span className="inline-block float-right ml-2 mt-2 text-[10px] text-gray-500 select-none">
          {message.time}
          {outgoing && <Ticks />}
        </span>
      </div>
    </div>
  );
}
