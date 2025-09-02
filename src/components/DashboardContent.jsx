import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, differenceInMonths, differenceInDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Pill, Shield, TrendingUp, Edit, Plus, Heart, Star, Clock, Activity } from 'lucide-react';

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
    return sortedEvents.slice(0, 3);
};

const getStats = (baby) => {
    const totalEvents = (baby.events || []).length;
    const completedEvents = (baby.events || []).filter(e => e.completed).length;
    const totalVaccines = (baby.vaccines || []).length;
    const completedVaccines = (baby.vaccines || []).filter(v => v.status === 'completed').length;
    const totalMilestones = (baby.milestones || []).length;
    const achievedMilestones = (baby.milestones || []).filter(m => m.achieved).length;
    const totalPhotos = (baby.gallery || []).length;

    return {
        events: { total: totalEvents, completed: completedEvents },
        vaccines: { total: totalVaccines, completed: completedVaccines },
        milestones: { total: totalMilestones, achieved: achievedMilestones },
        photos: totalPhotos
    };
};

const StatCard = ({ icon: Icon, title, value, subtitle, gradient, delay = 0 }) => (
    <motion.div
        className={`stat-card floating-card ${gradient}`}
        style={{ '--color-start': gradient.includes('blue') ? '#3b82f6' : gradient.includes('green') ? '#10b981' : gradient.includes('purple') ? '#8b5cf6' : '#f59e0b' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
        whileHover={{ scale: 1.05 }}
    >
        <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
                <Icon className="w-8 h-8 text-white/90" />
                <div className="text-right">
                    <div className="text-2xl font-bold text-white">{value}</div>
                    {subtitle && <div className="text-xs text-white/80">{subtitle}</div>}
                </div>
            </div>
            <div className="text-sm text-white/90 font-medium">{title}</div>
        </div>
    </motion.div>
);

const DashboardSkeleton = () => (
    <div className="space-y-6">
        <div className="glass-card rounded-3xl p-6 flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="flex flex-col items-center text-center">
                <Skeleton className="w-32 h-32 rounded-full" />
                <Skeleton className="h-8 w-32 mt-2" />
            </div>
            <div className="flex-1 text-center sm:text-left space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-10 w-24 mt-4" />
            </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
        </div>
    </div>
);

const DashboardContent = ({ baby, setActiveTab, updateBabyData, onEditBaby, onAddEvent }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [nextEvents, setNextEvents] = useState([]);
    const [stats, setStats] = useState({});

    useEffect(() => {
        const loadDashboard = async () => {
            setIsLoading(true);
            await new Promise(resolve => setTimeout(resolve, 600));
            
            const events = getNextEvents(baby);
            const babyStats = getStats(baby);
            setNextEvents(events);
            setStats(babyStats);
            setIsLoading(false);
        };

        loadDashboard();
    }, [baby]);

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="space-y-6">
            {/* Hero Baby Profile Card */}
            <motion.div
                className="glass-card rounded-3xl p-6 sm:p-8 relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full transform translate-x-16 -translate-y-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-400/20 to-yellow-400/20 rounded-full transform -translate-x-12 translate-y-12"></div>
                
                <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start space-y-6 sm:space-y-0 sm:space-x-8">
                    <div className="flex flex-col items-center text-center">
                        <div className="relative">
                            <Avatar className="w-32 h-32 border-4 border-white shadow-2xl">
                                <AvatarImage src={baby.photo} alt={`Foto de ${baby.name}`} />
                                <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                                    {baby.name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-pink-400 to-red-400 rounded-full flex items-center justify-center">
                                <Heart className="w-4 h-4 text-white animate-pulse" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold gradient-text mt-4">{baby.name}</h1>
                        <div className="flex items-center mt-2 px-3 py-1 bg-blue-100 rounded-full">
                            <Star className="w-4 h-4 text-blue-600 mr-1" />
                            <span className="text-sm font-medium text-blue-700">Meu Bebê</span>
                        </div>
                    </div>
                    
                    <div className="flex-1 text-center sm:text-left">
                        <div className="space-y-4">
                            <div>
                                <p className="text-lg text-gray-700 mb-2">
                                    Nascido(a) em {format(parseISO(baby.birthDate), 'dd \'de\' MMMM, yyyy', { locale: ptBR })}
                                </p>
                                <p className="text-2xl font-bold gradient-text">
                                    {getBabyAge(baby.birthDate)}
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-3">
                                    <div className="text-sm text-blue-600 font-medium">Peso</div>
                                    <div className="text-xl font-bold text-blue-800">{baby.weight}</div>
                                </div>
                                <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-3">
                                    <div className="text-sm text-purple-600 font-medium">Altura</div>
                                    <div className="text-xl font-bold text-purple-800">{baby.height}</div>
                                </div>
                            </div>
                            
                            <Button onClick={onEditBaby} className="btn-gradient text-white border-0 w-full sm:w-auto">
                                <Edit className="w-4 h-4 mr-2" />
                                Editar Perfil
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={Activity}
                    title="Eventos"
                    value={stats.events?.completed || 0}
                    subtitle={`de ${stats.events?.total || 0} total`}
                    gradient="gradient-blue"
                    delay={0.1}
                />
                <StatCard
                    icon={Shield}
                    title="Vacinas"
                    value={stats.vaccines?.completed || 0}
                    subtitle={`de ${stats.vaccines?.total || 0} total`}
                    gradient="gradient-green"
                    delay={0.2}
                />
                <StatCard
                    icon={TrendingUp}
                    title="Marcos"
                    value={stats.milestones?.achieved || 0}
                    subtitle={`de ${stats.milestones?.total || 0} total`}
                    gradient="gradient-purple"
                    delay={0.3}
                />
                <StatCard
                    icon={Heart}
                    title="Fotos"
                    value={stats.photos || 0}
                    subtitle="memórias"
                    gradient="gradient-orange"
                    delay={0.4}
                />
            </div>

            {/* Next Events Card */}
            <motion.div
                className="glass-card rounded-3xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center">
                        <div className="relative">
                            <Calendar className="w-8 h-8 mr-3 text-green-600" />
                            <div className="pulse-ring text-green-600"></div>
                        </div>
                        <h2 className="text-2xl font-bold gradient-text">Próximos Eventos</h2>
                    </div>
                    <Button onClick={onAddEvent} className="btn-gradient text-white border-0 w-full sm:w-auto">
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar
                    </Button>
                </div>
                
                <div className="space-y-4">
                    {nextEvents.length > 0 ? (
                        nextEvents.map((event, index) => (
                            <motion.div
                                key={event.id}
                                className="gradient-card rounded-2xl p-4 floating-card"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * index }}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center mb-2">
                                            <Clock className="w-4 h-4 text-blue-600 mr-2" />
                                            <CardTitle className="text-lg truncate">{event.name}</CardTitle>
                                        </div>
                                        {event.details && (
                                            <CardDescription className="text-sm text-gray-600">{event.details}</CardDescription>
                                        )}
                                    </div>
                                    <div className="text-left sm:text-right flex-shrink-0 bg-white/50 rounded-lg p-2">
                                        <p className="text-sm font-bold text-gray-800">{format(event.date, 'dd/MM/yyyy', { locale: ptBR })}</p>
                                        <p className="text-xs text-gray-600">{format(event.date, 'HH:mm', { locale: ptBR })}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <div className="animate-float">
                                <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                            </div>
                            <p className="text-gray-500 text-lg font-medium">Nenhum evento futuro agendado.</p>
                            <p className="text-gray-400 text-sm mt-1">Clique em "Adicionar" para criar um novo evento</p>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Quick Access Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { id: 'vaccines', icon: Shield, title: 'Vacinas', desc: 'Gerencie as vacinas', color: 'from-green-400 to-blue-500' },
                    { id: 'medications', icon: Pill, title: 'Medicamentos', desc: 'Controle medicamentos', color: 'from-orange-400 to-pink-500' },
                    { id: 'milestones', icon: TrendingUp, title: 'Marcos', desc: 'Acompanhe desenvolvimento', color: 'from-purple-400 to-pink-500' },
                    { id: 'timeline', icon: Activity, title: 'Timeline', desc: 'Histórico completo', color: 'from-blue-400 to-purple-500' }
                ].map((item, index) => (
                    <motion.div
                        key={item.id}
                        className="glass-card rounded-2xl p-6 text-center cursor-pointer floating-card group relative overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        onClick={() => setActiveTab(item.id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                        <div className="relative z-10">
                            <div className={`w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                <item.icon className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-1">{item.title}</h3>
                            <p className="text-sm text-gray-600">{item.desc}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default DashboardContent;