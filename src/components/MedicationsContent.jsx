import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Pill, Plus, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const MedicationsContent = ({ baby, updateBabyData }) => {
    const [showForm, setShowForm] = useState(false);
    const [newMedication, setNewMedication] = useState({ name: '', details: '', date: '' });

    const handleAddMedication = () => {
        if (!newMedication.name || !newMedication.date) {
            toast({
                title: "Erro",
                description: "Por favor, preencha o nome e a data do medicamento.",
                variant: "destructive",
            });
            return;
        }

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
        <div className="space-y-6">
            <motion.div
                className="medical-card rounded-2xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        <Pill className="w-8 h-8 mr-3 text-orange-600" />
                        <h2 className="text-2xl font-bold gradient-text">Controle de Medicamentos</h2>
                    </div>
                    <Button onClick={() => setShowForm(!showForm)}>
                        <Plus className="w-4 h-4 mr-2" />
                        {showForm ? 'Cancelar' : 'Adicionar Medicamento'}
                    </Button>
                </div>

                {showForm && (
                    <motion.div className="mb-6 p-4 bg-white rounded-lg shadow-sm border" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input type="text" placeholder="Nome do Medicamento" value={newMedication.name} onChange={e => setNewMedication({ ...newMedication, name: e.target.value })} className="p-2 border rounded" />
                            <input type="text" placeholder="Dosagem/Detalhes" value={newMedication.details} onChange={e => setNewMedication({ ...newMedication, details: e.target.value })} className="p-2 border rounded" />
                            <input type="datetime-local" value={newMedication.date} onChange={e => setNewMedication({ ...newMedication, date: e.target.value })} className="p-2 border rounded" />
                        </div>
                        <Button onClick={handleAddMedication} className="mt-4">Salvar</Button>
                    </motion.div>
                )}

                <div className="space-y-4">
                    {medications.length > 0 ? medications.map(med => (
                        <div key={med.id} className={`p-4 rounded-lg flex items-center justify-between ${med.completed ? 'bg-green-50' : 'bg-orange-50'}`}>
                            <div className="flex items-center">
                                <Button variant="ghost" size="icon" onClick={() => toggleComplete(med.id)} className="mr-4">
                                    {med.completed ? <CheckCircle className="text-green-500" /> : <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>}
                                </Button>
                                <div>
                                    <p className={`font-semibold ${med.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>{med.name}</p>
                                    <p className="text-sm text-gray-600">{med.details}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-700">{format(new Date(med.date), "d MMM yyyy", { locale: ptBR })}</p>
                                <p className="text-xs text-gray-500">{format(new Date(med.date), "HH:mm'h'", { locale: ptBR })}</p>
                            </div>
                        </div>
                    )) : (
                        <p className="text-center text-gray-500 py-8">Nenhum medicamento registrado.</p>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default MedicationsContent;