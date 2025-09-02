import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle, Clock, Pill, Syringe, Star, Baby } from 'lucide-react';
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

const TimelineContent = ({ baby }) => {
    const allEvents = [
        ...(baby.events || []).map(e => ({...e, eventType: e.type, date: new Date(e.date), isCompleted: e.completed })),
        ...(baby.vaccines || []).map(v => ({...v, eventType: 'vaccine', date: new Date(v.date), isCompleted: v.status === 'completed', name: v.name})),
        ...(baby.milestones || []).map(m => ({...m, eventType: 'milestone', date: new Date(m.date), isCompleted: m.achieved, name: m.milestone}))
    ].sort((a,b) => b.date - a.date);

    return (
        <div className="space-y-6">
            <motion.div 
                className="medical-card rounded-2xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center mb-6">
                    <Clock className="w-8 h-8 mr-3 text-blue-600" />
                    <h2 className="text-2xl font-bold gradient-text">Linha do Tempo de {baby.name}</h2>
                </div>
                <div className="relative pl-8">
                    <div className="absolute left-0 top-0 h-full w-0.5 bg-gray-200" style={{ transform: 'translateX(3.5px)' }}></div>

                    {allEvents.map((event, index) => {
                        const Icon = iconMap[event.eventType] || iconMap.default;
                        const bgColor = colorMap[event.eventType] || colorMap.default;
                        return (
                            <motion.div 
                                key={`${event.id}-${event.eventType}-${index}`} 
                                className="relative mb-8 flex items-center"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className={`z-10 w-8 h-8 rounded-full flex items-center justify-center -ml-4 ${bgColor}`}>
                                    <Icon className="w-5 h-5 text-white" />
                                </div>
                                <div className="ml-4 flex-1">
                                    <div className="p-4 bg-white border border-gray-100 rounded-lg shadow-sm">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold text-gray-800">{event.name}</p>
                                                <p className="text-sm text-gray-500 capitalize">{event.eventType}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-gray-700">{format(event.date, "d MMM yyyy", { locale: ptBR })}</p>
                                                <p className="text-xs text-gray-500">{format(event.date, "HH:mm'h'", { locale: ptBR })}</p>
                                            </div>
                                        </div>
                                        {event.isCompleted ? (
                                            <div className="mt-2 flex items-center text-green-600 text-sm">
                                                <CheckCircle className="w-4 h-4 mr-1"/>
                                                <span>Concluído</span>
                                            </div>
                                        ) : (
                                            <div className="mt-2 flex items-center text-yellow-600 text-sm">
                                                <Clock className="w-4 h-4 mr-1"/>
                                                <span>Pendente</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>
        </div>
    );
};

export default TimelineContent;