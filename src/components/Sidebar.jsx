
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Activity, Clock, Shield, Pill, TrendingUp, Camera, MessageCircle, Users, Settings, X, ChevronsLeft, ChevronsRight, Baby
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const iconMap = {
    Activity, Clock, Shield, Pill, TrendingUp, Camera, MessageCircle, Users, Settings
};

const Sidebar = ({ sidebarOpen, setSidebarOpen, activeTab, setActiveTab, menuItems, sidebarExpanded, setSidebarExpanded }) => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
    const isExpanded = isMobile || sidebarExpanded;

    const content = (
        <div className="flex flex-col h-full bg-card">
            <div className="p-4 border-b h-16 flex items-center justify-between">
                <motion.div 
                    className={cn("flex items-center space-x-2 overflow-hidden")}
                    initial={false}
                    animate={{ width: isExpanded ? 'auto' : '2rem' }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Baby className="w-5 h-5 text-white" />
                    </div>
                    <motion.h1 
                        className="text-xl font-bold gradient-text whitespace-nowrap"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isExpanded ? 1 : 0 }}
                        transition={{ duration: 0.2, delay: isExpanded ? 0.1 : 0 }}
                    >
                        Baby IAgencia
                    </motion.h1>
                </motion.div>
                 <Button
                    variant="ghost"
                    size="sm"
                    className="hidden lg:block"
                    onClick={() => setSidebarExpanded(!sidebarExpanded)}
                >
                    {sidebarExpanded ? <ChevronsLeft className="w-5 h-5" /> : <ChevronsRight className="w-5 h-5" />}
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden"
                >
                    <X className="w-4 h-4" />
                </Button>
            </div>
            
            <nav className="flex-1 p-2">
                <ul className="space-y-2">
                    {menuItems.map((item) => {
                        const Icon = iconMap[item.icon];
                        return (
                            <li key={item.id}>
                                <Button
                                    variant={activeTab === item.id ? "default" : "ghost"}
                                    className={cn("w-full justify-start", !isExpanded && "justify-center")}
                                    onClick={() => {
                                        setActiveTab(item.id);
                                        if(isMobile) {
                                            setSidebarOpen(false);
                                        }
                                    }}
                                >
                                    <Icon className={cn("w-5 h-5", isExpanded && "mr-3")} />
                                    <motion.span 
                                        className="whitespace-nowrap overflow-hidden"
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: isExpanded ? 1 : 0, width: isExpanded ? 'auto' : 0 }}
                                        transition={{ duration: 0.2, delay: isExpanded ? 0.1 : 0 }}
                                    >
                                        {item.label}
                                    </motion.span>
                                </Button>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </div>
    );

    if (isMobile) {
        return (
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 z-40"
                            onClick={() => setSidebarOpen(false)}
                        />
                        <motion.aside
                            initial={{ x: -300 }}
                            animate={{ x: 0 }}
                            exit={{ x: -300 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="fixed inset-y-0 left-0 z-50 w-64 border-r"
                        >
                            {content}
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        );
    }

    return (
        <motion.aside
            animate={{ width: sidebarExpanded ? '16rem' : '4.5rem' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 left-0 z-30 border-r h-screen hidden lg:block"
        >
            {content}
        </motion.aside>
    );
};

export default Sidebar;
