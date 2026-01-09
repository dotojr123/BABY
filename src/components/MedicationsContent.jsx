import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Pill, Plus, Clock, CheckCircle, AlertCircle, Sparkles, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

const MedicationsContent = ({ baby, updateBabyData }) => {
    const [showForm, setShowForm] = useState(false);
    const [newMedication, setNewMedication] = useState({
        name: '',
        details: '',
        date: '',
        duration: '',
        frequency: ''
    });
    const [selectedMed, setSelectedMed] = useState(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editMedication, setEditMedication] = useState(null);
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
            await new Promise(resolve => setTimeout(resolve, 800));

            const newEvent = {
                id: Date.now(),
                type: 'medication',
                name: newMedication.name,
                details: newMedication.details,
                duration: newMedication.duration,
                frequency: newMedication.frequency,
                date: new Date(newMedication.date).toISOString(),
                completed: false,
            };

            const updatedBaby = {
                ...baby,
                events: [...(baby.events || []), newEvent],
            };

            updateBabyData(updatedBaby);
            toast({
                title: "💊 Medicamento Adicionado!",
                description: `${newMedication.name} foi adicionado à lista com sucesso.`,
            });
            setNewMedication({ name: '', details: '', date: '', duration: '', frequency: '' });
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

    const handleDeleteMedication = async (eventId) => {
        if (window.confirm("Tem certeza que deseja excluir este medicamento?")) {
            const updatedEvents = (baby.events || []).filter(event => event.id !== eventId);
            const updatedBaby = { ...baby, events: updatedEvents };
            updateBabyData(updatedBaby);
            toast({
                title: "🗑️ Medicamento Excluído",
                description: "O registro foi removido com sucesso.",
            });
            setIsDetailsOpen(false);
        }
    };

    const handleUpdateMedication = async () => {
        if (!editMedication.name || !editMedication.date) {
            toast({
                title: "Erro",
                description: "Por favor, preencha o nome e a data.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 600));
            const updatedEvents = (baby.events || []).map(event =>
                event.id === editMedication.id
                    ? { ...editMedication, date: new Date(editMedication.date).toISOString() }
                    : event
            );
            const updatedBaby = { ...baby, events: updatedEvents };
            updateBabyData(updatedBaby);
            toast({
                title: "📝 Medicamento Atualizado",
                description: "As alterações foram salvas.",
            });
            setIsEditOpen(false);
            setEditMedication(null);
            setIsDetailsOpen(false);
        } catch (error) {
            toast({
                title: "Erro",
                description: "Falha ao atualizar medicamento.",
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

        const medication = updatedEvents.find(e => e.id === eventId);
        if (medication?.completed) {
            toast({
                title: "✅ Medicamento Administrado!",
                description: `${medication.name} foi marcado como administrado.`,
            });
        }
    };

    const medications = (baby.events || []).filter(e => e.type === 'medication').sort((a, b) => new Date(b.date) - new Date(a.date));
    const completedCount = medications.filter(m => m.completed).length;
    const completionRate = medications.length > 0 ? Math.round((completedCount / medications.length) * 100) : 0;

    // Check for overdue medications
    const now = new Date();
    const overdueMeds = medications.filter(m => !m.completed && new Date(m.date) < now);

    return (
        <div className="space-y-6">
            <motion.div
                className="glass-card rounded-3xl p-6 relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-full transform translate-x-16 -translate-y-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-400/20 to-purple-400/20 rounded-full transform -translate-x-12 translate-y-12"></div>

                <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center">
                            <div className="relative">
                                <Pill className="w-8 h-8 mr-3 text-orange-600" />
                                <div className="pulse-ring text-orange-600"></div>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold gradient-text flex items-center">
                                    Controle de Medicamentos
                                    <Sparkles className="w-6 h-6 ml-2 text-yellow-500" />
                                </h2>
                                {medications.length > 0 && (
                                    <div className="flex items-center gap-4 mt-1">
                                        <p className="text-sm text-gray-600">
                                            {completedCount} de {medications.length} administrados ({completionRate}%)
                                        </p>
                                        {overdueMeds.length > 0 && (
                                            <div className="flex items-center text-red-600 bg-red-50 px-2 py-1 rounded-full">
                                                <AlertCircle className="w-3 h-3 mr-1" />
                                                <span className="text-xs font-medium">{overdueMeds.length} atrasado(s)</span>
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
                            {showForm ? 'Cancelar' : 'Novo Medicamento'}
                        </Button>
                    </div>

                    {/* Progress bar */}
                    {medications.length > 0 && (
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-700">Progresso dos Medicamentos</span>
                                <span className="text-sm font-bold text-orange-600">{completionRate}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <motion.div
                                    className="bg-gradient-to-r from-orange-400 to-red-500 h-3 rounded-full"
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
                                    <label className="text-gray-700 font-medium block mb-2">Nome do Medicamento</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Vitamina D"
                                        value={newMedication.name}
                                        onChange={e => setNewMedication({ ...newMedication, name: e.target.value })}
                                        className="w-full p-3 border-2 border-orange-100 focus:border-orange-400 rounded-xl focus:outline-none transition-colors"
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div>
                                    <label className="text-gray-700 font-medium block mb-2">Dosagem/Detalhes</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: 2 gotas, 1x ao dia"
                                        value={newMedication.details}
                                        onChange={e => setNewMedication({ ...newMedication, details: e.target.value })}
                                        className="w-full p-3 border-2 border-orange-100 focus:border-orange-400 rounded-xl focus:outline-none transition-colors"
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div>
                                    <label className="text-gray-700 font-medium block mb-2">Data e Hora de Início</label>
                                    <input
                                        type="datetime-local"
                                        value={newMedication.date}
                                        onChange={e => setNewMedication({ ...newMedication, date: e.target.value })}
                                        className="w-full p-3 border-2 border-orange-100 focus:border-orange-400 rounded-xl focus:outline-none transition-colors"
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-gray-700 font-medium block mb-2">Por quanto tempo? (Duração)</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: 7 dias, 2 semanas..."
                                            value={newMedication.duration}
                                            onChange={e => setNewMedication({ ...newMedication, duration: e.target.value })}
                                            className="w-full p-3 border-2 border-orange-100 focus:border-orange-400 rounded-xl focus:outline-none transition-colors"
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-gray-700 font-medium block mb-2">Quantas vezes ao dia?</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: 3x ao dia, a cada 8 horas..."
                                            value={newMedication.frequency}
                                            onChange={e => setNewMedication({ ...newMedication, frequency: e.target.value })}
                                            className="w-full p-3 border-2 border-orange-100 focus:border-orange-400 rounded-xl focus:outline-none transition-colors"
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>
                            </div>
                            <Button
                                onClick={handleAddMedication}
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
                                        <Pill className="w-4 h-4 mr-2" />
                                        Salvar Medicamento
                                    </>
                                )}
                            </Button>
                        </motion.div>
                    )}

                    <div className="space-y-4">
                        {medications.length > 0 ? medications.map((med, index) => {
                            const isOverdue = !med.completed && new Date(med.date) < now;
                            return (
                                <motion.div
                                    key={med.id}
                                    className={`gradient-card rounded-2xl p-4 floating-card border-0 ${med.completed
                                        ? 'bg-gradient-to-r from-green-50 to-emerald-50'
                                        : isOverdue
                                            ? 'bg-gradient-to-r from-red-50 to-pink-50'
                                            : 'bg-gradient-to-r from-orange-50 to-yellow-50'
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
                                                onClick={() => toggleComplete(med.id)}
                                                className="flex-shrink-0 w-12 h-12 rounded-full hover:scale-110 transition-transform"
                                            >
                                                {med.completed ? (
                                                    <div className="relative">
                                                        <CheckCircle className="w-8 h-8 text-green-600" />
                                                        <div className="absolute inset-0 rounded-full bg-green-100 animate-ping"></div>
                                                    </div>
                                                ) : isOverdue ? (
                                                    <AlertCircle className="w-8 h-8 text-red-600 animate-pulse" />
                                                ) : (
                                                    <Clock className="w-8 h-8 text-orange-600" />
                                                )}
                                            </Button>
                                            <div className="flex-1 min-w-0">
                                                <h3 className={`font-bold text-lg mb-1 ${med.completed ? 'line-through text-gray-500' : 'text-gray-800'
                                                    }`}>
                                                    {med.name}
                                                </h3>
                                                {med.details && (
                                                    <p className="text-sm text-gray-600 mb-2">{med.details}</p>
                                                )}
                                                {(med.duration || med.frequency) && (
                                                    <div className="flex flex-wrap gap-2 mb-2">
                                                        {med.duration && (
                                                            <span className="text-[10px] sm:text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded-lg border border-purple-100 flex items-center font-medium">
                                                                <Clock className="w-3 h-3 mr-1" />
                                                                Duração: {med.duration}
                                                            </span>
                                                        )}
                                                        {med.frequency && (
                                                            <span className="text-[10px] sm:text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-lg border border-blue-100 flex items-center font-medium">
                                                                <Sparkles className="w-3 h-3 mr-1" />
                                                                {med.frequency}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                                <p className="text-xs text-gray-500">
                                                    {med.completed ? 'Administrado em' : isOverdue ? 'Atrasado desde' : 'Agendado para'} {format(new Date(med.date), "d MMM yyyy 'às' HH:mm'h'", { locale: ptBR })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${med.completed
                                                ? 'bg-green-100 text-green-800'
                                                : isOverdue
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-orange-100 text-orange-800'
                                                }`}>
                                                {med.completed ? 'Administrado' : isOverdue ? 'Atrasado' : 'Pendente'}
                                            </span>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    setSelectedMed(med);
                                                    setIsDetailsOpen(true);
                                                }}
                                                className="rounded-xl border-2 hover:scale-105 transition-transform"
                                            >
                                                Detalhes
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        }) : (
                            <div className="text-center py-16">
                                <div className="animate-float">
                                    <Pill className="w-20 h-20 mx-auto text-gray-400 mb-6" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-600 mb-2">Nenhum medicamento registrado</h3>
                                <p className="text-gray-500 mb-4">Comece adicionando os medicamentos do seu bebê</p>
                                <Button
                                    onClick={() => setShowForm(true)}
                                    className="btn-gradient text-white border-0"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Adicionar Primeiro Medicamento
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Modal de Detalhes */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="rounded-3xl max-w-md w-[95%]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            <Pill className="text-orange-600" />
                            {selectedMed?.name}
                        </DialogTitle>
                        <DialogDescription className="text-gray-500">
                            Informações detalhadas do medicamento
                        </DialogDescription>
                    </DialogHeader>

                    {selectedMed && (
                        <div className="space-y-6 my-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                                    <p className="text-xs text-orange-600 font-bold uppercase mb-1">Status</p>
                                    <div className="flex items-center gap-2">
                                        {selectedMed.completed ? (
                                            <span className="text-green-600 font-medium flex items-center gap-1">
                                                <CheckCircle className="w-4 h-4" /> Administrado
                                            </span>
                                        ) : (
                                            <span className="text-orange-600 font-medium flex items-center gap-1">
                                                <Clock className="w-4 h-4" /> Pendente
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                                    <p className="text-xs text-blue-600 font-bold uppercase mb-1">Início</p>
                                    <p className="font-medium text-gray-800">
                                        {format(new Date(selectedMed.date), "dd/MM/yy 'às' HH:mm", { locale: ptBR })}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {selectedMed.details && (
                                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                        <p className="text-xs text-gray-500 font-bold uppercase mb-1">Dosagem e Observações</p>
                                        <p className="text-gray-800">{selectedMed.details}</p>
                                    </div>
                                )}

                                {selectedMed.duration && (
                                    <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-purple-100 p-2 rounded-xl text-purple-600">
                                                <Clock className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-purple-600 font-bold uppercase">Duração do Tratamento</p>
                                                <p className="text-gray-800 font-medium">{selectedMed.duration}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedMed.frequency && (
                                    <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600">
                                                <Sparkles className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-emerald-600 font-bold uppercase">Frequência</p>
                                                <p className="text-gray-800 font-medium">{selectedMed.frequency}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <DialogFooter className="flex flex-col sm:flex-row gap-2">
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Button
                                variant="outline"
                                className="flex-1 sm:flex-none rounded-xl border-orange-200 text-orange-600 hover:bg-orange-50"
                                onClick={() => {
                                    setEditMedication({
                                        ...selectedMed,
                                        date: new Date(selectedMed.date).toISOString().slice(0, 16)
                                    });
                                    setIsEditOpen(true);
                                }}
                            >
                                <Edit2 className="w-4 h-4 mr-2" /> Editar
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1 sm:flex-none rounded-xl border-red-200 text-red-600 hover:bg-red-50"
                                onClick={() => handleDeleteMedication(selectedMed.id)}
                            >
                                <Trash2 className="w-4 h-4 mr-2" /> Excluir
                            </Button>
                        </div>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsDetailsOpen(false)}
                            className="rounded-xl w-full sm:w-auto"
                        >
                            Fechar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal de Edição */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="rounded-3xl max-w-md w-[95%]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Editar Medicamento</DialogTitle>
                        <DialogDescription>Altere as informações do medicamento abaixo.</DialogDescription>
                    </DialogHeader>

                    {editMedication && (
                        <div className="space-y-4 my-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Nome</label>
                                <input
                                    type="text"
                                    value={editMedication.name}
                                    onChange={e => setEditMedication({ ...editMedication, name: e.target.value })}
                                    className="w-full p-3 border-2 border-orange-100 focus:border-orange-400 rounded-xl focus:outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Dosagem/Detalhes</label>
                                <input
                                    type="text"
                                    value={editMedication.details}
                                    onChange={e => setEditMedication({ ...editMedication, details: e.target.value })}
                                    className="w-full p-3 border-2 border-orange-100 focus:border-orange-400 rounded-xl focus:outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Data e Hora</label>
                                <input
                                    type="datetime-local"
                                    value={editMedication.date}
                                    onChange={e => setEditMedication({ ...editMedication, date: e.target.value })}
                                    className="w-full p-3 border-2 border-orange-100 focus:border-orange-400 rounded-xl focus:outline-none transition-colors"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">Duração</label>
                                    <input
                                        type="text"
                                        value={editMedication.duration}
                                        onChange={e => setEditMedication({ ...editMedication, duration: e.target.value })}
                                        className="w-full p-3 border-2 border-orange-100 focus:border-orange-400 rounded-xl focus:outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">Frequência</label>
                                    <input
                                        type="text"
                                        value={editMedication.frequency}
                                        onChange={e => setEditMedication({ ...editMedication, frequency: e.target.value })}
                                        className="w-full p-3 border-2 border-orange-100 focus:border-orange-400 rounded-xl focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
                        <Button className="btn-gradient text-white border-0" onClick={handleUpdateMedication} disabled={isSubmitting}>
                            {isSubmitting ? "Salvando..." : "Salvar Alterações"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default MedicationsContent;
