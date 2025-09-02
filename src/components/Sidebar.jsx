import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Activity, Clock, Shield, Pill, TrendingUp, Camera, MessageCircle, Users, Settings, X, ChevronsLeft, ChevronsRight, Baby, Sparkles
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
        <div className="flex flex-col h-full bg-gradient-to-b from-white via-blue-50/30 to-purple-50/30 backdrop-blur-sm border-r border-white/20">
            <div className="p-4 border-b border-white/20 h-16 flex items-center justify-between relative overflow-hidden">
                {/* Decorative gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
                
                <motion.div 
                    className={cn("flex items-center space-x-2 overflow-hidden relative z-10")}
                    initial={false}
                    animate={{ width: isExpanded ? 'auto' : '2rem' }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                        <Baby className="w-5 h-5 text-white" />
                    </div>
                    <motion.div
                        className="whitespace-nowrap"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isExpanded ? 1 : 0 }}
                        transition={{ duration: 0.2, delay: isExpanded ? 0.1 : 0 }}
                    >
                        <h1 className="text-xl font-bold gradient-text flex items-center">
                            Baby IAgencia
                            <Sparkles className="w-4 h-4 ml-1 text-yellow-500" />
                        </h1>
                        <p className="text-xs text-gray-500">Cuidado Inteligente</p>
                    </motion.div>
                </motion.div>
                
                <Button
                    variant="ghost"
                    size="sm"
                    className="hidden lg:block hover:bg-white/50 transition-colors relative z-10"
                    onClick={() => setSidebarExpanded(!sidebarExpanded)}
                >
                    {sidebarExpanded ? <ChevronsLeft className="w-5 h-5" /> : <ChevronsRight className="w-5 h-5" />}
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden hover:bg-white/50 transition-colors relative z-10"
                >
                    <X className="w-4 h-4" />
                </Button>
            </div>
            
            <nav className="flex-1 p-2 overflow-y-auto">
                <ul className="space-y-2">
                    {menuItems.map((item, index) => {
                        const Icon = iconMap[item.icon];
                        const isActive = activeTab === item.id;
                        
                        return (
                            <li key={item.id}>
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Button
                                        variant={isActive ? "default" : "ghost"}
                                        className={cn(
                                            "w-full justify-start relative overflow-hidden transition-all duration-200",
                                            !isExpanded && "justify-center",
                                            isActive && "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg",
                                            !isActive && "hover:bg-white/50 hover:shadow-md"
                                        )}
                                        onClick={() => {
                                            setActiveTab(item.id);
                                            if(isMobile) {
                                                setSidebarOpen(false);
                                            }
                                        }}
                                    >
                                        {isActive && (
                                            <motion.div
                                                className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ duration: 0.3 }}
                                            />
                                        )}
                                        <Icon className={cn(
                                            "w-5 h-5 relative z-10",
                                            isExpanded && "mr-3",
                                            isActive && "drop-shadow-sm"
                                        )} />
                                        <motion.span 
                                            className="whitespace-nowrap overflow-hidden relative z-10 font-medium"
                                            initial={{ opacity: 0, width: 0 }}
                                            animate={{ 
                                                opacity: isExpanded ? 1 : 0, 
                                                width: isExpanded ? 'auto' : 0 
                                            }}
                                            transition={{ duration: 0.2, delay: isExpanded ? 0.1 : 0 }}
                                        >
                                            {item.label}
                                        </motion.span>
                                        {isActive && isExpanded && (
                                            <motion.div
                                                className="ml-auto"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 0.2 }}
                                            >
                                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                            </motion.div>
                                        )}
                                    </Button>
                                </motion.div>
                            </li>
                        );
                    })}
                </ul>
            </nav>
            
            {/* Footer with version info */}
            {isExpanded && (
                <motion.div 
                    className="p-4 border-t border-white/20 relative"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
                    <div className="text-center relative z-10">
                        <p className="text-xs text-gray-500">Versão 3.0</p>
                        <p className="text-xs text-gray-400">Powered by IA</p>
                    </div>
                </motion.div>
            )}
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
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                            onClick={() => setSidebarOpen(false)}
                        />
                        <motion.aside
                            initial={{ x: -300 }}
                            animate={{ x: 0 }}
                            exit={{ x: -300 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="fixed inset-y-0 left-0 z-50 w-64 shadow-2xl"
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
            className="fixed inset-y-0 left-0 z-30 h-screen hidden lg:block shadow-xl"
        >
            {content}
        </motion.aside>
    );
};

export default Sidebar;