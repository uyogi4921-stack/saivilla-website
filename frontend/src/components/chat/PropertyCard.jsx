import React from 'react';

const TYPE_GRADIENTS = {
  flat: 'from-sky-500 to-indigo-600',
  villa: 'from-emerald-500 to-teal-700',
  plot: 'from-lime-500 to-green-700',
  commercial: 'from-amber-500 to-orange-700',
};

const PropertyCard = ({ property: p }) => (
  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
    {/* Visual header */}
    <div className={`bg-gradient-to-br ${TYPE_GRADIENTS[p.type] || 'from-gray-500 to-gray-700'} px-3 py-3 flex items-center justify-between gap-2`}>
      <div className="min-w-0">
        <p className="text-white font-bold text-[15px] leading-tight">{p.emoji} {p.name}</p>
        <p className="text-white/80 text-xs mt-0.5">{p.config}</p>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className="bg-white/20 backdrop-blur text-white text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded">
          {p.type}
        </span>
        {p.status && (
          <span className="bg-white text-[10px] font-bold px-2 py-0.5 rounded text-emerald-700">
            {p.status}
          </span>
        )}
      </div>
    </div>

    {/* Details */}
    <div className="px-3 py-2.5 text-[13px] text-gray-700 space-y-1">
      <div className="flex justify-between gap-2">
        <span className="font-bold text-[#075E54] text-[14px]">{p.priceDisplay}</span>
        <span className="text-gray-500 shrink-0">{p.size}</span>
      </div>
      <p className="text-gray-600">📍 {p.area}</p>
      <p className="text-gray-400 text-xs leading-snug">{p.highlight}</p>
      {p.brochure && (
        <a
          href={p.brochure}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-[#075E54] font-semibold text-xs pt-1 underline underline-offset-2"
        >
          📄 View Brochure
        </a>
      )}
    </div>
  </div>
);

export default PropertyCard;
