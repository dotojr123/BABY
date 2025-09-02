import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const AddEventDialog = ({ isOpen, onClose, baby, updateBabyData }) => {
  const [newEvent, setNewEvent] = useState({
    type: 'appointment', // default type
    name: '',
    details: '',
    date: '',
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setNewEvent((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = () => {
    if (!newEvent.name || !newEvent.date || !newEvent.type) {
      toast({
        title: "Erro ao adicionar evento",
        description: "Nome, tipo e data são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const eventToAdd = {
      id: Date.now(),
      type: newEvent.type,
      name: newEvent.name,
      details: newEvent.details,
      date: new Date(newEvent.date).toISOString(),
      completed: false,
    };

    const updatedBaby = {
      ...baby,
      events: [...(baby.events || []), eventToAdd],
    };

    updateBabyData(updatedBaby);
    toast({
      title: "Sucesso!",
      description: "Novo evento adicionado.",
    });
    setNewEvent({ type: 'appointment', name: '', details: '', date: '' });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Evento</DialogTitle>
          <DialogDescription>
            Preencha os detalhes do novo evento para o seu bebê.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Tipo
            </Label>
            <select
              id="type"
              value={newEvent.type}
              onChange={handleChange}
              className="col-span-3 p-2 border rounded"
            >
              <option value="appointment">Consulta</option>
              <option value="medication">Medicamento</option>
              <option value="other">Outro</option>
            </select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nome
            </Label>
            <Input
              id="name"
              value={newEvent.name}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="details" className="text-right">
              Detalhes
            </Label>
            <Input
              id="details"
              value={newEvent.details}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Data e Hora
            </Label>
            <Input
              id="date"
              type="datetime-local"
              value={newEvent.date}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Adicionar Evento</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddEventDialog;