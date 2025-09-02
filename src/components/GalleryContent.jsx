import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Plus, Image as ImageIcon, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
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

const GalleryContent = ({ baby, updateBabyData }) => {
    const [showForm, setShowForm] = useState(false);
    const [newPhoto, setNewPhoto] = useState({ url: '', description: '' });
    const [photoToDelete, setPhotoToDelete] = useState(null);
    const [loadingImages, setLoadingImages] = useState(new Set());
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleImageLoad = (photoId) => {
        setLoadingImages(prev => {
            const newSet = new Set(prev);
            newSet.delete(photoId);
            return newSet;
        });
    };

    const handleImageLoadStart = (photoId) => {
        setLoadingImages(prev => new Set(prev).add(photoId));
    };

    const handleAddPhoto = async () => {
        if (!newPhoto.url) {
            toast({
                title: "Erro",
                description: "Por favor, insira a URL da imagem.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            // Simulate API delay for better UX demonstration
            await new Promise(resolve => setTimeout(resolve, 1000));

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
        } catch (error) {
            toast({
                title: "Erro",
                description: "Não foi possível adicionar a foto. Tente novamente.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
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
        <div className="space-y-4 sm:space-y-6">
            <motion.div
                className="medical-card rounded-2xl p-4 sm:p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center">
                        <Camera className="w-6 h-6 sm:w-8 sm:h-8 mr-3 text-blue-600" />
                        <h2 className="text-xl sm:text-2xl font-bold gradient-text">Galeria de Fotos</h2>
                    </div>
                    <Button 
                        onClick={() => setShowForm(!showForm)}
                        className="w-full sm:w-auto"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        {showForm ? 'Cancelar' : 'Adicionar Foto'}
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
                                <Label htmlFor="photoUrl">URL da Imagem</Label>
                                <Input 
                                    id="photoUrl" 
                                    type="text" 
                                    placeholder="https://exemplo.com/foto.jpg" 
                                    value={newPhoto.url} 
                                    onChange={e => setNewPhoto({ ...newPhoto, url: e.target.value })} 
                                    className="mt-1" 
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div>
                                <Label htmlFor="photoDescription">Descrição (Opcional)</Label>
                                <Input 
                                    id="photoDescription" 
                                    type="text" 
                                    placeholder="Primeiro banho do bebê" 
                                    value={newPhoto.description} 
                                    onChange={e => setNewPhoto({ ...newPhoto, description: e.target.value })} 
                                    className="mt-1"
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>
                        <Button 
                            onClick={handleAddPhoto} 
                            className="mt-4 w-full sm:w-auto"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <div className="flex items-center gap-2">
                                    <LoadingSpinner size="sm" />
                                    <span>Adicionando...</span>
                                </div>
                            ) : (
                                'Salvar'
                            )}
                        </Button>
                    </motion.div>
                )}

                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                    {photos.length > 0 ? photos.map(photo => (
                        <Card key={photo.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                            <CardContent className="p-0 relative">
                                {loadingImages.has(photo.id) && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
                                        <LoadingSpinner size="md" />
                                    </div>
                                )}
                                <img  
                                    alt={photo.description} 
                                    className="w-full h-32 sm:h-48 object-cover transition-transform group-hover:scale-105" 
                                    src={photo.url}
                                    onLoadStart={() => handleImageLoadStart(photo.id)}
                                    onLoad={() => handleImageLoad(photo.id)}
                                    onError={() => handleImageLoad(photo.id)}
                                />
                            </CardContent>
                            <CardFooter className="flex justify-between items-center p-2 sm:p-3">
                                <p className="text-xs sm:text-sm text-gray-700 truncate flex-1 mr-2">
                                    {photo.description}
                                </p>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => setPhotoToDelete(photo)}
                                        >
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="max-w-sm mx-4">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Esta ação removerá esta foto da galeria.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                                            <AlertDialogCancel 
                                                onClick={() => setPhotoToDelete(null)}
                                                className="w-full sm:w-auto"
                                            >
                                                Cancelar
                                            </AlertDialogCancel>
                                            <AlertDialogAction 
                                                onClick={handleDeletePhoto}
                                                className="w-full sm:w-auto"
                                            >
                                                Remover
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </CardFooter>
                        </Card>
                    )) : (
                        <div className="col-span-full text-center py-12">
                            <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-500 text-sm sm:text-base">Nenhuma foto adicionada ainda.</p>
                            <p className="text-gray-400 text-xs sm:text-sm mt-1">Clique em "Adicionar Foto" para começar</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default GalleryContent;