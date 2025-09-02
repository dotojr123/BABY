import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Plus, Image as ImageIcon, Trash2, Heart, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import FileUpload from '@/components/FileUpload';
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
    const [newPhoto, setNewPhoto] = useState({ url: '', description: '', uploadMethod: 'url' });
    const [photoToDelete, setPhotoToDelete] = useState(null);
    const [loadingImages, setLoadingImages] = useState(new Set());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [likedPhotos, setLikedPhotos] = useState(new Set());

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

    const handleLikePhoto = (photoId) => {
        setLikedPhotos(prev => {
            const newSet = new Set(prev);
            if (newSet.has(photoId)) {
                newSet.delete(photoId);
            } else {
                newSet.add(photoId);
            }
            return newSet;
        });
    };

    const handleFileSelect = (file) => {
        setNewPhoto(prev => ({
            ...prev,
            url: file.url,
            uploadMethod: 'upload'
        }));
    };

    const handleAddPhoto = async () => {
        if (!newPhoto.url) {
            toast({
                title: "Erro",
                description: "Por favor, adicione uma imagem (URL ou upload).",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 1000));

            const photoToAdd = {
                id: Date.now(),
                url: newPhoto.url,
                description: newPhoto.description || 'Foto do bebê',
                date: new Date().toISOString(),
                uploadMethod: newPhoto.uploadMethod,
            };

            const updatedBaby = {
                ...baby,
                gallery: [...(baby.gallery || []), photoToAdd],
            };

            updateBabyData(updatedBaby);
            toast({
                title: "✨ Foto Adicionada!",
                description: "Sua foto foi adicionada à galeria com sucesso.",
            });
            setNewPhoto({ url: '', description: '', uploadMethod: 'url' });
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
        <div className="space-y-6">
            <motion.div
                className="glass-card rounded-3xl p-6 relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-400/20 to-purple-400/20 rounded-full transform translate-x-16 -translate-y-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-400/20 to-cyan-400/20 rounded-full transform -translate-x-12 translate-y-12"></div>

                <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center">
                            <div className="relative">
                                <Camera className="w-8 h-8 mr-3 text-blue-600" />
                                <div className="pulse-ring text-blue-600"></div>
                            </div>
                            <h2 className="text-2xl font-bold gradient-text">Galeria de Memórias</h2>
                        </div>
                        <Button 
                            onClick={() => setShowForm(!showForm)}
                            className="btn-gradient text-white border-0 w-full sm:w-auto"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            {showForm ? 'Cancelar' : 'Adicionar Foto'}
                        </Button>
                    </div>

                    {showForm && (
                        <motion.div 
                            className="mb-6 gradient-card rounded-2xl p-6 border-0" 
                            initial={{ opacity: 0, height: 0 }} 
                            animate={{ opacity: 1, height: 'auto' }}
                        >
                            <div className="space-y-4">
                                {/* Método de upload */}
                                <div>
                                    <Label className="text-gray-700 font-medium">Como deseja adicionar a foto?</Label>
                                    <div className="flex gap-4 mt-2">
                                        <Button
                                            type="button"
                                            variant={newPhoto.uploadMethod === 'upload' ? 'default' : 'outline'}
                                            onClick={() => setNewPhoto(prev => ({ ...prev, uploadMethod: 'upload', url: '' }))}
                                            className="flex-1"
                                        >
                                            <Upload className="w-4 h-4 mr-2" />
                                            Upload de Arquivo
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={newPhoto.uploadMethod === 'url' ? 'default' : 'outline'}
                                            onClick={() => setNewPhoto(prev => ({ ...prev, uploadMethod: 'url', url: '' }))}
                                            className="flex-1"
                                        >
                                            <ImageIcon className="w-4 h-4 mr-2" />
                                            Link da Imagem
                                        </Button>
                                    </div>
                                </div>

                                {/* Upload de arquivo */}
                                {newPhoto.uploadMethod === 'upload' && (
                                    <div>
                                        <Label className="text-gray-700 font-medium">Selecionar Foto</Label>
                                        <div className="mt-2">
                                            <FileUpload
                                                onFileSelect={handleFileSelect}
                                                acceptedTypes="image/*"
                                                maxSize={5 * 1024 * 1024} // 5MB
                                                multiple={false}
                                                placeholder="Clique ou arraste uma foto aqui"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* URL da imagem */}
                                {newPhoto.uploadMethod === 'url' && (
                                    <div>
                                        <Label htmlFor="photoUrl" className="text-gray-700 font-medium">URL da Imagem</Label>
                                        <Input 
                                            id="photoUrl" 
                                            type="text" 
                                            placeholder="https://exemplo.com/foto.jpg" 
                                            value={newPhoto.url} 
                                            onChange={e => setNewPhoto({ ...newPhoto, url: e.target.value })} 
                                            className="mt-2 border-2 border-blue-100 focus:border-blue-400 rounded-xl" 
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                )}

                                {/* Descrição */}
                                <div>
                                    <Label htmlFor="photoDescription" className="text-gray-700 font-medium">Descrição (Opcional)</Label>
                                    <Input 
                                        id="photoDescription" 
                                        type="text" 
                                        placeholder="Primeiro banho do bebê" 
                                        value={newPhoto.description} 
                                        onChange={e => setNewPhoto({ ...newPhoto, description: e.target.value })} 
                                        className="mt-2 border-2 border-blue-100 focus:border-blue-400 rounded-xl"
                                        disabled={isSubmitting}
                                    />
                                </div>

                                {/* Preview da imagem */}
                                {newPhoto.url && (
                                    <div>
                                        <Label className="text-gray-700 font-medium">Preview</Label>
                                        <div className="mt-2 border-2 border-gray-200 rounded-xl p-4">
                                            <img 
                                                src={newPhoto.url} 
                                                alt="Preview" 
                                                className="w-full max-w-xs mx-auto rounded-lg"
                                                onError={() => toast({
                                                    title: "Erro na imagem",
                                                    description: "Não foi possível carregar a imagem. Verifique a URL.",
                                                    variant: "destructive"
                                                })}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <Button 
                                onClick={handleAddPhoto} 
                                className="mt-6 btn-gradient text-white border-0 w-full sm:w-auto"
                                disabled={isSubmitting || !newPhoto.url}
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center gap-2">
                                        <LoadingSpinner size="sm" />
                                        <span>Adicionando...</span>
                                    </div>
                                ) : (
                                    <>
                                        <Camera className="w-4 h-4 mr-2" />
                                        Salvar Foto
                                    </>
                                )}
                            </Button>
                        </motion.div>
                    )}

                    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {photos.length > 0 ? photos.map((photo, index) => (
                            <motion.div
                                key={photo.id}
                                className="group relative"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="overflow-hidden floating-card border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                                    <CardContent className="p-0 relative">
                                        {loadingImages.has(photo.id) && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 z-10 rounded-t-xl">
                                                <LoadingSpinner size="md" />
                                            </div>
                                        )}
                                        <div className="relative overflow-hidden rounded-t-xl">
                                            <img  
                                                alt={photo.description} 
                                                className="w-full h-32 sm:h-48 object-cover transition-all duration-500 group-hover:scale-110" 
                                                src={photo.url}
                                                onLoadStart={() => handleImageLoadStart(photo.id)}
                                                onLoad={() => handleImageLoad(photo.id)}
                                                onError={() => handleImageLoad(photo.id)}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            
                                            {/* Upload method indicator */}
                                            {photo.uploadMethod === 'upload' && (
                                                <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                                    <Upload className="w-3 h-3 inline mr-1" />
                                                    Upload
                                                </div>
                                            )}
                                            
                                            {/* Action buttons overlay */}
                                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <Button
                                                    size="icon"
                                                    variant="secondary"
                                                    className="w-8 h-8 rounded-full bg-white/90 hover:bg-white"
                                                    onClick={() => handleLikePhoto(photo.id)}
                                                >
                                                    <Heart className={`w-4 h-4 ${likedPhotos.has(photo.id) ? 'text-red-500 fill-current' : 'text-gray-600'}`} />
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button 
                                                            size="icon"
                                                            variant="secondary"
                                                            className="w-8 h-8 rounded-full bg-white/90 hover:bg-white"
                                                            onClick={() => setPhotoToDelete(photo)}
                                                        >
                                                            <Trash2 className="w-4 h-4 text-red-500" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent className="max-w-sm mx-4 rounded-2xl">
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Esta ação removerá esta foto da galeria permanentemente.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                                                            <AlertDialogCancel 
                                                                onClick={() => setPhotoToDelete(null)}
                                                                className="w-full sm:w-auto rounded-xl"
                                                            >
                                                                Cancelar
                                                            </AlertDialogCancel>
                                                            <AlertDialogAction 
                                                                onClick={handleDeletePhoto}
                                                                className="w-full sm:w-auto bg-red-500 hover:bg-red-600 rounded-xl"
                                                            >
                                                                Remover
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="p-3">
                                        <div className="w-full">
                                            <p className="text-sm font-medium text-gray-800 truncate mb-1">
                                                {photo.description}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(photo.date).toLocaleDateString('pt-BR')}
                                            </p>
                                        </div>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        )) : (
                            <div className="col-span-full text-center py-16">
                                <div className="animate-float">
                                    <ImageIcon className="w-20 h-20 mx-auto text-gray-400 mb-6" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-600 mb-2">Nenhuma foto ainda</h3>
                                <p className="text-gray-500 mb-4">Comece criando memórias especiais do seu bebê</p>
                                <Button 
                                    onClick={() => setShowForm(true)}
                                    className="btn-gradient text-white border-0"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Adicionar Primeira Foto
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default GalleryContent;