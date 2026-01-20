import React, { useState, useEffect, createContext, useContext } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
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
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
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

function AppInner() {
  const { user, loading } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' or 'signup'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [baby, setBaby] = useState(null);
  const [isEditingBaby, setIsEditingBaby] = useState(false);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [settings, setSettings] = useState({ theme: 'light', geminiApiKey: '' });

  // Load Baby Data from Cloudflare
  useEffect(() => {
    if (user) {
      api.getBaby().then(setBaby).catch(console.error);
    }
  }, [user]);

  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = settings.theme === 'dark' || (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    root.classList.toggle('dark', isDark);
  }, [settings.theme]);

  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const updateBabyData = (updatedBaby) => {
    setBaby(updatedBaby);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;

  if (!user) {
    return authView === 'login'
      ? <LoginPage onSwitchToSignup={() => setAuthView('signup')} />
      : <SignupPage onSwitchToLogin={() => setAuthView('login')} />;
  }

  const renderContent = () => {
    if (!baby && activeTab !== 'settings') return <div className="p-8 text-center text-gray-500">Buscando informações do seu bebê...</div>;
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardContent
            baby={baby}
            setActiveTab={setActiveTab}
            updateBabyData={updateBabyData}
            onEditBaby={() => setIsEditingBaby(true)}
            onAddEvent={() => setIsAddingEvent(true)}
          />
        );
      case 'timeline':
        return <TimelineContent baby={baby} />;
      case 'vaccines':
        return <VaccinesContent baby={baby} updateBabyData={updateBabyData} />;
      case 'medications':
        return <MedicationsContent baby={baby} updateBabyData={updateBabyData} />;
      case 'milestones':
        return <MilestonesContent baby={baby} updateBabyData={updateBabyData} />;
      case 'gallery':
        return <GalleryContent baby={baby} updateBabyData={updateBabyData} />;
      case 'documents':
        return <DocumentsContent baby={baby} updateBabyData={updateBabyData} />;
      case 'family':
        return <FamilyContent baby={baby} updateBabyData={updateBabyData} />;
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
            <Header setSidebarOpen={setSidebarOpen} setActiveTab={setActiveTab} baby={baby} />
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
        <FloatingAIChat baby={baby} updateBabyData={updateBabyData} />
        {baby && (
          <>
            <EditBabyDialog
              isOpen={isEditingBaby}
              onClose={() => setIsEditingBaby(false)}
              baby={baby}
              updateBabyData={updateBabyData}
            />
            <AddEventDialog
              isOpen={isAddingEvent}
              onClose={() => setIsAddingEvent(false)}
              baby={baby}
              updateBabyData={updateBabyData}
            />
          </>
        )}
      </div>
    </AppContext.Provider>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </HelmetProvider>
  );
}
