import React from 'react';

const QuickReplies = ({ chips, onSelect, disabled }) => {
  if (!chips?.length) return null;
  return (
    <div className="flex flex-wrap gap-2 justify-end py-1">
      {chips.map((chip) => (
        <button
          key={chip.id}
          data-chip-id={chip.id}
          onClick={() => onSelect(chip)}
          disabled={disabled}
          className="bg-white border border-[#25D366] text-[#075E54] text-[13px] font-medium px-3.5 py-1.5 rounded-full shadow-sm
                     hover:bg-[#25D366] hover:text-white active:scale-95 transition-all disabled:opacity-50"
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
};

export default QuickReplies;
