import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, CheckCircle, Clock, Syringe, Shield, Sparkles, Calendar, AlertCircle, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import { differenceInMonths, parseISO, addMonths, isAfter } from 'date-fns';
import { api } from '@/services/api';
import { safeParseDate } from '@/lib/utils';
import { ptBR } from 'date-fns/locale';

const vaccineSchedule = [
    // ... (same as before)
];



const VaccineScheduleCard = ({ baby, vaccines = [] }) => {
    const babyAgeMonths = baby.birthDate ? differenceInMonths(new Date(), safeParseDate(baby.birthDate)) : 0;
    const appliedVaccinesNames = vaccines.filter(v => v.status === 'completed').map(v => v.name.toLowerCase());

    const upcomingVaccines = vaccineSchedule
        .filter(v => v.ageMonths <= babyAgeMonths + 3 && v.ageMonths >= babyAgeMonths)
        .filter(v => !appliedVaccinesNames.some(applied => applied.includes(v.name.toLowerCase().split(' ')[0])));

    const overdueVaccines = vaccineSchedule
        .filter(v => v.ageMonths < babyAgeMonths)
        .filter(v => !appliedVaccinesNames.some(applied => applied.includes(v.name.toLowerCase().split(' ')[0])));

    // ... (rest of render logic remains similar, but using props)
};

const VaccineChart = ({ vaccines }) => {
    const statusData = vaccines.reduce((acc, vaccine) => {
        const s = vaccine.status || (vaccine.isCompleted ? 'completed' : 'pending');
        acc[s] = (acc[s] || 0) + 1;
        return acc;
    }, {});
    // ...
};

