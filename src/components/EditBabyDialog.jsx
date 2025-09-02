import React, { useState, useEffect } from 'react';
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
import { format } from 'date-fns';

const EditBabyDialog = ({ isOpen, onClose, baby, updateBabyData }) => {
  const [editedBaby, setEditedBaby] = useState(baby);

  useEffect(() => {
    setEditedBaby(baby);
  }, [baby]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setEditedBaby((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = () => {
    if (!editedBaby.name || !editedBaby.birthDate) {
      toast({
        title: "Erro ao salvar",
        description: "Nome e data de nascimento são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    updateBabyData(editedBaby);
    toast({
      title: "Sucesso!",
      description: "Dados do bebê atualizados.",
    });
    onClose();
  };

  if (!editedBaby) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Dados do Bebê</DialogTitle>
          <DialogDescription>
            Faça alterações nos dados do seu bebê aqui. Clique em salvar quando terminar.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nome
            </Label>
            <Input
              id="name"
              value={editedBaby.name}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="birthDate" className="text-right">
              Nascimento
            </Label>
            <Input
              id="birthDate"
              type="date"
              value={editedBaby.birthDate ? format(new Date(editedBaby.birthDate), 'yyyy-MM-dd') : ''}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="weight" className="text-right">
              Peso
            </Label>
            <Input
              id="weight"
              value={editedBaby.weight}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="height" className="text-right">
              Altura
            </Label>
            <Input
              id="height"
              value={editedBaby.height}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="photo" className="text-right">
              Foto URL
            </Label>
            <Input
              id="photo"
              value={editedBaby.photo}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Salvar mudanças</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditBabyDialog;