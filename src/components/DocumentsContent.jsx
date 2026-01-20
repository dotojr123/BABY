import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, Download, Eye, Trash2, Upload, Calendar, User, Stethoscope, TestTube, Heart, Sparkles, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import FileUpload from '@/components/FileUpload';
import { api } from '../services/api';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
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

const documentTypes = {
    medical: {
        label: 'Prontuário Médico',
        icon: Stethoscope,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        description: 'Consultas, diagnósticos e prescrições'
    },
    exam: {
        label: 'Exames',
        icon: TestTube,
        color: 'text-green-600',
        bg: 'bg-green-50',
        description: 'Resultados de exames laboratoriais'
    },
    vaccine: {
        label: 'Cartão de Vacina',
        icon: Heart,
        color: 'text-red-600',
        bg: 'bg-red-50',
        description: 'Comprovantes de vacinação'
    },
    certificate: {
        label: 'Certidões',
        icon: FileText,
        color: 'text-purple-600',
        bg: 'bg-purple-50',
        description: 'Certidão de nascimento e outros'
    },
    other: {
        label: 'Outros',
        icon: FileText,
        color: 'text-gray-600',
        bg: 'bg-gray-50',
        description: 'Documentos diversos'
    }
};

const DocumentsContent = ({ baby, updateBabyData }) => {
    const [showForm, setShowForm] = useState(false);
    const [newDocument, setNewDocument] = useState({
        title: '',
        type: 'medical',
        description: '',
        date: new Date().toISOString().split('T')[0],
        files: []
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [documentToDelete, setDocumentToDelete] = useState(null);
    const [selectedType, setSelectedType] = useState('all');
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [viewOpen, setViewOpen] = useState(false);

    const handleAddDocument = async () => {
        if (!newDocument.title || newDocument.files.length === 0) {
            toast({
                title: "Erro",
                description: "Por favor, preencha o título e adicione pelo menos um arquivo.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const uploadedFiles = [];

            // Faz o upload de cada arquivo para o R2 e salva no D1
            for (const fileObj of newDocument.files) {
                const formData = new FormData();
                formData.append('babyId', baby.id);
                formData.append('title', newDocument.title);
                formData.append('type', newDocument.type);
                formData.append('file', fileObj.file); // O objeto File original

                const result = await api.uploadDocument(formData);
                uploadedFiles.push({
                    ...fileObj,
                    id: result.id,
                    url: fileObj.url // Mantemos o Base64 para preview imediato sem recarregar
                });
            }

            const documentToAdd = {
                id: uploadedFiles[0]?.id || Date.now(),
                title: newDocument.title,
                type: newDocument.type,
                description: newDocument.description,
                date: newDocument.date,
                files: uploadedFiles,
                createdAt: new Date().toISOString(),
            };

            const updatedBaby = {
                ...baby,
                documents: [...(baby.documents || []), documentToAdd],
            };

            updateBabyData(updatedBaby);
            toast({
                title: "📄 Documento Adicionado!",
                description: `${newDocument.title} foi adicionado com sucesso.`,
            });
            setNewDocument({
                title: '',
                type: 'medical',
                description: '',
                date: new Date().toISOString().split('T')[0],
                files: []
            });
            setShowForm(false);
        } catch (error) {
            toast({
                title: "Erro",
                description: "Não foi possível adicionar o documento. Tente novamente.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteDocument = async () => {
        if (documentToDelete) {
            try {
                await api.deleteDocument(documentToDelete.id);
                const updatedDocuments = (baby.documents || []).filter(
                    (doc) => doc.id !== documentToDelete.id
                );
                const updatedBaby = { ...baby, documents: updatedDocuments };
                updateBabyData(updatedBaby);
                toast({
                    title: "🗑️ Documento Excluído",
                    description: `${documentToDelete.title} foi removido com sucesso.`,
                });
                setDocumentToDelete(null);
            } catch (error) {
                toast({
                    title: "Erro",
                    description: "Falha ao excluir o documento no servidor.",
                    variant: "destructive",
                });
            }
        }
    };

    const handleFileSelect = (files) => {
        const fileArray = Array.isArray(files) ? files : [files];
        setNewDocument(prev => ({
            ...prev,
            files: [...prev.files, ...fileArray]
        }));
    };

    const removeFile = (fileId) => {
        setNewDocument(prev => ({
            ...prev,
            files: prev.files.filter(file => file.id !== fileId)
        }));
    };

    const documents = baby.documents || [];
    const filteredDocuments = selectedType === 'all'
        ? documents
        : documents.filter(doc => doc.type === selectedType);

    // Estatísticas dos documentos
    const stats = Object.keys(documentTypes).reduce((acc, type) => {
        acc[type] = documents.filter(doc => doc.type === type).length;
        return acc;
    }, {});

    return (
        <div className="space-y-6">
            <motion.div
                className="glass-card rounded-3xl p-6 relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full transform translate-x-16 -translate-y-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-400/20 to-cyan-400/20 rounded-full transform -translate-x-12 translate-y-12"></div>

                <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center">
                            <div className="relative">
                                <FileText className="w-8 h-8 mr-3 text-blue-600" />
                                <div className="pulse-ring text-blue-600"></div>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold gradient-text flex items-center">
                                    Documentos Médicos
                                    <Sparkles className="w-6 h-6 ml-2 text-yellow-500" />
                                </h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    {documents.length} documento(s) armazenado(s)
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={() => setShowForm(!showForm)}
                            className="btn-gradient text-white border-0 w-full sm:w-auto"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            {showForm ? 'Cancelar' : 'Novo Documento'}
                        </Button>
                    </div>

                    {/* Estatísticas por tipo */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                        {Object.entries(documentTypes).map(([type, config]) => {
                            const IconComponent = config.icon;
                            return (
                                <Card
                                    key={type}
                                    className={`cursor-pointer transition-all duration-200 hover:scale-105 ${selectedType === type ? 'ring-2 ring-blue-500' : ''
                                        }`}
                                    onClick={() => setSelectedType(selectedType === type ? 'all' : type)}
                                >
                                    <CardContent className="p-4 text-center">
                                        <div className={`w-12 h-12 mx-auto mb-2 rounded-full ${config.bg} flex items-center justify-center`}>
                                            <IconComponent className={`w-6 h-6 ${config.color}`} />
                                        </div>
                                        <div className="text-lg font-bold text-gray-800">{stats[type] || 0}</div>
                                        <div className="text-xs text-gray-600">{config.label}</div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {showForm && (
                        <motion.div
                            className="mb-6 gradient-card rounded-2xl p-6 border-0"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                        >
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="docTitle" className="text-gray-700 font-medium">Título do Documento</Label>
                                        <Input
                                            id="docTitle"
                                            type="text"
                                            placeholder="Ex: Consulta Pediatra - Janeiro 2024"
                                            value={newDocument.title}
                                            onChange={e => setNewDocument({ ...newDocument, title: e.target.value })}
                                            className="mt-2 border-2 border-blue-100 focus:border-blue-400 rounded-xl"
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="docType" className="text-gray-700 font-medium">Tipo de Documento</Label>
                                        <select
                                            id="docType"
                                            value={newDocument.type}
                                            onChange={e => setNewDocument({ ...newDocument, type: e.target.value })}
                                            className="mt-2 w-full p-3 border-2 border-blue-100 focus:border-blue-400 rounded-xl focus:outline-none transition-colors"
                                            disabled={isSubmitting}
                                        >
                                            {Object.entries(documentTypes).map(([type, config]) => (
                                                <option key={type} value={type}>{config.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="docDate" className="text-gray-700 font-medium">Data do Documento</Label>
                                        <Input
                                            id="docDate"
                                            type="date"
                                            value={newDocument.date}
                                            onChange={e => setNewDocument({ ...newDocument, date: e.target.value })}
                                            className="mt-2 border-2 border-blue-100 focus:border-blue-400 rounded-xl"
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="docDescription" className="text-gray-700 font-medium">Descrição (Opcional)</Label>
                                        <Input
                                            id="docDescription"
                                            type="text"
                                            placeholder="Breve descrição do documento"
                                            value={newDocument.description}
                                            onChange={e => setNewDocument({ ...newDocument, description: e.target.value })}
                                            className="mt-2 border-2 border-blue-100 focus:border-blue-400 rounded-xl"
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-gray-700 font-medium">Arquivos</Label>
                                    <div className="mt-2">
                                        <FileUpload
                                            onFileSelect={handleFileSelect}
                                            acceptedTypes="image/*,.pdf,.doc,.docx"
                                            maxSize={10 * 1024 * 1024} // 10MB
                                            multiple={true}
                                            placeholder="Adicione fotos, PDFs ou documentos"
                                        />
                                    </div>

                                    {/* Arquivos selecionados */}
                                    {newDocument.files.length > 0 && (
                                        <div className="mt-4 space-y-2">
                                            <h4 className="font-medium text-gray-700">Arquivos Selecionados:</h4>
                                            {newDocument.files.map((file) => (
                                                <div key={file.id} className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                                                    <FileText className="w-4 h-4 text-blue-600" />
                                                    <span className="flex-1 text-sm font-medium">{file.name}</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeFile(file.id)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Button
                                onClick={handleAddDocument}
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
                                        <Upload className="w-4 h-4 mr-2" />
                                        Salvar Documento
                                    </>
                                )}
                            </Button>
                        </motion.div>
                    )}

                    {/* Lista de documentos */}
                    <div className="space-y-4">
                        {filteredDocuments.length > 0 ? filteredDocuments.map((doc, index) => {
                            const typeConfig = documentTypes[doc.type];
                            const IconComponent = typeConfig.icon;

                            return (
                                <motion.div
                                    key={doc.id}
                                    className="gradient-card rounded-2xl p-4 floating-card border-0"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className={`w-12 h-12 rounded-full ${typeConfig.bg} flex items-center justify-center flex-shrink-0`}>
                                                <IconComponent className={`w-6 h-6 ${typeConfig.color}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-lg text-gray-800 mb-1">{doc.title}</h3>
                                                <p className="text-sm text-gray-600 mb-2">{typeConfig.label}</p>
                                                {doc.description && (
                                                    <p className="text-sm text-gray-500 mb-2">{doc.description}</p>
                                                )}
                                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(doc.date).toLocaleDateString('pt-BR')}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <FileText className="w-3 h-3" />
                                                        {doc.files.length} arquivo(s)
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    setSelectedDoc(doc);
                                                    setViewOpen(true);
                                                }}
                                                className="rounded-xl border-2 hover:scale-105 transition-transform"
                                            >
                                                <Eye className="w-4 h-4 mr-1" />
                                                Ver
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    doc.files.forEach(file => {
                                                        const link = document.createElement('a');
                                                        link.href = file.url;
                                                        link.download = file.name;
                                                        link.click();
                                                    });
                                                }}
                                                className="rounded-xl border-2 hover:scale-105 transition-transform"
                                            >
                                                <Download className="w-4 h-4 mr-1" />
                                                Baixar
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setDocumentToDelete(doc)}
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl border-2"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className="max-w-sm mx-4 rounded-2xl">
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Remover documento?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Esta ação removerá <strong>{doc.title}</strong> permanentemente. Esta ação não pode ser desfeita.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                                                        <AlertDialogCancel
                                                            onClick={() => setDocumentToDelete(null)}
                                                            className="w-full sm:w-auto rounded-xl"
                                                        >
                                                            Cancelar
                                                        </AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={handleDeleteDocument}
                                                            className="w-full sm:w-auto bg-red-500 hover:bg-red-600 rounded-xl"
                                                        >
                                                            Remover
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        }) : (
                            <div className="text-center py-16">
                                <div className="animate-float">
                                    <FileText className="w-20 h-20 mx-auto text-gray-400 mb-6" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-600 mb-2">
                                    {selectedType === 'all' ? 'Nenhum documento ainda' : `Nenhum documento de ${documentTypes[selectedType].label}`}
                                </h3>
                                <p className="text-gray-500 mb-4">
                                    Comece adicionando documentos médicos do seu bebê
                                </p>
                                <Button
                                    onClick={() => setShowForm(true)}
                                    className="btn-gradient text-white border-0"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Adicionar Primeiro Documento
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Modal de Visualização */}
            <Dialog open={viewOpen} onOpenChange={setViewOpen}>
                <DialogContent className="rounded-3xl max-w-2xl w-[95%] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            {selectedDoc && (
                                <>
                                    <div className={`w-10 h-10 rounded-full ${documentTypes[selectedDoc.type].bg} flex items-center justify-center`}>
                                        {React.createElement(documentTypes[selectedDoc.type].icon, { className: `w-5 h-5 ${documentTypes[selectedDoc.type].color}` })}
                                    </div>
                                    {selectedDoc.title}
                                </>
                            )}
                        </DialogTitle>
                        <DialogDescription className="text-gray-500">
                            {selectedDoc?.description || 'Documento médico arquivado'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 my-4">
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <div className="bg-gray-50 px-3 py-1 rounded-full border border-gray-100 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {selectedDoc && new Date(selectedDoc.date).toLocaleDateString('pt-BR')}
                            </div>
                            <div className="bg-blue-50 px-3 py-1 rounded-full border border-blue-100 flex items-center gap-2 text-blue-600">
                                <FileText className="w-4 h-4" />
                                {selectedDoc?.files.length} arquivo(s)
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {selectedDoc?.files.map((file, idx) => (
                                <div key={idx} className="border-2 border-gray-100 rounded-2xl overflow-hidden bg-gray-50">
                                    <div className="p-3 bg-white border-b border-gray-100 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {file.type.startsWith('image/') ? (
                                                <Image className="w-4 h-4 text-blue-500" />
                                            ) : (
                                                <FileText className="w-4 h-4 text-gray-500" />
                                            )}
                                            <span className="font-medium text-sm truncate max-w-[200px]">{file.name}</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => window.open(file.url, '_blank')}
                                            className="text-blue-600"
                                        >
                                            <Eye className="w-3 h-3 mr-1" /> Expandir
                                        </Button>
                                    </div>
                                    <div className="p-4 flex items-center justify-center min-h-[300px] bg-gray-100/50">
                                        {file.type.startsWith('image/') ? (
                                            <img
                                                src={file.url}
                                                alt={file.name}
                                                className="max-w-full h-auto rounded-lg shadow-sm border border-gray-200"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://placehold.co/600x400?text=Imagem+Nao+Encontrada';
                                                }}
                                            />
                                        ) : file.type.includes('pdf') ? (
                                            <iframe
                                                src={file.url}
                                                className="w-full h-[500px] rounded-lg border border-gray-200"
                                                title={file.name}
                                            />
                                        ) : (
                                            <div className="text-center space-y-3 p-8 bg-white rounded-2xl shadow-inner border-2 border-dashed border-gray-200 w-full">
                                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                                                    <FileText className="w-8 h-8 text-gray-400" />
                                                </div>
                                                <div>
                                                    <p className="text-gray-900 font-bold">Arquivo {file.type.split('/')[1]?.toUpperCase() || 'Documento'}</p>
                                                    <p className="text-gray-500 text-sm mt-1">
                                                        Este tipo de arquivo pode não ser pré-visualizado diretamente no navegador.<br />
                                                        Use o botão de expandir ou baixar para ver o conteúdo completo.
                                                    </p>
                                                </div>
                                                <div className="pt-4 flex justify-center gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => window.open(file.url, '_blank')}>
                                                        <Eye className="w-4 h-4 mr-2" /> Abrir em Nova Aba
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <DialogFooter className="sm:justify-start">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setViewOpen(false)}
                            className="rounded-xl w-full sm:w-auto"
                        >
                            Fechar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default DocumentsContent;
