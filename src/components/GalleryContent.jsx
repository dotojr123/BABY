import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Plus, Image as ImageIcon, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
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

const GalleryContent = ({ baby, updateBabyData }) => {
    const [showForm, setShowForm] = useState(false);
    const [newPhoto, setNewPhoto] = useState({ url: '', description: '' });
    const [photoToDelete, setPhotoToDelete] = useState(null);

    const handleAddPhoto = () => {
        if (!newPhoto.url) {
            toast({
                title: "Erro",
                description: "Por favor, insira a URL da imagem.",
                variant: "destructive",
            });
            return;
        }

        const photoToAdd = {
            id: Date.now(),
            url: newPhoto.url,
            description: newPhoto.description || 'Foto do bebê',
            date: new Date().toISOString(),
        };

        const updatedBaby = {
            ...baby,
            gallery: [...(baby.gallery || []), photoToAdd],
        };

        updateBabyData(updatedBaby);
        toast({
            title: "Foto Adicionada!",
            description: "Sua foto foi adicionada à galeria.",
        });
        setNewPhoto({ url: '', description: '' });
        setShowForm(false);
    };

    const handleDeletePhoto = () => {
        if (photoToDelete) {
            const updatedGallery = (baby.gallery || []).filter(
                (photo) => photo.id !== photoToDelete.id
            );
            const updatedBaby = { ...baby, gallery: updatedGallery };
            updateBabyData(updatedBaby);
            toast({
                title: "Foto Removida!",
                description: "A foto foi removida da galeria.",
            });
            setPhotoToDelete(null);
        }
    };

    const photos = baby.gallery || [];

    return (
        <div className="space-y-6">
            <motion.div
                className="medical-card rounded-2xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        <Camera className="w-8 h-8 mr-3 text-blue-600" />
                        <h2 className="text-2xl font-bold gradient-text">Galeria de Fotos</h2>
                    </div>
                    <Button onClick={() => setShowForm(!showForm)}>
                        <Plus className="w-4 h-4 mr-2" />
                        {showForm ? 'Cancelar' : 'Adicionar Foto'}
                    </Button>
                </div>

                {showForm && (
                    <motion.div className="mb-6 p-4 bg-white rounded-lg shadow-sm border" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="photoUrl">URL da Imagem</Label>
                                <Input id="photoUrl" type="text" placeholder="https://exemplo.com/foto.jpg" value={newPhoto.url} onChange={e => setNewPhoto({ ...newPhoto, url: e.target.value })} className="mt-1" />
                            </div>
                            <div>
                                <Label htmlFor="photoDescription">Descrição (Opcional)</Label>
                                <Input id="photoDescription" type="text" placeholder="Primeiro banho do bebê" value={newPhoto.description} onChange={e => setNewPhoto({ ...newPhoto, description: e.target.value })} className="mt-1" />
                            </div>
                        </div>
                        <Button onClick={handleAddPhoto} className="mt-4">Salvar</Button>
                    </motion.div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {photos.length > 0 ? photos.map(photo => (
                        <Card key={photo.id} className="overflow-hidden">
                            <CardContent className="p-0">
                                <img  alt={photo.description} class="w-full h-48 object-cover" src={photo.url} />
                            </CardContent>
                            <CardFooter className="flex justify-between items-center p-3">
                                <p className="text-sm text-gray-700 truncate">{photo.description}</p>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" onClick={() => setPhotoToDelete(photo)}>
                                            <Trash2 className="w-5 h-5 text-red-500" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Esta ação removerá esta foto da galeria.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel onClick={() => setPhotoToDelete(null)}>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleDeletePhoto}>Remover</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </CardFooter>
                        </Card>
                    )) : (
                        <p className="text-center text-gray-500 py-8 col-span-full">Nenhuma foto adicionada ainda.</p>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default GalleryContent;