const VaccinesContent = ({ baby, updateBabyData }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [vaccines, setVaccines] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [newVaccine, setNewVaccine] = useState({ name: '', date: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSchedule, setShowSchedule] = useState(false);

    useEffect(() => {
        const loadVaccines = async () => {
            if (!baby?.id) return;
            setIsLoading(true);
            try {
                const events = await api.getEvents(baby.id);
                const filtered = events.filter(e => e.type === 'vaccine').map(v => ({
                    ...v,
                    // Garante que o status seja legível para o componente antigo
                    status: v.completed ? 'completed' : 'pending'
                }));
                setVaccines(filtered);
            } catch (error) {
                console.error("Load vaccines error:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadVaccines();
    }, [baby?.id]);

    const handleAddVaccine = async () => {
        if (!newVaccine.name || !newVaccine.date) {
            toast({
                title: "Erro",
                description: "Por favor, preencha o nome e a data da vacina.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await api.addEvent({
                babyId: baby.id,
                type: 'vaccine',
                title: newVaccine.name,
                date: new Date(newVaccine.date).toISOString(),
                completed: false
            });

            // Recarregar
            const events = await api.getEvents(baby.id);
            setVaccines(events.filter(e => e.type === 'vaccine').map(v => ({ ...v, status: v.completed ? 'completed' : 'pending' })));

            toast({
                title: "🎉 Vacina Adicionada",
                description: `${newVaccine.name} foi adicionada à lista com sucesso.`
            });
            setNewVaccine({ name: '', date: '' });
            setShowForm(false);
        } catch (error) {
            toast({
                title: "Erro",
                description: "Não foi possível adicionar a vacina. Tente novamente.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleVaccineStatus = async (vaccineId) => {
        const vaccine = vaccines.find(v => v.id === vaccineId);
        if (!vaccine) return;

        const newStatus = !vaccine.completed;
        try {
            await api.updateEvent(vaccineId, {
                ...vaccine,
                completed: newStatus
            });

            setVaccines(vaccines.map(v =>
                v.id === vaccineId ? { ...v, completed: newStatus, status: newStatus ? 'completed' : 'pending' } : v
            ));

            if (newStatus) {
                toast({
                    title: "✅ Vacina Aplicada!",
                    description: `${vaccine.title || vaccine.name} foi marcada como aplicada.`,
                });
            }
        } catch (error) {
            toast({ title: "Erro ao atualizar vacina", variant: "destructive" });
        }
    };

    if (isLoading) return <div className="flex justify-center p-12"><LoadingSpinner /></div>;

    const completedCount = vaccines.filter(v => v.completed).length;
    const completionRate = vaccines.length > 0 ? Math.round((completedCount / vaccines.length) * 100) : 0;

    return (
        <div className="space-y-6">
            <motion.div
                className="glass-card rounded-3xl p-6 relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full transform translate-x-16 -translate-y-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-400/20 to-purple-400/20 rounded-full transform -translate-x-12 translate-y-12"></div>

                <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center">
                            <div className="relative">
                                <Syringe className="w-8 h-8 mr-3 text-blue-600" />
                                <div className="pulse-ring text-blue-600"></div>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold gradient-text flex items-center">
                                    Caderneta de Vacinas 3.0
                                    <Sparkles className="w-6 h-6 ml-2 text-yellow-500" />
                                </h2>
                                {vaccines.length > 0 && (
                                    <p className="text-sm text-gray-600 mt-1">
                                        {completedCount} de {vaccines.length} vacinas aplicadas ({completionRate}%)
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant={showSchedule ? "default" : "outline"}
                                size="sm"
                                onClick={() => setShowSchedule(!showSchedule)}
                                className="rounded-xl"
                            >
                                <Calendar className="w-4 h-4 mr-2" />
                                Calendário
                            </Button>
                            <Button
                                onClick={() => setShowForm(!showForm)}
                                className="btn-gradient text-white border-0"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                {showForm ? 'Cancelar' : 'Nova Vacina'}
                            </Button>
                        </div>
                    </div>

                    {/* Analytics Cards */}
                    {vaccines.length > 0 && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            <VaccineChart vaccines={vaccines} />
                            <VaccineScheduleCard baby={baby} />
                        </div>
                    )}

                    {/* Vaccine Schedule */}
                    {showSchedule && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mb-6"
                        >
                            <Card className="gradient-card border-0">
                                <CardHeader>
                                    <CardTitle>Calendário Nacional de Vacinação</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                                        {vaccineSchedule.map((vaccine, index) => (
                                            <div key={index} className="p-3 bg-white rounded-lg shadow-sm">
                                                <div className="font-medium text-sm">{vaccine.name}</div>
                                                <div className="text-xs text-gray-600">{vaccine.ageMonths} meses</div>
                                                <div className="text-xs text-gray-500 mt-1">{vaccine.description}</div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Progress bar */}
                    {vaccines.length > 0 && (
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-700">Progresso das Vacinas</span>
                                <span className="text-sm font-bold text-blue-600">{completionRate}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <motion.div
                                    className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${completionRate}%` }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                ></motion.div>
                            </div>
                        </div>
                    )}

                    {showForm && (
                        <motion.div
                            className="mb-6 gradient-card rounded-2xl p-6 border-0"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                        >
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <Label htmlFor="vaccineName" className="text-gray-700 font-medium">Nome da Vacina</Label>
                                    <Input
                                        id="vaccineName"
                                        type="text"
                                        placeholder="Ex: Pentavalente"
                                        value={newVaccine.name}
                                        onChange={e => setNewVaccine({ ...newVaccine, name: e.target.value })}
                                        className="mt-2 border-2 border-blue-100 focus:border-blue-400 rounded-xl"
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="vaccineDate" className="text-gray-700 font-medium">Data</Label>
                                    <Input
                                        id="vaccineDate"
                                        type="date"
                                        value={newVaccine.date}
                                        onChange={e => setNewVaccine({ ...newVaccine, date: e.target.value })}
                                        className="mt-2 border-2 border-blue-100 focus:border-blue-400 rounded-xl"
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>
                            <Button
                                onClick={handleAddVaccine}
                                className="mt-6 btn-gradient text-white border-0 w-full sm:w-auto"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center gap-2">
                                        <LoadingSpinner size="sm" />
                                        <span>Salvando...</span>
                                    </div>
                                ) : (
                                    <>
                                        <Shield className="w-4 h-4 mr-2" />
                                        Salvar Vacina
                                    </>
                                )}
                            </Button>
                        </motion.div>
                    )}

                    <div className="space-y-4">
                        {vaccines.length > 0 ? vaccines.map((vaccine, index) => (
                            <motion.div
                                key={vaccine.id || index}
                                className={`gradient-card rounded-2xl p-4 floating-card border-0 ${vaccine.status === 'completed'
                                    ? 'bg-gradient-to-r from-green-50 to-emerald-50'
                                    : 'bg-gradient-to-r from-yellow-50 to-orange-50'
                                    }`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ scale: 1.02 }}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                    <div className="flex items-center gap-4 flex-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => toggleVaccineStatus(vaccine.id)}
                                            className="flex-shrink-0 w-12 h-12 rounded-full hover:scale-110 transition-transform"
                                        >
                                            {vaccine.status === 'completed' ? (
                                                <div className="relative">
                                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                                    <div className="absolute inset-0 rounded-full bg-green-100 animate-ping"></div>
                                                </div>
                                            ) : (
                                                <Clock className="w-8 h-8 text-orange-600" />
                                            )}
                                        </Button>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-lg text-gray-800 mb-1">{vaccine.name}</h3>
                                            <p className="text-sm text-gray-600">
                                                {vaccine.status === 'completed' ? 'Aplicada em' : 'Agendada para'} {format(safeParseDate(vaccine.date), "dd/MM/yyyy", { locale: ptBR })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${vaccine.status === 'completed'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-orange-100 text-orange-800'
                                            }`}>
                                            {vaccine.status === 'completed' ? 'Aplicada' : 'Pendente'}
                                        </span>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => toast({ title: "Funcionalidade em breve!" })}
                                            className="rounded-xl border-2 hover:scale-105 transition-transform"
                                        >
                                            Detalhes
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )) : (
                            <div className="text-center py-16">
                                <div className="animate-float">
                                    <Syringe className="w-20 h-20 mx-auto text-gray-400 mb-6" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-600 mb-2">Nenhuma vacina registrada</h3>
                                <p className="text-gray-500 mb-4">Comece adicionando as vacinas do seu bebê</p>
                                <Button
                                    onClick={() => setShowForm(true)}
                                    className="btn-gradient text-white border-0"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Adicionar Primeira Vacina
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default VaccinesContent;
