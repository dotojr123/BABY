import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, File, Image, FileText, Camera, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import LoadingSpinner from '@/components/LoadingSpinner';

const FileUpload = ({
    onFileSelect,
    acceptedTypes = "image/*",
    maxSize = 5 * 1024 * 1024, // 5MB default
    multiple = false,
    className = "",
    placeholder = "Clique ou arraste arquivos aqui"
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const getFileIcon = (fileType) => {
        if (fileType.startsWith('image/')) return Image;
        if (fileType.includes('pdf')) return FileText;
        return File;
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const simulateUpload = async (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                // Adiciona um pequeno delay para simular rede
                setTimeout(() => {
                    resolve(reader.result);
                }, 800);
            };
            reader.readAsDataURL(file);
        });
    };

    const handleFileSelect = async (files) => {
        const fileList = Array.from(files);

        // Validar tamanho dos arquivos
        const oversizedFiles = fileList.filter(file => file.size > maxSize);
        if (oversizedFiles.length > 0) {
            toast({
                title: "Arquivo muito grande",
                description: `Alguns arquivos excedem o limite de ${formatFileSize(maxSize)}`,
                variant: "destructive",
            });
            return;
        }

        setIsUploading(true);

        try {
            const uploadPromises = fileList.map(async (file) => {
                const url = await simulateUpload(file);
                return {
                    id: Date.now() + Math.random(),
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    url: url,
                    uploadedAt: new Date().toISOString()
                };
            });

            const uploadedFileData = await Promise.all(uploadPromises);
            setUploadedFiles(prev => [...prev, ...uploadedFileData]);

            if (onFileSelect) {
                onFileSelect(multiple ? uploadedFileData : uploadedFileData[0]);
            }

            toast({
                title: "✅ Upload Concluído!",
                description: `${uploadedFileData.length} arquivo(s) enviado(s) com sucesso.`,
            });

        } catch (error) {
            toast({
                title: "Erro no Upload",
                description: "Não foi possível enviar os arquivos. Tente novamente.",
                variant: "destructive",
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const removeFile = (fileId) => {
        setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    };

    return (
        <div className={`space-y-4 ${className}`}>
            <div
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${isDragging
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'
                    } ${isUploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={acceptedTypes}
                    multiple={multiple}
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="hidden"
                />

                {isUploading ? (
                    <div className="space-y-4">
                        <LoadingSpinner size="lg" />
                        <p className="text-gray-600">Enviando arquivos...</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                            <Upload className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-lg font-medium text-gray-700">{placeholder}</p>
                            <p className="text-sm text-gray-500 mt-1">
                                Ou clique para selecionar • Máximo {formatFileSize(maxSize)}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Lista de arquivos enviados */}
            {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                    <h4 className="font-medium text-gray-700">Arquivos Enviados:</h4>
                    {uploadedFiles.map((file) => {
                        const IconComponent = getFileIcon(file.type);
                        return (
                            <motion.div
                                key={file.id}
                                className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <IconComponent className="w-5 h-5 text-green-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-800 truncate">{file.name}</p>
                                    <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check className="w-5 h-5 text-green-600" />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeFile(file.id);
                                        }}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default FileUpload;
