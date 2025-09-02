import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, differenceInMonths, differenceInDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Pill, Shield, TrendingUp, Edit, Plus } from 'lucide-react';

const getBabyAge = (birthDate) => {
    const today = new Date();
    const birth = parseISO(birthDate);

    const months = differenceInMonths(today, birth);
    const remainingDays = differenceInDays(today, new Date(birth.getFullYear(), birth.getMonth() + months, birth.getDate()));

    if (months < 1) {
        return `${remainingDays} dia(s)`;
    } else if (months < 12) {
        return `${months} mês(es) e ${remainingDays} dia(s)`;
    } else {
        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;
        return `${years} ano(s), ${remainingMonths} mês(es) e ${remainingDays} dia(s)`;
    }
};

const getNextEvents = (baby) => {
    const allEvents = [
        ...(baby.events || []).filter(e => !e.completed).map(e => ({ ...e, type: e.type, date: parseISO(e.date) })),
        ...(baby.vaccines || []).filter(v => v.status === 'pending').map(v => ({ ...v, type: 'vaccine', name: v.name, date: parseISO(v.date) })),
    ];

    const sortedEvents = allEvents.sort((a, b) => a.date - b.date);
    return sortedEvents.slice(0, 3); // Get up to 3 next events
};

const DashboardSkeleton = () => (
    <div className="space-y-4 sm:space-y-6">
        {/* Baby Profile Skeleton */}
        <div className="medical-card rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="flex flex-col items-center text-center">
                <Skeleton className="w-24 h-24 md:w-32 md:h-32 rounded-full" />
                <Skeleton className="h-8 w-32 mt-2" />
            </div>
            <div className="flex-1 text-center sm:text-left space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-10 w-24 mt-4" />
            </div>
        </div>

        {/* Next Events Skeleton */}
        <div className="medical-card rounded-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <Skeleton className="w-6 h-6 sm:w-8 sm:h-8 mr-3 rounded-full" />
                    <Skeleton className="h-6 sm:h-8 w-48" />
                </div>
                <Skeleton className="h-10 w-24" />
            </div>
            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="p-4">
                        <div className="flex justify-between items-center">
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                            <div className="text-right space-y-1">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>

        {/* Quick Access Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="p-4 sm:p-6 text-center">
                    <Skeleton className="w-10 h-10 mx-auto mb-3 rounded-full" />
                    <Skeleton className="h-6 w-20 mx-auto mb-2" />
                    <Skeleton className="h-4 w-32 mx-auto" />
                </Card>
            ))}
        </div>
    </div>
);

const DashboardContent = ({ baby, setActiveTab, updateBabyData, onEditBaby, onAddEvent }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [nextEvents, setNextEvents] = useState([]);

    useEffect(() => {
        const loadDashboard = async () => {
            setIsLoading(true);
            
            // Simulate loading delay
            await new Promise(resolve => setTimeout(resolve, 600));
            
            const events = getNextEvents(baby);
            setNextEvents(events);
            setIsLoading(false);
        };

        loadDashboard();
    }, [baby]);

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Baby Profile Card */}
            <motion.div
                className="medical-card rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex flex-col items-center text-center">
                    <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-blue-200 shadow-lg">
                        <AvatarImage src={baby.photo} alt={`Foto de ${baby.name}`} />
                        <AvatarFallback>{baby.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h1 className="text-2xl sm:text-3xl font-bold gradient-text mt-2">{baby.name}</h1>
                </div>
                <div className="flex-1 text-center sm:text-left">
                    <p className="text-base sm:text-lg text-gray-700 mb-2">
                        Nascido(a) em {format(parseISO(baby.birthDate), 'dd \'de\' MMMM, yyyy', { locale: ptBR })} ({getBabyAge(baby.birthDate)})
                    </p>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 sm:gap-x-6 gap-y-2 text-gray-600 text-sm sm:text-md">
                        <span>Peso: <span className="font-semibold">{baby.weight}</span></span>
                        <span>Altura: <span className="font-semibold">{baby.height}</span></span>
                    </div>
                    <Button onClick={onEditBaby} className="mt-4 w-full sm:w-auto">
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                    </Button>
                </div>
            </motion.div>

            {/* Next Events Card */}
            <motion.div
                className="medical-card rounded-2xl p-4 sm:p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center">
                        <Calendar className="w-6 h-6 sm:w-8 sm:h-8 mr-3 text-green-600" />
                        <h2 className="text-xl sm:text-2xl font-bold gradient-text">Próximos Eventos</h2>
                    </div>
                    <Button onClick={onAddEvent} className="w-full sm:w-auto">
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar
                    </Button>
                </div>
                <div className="space-y-3 sm:space-y-4">
                    {nextEvents.length > 0 ? (
                        nextEvents.map(event => (
                            <Card key={event.id} className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 hover:shadow-md transition-shadow">
                                <div className="flex-1 min-w-0">
                                    <CardTitle className="text-base sm:text-lg truncate">{event.name}</CardTitle>
                                    {event.details && (
                                        <CardDescription className="text-xs sm:text-sm text-gray-600 mt-1">{event.details}</CardDescription>
                                    )}
                                </div>
                                <div className="text-left sm:text-right flex-shrink-0">
                                    <p className="text-xs sm:text-sm font-medium text-gray-700">{format(event.date, 'dd/MM/yyyy', { locale: ptBR })}</p>
                                    <p className="text-xs text-gray-500">{format(event.date, 'HH:mm', { locale: ptBR })}</p>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-8">
                            <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-500 text-sm sm:text-base">Nenhum evento futuro agendado.</p>
                            <p className="text-gray-400 text-xs sm:text-sm mt-1">Clique em "Adicionar" para criar um novo evento</p>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Quick Access Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <motion.div
                    className="medical-card rounded-2xl p-4 sm:p-6 text-center cursor-pointer hover:shadow-lg transition-shadow"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    onClick={() => setActiveTab('vaccines')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Shield className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-3 text-green-500" />
                    <h3 className="text-lg sm:text-xl font-semibold">Vacinas</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Gerencie as vacinas do bebê.</p>
                </motion.div>
                <motion.div
                    className="medical-card rounded-2xl p-4 sm:p-6 text-center cursor-pointer hover:shadow-lg transition-shadow"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    onClick={() => setActiveTab('medications')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Pill className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-3 text-orange-500" />
                    <h3 className="text-lg sm:text-xl font-semibold">Medicamentos</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Controle os medicamentos.</p>
                </motion.div>
                <motion.div
                    className="medical-card rounded-2xl p-4 sm:p-6 text-center cursor-pointer hover:shadow-lg transition-shadow"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    onClick={() => setActiveTab('milestones')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-3 text-pink-500" />
                    <h3 className="text-lg sm:text-xl font-semibold">Marcos</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Acompanhe o desenvolvimento.</p>
                </motion.div>
                <motion.div
                    className="medical-card rounded-2xl p-4 sm:p-6 text-center cursor-pointer hover:shadow-lg transition-shadow"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    onClick={() => setActiveTab('timeline')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Calendar className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-3 text-blue-500" />
                    <h3 className="text-lg sm:text-xl font-semibold">Timeline</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Veja o histórico completo.</p>
                </motion.div>
            </div>
        </div>
    );
};

export default DashboardContent;