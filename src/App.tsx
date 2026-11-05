import { useState, useEffect } from 'react';
import { DocumentsWindow } from './components/windows/DocumentsWindow';
import { CommandPromptWindow } from './components/windows/CommandPromptWindow';
import { Music } from 'lucide-react';
import { InternetWindow } from './components/windows/InternetWindow';
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
      internet: {
        title: 'Internet Explorer',
        icon: <img src="images/internet-explorer.svg" alt="" className="w-4 h-4" />,
        component: <InternetWindow />,
        position: { x: 100, y: 45 },
      },
      pinball: {
        title: '3D Pinball for Windows — Space Cadet',
        icon: <img src="images/help.ico" alt="" className="w-4 h-4" />,
        component: (
          <div className="h-full flex flex-col bg-black">
            <iframe
              title="3D Pinball"
              src="https://pinball.alula.me/"
              className="w-full flex-1 border-0"
              allow="autoplay; gamepad; fullscreen"
            />
            <div className="text-white text-xs text-center">
              Click the game · Z / : flippers · hold and release Space: launch
            </div>
            <a
              href="https://github.com/alula/SpaceCadetPinball"
              target="_blank"
              rel="noreferrer"
              className="text-white text-xs text-center"
            >
              Space Cadet Pinball web port ↗
            </a>
          </div>
        ),
        position: { x: 100, y: 45 },
      },
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

      <div className="absolute inset-0 z-20 pointer-events-none">
        {openWindows.map((window) => (
          <div
            key={window.id}
            onClick={() => handleWindowClick(window.id)}
            style={{ zIndex: activeWindow === window.id ? 30 : 20 }}
            className="pointer-events-auto"
          >
            <Window
              explorer={['documents', 'internet', 'pinball'].includes(window.id)}
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
