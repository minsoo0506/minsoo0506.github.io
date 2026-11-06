import { useState, useEffect } from 'react';
import { DocumentsWindow } from './components/windows/DocumentsWindow';
import { CommandPromptWindow } from './components/windows/CommandPromptWindow';
import { Music } from 'lucide-react';
import { MusicWindow } from './components/windows/MusicWindow';
import { Window } from './components/Window';
import { Taskbar } from './components/Taskbar';
import { DesktopIcon } from './components/DesktopIcon';
import { AboutWindow } from './components/windows/AboutWindow';
import { ProjectsWindow } from './components/windows/ProjectsWindow';
import { ExperienceWindow } from './components/windows/ExperienceWindow';
import { ContactWindow } from './components/windows/ContactWindow';
import portfolioData from './data/portfolio.json';

import LoadingScreen from './components/LoadingScreen';

interface OpenWindow {
  id: string;
  title: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  position?: { x: number; y: number };
}

const documentsConfig = {
  title: 'My Documents',
  icon: <img src="images/folder.ico" alt="" className="w-4 h-4" />,
  component: <DocumentsWindow />,
  position: { x: 100, y: 35 },
};

function App() {
  const [openWindows, setOpenWindows] = useState<OpenWindow[]>([]);
  const [activeWindow, setActiveWindow] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [recycleError, setRecycleError] = useState<string | null>(null);
  const recycleMessages = [
    "You really thought I'd let you do that?",
    'Fatal Error: Too much effort invested.',
    "I'M NOT READY TO LET GO!!!",
    "YOU CAN'T JUST TAKE THIS AWAY FROM ME!!!",
  ];
  const rejectRecycle = () =>
    setRecycleError(recycleMessages[Math.floor(Math.random() * recycleMessages.length)]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const openDocumentsFromAddress = () => {
      if (!window.location.hash.startsWith('#/documents')) return;
      setOpenWindows((current) =>
        current.some((item) => item.id === 'documents')
          ? current
          : [...current, { id: 'documents', ...documentsConfig }]
      );
      setActiveWindow('documents');
    };
    openDocumentsFromAddress();
    window.addEventListener('hashchange', openDocumentsFromAddress);
    return () => window.removeEventListener('hashchange', openDocumentsFromAddress);
  }, []);

  const openWindow = (id: string) => {
    if (openWindows.find((w) => w.id === id)) {
      setActiveWindow(id);
      return;
    }

    const windowConfigs: Record<string, Omit<OpenWindow, 'id'>> = {
      documents: documentsConfig,
      about: {
        title: 'About Me',
        icon: <img src="images/mypc.ico" alt="About Me" className="w-4 h-4" />,
        component: <AboutWindow data={portfolioData} />,
        position: { x: 100, y: 5 },
      },
      experience: {
        title: 'Experience & Education',
        icon: <img src="images/world.ico" alt="Experience & Education" className="w-4 h-4" />,
        component: (
          <ExperienceWindow
            experience={portfolioData.experience}
            education={portfolioData.education}
          />
        ),
        position: { x: 200, y: 20 },
      },
      projects: {
        title: 'My Projects',
        icon: <img src="images/folder.ico" alt="My Projects" className="w-4 h-4" />,
        component: <ProjectsWindow projects={portfolioData.projects} />,
        position: { x: 300, y: 35 },
      },
      music: {
        title: 'My Music — Windows Media Player',
        icon: <Music size={16} className="text-white" />,
        component: <MusicWindow />,
        position: { x: 120, y: 45 },
      },
      terminal: {
        title: 'Command Prompt',
        icon: <img src="images/command-prompt.svg" alt="" className="w-4 h-4" />,
        component: <CommandPromptWindow onClose={() => closeWindow('terminal')} />,
        position: { x: 100, y: 75 },
      },
      contact: {
        title: 'Contact',
        icon: <img src="images/phone.ico" alt="Contact" className="w-4 h-4" />,
        component: <ContactWindow data={portfolioData.personal} />,
        position: { x: 400, y: 55 },
      },
    };

    const config = windowConfigs[id];
    if (config) {
      setOpenWindows([...openWindows, { id, ...config }]);
      setActiveWindow(id);
    }
  };

  const closeWindow = (id: string) => {
    if (id === 'documents' && window.location.hash.startsWith('#/documents')) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    setOpenWindows((current) => current.filter((w) => w.id !== id));
    setActiveWindow((current) => (current === id ? null : current));
  };

  const handleWindowClick = (id: string) => {
    setActiveWindow(id);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen xp-desktop relative overflow-hidden font-tahoma selection:bg-[#0b61ff] selection:text-white">
      {/* Background Image */}
      <div className="absolute inset-0 pb-[32px] pointer-events-none">
        <img
          src="images/wallpaper.jpg"
          alt="Desktop Background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Desktop Icons Grid */}
      <div className="relative z-10 p-4 grid grid-flow-col grid-rows-[repeat(auto-fill,100px)] gap-4 w-fit content-start h-[calc(100vh-40px)]">
        <DesktopIcon
          icon={<img src="images/mypc.ico" alt="About Me" className="w-10 h-10" />}
          label="About Me"
          onClick={() => openWindow('about')}
        />
        <DesktopIcon
          icon={<img src="images/world.ico" alt="Experience" className="w-10 h-10" />}
          label="Experience & Education"
          onClick={() => openWindow('experience')}
        />
        <DesktopIcon
          icon={<img src="images/folder.ico" alt="Projects" className="w-10 h-10" />}
          label="My Projects"
          onClick={() => openWindow('projects')}
        />
        <DesktopIcon
          icon={<img src="images/phone.ico" alt="Contact" className="w-10 h-10" />}
          label="Contact"
          onClick={() => openWindow('contact')}
        />
      </div>

      <div
        className="absolute right-2 bottom-[40px] z-10"
        onDragOver={(event) => {
          if (event.dataTransfer.types.includes('application/x-xp-desktop-icon')) {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'move';
          }
        }}
        onDrop={(event) => {
          event.preventDefault();
          if (event.dataTransfer.getData('application/x-xp-desktop-icon')) rejectRecycle();
        }}
      >
        <DesktopIcon
          icon={<img src="images/recycle-bin.png" alt="" className="w-10 h-10" />}
          label="Recycle Bin"
          onClick={() => {}}
          draggable={false}
        />
      </div>
      {recycleError && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center" role="presentation">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="recycle-error-title"
            aria-describedby="recycle-error-message"
            className="w-[400px] max-w-[calc(100vw-24px)] rounded-t-[7px] bg-[#ece9d8] border-[3px] border-[#0054df] shadow-xp-window"
          >
            <div className="h-[26px] px-1 flex items-center justify-between bg-gradient-to-b from-[#3a8cff] via-[#0058e6] to-[#0040ab] text-white text-[13px] font-bold">
              <span id="recycle-error-title">Error</span>
              <button
                onClick={() => setRecycleError(null)}
                aria-label="Close"
                className="w-5 h-5 rounded-sm bg-[#e64224] border border-white text-white leading-none"
              >
                ✕
              </button>
            </div>
            <div className="flex items-start gap-4 px-5 pt-5 pb-4 min-h-[75px]">
              <div
                aria-hidden="true"
                className="w-8 h-8 rounded-full bg-gradient-to-b from-[#ff8a79] via-[#eb1608] to-[#980700] border border-[#8d0800] shadow flex items-center justify-center text-white text-[26px] font-bold leading-none flex-shrink-0"
              >
                ×
              </div>
              <p id="recycle-error-message" className="text-[12px] text-black pt-1">
                {recycleError}
              </p>
            </div>
            <div className="flex justify-center pb-4">
              <button
                autoFocus
                onClick={() => setRecycleError(null)}
                className="px-7 py-[2px] text-[12px] text-black bg-[#ece9d8] border border-[#003c74] shadow-[inset_1px_1px_white,inset_-1px_-1px_#888] focus:outline focus:outline-1 focus:outline-dotted focus:outline-black"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="absolute inset-0 z-20 pointer-events-none">
        {openWindows.map((window) => (
          <div
            key={window.id}
            onClick={() => handleWindowClick(window.id)}
            style={{ zIndex: activeWindow === window.id ? 30 : 20 }}
            className="pointer-events-auto"
          >
            <Window
              explorer={window.id === 'documents'}
              media={window.id === 'music'}
              terminal={window.id === 'terminal'}
              title={window.title}
              icon={window.icon}
              onClose={() => closeWindow(window.id)}
              initialPosition={window.position}
            >
              {window.component}
            </Window>
          </div>
        ))}
      </div>

      <Taskbar
        openWindows={openWindows}
        activeWindow={activeWindow}
        onWindowClick={handleWindowClick}
        onStartMenuClick={openWindow}
        data={portfolioData.personal}
      />
    </div>
  );
}

export default App;
