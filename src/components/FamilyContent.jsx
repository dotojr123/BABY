import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, User, Trash2, Crown, Heart, UserCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const relationshipIcons = {
    'Mãe': { icon: Crown, color: 'text-pink-500', bg: 'bg-pink-50' },
    'Pai': { icon: Crown, color: 'text-blue-500', bg: 'bg-blue-50' },
    'Avó': { icon: Heart, color: 'text-purple-500', bg: 'bg-purple-50' },
    'Avô': { icon: Heart, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    'Babá': { icon: UserCheck, color: 'text-green-500', bg: 'bg-green-50' },
    'Cuidador': { icon: UserCheck, color: 'text-teal-500', bg: 'bg-teal-50' },
    'default': { icon: User, color: 'text-gray-500', bg: 'bg-gray-50' }
};

const FamilyContent = ({ baby, updateBabyData }) => {
    const [showForm, setShowForm] = useState(false);
    const [newMember, setNewMember] = useState({ name: '', relationship: '' });
    const [memberToDelete, setMemberToDelete] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddMember = async () => {
        if (!newMember.name || !newMember.relationship) {
            toast({
                title: "Erro",
                description: "Por favor, preencha o nome e o parentesco.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 800));

            const memberToAdd = {
                id: Date.now(),
                name: newMember.name,
                relationship: newMember.relationship,
                addedAt: new Date().toISOString(),
            };

            const updatedBaby = {
                ...baby,
                family: [...(baby.family || []), memberToAdd],
            };

            updateBabyData(updatedBaby);
            toast({
                title: "👨‍👩‍👧‍👦 Membro Adicionado!",
                description: `${newMember.name} foi adicionado à família com sucesso.`,
            });
            setNewMember({ name: '', relationship: '' });
            setShowForm(false);
        } catch (error) {
            toast({
                title: "Erro",
                description: "Não foi possível adicionar o membro. Tente novamente.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteMember = () => {
        if (memberToDelete) {
            const updatedFamily = (baby.family || []).filter(
                (member) => member.id !== memberToDelete.id
            );
            const updatedBaby = { ...baby, family: updatedFamily };
            updateBabyData(updatedBaby);
            toast({
                title: "Membro Removido!",
                description: `${memberToDelete.name} foi removido da família.`,
            });
            setMemberToDelete(null);
        }
    };

    const familyMembers = baby.family || [];

    return (
        <div className="space-y-6">
            <motion.div
                className="glass-card rounded-3xl p-6 relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full transform translate-x-16 -translate-y-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-400/20 to-cyan-400/20 rounded-full transform -translate-x-12 translate-y-12"></div>

                <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center">
                            <div className="relative">
                                <Users className="w-8 h-8 mr-3 text-purple-600" />
                                <div className="pulse-ring text-purple-600"></div>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold gradient-text flex items-center">
                                    Círculo Familiar
                                    <Sparkles className="w-6 h-6 ml-2 text-yellow-500" />
                                </h2>
                                {familyMembers.length > 0 && (
                                    <p className="text-sm text-gray-600 mt-1">
                                        {familyMembers.length} membro(s) com acesso aos dados do bebê
                                    </p>
                                )}
                            </div>
                        </div>
                        <Button 
                            onClick={() => setShowForm(!showForm)}
                            className="btn-gradient text-white border-0 w-full sm:w-auto"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            {showForm ? 'Cancelar' : 'Adicionar Membro'}
                        </Button>
                    </div>

                    {showForm && (
                        <motion.div 
                            className="mb-6 gradient-card rounded-2xl p-6 border-0" 
                            initial={{ opacity: 0, height: 0 }} 
                            animate={{ opacity: 1, height: 'auto' }}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="memberName" className="text-gray-700 font-medium">Nome Completo</Label>
                                    <Input 
                                        id="memberName" 
                                        type="text" 
                                        placeholder="Ex: Maria Silva" 
                                        value={newMember.name} 
                                        onChange={e => setNewMember({ ...newMember, name: e.target.value })} 
                                        className="mt-2 border-2 border-purple-100 focus:border-purple-400 rounded-xl"
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="memberRelationship" className="text-gray-700 font-medium">Parentesco</Label>
                                    <select
                                        id="memberRelationship"
                                        value={newMember.relationship}
                                        onChange={e => setNewMember({ ...newMember, relationship: e.target.value })}
                                        className="mt-2 w-full p-3 border-2 border-purple-100 focus:border-purple-400 rounded-xl focus:outline-none transition-colors"
                                        disabled={isSubmitting}
                                    >
                                        <option value="">Selecione o parentesco</option>
                                        <option value="Mãe">Mãe</option>
                                        <option value="Pai">Pai</option>
                                        <option value="Avó">Avó</option>
                                        <option value="Avô">Avô</option>
                                        <option value="Babá">Babá</option>
                                        <option value="Cuidador">Cuidador(a)</option>
                                        <option value="Tio">Tio</option>
                                        <option value="Tia">Tia</option>
                                        <option value="Outro">Outro</option>
                                    </select>
                                </div>
                            </div>
                            <Button 
                                onClick={handleAddMember} 
                                className="mt-6 btn-gradient text-white border-0 w-full sm:w-auto"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center gap-2">
                                        <LoadingSpinner size="sm" />
                                        <span>Adicionando...</span>
                                    </div>
                                ) : (
                                    <>
                                        <Users className="w-4 h-4 mr-2" />
                                        Adicionar à Família
                                    </>
                                )}
                            </Button>
                        </motion.div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {familyMembers.length > 0 ? familyMembers.map((member, index) => {
                            const relationshipConfig = relationshipIcons[member.relationship] || relationshipIcons.default;
                            const IconComponent = relationshipConfig.icon;
                            
                            return (
                                <motion.div
                                    key={member.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card className="floating-card border-0 shadow-lg bg-white/80 backdrop-blur-sm relative overflow-hidden">
                                        <div className={`absolute top-0 left-0 right-0 h-1 ${relationshipConfig.bg.replace('bg-', 'bg-gradient-to-r from-').replace('-50', '-400 to-').replace('50', '500')}`}></div>
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-full ${relationshipConfig.bg} flex items-center justify-center flex-shrink-0`}>
                                                    <IconComponent className={`w-6 h-6 ${relationshipConfig.color}`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-lg text-gray-800 truncate">{member.name}</h3>
                                                    <p className={`text-sm font-medium ${relationshipConfig.color}`}>{member.relationship}</p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Acesso desde {new Date(member.addedAt || Date.now()).toLocaleDateString('pt-BR')}
                                                    </p>
                                                </div>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            onClick={() => setMemberToDelete(member)}
                                                            className="flex-shrink-0 hover:bg-red-50 hover:text-red-600 transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent className="max-w-sm mx-4 rounded-2xl">
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Remover membro da família?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Esta ação removerá <strong>{member.name}</strong> do acesso aos dados do bebê. Esta ação não pode ser desfeita.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                                                            <AlertDialogCancel 
                                                                onClick={() => setMemberToDelete(null)}
                                                                className="w-full sm:w-auto rounded-xl"
                                                            >
                                                                Cancelar
                                                            </AlertDialogCancel>
                                                            <AlertDialogAction 
                                                                onClick={handleDeleteMember}
                                                                className="w-full sm:w-auto bg-red-500 hover:bg-red-600 rounded-xl"
                                                            >
                                                                Remover
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        }) : (
                            <div className="col-span-full text-center py-16">
                                <div className="animate-float">
                                    <Users className="w-20 h-20 mx-auto text-gray-400 mb-6" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-600 mb-2">Nenhum membro da família ainda</h3>
                                <p className="text-gray-500 mb-4">Adicione familiares e cuidadores para compartilhar o acompanhamento do bebê</p>
                                <Button 
                                    onClick={() => setShowForm(true)}
                                    className="btn-gradient text-white border-0"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Adicionar Primeiro Membro
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default FamilyContent;