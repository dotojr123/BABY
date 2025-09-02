import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Plus, Star, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const MilestonesContent = ({ baby, updateBabyData }) => {
    const [showForm, setShowForm] = useState(false);
    const [newMilestone, setNewMilestone] = useState({ milestone: '', date: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddMilestone = async () => {
        if (!newMilestone.milestone || !newMilestone.date) {
            toast({
                title: "Erro",
                description: "Por favor, preencha o marco e a data.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 800));

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
        } catch (error) {
            toast({
                title: "Erro",
                description: "Não foi possível adicionar o marco. Tente novamente.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
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
        <div className="space-y-4 sm:space-y-6">
            <motion.div
                className="medical-card rounded-2xl p-4 sm:p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center">
                        <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 mr-3 text-pink-600" />
                        <h2 className="text-xl sm:text-2xl font-bold gradient-text">Marcos de Desenvolvimento</h2>
                    </div>
                    <Button 
                        onClick={() => setShowForm(!showForm)}
                        className="w-full sm:w-auto"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        {showForm ? 'Cancelar' : 'Adicionar Marco'}
                    </Button>
                </div>

                {showForm && (
                    <motion.div 
                        className="mb-6 p-4 bg-white rounded-lg shadow-sm border" 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }}
                    >
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <Label htmlFor="milestoneDesc">Descrição do Marco</Label>
                                <Input 
                                    id="milestoneDesc"
                                    type="text" 
                                    placeholder="Ex: Primeiro sorriso" 
                                    value={newMilestone.milestone} 
                                    onChange={e => setNewMilestone({ ...newMilestone, milestone: e.target.value })} 
                                    className="mt-1"
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div>
                                <Label htmlFor="milestoneDate">Data</Label>
                                <Input 
                                    id="milestoneDate"
                                    type="date" 
                                    value={newMilestone.date} 
                                    onChange={e => setNewMilestone({ ...newMilestone, date: e.target.value })} 
                                    className="mt-1"
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>
                        <Button 
                            onClick={handleAddMilestone} 
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
                    {milestones.length > 0 ? milestones.map(m => (
                        <motion.div 
                            key={m.id} 
                            className={`p-3 sm:p-4 rounded-lg flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 ${
                                m.achieved ? 'bg-green-50 border border-green-200' : 'bg-pink-50 border border-pink-200'
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
                                    onClick={() => toggleAchieved(m.id)} 
                                    className="flex-shrink-0 mt-1 sm:mt-0"
                                >
                                    {m.achieved ? (
                                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                                    ) : (
                                        <Star className="w-5 h-5 sm:w-6 sm:h-6 text-pink-400 hover:text-pink-500 transition-colors" />
                                    )}
                                </Button>
                                <div className="flex-1 min-w-0">
                                    <p className={`font-semibold text-sm sm:text-base ${
                                        m.achieved ? 'line-through text-gray-500' : 'text-gray-800'
                                    }`}>
                                        {m.milestone}
                                    </p>
                                </div>
                            </div>
                            <div className="text-left sm:text-right flex-shrink-0 ml-8 sm:ml-0">
                                <p className="text-xs sm:text-sm font-medium text-gray-700">
                                    {format(new Date(m.date), "d MMM yyyy", { locale: ptBR })}
                                </p>
                            </div>
                        </motion.div>
                    )) : (
                        <div className="text-center py-12">
                            <TrendingUp className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-500 text-sm sm:text-base">Nenhum marco de desenvolvimento registrado.</p>
                            <p className="text-gray-400 text-xs sm:text-sm mt-1">Clique em "Adicionar Marco" para começar</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default MilestonesContent;