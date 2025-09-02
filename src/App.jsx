import React, { useState, useEffect, createContext, useContext } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from '@/components/ui/toaster';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import DashboardContent from '@/components/DashboardContent';
import VaccinesContent from '@/components/VaccinesContent';
import TimelineContent from '@/components/TimelineContent';
import MedicationsContent from '@/components/MedicationsContent';
import MilestonesContent from '@/components/MilestonesContent';
import GalleryContent from '@/components/GalleryContent';
import FamilyContent from '@/components/FamilyContent';
import DocumentsContent from '@/components/DocumentsContent';
import SettingsContent from '@/components/SettingsContent';
import EditBabyDialog from '@/components/EditBabyDialog';
import AddEventDialog from '@/components/AddEventDialog';
import GenericPlaceholder from '@/components/GenericPlaceholder';
import FloatingAIChat from '@/components/FloatingAIChat';
import { cn } from '@/lib/utils';

const AppContext = createContext();
export const useAppContext = () => useContext(AppContext);

const menuItemsConfig = [
  { id: 'dashboard', label: 'Dashboard', icon: 'Activity' },
  { id: 'timeline', label: 'Timeline', icon: 'Clock' },
  { id: 'vaccines', label: 'Vacinas', icon: 'Shield' },
  { id: 'medications', label: 'Medicamentos', icon: 'Pill' },
  { id: 'milestones', label: 'Marcos', icon: 'TrendingUp' },
  { id: 'gallery', label: 'Galeria', icon: 'Camera' },
  { id: 'documents', label: 'Documentos', icon: 'FileText' },
  { id: 'family', label: 'Família', icon: 'Users' },
  { id: 'settings', label: 'Configurações', icon: 'Settings' },
];

const getInitialBabies = () => {
    try {
        const savedBabies = localStorage.getItem('babyGuardian_babies');
        if (savedBabies) {
            const parsedBabies = JSON.parse(savedBabies);
            if (Array.isArray(parsedBabies) && parsedBabies.length > 0) {
                return parsedBabies;
            }
        }
    } catch (error) {
        console.error("Failed to parse babies from localStorage", error);
    }

    const exampleBaby = {
        id: 1,
        name: 'Sofia',
        birthDate: '2023-06-15T00:00:00.000Z',
        photo: 'https://images.unsplash.com/photo-1482074734195-5191829f3633',
        weight: '8.2 kg',
        height: '72 cm',
        events: [
          { id: 1, type: 'medication', name: 'Vitamina D', date: '2025-09-01T09:00:00', details: '2 gotas', completed: false },
          { id: 2, type: 'appointment', name: 'Consulta Pediatra', date: '2025-09-02T14:30:00', details: 'Dr. House', completed: false }
        ],
        vaccines: [
          { id: 1, name: 'BCG', date: '2023-06-16', status: 'completed' },
          { id: 2, name: 'Hepatite B', date: '2023-07-15', status: 'completed' },
          { id: 3, name: 'Pentavalente', date: '2023-08-15', status: 'pending' }
        ],
        milestones: [
          { id: 1, milestone: 'Primeiro sorriso', date: '2023-08-01', achieved: true },
          { id: 2, milestone: 'Sustentar a cabeça', date: '2023-09-15', achieved: true },
          { id: 3, milestone: 'Sentar sem apoio', date: '2024-01-15', achieved: false }
        ],
        gallery: [
          { id: 1, url: 'https://images.unsplash.com/photo-1512909006721-fa1ff6085f52', description: 'Primeiro dia em casa', date: '2023-06-16T10:00:00.000Z' },
          { id: 2, url: 'https://images.unsplash.com/photo-1503454537192-b749717b85c5', description: 'Hora da soneca', date: '2023-07-01T14:00:00.000Z' }
        ],
        documents: [
          { 
            id: 1, 
            title: 'Certidão de Nascimento', 
            type: 'certificate', 
            description: 'Documento oficial de nascimento',
            date: '2023-06-15',
            files: [{ id: 1, name: 'certidao_nascimento.pdf', type: 'application/pdf', url: '#' }],
            createdAt: '2023-06-16T10:00:00.000Z'
          }
        ],
        family: [
          { id: 1, name: 'Ana Silva', relationship: 'Mãe' },
          { id: 2, name: 'Pedro Santos', relationship: 'Pai' }
        ]
      };
    localStorage.setItem('babyGuardian_babies', JSON.stringify([exampleBaby]));
    return [exampleBaby];
};

