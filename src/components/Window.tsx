import { X } from 'lucide-react';
import { useDraggable } from '../hooks/use-draggable';
import { useIsDesktop } from '../hooks/use-is-desktop';

interface WindowProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  onClose: () => void;
  initialPosition?: { x: number; y: number };
}

export const Window: React.FC<WindowProps> = ({
  title,
  children,
  icon,
  onClose,
  initialPosition = { x: 100, y: 100 },
}) => {
  const isDesktop = useIsDesktop(1024);
  const { position, dragRef, handleMouseDown } = useDraggable(initialPosition);

  // Mobile/Tablet View (Simplified but themed)
  if (isDesktop === false) {
    return (
      <div className="fixed inset-0 bottom-[30px] z-50 bg-[#ECE9D8] flex flex-col font-tahoma">
        {/* Mobile Title Bar */}
        <div className="h-[30px] flex items-center justify-between px-2 select-none shadow-md bg-gradient-to-b from-[#0058E6] via-[#3A8CFF] to-[#0058E6]">
          <div className="flex items-center gap-2 text-white font-bold text-sm drop-shadow-md">
            {icon && <div className="w-4 h-4">{icon}</div>}
            <span>{title}</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-[21px] h-[21px] bg-[#E81123] rounded-[3px] border border-white/50 flex items-center justify-center text-white shadow-sm active:translate-y-[1px]"
          >
            <X size={14} strokeWidth={3} />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4">{children}</div>
      </div>
    );
  }

  // Desktop View (Full XP Style)
  if (isDesktop === null) return null;

  return (
    <div
      ref={dragRef}
      className="absolute flex flex-col rounded-t-[8px] rounded-b-[4px] overflow-hidden shadow-xp-window w-1/2 h-[75vh] max-w-full font-tahoma"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        // The blue XP window border frame
        padding: '3px',
        background: 'linear-gradient(to bottom, #0058E6 0%, #0058E6 30px, #0831D9 100%)',
      }}
    >
      {/* Title Bar */}
      <div
        className="h-[30px] flex items-center justify-between px-1 cursor-move select-none"
        onMouseDown={handleMouseDown}
        style={{
          background:
            'linear-gradient(to bottom, #0058E6 0%, #3A8CFF 8%, #0058E6 25%, #0058E6 88%, #0040AB 100%)',
        }}
      >
        <div className="flex items-center gap-1 pl-1">
          {/* Window Icon */}
          {icon && <div className="w-4 h-4 filter drop-shadow-sm">{icon}</div>}
          <span
            className="text-white font-bold text-[13px] tracking-wide ml-1"
            style={{ textShadow: '1px 1px 1px rgba(0,0,0,0.7)' }}
          >
            {title}
          </span>
        </div>

        {/* Window Controls */}
        <div className="flex items-center gap-1 mr-1">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-[21px] h-[21px] bg-[#E81123] hover:bg-[#ff4857] rounded-[3px] border border-white/60 flex items-center justify-center text-white shadow-sm transition-colors group active:bg-[#bf0e1d]"
            aria-label="Close"
          >
            <X size={15} strokeWidth={3} className="drop-shadow-sm" />
          </button>
        </div>
      </div>

      {/* Menu Bar (Optional, simpler for now just white background) */}
      <div className="flex-1 bg-[#ECE9D8] relative">
        {/* Inner Content Area Frame */}
        <div className="absolute inset-0 m-[3px] mt-0 bg-white border border-[#808080] shadow-[inset_1px_1px_0px_#404040] overflow-auto xp-window-content">
          <div className="p-4 min-h-full">{children}</div>
        </div>
      </div>
    </div>
  );
};
