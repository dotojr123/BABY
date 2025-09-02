import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle, Clock, Pill, Syringe, Star, Baby, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import LoadingSpinner from '@/components/LoadingSpinner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const iconMap = {
    appointment: Calendar,
    medication: Pill,
    vaccine: Syringe,
    milestone: Star,
    default: Baby,
};

const colorMap = {
    appointment: 'from-blue-500 to-blue-600',
    medication: 'from-orange-500 to-orange-600',
    vaccine: 'from-green-500 to-green-600',
    milestone: 'from-pink-500 to-pink-600',
    default: 'from-gray-500 to-gray-600'
};

const TimelineSkeleton = () => (
    <div className="space-y-6">
        <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center mb-6">
                <Skeleton className="w-8 h-8 mr-3 rounded-full" />
                <Skeleton className="h-8 w-64" />
            </div>
            <div className="relative pl-8">
                <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full opacity-30"></div>
                {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="relative mb-8 flex items-center">
                        <Skeleton className="z-10 w-12 h-12 rounded-full -ml-6" />
                        <div className="ml-6 flex-1">
                            <div className="gradient-card rounded-2xl p-4">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                                    <div className="flex-1">
                                        <Skeleton className="h-6 w-3/4 mb-2" />
                                        <Skeleton className="h-4 w-1/2 mb-2" />
                                        <Skeleton className="h-4 w-2/3" />
                                    </div>
                                    <div className="text-right">
                                        <Skeleton className="h-4 w-20 mb-1" />
                                        <Skeleton className="h-3 w-16" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const TimelineContent = ({ baby }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [allEvents, setAllEvents] = useState([]);

    useEffect(() => {
        const loadEvents = async () => {
            setIsLoading(true);
            await new Promise(resolve => setTimeout(resolve, 800));
            
            const events = [
                ...(baby.events || []).map(e => ({...e, eventType: e.type, date: new Date(e.date), isCompleted: e.completed })),
                ...(baby.vaccines || []).map(v => ({...v, eventType: 'vaccine', date: new Date(v.date), isCompleted: v.status === 'completed', name: v.name})),
                ...(baby.milestones || []).map(m => ({...m, eventType: 'milestone', date: new Date(m.date), isCompleted: m.achieved, name: m.milestone}))
            ].sort((a,b) => b.date - a.date);
            
            setAllEvents(events);
            setIsLoading(false);
        };

        loadEvents();
    }, [baby]);

    if (isLoading) {
        return <TimelineSkeleton />;
    }

    return (
        <div className="space-y-6">
            <motion.div 
                className="glass-card rounded-3xl p-6 relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full transform translate-x-16 -translate-y-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-400/20 to-yellow-400/20 rounded-full transform -translate-x-12 translate-y-12"></div>

                <div className="relative z-10">
                    <div className="flex items-center mb-8">
                        <div className="relative">
                            <Clock className="w-8 h-8 mr-3 text-blue-600" />
                            <div className="pulse-ring text-blue-600"></div>
                        </div>
                        <h2 className="text-2xl font-bold gradient-text">Linha do Tempo de {baby.name}</h2>
                        <Sparkles className="w-6 h-6 ml-2 text-yellow-500 animate-pulse" />
                    </div>
                    
                    {allEvents.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="animate-float">
                                <Calendar className="w-20 h-20 mx-auto text-gray-400 mb-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-600 mb-2">Timeline vazia</h3>
                            <p className="text-gray-500 mb-4">Adicione eventos, vacinas ou marcos para ver a timeline</p>
                        </div>
                    ) : (
                        <div className="relative pl-8">
                            <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-400 via-purple-400 to-pink-400 rounded-full"></div>

                            {allEvents.map((event, index) => {
                                const Icon = iconMap[event.eventType] || iconMap.default;
                                const gradientColor = colorMap[event.eventType] || colorMap.default;
                                return (
                                    <motion.div 
                                        key={`${event.id}-${event.eventType}-${index}`} 
                                        className="relative mb-8 flex items-center"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <div className={`z-10 w-12 h-12 rounded-full bg-gradient-to-r ${gradientColor} flex items-center justify-center -ml-6 shadow-lg`}>
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="ml-6 flex-1">
                                            <motion.div 
                                                className="gradient-card rounded-2xl p-4 floating-card border-0 shadow-lg"
                                                whileHover={{ scale: 1.02 }}
                                            >
                                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-bold text-gray-800 text-lg mb-1 truncate">{event.name}</h3>
                                                        <div className="flex items-center mb-2">
                                                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${gradientColor} text-white`}>
                                                                {event.eventType}
                                                            </span>
                                                        </div>
                                                        {event.details && (
                                                            <p className="text-sm text-gray-600 line-clamp-2">{event.details}</p>
                                                        )}
                                                    </div>
                                                    <div className="text-left sm:text-right flex-shrink-0 bg-white/70 rounded-xl p-3">
                                                        <p className="text-sm font-bold text-gray-800">
                                                            {format(event.date, "d MMM yyyy", { locale: ptBR })}
                                                        </p>
                                                        <p className="text-xs text-gray-600">
                                                            {format(event.date, "HH:mm'h'", { locale: ptBR })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="mt-3 flex items-center justify-between">
                                                    {event.isCompleted ? (
                                                        <div className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full">
                                                            <CheckCircle className="w-4 h-4 mr-2"/>
                                                            <span className="text-sm font-medium">Concluído</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                                                            <Clock className="w-4 h-4 mr-2"/>
                                                            <span className="text-sm font-medium">Pendente</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default TimelineContent;