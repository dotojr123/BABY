import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle, Clock, Pill, Syringe, Star, Baby, Sparkles, Filter, BarChart3, TrendingUp, Download, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LoadingSpinner from '@/components/LoadingSpinner';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
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

const TimelineChart = ({ events }) => {
    const monthlyData = events.reduce((acc, event) => {
        const month = format(event.date, 'MMM yyyy', { locale: ptBR });
        if (!acc[month]) {
            acc[month] = { total: 0, completed: 0, appointment: 0, medication: 0, vaccine: 0, milestone: 0 };
        }
        acc[month].total++;
        acc[month][event.eventType]++;
        if (event.isCompleted) acc[month].completed++;
        return acc;
    }, {});

    const chartData = Object.entries(monthlyData).slice(-6);

    return (
        <Card className="glass-card border-0 shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    Atividade por Mês
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {chartData.map(([month, data]) => (
                        <div key={month} className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">{month}</span>
                                <span className="text-xs text-gray-500">{data.total} eventos</span>
                            </div>
                            <div className="flex gap-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                    className="bg-blue-500 transition-all duration-500"
                                    style={{ width: `${(data.appointment / data.total) * 100}%` }}
                                />
                                <div 
                                    className="bg-orange-500 transition-all duration-500"
                                    style={{ width: `${(data.medication / data.total) * 100}%` }}
                                />
                                <div 
                                    className="bg-green-500 transition-all duration-500"
                                    style={{ width: `${(data.vaccine / data.total) * 100}%` }}
                                />
                                <div 
                                    className="bg-pink-500 transition-all duration-500"
                                    style={{ width: `${(data.milestone / data.total) * 100}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>{data.completed} concluídos</span>
                                <span>{Math.round((data.completed / data.total) * 100)}%</span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

const TimelineStats = ({ events }) => {
    const stats = {
        total: events.length,
        completed: events.filter(e => e.isCompleted).length,
        byType: events.reduce((acc, event) => {
            acc[event.eventType] = (acc[event.eventType] || 0) + 1;
            return acc;
        }, {}),
        thisMonth: events.filter(e => 
            isWithinInterval(e.date, { 
                start: startOfMonth(new Date()), 
                end: endOfMonth(new Date()) 
            })
        ).length
    };

    const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="gradient-card border-0 p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-gray-600">Total de Eventos</div>
            </Card>
            <Card className="gradient-card border-0 p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{completionRate}%</div>
                <div className="text-sm text-gray-600">Taxa de Conclusão</div>
            </Card>
            <Card className="gradient-card border-0 p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.thisMonth}</div>
                <div className="text-sm text-gray-600">Este Mês</div>
            </Card>
            <Card className="gradient-card border-0 p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{Object.keys(stats.byType).length}</div>
                <div className="text-sm text-gray-600">Tipos Diferentes</div>
            </Card>
        </div>
    );
};

const TimelineSkeleton = () => (
    <div className="space-y-6">
        <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center mb-6">
                <Skeleton className="w-8 h-8 mr-3 rounded-full" />
                <Skeleton className="h-8 w-64" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 rounded-xl" />
                ))}
            </div>
            <div className="relative pl-8">
                <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full opacity-30"></div>
                {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="relative mb-8 flex items-center">
                        <Skeleton className="z-10 w-12 h-12 rounded-full -ml-6" />
                        <div className="ml-6 flex-1">
                            <div className="gradient-card rounded-2xl p-4">
                                <Skeleton className="h-6 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-1/2" />
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
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [filters, setFilters] = useState({
        type: 'all',
        status: 'all',
        search: '',
        month: 'all'
    });
    const [showChart, setShowChart] = useState(false);

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
            setFilteredEvents(events);
            setIsLoading(false);
        };

        loadEvents();
    }, [baby]);

    useEffect(() => {
        let filtered = [...allEvents];

        // Filter by type
        if (filters.type !== 'all') {
            filtered = filtered.filter(event => event.eventType === filters.type);
        }

        // Filter by status
        if (filters.status !== 'all') {
            filtered = filtered.filter(event => 
                filters.status === 'completed' ? event.isCompleted : !event.isCompleted
            );
        }

        // Filter by search
        if (filters.search) {
            filtered = filtered.filter(event => 
                event.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                (event.details && event.details.toLowerCase().includes(filters.search.toLowerCase()))
            );
        }

        // Filter by month
        if (filters.month !== 'all') {
            const [year, month] = filters.month.split('-');
            filtered = filtered.filter(event => 
                event.date.getFullYear() === parseInt(year) && 
                event.date.getMonth() === parseInt(month) - 1
            );
        }

        setFilteredEvents(filtered);
    }, [filters, allEvents]);

    const exportTimeline = () => {
        const data = filteredEvents.map(event => ({
            Nome: event.name,
            Tipo: event.eventType,
            Data: format(event.date, 'dd/MM/yyyy HH:mm'),
            Status: event.isCompleted ? 'Concluído' : 'Pendente',
            Detalhes: event.details || ''
        }));
        
        console.log('Exportando timeline:', data);
        // Aqui você implementaria a exportação real (CSV, PDF, etc.)
    };

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
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
                        <div className="flex items-center">
                            <div className="relative">
                                <Clock className="w-8 h-8 mr-3 text-blue-600" />
                                <div className="pulse-ring text-blue-600"></div>
                            </div>
                            <h2 className="text-2xl font-bold gradient-text">Linha do Tempo de {baby.name}</h2>
                            <Sparkles className="w-6 h-6 ml-2 text-yellow-500 animate-pulse" />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant={showChart ? "default" : "outline"}
                                size="sm"
                                onClick={() => setShowChart(!showChart)}
                                className="rounded-xl"
                            >
                                <BarChart3 className="w-4 h-4 mr-2" />
                                {showChart ? 'Ocultar' : 'Mostrar'} Gráficos
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={exportTimeline}
                                className="rounded-xl"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Exportar
                            </Button>
                        </div>
                    </div>

                    {/* Statistics */}
                    <TimelineStats events={allEvents} />

                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                placeholder="Buscar eventos..."
                                value={filters.search}
                                onChange={(e) => setFilters({...filters, search: e.target.value})}
                                className="pl-10 rounded-xl border-2"
                            />
                        </div>
                        <select
                            value={filters.type}
                            onChange={(e) => setFilters({...filters, type: e.target.value})}
                            className="p-2 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none"
                        >
                            <option value="all">Todos os tipos</option>
                            <option value="appointment">Consultas</option>
                            <option value="medication">Medicamentos</option>
                            <option value="vaccine">Vacinas</option>
                            <option value="milestone">Marcos</option>
                        </select>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({...filters, status: e.target.value})}
                            className="p-2 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none"
                        >
                            <option value="all">Todos os status</option>
                            <option value="completed">Concluídos</option>
                            <option value="pending">Pendentes</option>
                        </select>
                        <input
                            type="month"
                            value={filters.month}
                            onChange={(e) => setFilters({...filters, month: e.target.value})}
                            className="p-2 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none"
                        />
                    </div>

                    {/* Chart */}
                    {showChart && allEvents.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mb-6"
                        >
                            <TimelineChart events={allEvents} />
                        </motion.div>
                    )}

                    {/* Results count */}
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-gray-600">
                            Mostrando {filteredEvents.length} de {allEvents.length} eventos
                        </p>
                        {filteredEvents.length !== allEvents.length && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setFilters({ type: 'all', status: 'all', search: '', month: 'all' })}
                                className="text-blue-600 hover:text-blue-700"
                            >
                                Limpar filtros
                            </Button>
                        )}
                    </div>
                    
                    {filteredEvents.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="animate-float">
                                <Calendar className="w-20 h-20 mx-auto text-gray-400 mb-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-600 mb-2">
                                {allEvents.length === 0 ? 'Timeline vazia' : 'Nenhum evento encontrado'}
                            </h3>
                            <p className="text-gray-500 mb-4">
                                {allEvents.length === 0 
                                    ? 'Adicione eventos, vacinas ou marcos para ver a timeline'
                                    : 'Tente ajustar os filtros para encontrar o que procura'
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="relative pl-8">
                            <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-400 via-purple-400 to-pink-400 rounded-full"></div>

                            {filteredEvents.map((event, index) => {
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