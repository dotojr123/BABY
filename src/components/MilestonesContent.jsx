import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Plus, Star, CheckCircle, Trophy, Sparkles, Target } from 'lucide-react';
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
                title: "🎉 Marco Conquistado!",
                description: `${newMilestone.milestone} foi registrado com sucesso.`,
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
        
        const milestone = updatedMilestones.find(m => m.id === milestoneId);
        if (milestone?.achieved) {
            toast({
                title: "🌟 Marco Alcançado!",
                description: `Parabéns! ${milestone.milestone} foi conquistado.`,
            });
        }
    };

    const milestones = (baby.milestones || []).sort((a, b) => new Date(b.date) - new Date(a.date));
    const achievedCount = milestones.filter(m => m.achieved).length;
    const achievementRate = milestones.length > 0 ? Math.round((achievedCount / milestones.length) * 100) : 0;

    return (
        <div className="space-y-6">
            <motion.div
                className="glass-card rounded-3xl p-6 relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-400/20 to-purple-400/20 rounded-full transform translate-x-16 -translate-y-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-yellow-400/20 to-orange-400/20 rounded-full transform -translate-x-12 translate-y-12"></div>

                <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center">
                            <div className="relative">
                                <TrendingUp className="w-8 h-8 mr-3 text-pink-600" />
                                <div className="pulse-ring text-pink-600"></div>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold gradient-text flex items-center">
                                    Marcos de Desenvolvimento
                                    <Sparkles className="w-6 h-6 ml-2 text-yellow-500" />
                                </h2>
                                {milestones.length > 0 && (
                                    <div className="flex items-center gap-4 mt-1">
                                        <p className="text-sm text-gray-600">
                                            {achievedCount} de {milestones.length} marcos alcançados ({achievementRate}%)
                                        </p>
                                        {achievedCount > 0 && (
                                            <div className="flex items-center text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                                                <Trophy className="w-3 h-3 mr-1" />
                                                <span className="text-xs font-medium">Conquistas</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        <Button 
                            onClick={() => setShowForm(!showForm)}
                            className="btn-gradient text-white border-0 w-full sm:w-auto"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            {showForm ? 'Cancelar' : 'Novo Marco'}
                        </Button>
                    </div>

                    {/* Achievement progress bar */}
                    {milestones.length > 0 && (
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-700">Progresso dos Marcos</span>
                                <span className="text-sm font-bold text-pink-600">{achievementRate}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <motion.div 
                                    className="bg-gradient-to-r from-pink-400 to-purple-500 h-3 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${achievementRate}%` }}
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
                                    <Label htmlFor="milestoneDesc" className="text-gray-700 font-medium">Descrição do Marco</Label>
                                    <Input 
                                        id="milestoneDesc"
                                        type="text" 
                                        placeholder="Ex: Primeiro sorriso, Engatinhar, Primeiras palavras" 
                                        value={newMilestone.milestone} 
                                        onChange={e => setNewMilestone({ ...newMilestone, milestone: e.target.value })} 
                                        className="mt-2 border-2 border-pink-100 focus:border-pink-400 rounded-xl"
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="milestoneDate" className="text-gray-700 font-medium">Data da Conquista</Label>
                                    <Input 
                                        id="milestoneDate"
                                        type="date" 
                                        value={newMilestone.date} 
                                        onChange={e => setNewMilestone({ ...newMilestone, date: e.target.value })} 
                                        className="mt-2 border-2 border-pink-100 focus:border-pink-400 rounded-xl"
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>
                            <Button 
                                onClick={handleAddMilestone} 
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
                                        <Trophy className="w-4 h-4 mr-2" />
                                        Registrar Marco
                                    </>
                                )}
                            </Button>
                        </motion.div>
                    )}

                    <div className="space-y-4">
                        {milestones.length > 0 ? milestones.map((m, index) => (
                            <motion.div 
                                key={m.id} 
                                className={`gradient-card rounded-2xl p-4 floating-card border-0 ${
                                    m.achieved 
                                        ? 'bg-gradient-to-r from-green-50 to-emerald-50' 
                                        : 'bg-gradient-to-r from-pink-50 to-purple-50'
                                }`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ scale: 1.02 }}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                    <div className="flex items-start sm:items-center gap-4 flex-1">
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => toggleAchieved(m.id)} 
                                            className="flex-shrink-0 w-12 h-12 rounded-full hover:scale-110 transition-transform"
                                        >
                                            {m.achieved ? (
                                                <div className="relative">
                                                    <Trophy className="w-8 h-8 text-yellow-600" />
                                                    <div className="absolute inset-0 rounded-full bg-yellow-100 animate-ping"></div>
                                                </div>
                                            ) : (
                                                <Target className="w-8 h-8 text-pink-400 hover:text-pink-500 transition-colors" />
                                            )}
                                        </Button>
                                        <div className="flex-1 min-w-0">
                                            <h3 className={`font-bold text-lg mb-1 ${
                                                m.achieved ? 'text-gray-800' : 'text-gray-600'
                                            }`}>
                                                {m.milestone}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {m.achieved ? 'Conquistado em' : 'Meta para'} {format(new Date(m.date), "d 'de' MMMM, yyyy", { locale: ptBR })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                            m.achieved 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-pink-100 text-pink-800'
                                        }`}>
                                            {m.achieved ? 'Conquistado' : 'Em progresso'}
                                        </span>
                                        {m.achieved && (
                                            <div className="flex items-center">
                                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )) : (
                            <div className="text-center py-16">
                                <div className="animate-float">
                                    <TrendingUp className="w-20 h-20 mx-auto text-gray-400 mb-6" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-600 mb-2">Nenhum marco registrado ainda</h3>
                                <p className="text-gray-500 mb-4">Comece registrando os marcos de desenvolvimento do seu bebê</p>
                                <Button 
                                    onClick={() => setShowForm(true)}
                                    className="btn-gradient text-white border-0"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Registrar Primeiro Marco
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default MilestonesContent;