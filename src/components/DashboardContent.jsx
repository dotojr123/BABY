
import React from 'react';
import { motion } from 'framer-motion';
import { format, differenceInMonths, differenceInDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

const DashboardContent = ({ baby, setActiveTab, updateBabyData, onEditBaby, onAddEvent }) => {
    const nextEvents = getNextEvents(baby);

    return (
        <div className="space-y-6">
            {/* Baby Profile Card */}
            <motion.div
                className="medical-card rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6"
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
                    <p className="text-lg text-gray-700 mb-2">
                        Nascido(a) em {format(parseISO(baby.birthDate), 'dd \'de\' MMMM, yyyy', { locale: ptBR })} ({getBabyAge(baby.birthDate)})
                    </p>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-x-6 gap-y-2 text-gray-600 text-md">
                        <span>Peso: <span className="font-semibold">{baby.weight}</span></span>
                        <span>Altura: <span className="font-semibold">{baby.height}</span></span>
                    </div>
                    <Button onClick={onEditBaby} className="mt-4">
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                    </Button>
                </div>
            </motion.div>

            {/* Next Events Card */}
            <motion.div
                className="medical-card rounded-2xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        <Calendar className="w-8 h-8 mr-3 text-green-600" />
                        <h2 className="text-2xl font-bold gradient-text">Próximos Eventos</h2>
                    </div>
                    <Button onClick={onAddEvent}>
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar
                    </Button>
                </div>
                <div className="space-y-4">
                    {nextEvents.length > 0 ? (
                        nextEvents.map(event => (
                            <Card key={event.id} className="p-4 flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg">{event.name}</CardTitle>
                                    <CardDescription className="text-sm text-gray-600">{event.details}</CardDescription>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-700">{format(event.date, 'dd/MM/yyyy', { locale: ptBR })}</p>
                                    <p className="text-xs text-gray-500">{format(event.date, 'HH:mm', { locale: ptBR })}</p>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 py-4">Nenhum evento futuro agendado.</p>
                    )}
                </div>
            </motion.div>

            {/* Quick Access Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                    className="medical-card rounded-2xl p-6 text-center cursor-pointer hover:shadow-lg transition-shadow"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    onClick={() => setActiveTab('vaccines')}
                >
                    <Shield className="w-10 h-10 mx-auto mb-3 text-green-500" />
                    <h3 className="text-xl font-semibold">Vacinas</h3>
                    <p className="text-sm text-gray-600">Gerencie as vacinas do bebê.</p>
                </motion.div>
                <motion.div
                    className="medical-card rounded-2xl p-6 text-center cursor-pointer hover:shadow-lg transition-shadow"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    onClick={() => setActiveTab('medications')}
                >
                    <Pill className="w-10 h-10 mx-auto mb-3 text-orange-500" />
                    <h3 className="text-xl font-semibold">Medicamentos</h3>
                    <p className="text-sm text-gray-600">Controle os medicamentos.</p>
                </motion.div>
                <motion.div
                    className="medical-card rounded-2xl p-6 text-center cursor-pointer hover:shadow-lg transition-shadow"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    onClick={() => setActiveTab('milestones')}
                >
                    <TrendingUp className="w-10 h-10 mx-auto mb-3 text-pink-500" />
                    <h3 className="text-xl font-semibold">Marcos</h3>
                    <p className="text-sm text-gray-600">Acompanhe o desenvolvimento.</p>
                </motion.div>
                <motion.div
                    className="medical-card rounded-2xl p-6 text-center cursor-pointer hover:shadow-lg transition-shadow"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    onClick={() => setActiveTab('timeline')}
                >
                    <Calendar className="w-10 h-10 mx-auto mb-3 text-blue-500" />
                    <h3 className="text-xl font-semibold">Timeline</h3>
                    <p className="text-sm text-gray-600">Veja o histórico completo.</p>
                </motion.div>
            </div>
        </div>
    );
};

export default DashboardContent;
