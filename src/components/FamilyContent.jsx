import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, User, Trash2 } from 'lucide-react';
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
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 800));

            const memberToAdd = {
                id: Date.now(),
                name: newMember.name,
                relationship: newMember.relationship,
            };

            const updatedBaby = {
                ...baby,
                family: [...(baby.family || []), memberToAdd],
            };

            updateBabyData(updatedBaby);
            toast({
                title: "Membro Adicionado!",
                description: `${newMember.name} foi adicionado à família.`,
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
        <div className="space-y-4 sm:space-y-6">
            <motion.div
                className="medical-card rounded-2xl p-4 sm:p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center">
                        <Users className="w-6 h-6 sm:w-8 sm:h-8 mr-3 text-purple-600" />
                        <h2 className="text-xl sm:text-2xl font-bold gradient-text">Acesso Familiar</h2>
                    </div>
                    <Button 
                        onClick={() => setShowForm(!showForm)}
                        className="w-full sm:w-auto"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        {showForm ? 'Cancelar' : 'Adicionar Membro'}
                    </Button>
                </div>

                {showForm && (
                    <motion.div 
                        className="mb-6 p-4 bg-white rounded-lg shadow-sm border" 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="memberName">Nome</Label>
                                <Input 
                                    id="memberName" 
                                    type="text" 
                                    placeholder="Nome do Membro" 
                                    value={newMember.name} 
                                    onChange={e => setNewMember({ ...newMember, name: e.target.value })} 
                                    className="mt-1"
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div>
                                <Label htmlFor="memberRelationship">Parentesco</Label>
                                <Input 
                                    id="memberRelationship" 
                                    type="text" 
                                    placeholder="Ex: Avó, Babá" 
                                    value={newMember.relationship} 
                                    onChange={e => setNewMember({ ...newMember, relationship: e.target.value })} 
                                    className="mt-1"
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>
                        <Button 
                            onClick={handleAddMember} 
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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {familyMembers.length > 0 ? familyMembers.map(member => (
                        <Card key={member.id} className="flex items-center p-3 sm:p-4 hover:shadow-md transition-shadow">
                            <User className="w-6 h-6 sm:w-8 sm:h-8 mr-3 sm:mr-4 text-gray-600 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <CardTitle className="text-base sm:text-lg truncate">{member.name}</CardTitle>
                                <CardDescription className="text-xs sm:text-sm text-gray-500">{member.relationship}</CardDescription>
                            </div>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => setMemberToDelete(member)}
                                        className="flex-shrink-0"
                                    >
                                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="max-w-sm mx-4">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Esta ação removerá {member.name} da lista de acesso familiar.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                                        <AlertDialogCancel 
                                            onClick={() => setMemberToDelete(null)}
                                            className="w-full sm:w-auto"
                                        >
                                            Cancelar
                                        </AlertDialogCancel>
                                        <AlertDialogAction 
                                            onClick={handleDeleteMember}
                                            className="w-full sm:w-auto"
                                        >
                                            Remover
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </Card>
                    )) : (
                        <div className="col-span-full text-center py-12">
                            <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-500 text-sm sm:text-base">Nenhum membro da família adicionado ainda.</p>
                            <p className="text-gray-400 text-xs sm:text-sm mt-1">Clique em "Adicionar Membro" para começar</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default FamilyContent;