const getInitialSettings = () => {
    try {
        const savedSettings = localStorage.getItem('babyGuardian_settings');
        if (savedSettings) {
            return JSON.parse(savedSettings);
        }
    } catch (error) {
        console.error("Failed to parse settings from localStorage", error);
    }
    const defaultSettings = { theme: 'light', geminiApiKey: '' };
    localStorage.setItem('babyGuardian_settings', JSON.stringify(defaultSettings));
    return defaultSettings;
};


function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [babies, setBabies] = useState(getInitialBabies);
  const [selectedBaby, setSelectedBaby] = useState(babies[0]);
  const [isEditingBaby, setIsEditingBaby] = useState(false);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [settings, setSettings] = useState(getInitialSettings);

  useEffect(() => {
      const root = window.document.documentElement;
      const isDark = settings.theme === 'dark' || (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      root.classList.toggle('dark', isDark);
  }, [settings.theme]);

  const updateSettings = (newSettings) => {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      localStorage.setItem('babyGuardian_settings', JSON.stringify(updatedSettings));
  };
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarExpanded(false);
      } else {
        setSidebarExpanded(true);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const updateBabyData = (updatedBaby) => {
    const updatedBabies = babies.map(baby => baby.id === updatedBaby.id ? updatedBaby : baby);
    setBabies(updatedBabies);
    setSelectedBaby(updatedBaby);
    localStorage.setItem('babyGuardian_babies', JSON.stringify(updatedBabies));
  };

  const renderContent = () => {
    if (!selectedBaby && activeTab !== 'settings') return <GenericPlaceholder title="Nenhum bebê selecionado" />;
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardContent
            baby={selectedBaby}
            setActiveTab={setActiveTab}
            updateBabyData={updateBabyData}
            onEditBaby={() => setIsEditingBaby(true)}
            onAddEvent={() => setIsAddingEvent(true)}
          />
        );
      case 'timeline':
        return <TimelineContent baby={selectedBaby} />;
      case 'vaccines':
        return <VaccinesContent baby={selectedBaby} updateBabyData={updateBabyData} />;
      case 'medications':
        return <MedicationsContent baby={selectedBaby} updateBabyData={updateBabyData} />;
      case 'milestones':
        return <MilestonesContent baby={selectedBaby} updateBabyData={updateBabyData} />;
      case 'gallery':
        return <GalleryContent baby={selectedBaby} updateBabyData={updateBabyData} />;
      case 'documents':
        return <DocumentsContent baby={selectedBaby} updateBabyData={updateBabyData} />;
      case 'family':
        return <FamilyContent baby={selectedBaby} updateBabyData={updateBabyData} />;
      case 'settings':
        return <SettingsContent />;
      default:
        return <GenericPlaceholder />;
    }
  };

  return (
    <AppContext.Provider value={{ settings, updateSettings }}>
      <Helmet>
        <title>Baby IAgencia - Cuidado Infantil Digital Revolucionário</title>
        <meta name="description" content="Plataforma completa para acompanhamento do desenvolvimento infantil com IA, prontuário digital, vacinas e marcos de crescimento." />
        <meta property="og:title" content="Baby IAgencia - Cuidado Infantil Digital" />
        <meta property="og:description" content="Revolucione o cuidado com seu bebê através de tecnologia avançada e inteligência artificial." />
      </Helmet>
      <div className="min-h-screen bg-background text-foreground">
        <div className="flex">
          <Sidebar 
            sidebarOpen={sidebarOpen} 
            setSidebarOpen={setSidebarOpen} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            menuItems={menuItemsConfig}
            sidebarExpanded={sidebarExpanded}
            setSidebarExpanded={setSidebarExpanded}
          />
          <div className={cn("flex-1 flex flex-col transition-all duration-300", sidebarExpanded ? "lg:ml-64" : "lg:ml-[4.5rem]")}>
            <Header setSidebarOpen={setSidebarOpen} setActiveTab={setActiveTab} />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
              <div className="max-w-7xl mx-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {renderContent()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </main>
          </div>
        </div>
        <Toaster />
        <FloatingAIChat baby={selectedBaby} updateBabyData={updateBabyData} />
        {selectedBaby && (
          <>
            <EditBabyDialog
              isOpen={isEditingBaby}
              onClose={() => setIsEditingBaby(false)}
              baby={selectedBaby}
              updateBabyData={updateBabyData}
            />
            <AddEventDialog
              isOpen={isAddingEvent}
              onClose={() => setIsAddingEvent(false)}
              baby={selectedBaby}
              updateBabyData={updateBabyData}
            />
          </>
        )}
      </div>
    </AppContext.Provider>
  );
}

export default App;