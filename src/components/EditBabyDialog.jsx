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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { Camera, Upload, Image as ImageIcon } from 'lucide-react';
import FileUpload from '@/components/FileUpload';
import LoadingSpinner from '@/components/LoadingSpinner';

const EditBabyDialog = ({ isOpen, onClose, baby, updateBabyData }) => {
  const [editedBaby, setEditedBaby] = useState(baby);
  const [photoUploadMethod, setPhotoUploadMethod] = useState('url');
  const [isUpdatingPhoto, setIsUpdatingPhoto] = useState(false);

  useEffect(() => {
    setEditedBaby(baby);
  }, [baby]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setEditedBaby((prev) => ({ ...prev, [id]: value }));
  };

  const handlePhotoUpload = async (file) => {
    setIsUpdatingPhoto(true);
    try {
      // Simula o upload da foto
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setEditedBaby(prev => ({
        ...prev,
        photo: file.url,
        photoUploadMethod: 'upload'
      }));
      
      toast({
        title: "📸 Foto Atualizada!",
        description: "A foto do perfil foi atualizada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro no Upload",
        description: "Não foi possível fazer upload da foto. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPhoto(false);
    }
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
      title: "✅ Sucesso!",
      description: "Dados do bebê atualizados com sucesso.",
    });
    onClose();
  };

  if (!editedBaby) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-600" />
            Editar Perfil do Bebê
          </DialogTitle>
          <DialogDescription>
            Faça alterações nos dados do seu bebê aqui. Clique em salvar quando terminar.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {/* Seção da Foto */}
          <div className="space-y-4">
            <Label className="text-gray-700 font-medium">Foto do Perfil</Label>
            
            {/* Preview da foto atual */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-blue-100">
                  <AvatarImage src={editedBaby.photo} alt={`Foto de ${editedBaby.name}`} />
                  <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                    {editedBaby.name?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                {editedBaby.photoUploadMethod === 'upload' && (
                  <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-1 rounded-full">
                    <Upload className="w-3 h-3" />
                  </div>
                )}
              </div>
              
              {/* Método de upload */}
              <div className="w-full">
                <div className="flex gap-2 mb-3">
                  <Button
                    type="button"
                    variant={photoUploadMethod === 'upload' ? 'default' : 'outline'}
                    onClick={() => setPhotoUploadMethod('upload')}
                    className="flex-1 text-sm"
                    size="sm"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                  <Button
                    type="button"
                    variant={photoUploadMethod === 'url' ? 'default' : 'outline'}
                    onClick={() => setPhotoUploadMethod('url')}
                    className="flex-1 text-sm"
                    size="sm"
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    URL
                  </Button>
                </div>

                {/* Upload de arquivo */}
                {photoUploadMethod === 'upload' && (
                  <div className="space-y-2">
                    {isUpdatingPhoto ? (
                      <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-xl">
                        <div className="text-center">
                          <LoadingSpinner size="md" />
                          <p className="text-sm text-gray-600 mt-2">Atualizando foto...</p>
                        </div>
                      </div>
                    ) : (
                      <FileUpload
                        onFileSelect={handlePhotoUpload}
                        acceptedTypes="image/*"
                        maxSize={5 * 1024 * 1024} // 5MB
                        multiple={false}
                        placeholder="Clique ou arraste uma foto aqui"
                        className="text-sm"
                      />
                    )}
                  </div>
                )}

                {/* URL da imagem */}
                {photoUploadMethod === 'url' && (
                  <div>
                    <Input 
                      type="text" 
                      placeholder="https://exemplo.com/foto.jpg" 
                      value={editedBaby.photo || ''} 
                      onChange={e => setEditedBaby(prev => ({ ...prev, photo: e.target.value, photoUploadMethod: 'url' }))} 
                      className="border-2 border-blue-100 focus:border-blue-400 rounded-xl"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dados básicos */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="name" className="text-gray-700 font-medium">
                Nome Completo
              </Label>
              <Input
                id="name"
                value={editedBaby.name}
                onChange={handleChange}
                className="mt-2 border-2 border-blue-100 focus:border-blue-400 rounded-xl"
                placeholder="Nome do bebê"
              />
            </div>
            
            <div>
              <Label htmlFor="birthDate" className="text-gray-700 font-medium">
                Data de Nascimento
              </Label>
              <Input
                id="birthDate"
                type="date"
                value={editedBaby.birthDate ? format(new Date(editedBaby.birthDate), 'yyyy-MM-dd') : ''}
                onChange={handleChange}
                className="mt-2 border-2 border-blue-100 focus:border-blue-400 rounded-xl"
              />
            </div>
          </div>

          {/* Medidas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="weight" className="text-gray-700 font-medium">
                Peso Atual
              </Label>
              <Input
                id="weight"
                value={editedBaby.weight}
                onChange={handleChange}
                className="mt-2 border-2 border-blue-100 focus:border-blue-400 rounded-xl"
                placeholder="Ex: 8.2 kg"
              />
            </div>
            
            <div>
              <Label htmlFor="height" className="text-gray-700 font-medium">
                Altura Atual
              </Label>
              <Input
                id="height"
                value={editedBaby.height}
                onChange={handleChange}
                className="mt-2 border-2 border-blue-100 focus:border-blue-400 rounded-xl"
                placeholder="Ex: 72 cm"
              />
            </div>
          </div>
        </div>
        
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} className="rounded-xl">
            Cancelar
          </Button>
          <Button onClick={handleSave} className="btn-gradient text-white border-0 rounded-xl">
            <Camera className="w-4 h-4 mr-2" />
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditBabyDialog;