import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, User, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
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

    const handleAddMember = () => {
        if (!newMember.name || !newMember.relationship) {
            toast({
                title: "Erro",
                description: "Por favor, preencha o nome e o parentesco.",
                variant: "destructive",
            });
            return;
        }

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
                className="medical-card rounded-2xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        <Users className="w-8 h-8 mr-3 text-purple-600" />
                        <h2 className="text-2xl font-bold gradient-text">Acesso Familiar</h2>
                    </div>
                    <Button onClick={() => setShowForm(!showForm)}>
                        <Plus className="w-4 h-4 mr-2" />
                        {showForm ? 'Cancelar' : 'Adicionar Membro'}
                    </Button>
                </div>

                {showForm && (
                    <motion.div className="mb-6 p-4 bg-white rounded-lg shadow-sm border" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="memberName">Nome</Label>
                                <Input id="memberName" type="text" placeholder="Nome do Membro" value={newMember.name} onChange={e => setNewMember({ ...newMember, name: e.target.value })} className="mt-1" />
                            </div>
                            <div>
                                <Label htmlFor="memberRelationship">Parentesco</Label>
                                <Input id="memberRelationship" type="text" placeholder="Ex: Avó, Babá" value={newMember.relationship} onChange={e => setNewMember({ ...newMember, relationship: e.target.value })} className="mt-1" />
                            </div>
                        </div>
                        <Button onClick={handleAddMember} className="mt-4">Salvar</Button>
                    </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {familyMembers.length > 0 ? familyMembers.map(member => (
                        <Card key={member.id} className="flex items-center p-4">
                            <User className="w-8 h-8 mr-4 text-gray-600" />
                            <div className="flex-1">
                                <CardTitle className="text-lg">{member.name}</CardTitle>
                                <CardDescription className="text-sm text-gray-500">{member.relationship}</CardDescription>
                            </div>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={() => setMemberToDelete(member)}>
                                        <Trash2 className="w-5 h-5 text-red-500" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Esta ação removerá {member.name} da lista de acesso familiar.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel onClick={() => setMemberToDelete(null)}>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDeleteMember}>Remover</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </Card>
                    )) : (
                        <p className="text-center text-gray-500 py-8 col-span-full">Nenhum membro da família adicionado ainda.</p>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default FamilyContent;
