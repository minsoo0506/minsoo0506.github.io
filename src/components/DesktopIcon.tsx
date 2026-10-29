import React from 'react';

interface DesktopIconProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

export const DesktopIcon: React.FC<DesktopIconProps> = ({ icon, label, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-24 group flex flex-col items-center gap-1 p-1 rounded hover:bg-[#0b61ff]/20 focus:bg-[#0b61ff]/20 focus:outline-[1px] focus:outline-dotted focus:outline-white/50 transition-colors"
    >
      <div className="w-12 h-12 flex items-center justify-center filter drop-shadow-md">{icon}</div>
      <span
        className="text-white text-xs font-tahoma text-center px-1 rounded-sm
                 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]
                 group-hover:bg-[#0b61ff] group-focus:bg-[#0b61ff] line-clamp-2"
        style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.8)' }}
      >
        {label}
      </span>
    </button>
  );
};
