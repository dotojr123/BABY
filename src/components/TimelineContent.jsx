import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle, Clock, Pill, Syringe, Star, Baby } from 'lucide-react';
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
    appointment: 'bg-blue-500',
    medication: 'bg-orange-500',
    vaccine: 'bg-green-500',
    milestone: 'bg-pink-500',
    default: 'bg-gray-500'
};

const TimelineSkeleton = () => (
    <div className="space-y-4 sm:space-y-6">
        <div className="medical-card rounded-2xl p-4 sm:p-6">
            <div className="flex items-center mb-6">
                <Skeleton className="w-6 h-6 sm:w-8 sm:h-8 mr-3 rounded-full" />
                <Skeleton className="h-6 sm:h-8 w-48 sm:w-64" />
            </div>
            <div className="relative pl-6 sm:pl-8">
                <div className="absolute left-0 top-0 h-full w-0.5 bg-gray-200" style={{ transform: 'translateX(3.5px)' }}></div>
                {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="relative mb-6 sm:mb-8 flex items-center">
                        <Skeleton className="z-10 w-8 h-8 rounded-full -ml-4" />
                        <div className="ml-4 flex-1">
                            <div className="p-3 sm:p-4 bg-white border border-gray-100 rounded-lg shadow-sm">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4">
                                    <div className="flex-1">
                                        <Skeleton className="h-5 w-3/4 mb-2" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </div>
                                    <div className="text-right">
                                        <Skeleton className="h-4 w-20 mb-1" />
                                        <Skeleton className="h-3 w-16" />
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <Skeleton className="h-4 w-24" />
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
        // Simulate loading time for better UX demonstration
        const loadEvents = async () => {
            setIsLoading(true);
            
            // Simulate API delay
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
        <div className="space-y-4 sm:space-y-6">
            <motion.div 
                className="medical-card rounded-2xl p-4 sm:p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center mb-6">
                    <Clock className="w-6 h-6 sm:w-8 sm:h-8 mr-3 text-blue-600" />
                    <h2 className="text-xl sm:text-2xl font-bold gradient-text">Linha do Tempo de {baby.name}</h2>
                </div>
                
                {allEvents.length === 0 ? (
                    <div className="text-center py-12">
                        <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500 text-sm sm:text-base">Nenhum evento registrado ainda.</p>
                        <p className="text-gray-400 text-xs sm:text-sm mt-1">Adicione eventos, vacinas ou marcos para ver a timeline</p>
                    </div>
                ) : (
                    <div className="relative pl-6 sm:pl-8">
                        <div className="absolute left-0 top-0 h-full w-0.5 bg-gray-200" style={{ transform: 'translateX(3.5px)' }}></div>

                        {allEvents.map((event, index) => {
                            const Icon = iconMap[event.eventType] || iconMap.default;
                            const bgColor = colorMap[event.eventType] || colorMap.default;
                            return (
                                <motion.div 
                                    key={`${event.id}-${event.eventType}-${index}`} 
                                    className="relative mb-6 sm:mb-8 flex items-center"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className={`z-10 w-8 h-8 rounded-full flex items-center justify-center -ml-4 ${bgColor}`}>
                                        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <div className="p-3 sm:p-4 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">{event.name}</p>
                                                    <p className="text-xs sm:text-sm text-gray-500 capitalize">{event.eventType}</p>
                                                    {event.details && (
                                                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{event.details}</p>
                                                    )}
                                                </div>
                                                <div className="text-left sm:text-right flex-shrink-0">
                                                    <p className="text-xs sm:text-sm font-medium text-gray-700">
                                                        {format(event.date, "d MMM yyyy", { locale: ptBR })}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {format(event.date, "HH:mm'h'", { locale: ptBR })}
                                                    </p>
                                                </div>
                                            </div>
                                            {event.isCompleted ? (
                                                <div className="mt-2 flex items-center text-green-600 text-xs sm:text-sm">
                                                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1"/>
                                                    <span>Concluído</span>
                                                </div>
                                            ) : (
                                                <div className="mt-2 flex items-center text-yellow-600 text-xs sm:text-sm">
                                                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1"/>
                                                    <span>Pendente</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default TimelineContent;