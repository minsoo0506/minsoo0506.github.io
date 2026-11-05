import React, { useState, useEffect } from 'react';
import { KeyRound, Power } from 'lucide-react';

interface TaskbarDataProps {
  fullname: string;
  avatar: string;
}

interface TaskbarProps {
  data: TaskbarDataProps;
  openWindows: Array<{ id: string; title: string; icon: React.ReactNode }>;
  activeWindow: string | null;
  onWindowClick: (id: string) => void;
  onStartMenuClick: (app: string) => void;
}

export const Taskbar: React.FC<TaskbarProps> = ({
  data,
  openWindows,
  activeWindow,
  onWindowClick,
  onStartMenuClick,
}) => {
  const [showStartMenu, setShowStartMenu] = useState(false);
  const [programs, setPrograms] = useState(false);
  const [games, setGames] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const menuItems = [
    {
      id: 'about',
      label: 'About Me',
      subtitle: 'Personal Info',
      icon: <img src="images/mypc.ico" alt="About Me" className="w-8 h-8" />,
    },
    {
      id: 'experience',
      label: 'Experience',
      subtitle: 'Work & Edu',
      icon: <img src="images/world.ico" alt="Experience" className="w-8 h-8" />,
    },
    {
      id: 'projects',
      label: 'My Projects',
      subtitle: 'Portfolio',
      icon: <img src="images/folder.ico" alt="Projects" className="w-8 h-8" />,
    },
    {
      id: 'contact',
      label: 'Contact',
      subtitle: 'Get in touch',
      icon: <img src="images/phone.ico" alt="Contact" className="w-8 h-8" />,
    },
    {
      id: 'terminal',
      label: 'Command Prompt',
      subtitle: 'Terminal',
      icon: <img src="images/command-prompt.svg" alt="" className="w-8 h-8" />,
    },
  ];

  const handleMenuItemClick = (id: string) => {
    onStartMenuClick(id);
    setShowStartMenu(false);
    setPrograms(false);
    setGames(false);
  };

  return (
    <>
      {/* Taskbar Container */}
      <div
        className="fixed bottom-0 left-0 right-0 h-[32px] w-full z-50 flex items-center select-none"
        style={{
          background:
            'linear-gradient(to bottom, #245EDC 0%, #3f8cf3 9%, #245EDC 18%, #245EDC 92%, #1941A5 100%)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3)',
        }}
      >
        {/* Start Button */}
        <div className="pl-[2px] ">
          <button
            onClick={() => setShowStartMenu(!showStartMenu)}
            className={`
              relative h-[30px] rounded-r-[10px] rounded-tl-[3px] rounded-bl-[3px] flex items-center pl-1 pr-5 gap-1
              font-bold text-white italic text-[16px] shadow-lg transition-all duration-100
              ${showStartMenu ? 'brightness-90 translate-y-[1px]' : 'hover:brightness-110'}
            `}
            style={{
              background:
                'linear-gradient(to bottom, #66b966 0%, #3b9d3f 12%, #2c8d2e 42%, #18811b 80%, #08640c 100%)',
              boxShadow: showStartMenu
                ? 'inset 2px 2px 2px rgba(0,0,0,0.4)'
                : 'inset 1px 1px 0 rgba(255,255,255,0.4), 1px 1px 2px rgba(0,0,0,0.5)',
            }}
          >
            <img
              src="images/windows-xp-flag.svg"
              onError={(e) => (e.currentTarget.style.display = 'none')}
              className="w-5 h-5 drop-shadow-[1px_1px_1px_rgba(0,0,0,0.4)]"
              alt=""
            />
            <span style={{ textShadow: '1px 1px 1px rgba(0,0,0,0.5)' }}>start</span>
          </button>
        </div>

        {/* Divider */}
        <div className="h-[20px] w-[2px] bg-[#0C2263] opacity-30 mx-1"></div>

        {/* Task Band (Window Switcher) */}
        <div className="flex-1 flex gap-1 px-1 overflow-x-auto items-center h-full">
          {openWindows.map((window) => (
            <button
              key={window.id}
              onClick={() => onWindowClick(window.id)}
              className={`
                group h-[22px] min-w-[150px] max-w-[200px] px-2 items-center gap-2 rounded-[2px] transition-all
                ${
                  activeWindow === window.id
                    ? 'flex'
                    : window.id === openWindows.find((w) => w.id !== activeWindow)?.id
                    ? 'hidden md:flex'
                    : 'hidden lg:flex'
                }
                ${
                  activeWindow === window.id
                    ? 'bg-[#1e52b7] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.5),_1px_0_0_rgba(255,255,255,0.2)]' // Pushed in
                    : 'bg-[#3C81F3] hover:bg-[#5394FF] shadow-[inset_1px_1px_0_rgba(255,255,255,0.3),_1px_1px_2px_rgba(0,0,0,0.5)]' // Popped out
                }
              `}
            >
              <div className="w-4 h-4 shrink-0">{window.icon}</div>
              <span
                className={`text-[11px] truncate ${
                  activeWindow === window.id ? 'font-bold text-white/90' : 'text-white'
                }`}
              >
                {window.title}
              </span>
            </button>
          ))}
        </div>

        {/* System Tray */}
        <div
          className="h-full pl-2 pr-4 flex items-center gap-2 border-l border-[#122E73]"
          style={{
            background:
              'linear-gradient(to bottom, #1290E8 0%, #87CEFF 10%, #1290E8 20%, #1290E8 100%)',
            boxShadow: 'inset 2px 0 3px rgba(0,0,0,0.3)',
          }}
        >
          <div className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center text-[8px] text-white">
            EN
          </div>
          <span className="text-white text-[11px] font-thin">{formatTime(currentTime)}</span>
        </div>
      </div>

      {/* Start Menu */}
      {showStartMenu && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-transparent"
            onClick={() => setShowStartMenu(false)}
          />
          <div
            className="fixed bottom-[32px] left-0 w-[380px] max-w-full max-h-[calc(100vh-32px)] overflow-y-auto z-[70] flex flex-col rounded-t-[5px] animate-in slide-in-from-bottom-2 duration-100"
            style={{
              boxShadow: '4px 4px 10px rgba(0,0,0,0.5)',
              border: '1px solid #003399',
            }}
          >
            {/* Header */}
            <div
              className="h-[60px] flex items-center gap-3 px-3 relative overflow-hidden"
              style={{
                background: 'linear-gradient(to bottom, #245EDC 0%, #3f8cf3 100%)',
                borderBottom: '2px solid #E55400', // Orange line
              }}
            >
              <div className="w-10 h-10 bg-white rounded-[3px] border-2 border-white/50 overflow-hidden shadow-md">
                <img
                  src={'images/' + data.avatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-white font-bold text-[16px] drop-shadow-md">
                {data.fullname}
              </span>
            </div>

            {/* Content Columns */}
            <div className="flex bg-white border-x-2 border-[#245EDC]">
              {/* Left Column (White) */}
              <div className="w-[50%] py-2 flex flex-col gap-1 pl-1">
                {[
                  {
                    id: 'internet',
                    label: 'Internet',
                    subtitle: 'Internet Explorer',
                    icon: (
                      <span className="xp-internet-icon">
                        <img src="images/internet-explorer.svg" alt="" />
                      </span>
                    ),
                  },
                  ...menuItems.filter((item) => item.id === 'contact'),
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleMenuItemClick(item.id)}
                    className="w-full text-left px-2 py-2 flex items-center gap-3 hover:bg-[#2F71CD] hover:text-white group"
                  >
                    {item.icon}
                    <span className="flex flex-col">
                      <strong className="text-[11px]">{item.label}</strong>
                      <span className="text-[9px] text-gray-500 group-hover:text-white">
                        {item.subtitle}
                      </span>
                    </span>
                  </button>
                ))}
                <div className="flex-1 min-h-[80px]" />
                <button
                  onClick={() => setPrograms(!programs)}
                  className="border-t border-gray-300 py-2 text-[13px] font-bold hover:bg-[#2F71CD] hover:text-white"
                >
                  All Programs <span className="text-green-600 text-[20px] align-middle">▶</span>
                </button>
              </div>

              {/* Right Column (Blue) */}
              <div className="w-[50%] bg-[#D3E5FA] py-2 px-1 border-l border-[#95BDE7] flex flex-col gap-1">
                <button
                  onClick={() => handleMenuItemClick('documents')}
                  className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-[#2F71CD] hover:text-white group rounded-[3px]"
                >
                  <img src="images/folder.ico" alt="" className="w-6 h-6" />
                  <span className="text-[11px] font-bold text-[#00136B] group-hover:text-white">
                    My Documents
                  </span>
                </button>
                <button className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-[#2F71CD] hover:text-white group rounded-[3px]">
                  <img src="images/folder.ico" alt="" className="w-6 h-6" />
                  <span className="text-[11px] font-bold text-[#00136B] group-hover:text-white">
                    My Pictures
                  </span>
                </button>
                <button
                  onClick={() => handleMenuItemClick('music')}
                  className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-[#2F71CD] hover:text-white group rounded-[3px]"
                >
                  <img src="images/folder.ico" alt="" className="w-6 h-6" />
                  <span className="text-[11px] font-bold text-[#00136B] group-hover:text-white">
                    My Music
                  </span>
                </button>

                <div className="h-px bg-[#95BDE7] mx-2 my-1" />
                {menuItems
                  .filter((item) => item.id !== 'contact')
                  .map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleMenuItemClick(item.id)}
                      className="w-full text-left px-3 py-1 flex items-center gap-2 hover:bg-[#2F71CD] hover:text-white text-[11px] font-bold text-[#00136B]"
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  ))}
                <div className="flex-1"></div>
              </div>
            </div>

            {programs && (
              <div className="absolute z-20 left-1/2 top-[60px] bottom-[40px] w-[48%] overflow-auto border border-[#245edc] bg-[#eaf3ff] text-[13px] shadow-md">
                {menuItems
                  .filter((item) => item.id !== 'contact')
                  .map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleMenuItemClick(item.id)}
                      className="block w-full text-left px-3 py-2 hover:bg-[#2F71CD] hover:text-white"
                    >
                      {item.label}
                    </button>
                  ))}
                <button
                  onClick={() => setGames(!games)}
                  className="block w-full text-left px-3 py-2 hover:bg-[#2F71CD] hover:text-white"
                >
                  📁 Games ▸
                </button>
                {games && (
                  <button
                    onClick={() => handleMenuItemClick('pinball')}
                    className="block w-full text-left pl-7 py-2 hover:bg-[#2F71CD] hover:text-white"
                  >
                    3D Pinball
                  </button>
                )}
              </div>
            )}

            {/* Footer */}
            <div
              className="h-[40px] flex items-center justify-end px-3 gap-3"
              style={{
                background: 'linear-gradient(to bottom, #3f8cf3 0%, #245EDC 100%)',
                boxShadow: 'inset 0 2px 2px rgba(255,255,255,0.4)',
                borderTop: '1px solid #fff',
              }}
            >
              <button className="flex items-center gap-1.5 px-2 py-1 hover:bg-white/20 rounded text-white text-[11px]">
                <span className="xp-session-icon xp-session-icon-logoff" aria-hidden="true">
                  <KeyRound size={16} strokeWidth={2.5} />
                </span>
                <span>Log Off</span>
              </button>
              <button className="flex items-center gap-1.5 px-2 py-1 hover:bg-white/20 rounded text-white text-[11px]">
                <span className="xp-session-icon xp-session-icon-power" aria-hidden="true">
                  <Power size={16} strokeWidth={2.5} />
                </span>
                <span>Turn Off Computer</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};
