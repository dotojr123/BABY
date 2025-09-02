import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Pill, Plus, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const MedicationsContent = ({ baby, updateBabyData }) => {
    const [showForm, setShowForm] = useState(false);
    const [newMedication, setNewMedication] = useState({ name: '', details: '', date: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddMedication = async () => {
        if (!newMedication.name || !newMedication.date) {
            toast({
                title: "Erro",
                description: "Por favor, preencha o nome e a data do medicamento.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 800));

            const newEvent = {
                id: Date.now(),
                type: 'medication',
                name: newMedication.name,
                details: newMedication.details,
                date: new Date(newMedication.date).toISOString(),
                completed: false,
            };

            const updatedBaby = {
                ...baby,
                events: [...(baby.events || []), newEvent],
            };

            updateBabyData(updatedBaby);
            toast({
                title: "Medicamento Adicionado!",
                description: `${newMedication.name} foi adicionado à lista.`,
            });
            setNewMedication({ name: '', details: '', date: '' });
            setShowForm(false);
        } catch (error) {
            toast({
                title: "Erro",
                description: "Não foi possível adicionar o medicamento. Tente novamente.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleComplete = (eventId) => {
        const updatedEvents = (baby.events || []).map(event =>
            event.id === eventId ? { ...event, completed: !event.completed } : event
        );
        const updatedBaby = { ...baby, events: updatedEvents };
        updateBabyData(updatedBaby);
    };

    const medications = (baby.events || []).filter(e => e.type === 'medication').sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <div className="space-y-4 sm:space-y-6">
            <motion.div
                className="medical-card rounded-2xl p-4 sm:p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center">
                        <Pill className="w-6 h-6 sm:w-8 sm:h-8 mr-3 text-orange-600" />
                        <h2 className="text-xl sm:text-2xl font-bold gradient-text">Controle de Medicamentos</h2>
                    </div>
                    <Button 
                        onClick={() => setShowForm(!showForm)}
                        className="w-full sm:w-auto"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        {showForm ? 'Cancelar' : 'Adicionar Medicamento'}
                    </Button>
                </div>

                {showForm && (
                    <motion.div 
                        className="mb-6 p-4 bg-white rounded-lg shadow-sm border" 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }}
                    >
                        <div className="grid grid-cols-1 gap-4">
                            <input 
                                type="text" 
                                placeholder="Nome do Medicamento" 
                                value={newMedication.name} 
                                onChange={e => setNewMedication({ ...newMedication, name: e.target.value })} 
                                className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary" 
                                disabled={isSubmitting}
                            />
                            <input 
                                type="text" 
                                placeholder="Dosagem/Detalhes" 
                                value={newMedication.details} 
                                onChange={e => setNewMedication({ ...newMedication, details: e.target.value })} 
                                className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                                disabled={isSubmitting}
                            />
                            <input 
                                type="datetime-local" 
                                value={newMedication.date} 
                                onChange={e => setNewMedication({ ...newMedication, date: e.target.value })} 
                                className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                                disabled={isSubmitting}
                            />
                        </div>
                        <Button 
                            onClick={handleAddMedication} 
                            className="mt-4 w-full sm:w-auto"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <div className="flex items-center gap-2">
                                    <LoadingSpinner size="sm" />
                                    <span>Salvando...</span>
                                </div>
                            ) : (
                                'Salvar'
                            )}
                        </Button>
                    </motion.div>
                )}

                <div className="space-y-3 sm:space-y-4">
                    {medications.length > 0 ? medications.map(med => (
                        <motion.div 
                            key={med.id} 
                            className={`p-3 sm:p-4 rounded-lg flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 ${
                                med.completed ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'
                            }`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => toggleComplete(med.id)} 
                                    className="flex-shrink-0 mt-1 sm:mt-0"
                                >
                                    {med.completed ? (
                                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                                    ) : (
                                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-gray-300 hover:border-orange-400 transition-colors"></div>
                                    )}
                                </Button>
                                <div className="flex-1 min-w-0">
                                    <p className={`font-semibold text-sm sm:text-base ${
                                        med.completed ? 'line-through text-gray-500' : 'text-gray-800'
                                    }`}>
                                        {med.name}
                                    </p>
                                    {med.details && (
                                        <p className="text-xs sm:text-sm text-gray-600 mt-1">{med.details}</p>
                                    )}
                                </div>
                            </div>
                            <div className="text-left sm:text-right flex-shrink-0 ml-8 sm:ml-0">
                                <p className="text-xs sm:text-sm font-medium text-gray-700">
                                    {format(new Date(med.date), "d MMM yyyy", { locale: ptBR })}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {format(new Date(med.date), "HH:mm'h'", { locale: ptBR })}
                                </p>
                            </div>
                        </motion.div>
                    )) : (
                        <div className="text-center py-12">
                            <Pill className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-500 text-sm sm:text-base">Nenhum medicamento registrado.</p>
                            <p className="text-gray-400 text-xs sm:text-sm mt-1">Clique em "Adicionar Medicamento" para começar</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default MedicationsContent;