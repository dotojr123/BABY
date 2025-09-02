import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Plus, Star, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const MilestonesContent = ({ baby, updateBabyData }) => {
    const [showForm, setShowForm] = useState(false);
    const [newMilestone, setNewMilestone] = useState({ milestone: '', date: '' });

    const handleAddMilestone = () => {
        if (!newMilestone.milestone || !newMilestone.date) {
            toast({
                title: "Erro",
                description: "Por favor, preencha o marco e a data.",
                variant: "destructive",
            });
            return;
        }

        const newEntry = {
            id: Date.now(),
            milestone: newMilestone.milestone,
            date: new Date(newMilestone.date).toISOString(),
            achieved: true,
        };

        const updatedBaby = {
            ...baby,
            milestones: [...(baby.milestones || []), newEntry],
        };

        updateBabyData(updatedBaby);
        toast({
            title: "Marco Adicionado!",
            description: `${newMilestone.milestone} foi registrado.`,
        });
        setNewMilestone({ milestone: '', date: '' });
        setShowForm(false);
    };

    const toggleAchieved = (milestoneId) => {
        const updatedMilestones = (baby.milestones || []).map(m =>
            m.id === milestoneId ? { ...m, achieved: !m.achieved } : m
        );
        const updatedBaby = { ...baby, milestones: updatedMilestones };
        updateBabyData(updatedBaby);
    };

    const milestones = (baby.milestones || []).sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <div className="space-y-6">
            <motion.div
                className="medical-card rounded-2xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        <TrendingUp className="w-8 h-8 mr-3 text-pink-600" />
                        <h2 className="text-2xl font-bold gradient-text">Marcos de Desenvolvimento</h2>
                    </div>
                    <Button onClick={() => setShowForm(!showForm)}>
                        <Plus className="w-4 h-4 mr-2" />
                        {showForm ? 'Cancelar' : 'Adicionar Marco'}
                    </Button>
                </div>

                {showForm && (
                    <motion.div className="mb-6 p-4 bg-white rounded-lg shadow-sm border" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" placeholder="Descrição do Marco" value={newMilestone.milestone} onChange={e => setNewMilestone({ ...newMilestone, milestone: e.target.value })} className="p-2 border rounded" />
                            <input type="date" value={newMilestone.date} onChange={e => setNewMilestone({ ...newMilestone, date: e.target.value })} className="p-2 border rounded" />
                        </div>
                        <Button onClick={handleAddMilestone} className="mt-4">Salvar</Button>
                    </motion.div>
                )}

                <div className="space-y-4">
                    {milestones.length > 0 ? milestones.map(m => (
                        <div key={m.id} className={`p-4 rounded-lg flex items-center justify-between ${m.achieved ? 'bg-green-50' : 'bg-pink-50'}`}>
                            <div className="flex items-center">
                                <Button variant="ghost" size="icon" onClick={() => toggleAchieved(m.id)} className="mr-4">
                                    {m.achieved ? <CheckCircle className="text-green-500" /> : <Star className="text-pink-400" />}
                                </Button>
                                <div>
                                    <p className={`font-semibold ${m.achieved ? 'line-through text-gray-500' : 'text-gray-800'}`}>{m.milestone}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-700">{format(new Date(m.date), "d MMM yyyy", { locale: ptBR })}</p>
                            </div>
                        </div>
                    )) : (
                        <p className="text-center text-gray-500 py-8">Nenhum marco de desenvolvimento registrado.</p>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default MilestonesContent;