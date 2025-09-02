import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, Download, Eye, Trash2, Upload, Calendar, User, Stethoscope, TestTube, Heart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
            await new Promise(resolve => setTimeout(resolve, 1000));

            const documentToAdd = {
                id: Date.now(),
                title: newDocument.title,
                type: newDocument.type,
                description: newDocument.description,
                date: newDocument.date,
                files: newDocument.files,
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

    const handleDeleteDocument = () => {
        if (documentToDelete) {
            const updatedDocuments = (baby.documents || []).filter(
                (doc) => doc.id !== documentToDelete.id
            );
            const updatedBaby = { ...baby, documents: updatedDocuments };
            updateBabyData(updatedBaby);
            toast({
                title: "Documento Removido!",
                description: "O documento foi removido com sucesso.",
            });
            setDocumentToDelete(null);
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
                                    className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                                        selectedType === type ? 'ring-2 ring-blue-500' : ''
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
                                                onClick={() => toast({ title: "Visualização em breve!" })}
                                                className="rounded-xl border-2 hover:scale-105 transition-transform"
                                            >
                                                <Eye className="w-4 h-4 mr-1" />
                                                Ver
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant="outline"
                                                onClick={() => toast({ title: "Download em breve!" })}
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
        </div>
    );
};

export default DocumentsContent;