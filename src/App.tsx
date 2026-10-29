import { useState, useEffect } from 'react';
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

function App() {
  const [openWindows, setOpenWindows] = useState<OpenWindow[]>([]);
  const [activeWindow, setActiveWindow] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const openWindow = (id: string) => {
    if (openWindows.find((w) => w.id === id)) {
      setActiveWindow(id);
      return;
    }

    const windowConfigs: Record<string, Omit<OpenWindow, 'id'>> = {
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
    setOpenWindows(openWindows.filter((w) => w.id !== id));
    if (activeWindow === id) {
      setActiveWindow(openWindows.length > 1 ? openWindows[openWindows.length - 2].id : null);
    }
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
      <div className="absolute inset-0 pb-[30px] pointer-events-none">
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
