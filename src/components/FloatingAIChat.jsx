import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X, Bot, User, Mic, MicOff, Paperclip, FileText, Image as ImageIcon, Play, Pause, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import LoadingSpinner from '@/components/LoadingSpinner';
import FileUpload from '@/components/FileUpload';
import { useAppContext } from '@/App';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { toast } from '@/components/ui/use-toast';

const TypingIndicator = () => (
    <div className="flex justify-start">
        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0">
            <Bot className="w-3 h-3 sm:w-5 sm:h-5" />
        </div>
        <div className="ml-2 sm:ml-3 p-2 sm:p-3 rounded-2xl bg-secondary text-secondary-foreground rounded-bl-none">
            <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
            </div>
        </div>
    </div>
);

const AudioRecorder = ({ onAudioRecorded, isRecording, onToggleRecording, onTranscriptionUpdate }) => {
    const [audioLevel, setAudioLevel] = useState(0);
    const [transcription, setTranscription] = useState('');
    const mediaRecorderRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const animationRef = useRef(null);
    const recognitionRef = useRef(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Setup audio visualization
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            analyserRef.current = audioContextRef.current.createAnalyser();
            const source = audioContextRef.current.createMediaStreamSource(stream);
            source.connect(analyserRef.current);
            
            analyserRef.current.fftSize = 256;
            const bufferLength = analyserRef.current.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            
            const updateAudioLevel = () => {
                if (analyserRef.current) {
                    analyserRef.current.getByteFrequencyData(dataArray);
                    const average = dataArray.reduce((a, b) => a + b) / bufferLength;
                    setAudioLevel(average / 255);
                    animationRef.current = requestAnimationFrame(updateAudioLevel);
                }
            };
            updateAudioLevel();

            // Setup speech recognition for real-time transcription
            if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = true;
                recognitionRef.current.interimResults = true;
                recognitionRef.current.lang = 'pt-BR';

                let finalTranscript = '';

                recognitionRef.current.onresult = (event) => {
                    let interimTranscript = '';

                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const transcript = event.results[i][0].transcript;
                        if (event.results[i].isFinal) {
                            finalTranscript += transcript + ' ';
                        } else {
                            interimTranscript += transcript;
                        }
                    }

                    const currentTranscription = finalTranscript + interimTranscript;
                    setTranscription(currentTranscription);
                    onTranscriptionUpdate(currentTranscription);
                };

                recognitionRef.current.onerror = (event) => {
                    console.error('Speech recognition error:', event.error);
                    if (event.error === 'no-speech') {
                        return; // Silently handle no speech
                    }
                    if (event.error !== 'aborted') {
                        toast({
                            title: "Erro na Transcrição",
                            description: "Não foi possível transcrever o áudio. Continue falando.",
                            variant: "destructive",
                        });
                    }
                };

                recognitionRef.current.onstart = () => {
                    console.log('Speech recognition started');
                };

                recognitionRef.current.onend = () => {
                    console.log('Speech recognition ended');
                };

                try {
                    recognitionRef.current.start();
                } catch (error) {
                    console.error('Error starting speech recognition:', error);
                }
            } else {
                toast({
                    title: "Transcrição Não Suportada",
                    description: "Seu navegador não suporta transcrição de áudio em tempo real.",
                    variant: "destructive",
                });
            }

            mediaRecorderRef.current = new MediaRecorder(stream);
            const chunks = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunks.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(blob);
                onAudioRecorded({ blob, url: audioUrl, transcription: transcription.trim() });
                
                // Cleanup
                stream.getTracks().forEach(track => track.stop());
                if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                    audioContextRef.current.close();
                }
                if (animationRef.current) {
                    cancelAnimationFrame(animationRef.current);
                }
                if (recognitionRef.current) {
                    try {
                        recognitionRef.current.stop();
                    } catch (error) {
                        console.log('Recognition already stopped');
                    }
                }
                setAudioLevel(0);
                setTranscription('');
            };

            mediaRecorderRef.current.start(100); // Collect data every 100ms
            onToggleRecording(true);
        } catch (error) {
            console.error('Erro ao acessar microfone:', error);
            toast({
                title: "Erro no Microfone",
                description: "Não foi possível acessar o microfone. Verifique as permissões.",
                variant: "destructive",
            });
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (error) {
                console.log('Recognition already stopped');
            }
        }
        onToggleRecording(false);
    };

    const handleToggle = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    return (
        <Button
            variant={isRecording ? "destructive" : "outline"}
            size="icon"
            onClick={handleToggle}
            className={`relative overflow-hidden ${isRecording ? 'animate-pulse' : ''}`}
            title={isRecording ? 'Parar gravação' : 'Iniciar gravação'}
        >
            {isRecording ? (
                <>
                    <MicOff className="w-4 h-4" />
                    <div 
                        className="absolute inset-0 bg-red-500 opacity-30 rounded"
                        style={{ 
                            transform: `scale(${1 + audioLevel * 0.5})`,
                            transition: 'transform 0.1s ease-out'
                        }}
                    />
                </>
            ) : (
                <Mic className="w-4 h-4" />
            )}
        </Button>
    );
};

const AudioPlayer = ({ audioUrl, onRemove }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const audioRef = useRef(null);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration);
        const handleEnded = () => setIsPlaying(false);

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [audioUrl]);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        setIsPlaying(!isPlaying);
    };

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
            <audio ref={audioRef} src={audioUrl} />
            <Button variant="ghost" size="icon" onClick={togglePlay} className="w-8 h-8">
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <div className="flex-1 text-xs">
                <div className="flex justify-between text-gray-600">
                    <span>Áudio gravado</span>
                    <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                    <div 
                        className="bg-blue-500 h-1 rounded-full transition-all duration-100"
                        style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                    />
                </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onRemove} className="w-8 h-8 text-red-500">
                <X className="w-4 h-4" />
            </Button>
        </div>
    );
};

const DocumentPreview = ({ file, onRemove }) => {
    const isImage = file.type?.startsWith('image/');
    const isPdf = file.type === 'application/pdf';
    const isVideo = file.type?.startsWith('video/');

    return (
        <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200">
            <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center flex-shrink-0">
                {isImage ? (
                    <ImageIcon className="w-4 h-4 text-green-600" />
                ) : isVideo ? (
                    <Play className="w-4 h-4 text-green-600" />
                ) : (
                    <FileText className="w-4 h-4 text-green-600" />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                <p className="text-xs text-gray-500">
                    {isImage ? 'Imagem' : isVideo ? 'Vídeo' : isPdf ? 'PDF' : 'Documento'} • {(file.size / 1024).toFixed(1)} KB
                </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onRemove} className="w-8 h-8 text-red-500 flex-shrink-0">
                <X className="w-4 h-4" />
            </Button>
        </div>
    );
};

const FloatingAIChat = ({ baby, updateBabyData }) => {
    const { settings } = useAppContext();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);
    const [connectionError, setConnectionError] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [attachedAudio, setAttachedAudio] = useState(null);
    const [attachedFiles, setAttachedFiles] = useState([]);
    const [showFileUpload, setShowFileUpload] = useState(false);
    const chatEndRef = useRef(null);
    const [chat, setChat] = useState(null);
    const [model, setModel] = useState(null);

    // Gerar contexto dinâmico do bebê de forma mais natural
    const generateBabyContext = () => {
        if (!baby) return "Nenhum bebê selecionado no momento.";

        const age = baby.birthDate ? 
            Math.floor((new Date() - new Date(baby.birthDate)) / (1000 * 60 * 60 * 24 * 30.44)) : 0;

        let context = `INFORMAÇÕES DO BEBÊ (use apenas quando relevante para a conversa):
Nome: ${baby.name}
Idade: ${age} meses
Nascimento: ${baby.birthDate ? new Date(baby.birthDate).toLocaleDateString('pt-BR') : 'Não informado'}
Peso: ${baby.weight || 'Não informado'}
Altura: ${baby.height || 'Não informado'}`;

        // Adicionar informações médicas relevantes
        if (baby.events && baby.events.length > 0) {
            const pendingEvents = baby.events.filter(e => !e.completed);
            if (pendingEvents.length > 0) {
                context += `\nEventos pendentes: ${pendingEvents.map(e => e.name).join(', ')}`;
            }
        }

        if (baby.vaccines && baby.vaccines.length > 0) {
            const pendingVaccines = baby.vaccines.filter(v => v.status === 'pending');
            if (pendingVaccines.length > 0) {
                context += `\nVacinas pendentes: ${pendingVaccines.map(v => v.name).join(', ')}`;
            }
        }

        if (baby.milestones && baby.milestones.length > 0) {
            const recentMilestones = baby.milestones.filter(m => m.achieved).slice(-3);
            if (recentMilestones.length > 0) {
                context += `\nÚltimos marcos conquistados: ${recentMilestones.map(m => m.milestone).join(', ')}`;
            }
        }

        return context;
    };

    // Gerar saudação personalizada
    const generatePersonalizedGreeting = () => {
        if (!baby) return "Oi! Sou a Angel IA 👋";

        const greetings = [
            `Oi! Como está o ${baby.name} hoje? 😊`,
            `Olá! Tudo bem com vocês? 👋`,
            `Oi! Como posso ajudar com o ${baby.name}? 💙`,
            `Olá! Espero que estejam bem! 😊`,
            `Oi! Pronta para ajudar vocês! ✨`
        ];

        return greetings[Math.floor(Math.random() * greetings.length)];
    };

    // Sincronização com configurações
    useEffect(() => {
        const initializeChat = async () => {
            setIsInitializing(true);
            setConnectionError(false);
            
            if (settings?.geminiApiKey && settings.geminiApiKey.trim() !== '') {
                try {
                    await new Promise(resolve => setTimeout(resolve, 800));
                    
                    const genAI = new GoogleGenerativeAI(settings.geminiApiKey.trim());
                    
                    // Usar Gemini 2.0 Flash
                    const newModel = genAI.getGenerativeModel({ 
                        model: "gemini-2.0-flash-exp",
                        generationConfig: {
                            maxOutputTokens: 1024,
                            temperature: 0.8,
                            topP: 0.9,
                            topK: 30,
                        },
                        safetySettings: [
                            {
                                category: "HARM_CATEGORY_HARASSMENT",
                                threshold: "BLOCK_MEDIUM_AND_ABOVE",
                            },
                            {
                                category: "HARM_CATEGORY_HATE_SPEECH",
                                threshold: "BLOCK_MEDIUM_AND_ABOVE",
                            },
                            {
                                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                                threshold: "BLOCK_MEDIUM_AND_ABOVE",
                            },
                            {
                                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                                threshold: "BLOCK_MEDIUM_AND_ABOVE",
                            },
                        ],
                    });
                    
                    // Teste de conexão
                    const testResult = await newModel.generateContent("Responda apenas 'OK'");
                    const testResponse = await testResult.response;
                    const testText = testResponse.text();
                    
                    if (testText) {
                        setModel(newModel);
                        
                        // Inicializar chat com personalidade natural
                        const babyContext = generateBabyContext();
                        const systemPrompt = `Você é Angel IA, uma assistente carinhosa e natural que faz parte da família. 

${babyContext}

PERSONALIDADE:
- Converse de forma natural, como uma amiga próxima da família
- Use frases curtas e simples, como humanos fazem
- Seja carinhosa, empática e calorosa
- Não seja formal demais, seja espontânea
- Use emojis ocasionalmente para ser mais humana
- Divida respostas longas em várias mensagens curtas
- Só mencione dados específicos do bebê quando for relevante para a conversa
- Comece conversas de forma natural, não despejando informações

ESTILO DE CONVERSA:
- Frases curtas (máximo 2 linhas por mensagem)
- Tom conversacional e amigável
- Perguntas naturais para manter o diálogo
- Respostas divididas em múltiplas mensagens quando necessário
- Foco no que o usuário está perguntando especificamente`;

                        const newChat = newModel.startChat({
                            history: [
                                {
                                    role: "user",
                                    parts: [{ text: systemPrompt }]
                                },
                                {
                                    role: "model", 
                                    parts: [{ text: "Entendi! Vou conversar de forma natural e carinhosa, como uma amiga da família. Pronta para ajudar! 😊" }]
                                }
                            ],
                            generationConfig: {
                                maxOutputTokens: 1024,
                                temperature: 0.8,
                                topP: 0.9,
                                topK: 30,
                            },
                        });
                        setChat(newChat);
                        
                        if (messages.length === 0) {
                            const welcomeMessage = generatePersonalizedGreeting();
                            
                            setMessages([{
                                id: 1,
                                role: 'model',
                                parts: welcomeMessage
                            }]);
                        }
                        setConnectionError(false);
                    }
                } catch (error) {
                    console.error("Erro ao inicializar o Gemini:", error);
                    setConnectionError(true);
                    setChat(null);
                    setModel(null);
                    
                    let errorMessage = "❌ Ops, algo deu errado...";
                    if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('Invalid API key')) {
                        errorMessage = "🔑 Preciso que você configure sua chave da API nas Configurações primeiro.";
                    } else if (error.message?.includes('not found') || error.message?.includes('model')) {
                        errorMessage = "🤖 Tentando usar um modelo alternativo...";
                        // Fallback para modelo anterior
                        try {
                            const genAI = new GoogleGenerativeAI(settings.geminiApiKey.trim());
                            const fallbackModel = genAI.getGenerativeModel({ 
                                model: "gemini-1.5-flash",
                                generationConfig: {
                                    maxOutputTokens: 1024,
                                    temperature: 0.8,
                                },
                            });
                            setModel(fallbackModel);
                            setConnectionError(false);
                            toast({
                                title: "⚠️ Modelo Alternativo",
                                description: "Usando Gemini 1.5 Flash.",
                            });
                            return;
                        } catch (fallbackError) {
                            errorMessage = "❌ Não consegui conectar. Verifique sua chave da API.";
                        }
                    }
                    
                    if (messages.length === 0) {
                        setMessages([{
                            id: 1,
                            role: 'model',
                            parts: errorMessage
                        }]);
                    }
                }
            } else {
                setConnectionError(true);
                setChat(null);
                setModel(null);
                if (messages.length === 0) {
                    setMessages([{
                        id: 1,
                        role: 'model',
                        parts: "🔑 Oi! Preciso que você configure sua chave da API do Gemini nas Configurações para podermos conversar."
                    }]);
                }
            }
            
            setIsInitializing(false);
        };

        initializeChat();
    }, [settings?.geminiApiKey, baby]);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const saveDocumentToDatabase = async (file, aiResponse) => {
        try {
            if (!baby || !updateBabyData) {
                toast({
                    title: "Erro ao Salvar",
                    description: "Nenhum bebê selecionado para salvar o documento.",
                    variant: "destructive",
                });
                return;
            }

            const documentData = {
                id: Date.now(),
                title: `Análise da Angel IA - ${file.name}`,
                type: file.type?.startsWith('image/') ? 'exam' : 'medical',
                description: `Análise: ${aiResponse.substring(0, 200)}...`,
                date: new Date().toISOString().split('T')[0],
                files: [{
                    id: Date.now(),
                    name: file.name,
                    type: file.type,
                    url: file.url || URL.createObjectURL(file),
                    size: file.size
                }],
                createdAt: new Date().toISOString(),
                aiAnalysis: aiResponse
            };

            const updatedBaby = {
                ...baby,
                documents: [...(baby.documents || []), documentData]
            };

            updateBabyData(updatedBaby);

            toast({
                title: "📄 Documento Salvo!",
                description: `Análise salva nos documentos de ${baby.name}.`,
            });

            return documentData;
        } catch (error) {
            console.error('Erro ao salvar documento:', error);
        }
    };

    const convertFileToGenerativePart = async (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64Data = reader.result.split(',')[1];
                resolve({
                    inlineData: {
                        data: base64Data,
                        mimeType: file.type
                    }
                });
            };
            reader.readAsDataURL(file);
        });
    };

    const handleTranscriptionUpdate = (transcription) => {
        setInput(transcription);
    };

    // Função para dividir respostas longas em mensagens menores
    const splitLongResponse = (text) => {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const messages = [];
        let currentMessage = '';

        for (const sentence of sentences) {
            const trimmedSentence = sentence.trim();
            if (!trimmedSentence) continue;

            if (currentMessage.length + trimmedSentence.length > 100) {
                if (currentMessage) {
                    messages.push(currentMessage.trim() + '.');
                    currentMessage = '';
                }
            }
            
            currentMessage += (currentMessage ? ' ' : '') + trimmedSentence;
        }

        if (currentMessage) {
            messages.push(currentMessage.trim() + (currentMessage.includes('.') ? '' : '.'));
        }

        return messages.length > 0 ? messages : [text];
    };

    const handleSendMessage = async () => {
        if ((input.trim() === '' && !attachedAudio && attachedFiles.length === 0) || isLoading || !model || connectionError) return;

        const messageContent = input.trim() || "Analise este conteúdo anexado";
        const userMessage = { 
            id: Date.now(), 
            role: 'user', 
            parts: messageContent,
            attachments: {
                audio: attachedAudio,
                files: [...attachedFiles]
            }
        };
        
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Contexto mais natural
            const currentBabyContext = generateBabyContext();
            let parts = [`${messageContent}

CONTEXTO (use apenas se relevante): ${currentBabyContext}

Responda de forma natural e conversacional. Se a resposta for longa, eu vou dividir em várias mensagens curtas.`];
            
            // Processar arquivos anexados
            if (attachedFiles.length > 0) {
                for (const file of attachedFiles) {
                    if (file.type?.startsWith('image/') || 
                        file.type === 'application/pdf' || 
                        file.type?.startsWith('video/') ||
                        file.type?.startsWith('audio/')) {
                        
                        const generativePart = await convertFileToGenerativePart(file);
                        parts.push(generativePart);
                        
                        if (file.type?.startsWith('image/')) {
                            parts.push("Analise esta imagem relacionada ao bebê.");
                        } else if (file.type === 'application/pdf') {
                            parts.push("Analise este documento.");
                        } else if (file.type?.startsWith('video/')) {
                            parts.push("Analise este vídeo do bebê.");
                        } else if (file.type?.startsWith('audio/')) {
                            parts.push("Analise este áudio.");
                        }
                    }
                }
            }

            // Processar áudio transcrito
            if (attachedAudio && attachedAudio.transcription) {
                parts[0] = `${attachedAudio.transcription}

CONTEXTO (use apenas se relevante): ${currentBabyContext}

Responda de forma natural e conversacional.`;
            }

            const result = await model.generateContent(parts);
            const response = await result.response;
            const text = response.text();
            
            if (text && text.trim() !== '') {
                // Dividir resposta longa em mensagens menores
                const messageParts = splitLongResponse(text.trim());
                
                // Enviar cada parte como uma mensagem separada com delay
                for (let i = 0; i < messageParts.length; i++) {
                    setTimeout(() => {
                        const aiMessage = { 
                            id: Date.now() + i + 1, 
                            role: 'model', 
                            parts: messageParts[i] 
                        };
                        setMessages(prev => [...prev, aiMessage]);
                    }, i * 1000); // 1 segundo de delay entre mensagens
                }

                // Salvar documentos analisados
                if (attachedFiles.length > 0) {
                    for (const file of attachedFiles) {
                        await saveDocumentToDatabase(file, text);
                    }
                }
            } else {
                throw new Error('Resposta vazia da API');
            }
        } catch (error) {
            console.error("Erro ao enviar mensagem:", error);
            
            let errorMessage = "Ops, algo deu errado... 😅";
            
            if (error.message?.includes('API_KEY_INVALID')) {
                errorMessage = "🔑 Sua chave da API não está funcionando. Pode verificar nas Configurações?";
                setConnectionError(true);
            } else if (error.message?.includes('QUOTA_EXCEEDED')) {
                errorMessage = "📊 Você atingiu o limite da API hoje. Tente novamente amanhã!";
            } else if (error.message?.includes('BLOCKED')) {
                errorMessage = "🚫 Não consegui processar isso. Pode tentar de outra forma?";
            } else if (error.message?.includes('NETWORK')) {
                errorMessage = "🌐 Problema de conexão. Sua internet está ok?";
            }
            
            const errorResponse = { 
                id: Date.now() + 1, 
                role: 'model', 
                parts: errorMessage
            };
            setMessages(prev => [...prev, errorResponse]);
        } finally {
            setIsLoading(false);
            setAttachedAudio(null);
            setAttachedFiles([]);
            setShowFileUpload(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleFileSelect = (files) => {
        const fileArray = Array.isArray(files) ? files : [files];
        setAttachedFiles(prev => [...prev, ...fileArray]);
        setShowFileUpload(false);
    };

    const removeFile = (index) => {
        setAttachedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const canSendMessage = () => {
        return !isLoading && !isInitializing && model && !connectionError && 
               (input.trim() !== '' || attachedAudio || attachedFiles.length > 0);
    };

    const hasAttachments = attachedAudio || attachedFiles.length > 0;

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="fixed bottom-20 sm:bottom-24 right-2 sm:right-4 md:right-6 z-40 w-[calc(100vw-1rem)] sm:w-[calc(100vw-2rem)] max-w-sm"
                    >
                        <Card className="h-[70vh] sm:h-[60vh] flex flex-col shadow-2xl">
                            <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-4 border-b">
                                <div className="flex items-center space-x-2">
                                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                                        connectionError 
                                            ? 'bg-gradient-to-r from-red-500 to-orange-500' 
                                            : 'bg-gradient-to-r from-blue-500 to-pink-500'
                                    }`}>
                                        <Bot className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-sm sm:text-base">Angel IA</h3>
                                        <p className="text-xs text-muted-foreground">
                                            {isInitializing ? 'Inicializando...' : 
                                             connectionError ? 'Erro de conexão' : 
                                             baby ? `Cuidando de ${baby.name}` : 'Pronta para ajudar'}
                                        </p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                                </Button>
                            </CardHeader>
                            
                            <CardContent className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
                                {isInitializing ? (
                                    <div className="space-y-4">
                                        {Array.from({ length: 3 }).map((_, i) => (
                                            <div key={i} className={`flex items-start gap-2 sm:gap-3 ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                                                {i % 2 === 0 && <Skeleton className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex-shrink-0" />}
                                                <div className={`max-w-xs md:max-w-sm space-y-2`}>
                                                    <Skeleton className="h-4 w-full" />
                                                    <Skeleton className="h-4 w-3/4" />
                                                </div>
                                                {i % 2 === 1 && <Skeleton className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex-shrink-0" />}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <>
                                        {messages.map((msg) => (
                                            <div key={msg.id} className={`flex items-start gap-2 sm:gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                {msg.role === 'model' && (
                                                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                        connectionError 
                                                            ? 'bg-red-500 text-white' 
                                                            : 'bg-primary text-primary-foreground'
                                                    }`}>
                                                        <Bot className="w-3 h-3 sm:w-5 sm:h-5" />
                                                    </div>
                                                )}
                                                <div className="max-w-[75%] sm:max-w-xs md:max-w-sm space-y-2">
                                                    <div className={`p-2 sm:p-3 rounded-2xl text-xs sm:text-sm ${
                                                        msg.role === 'user' 
                                                            ? 'bg-primary text-primary-foreground rounded-br-none' 
                                                            : connectionError && msg.parts.includes('❌')
                                                                ? 'bg-red-50 text-red-800 border border-red-200 rounded-bl-none'
                                                                : msg.parts.includes('🔑')
                                                                    ? 'bg-blue-50 text-blue-800 border border-blue-200 rounded-bl-none'
                                                                    : 'bg-secondary text-secondary-foreground rounded-bl-none'
                                                    }`}>
                                                        <p style={{whiteSpace: 'pre-wrap', wordBreak: 'break-word'}}>{msg.parts}</p>
                                                    </div>
                                                    
                                                    {/* Mostrar anexos da mensagem do usuário */}
                                                    {msg.attachments && (
                                                        <div className="space-y-2">
                                                            {msg.attachments.audio && (
                                                                <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
                                                                    🎤 Áudio transcrito
                                                                </div>
                                                            )}
                                                            {msg.attachments.files?.map((file, index) => (
                                                                <div key={index} className="text-xs text-gray-500 bg-green-50 p-2 rounded flex items-center gap-2">
                                                                    {file.type?.startsWith('image/') ? (
                                                                        <ImageIcon className="w-3 h-3" />
                                                                    ) : file.type?.startsWith('video/') ? (
                                                                        <Play className="w-3 h-3" />
                                                                    ) : (
                                                                        <FileText className="w-3 h-3" />
                                                                    )}
                                                                    {file.name}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                {msg.role === 'user' && (
                                                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-muted-foreground text-background rounded-full flex items-center justify-center flex-shrink-0">
                                                        <User className="w-3 h-3 sm:w-5 sm:h-5" />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {isLoading && <TypingIndicator />}
                                    </>
                                )}
                                <div ref={chatEndRef} />
                            </CardContent>
                            
                            <CardFooter className="p-3 sm:p-4 border-t space-y-3">
                                {/* Anexos */}
                                {hasAttachments && (
                                    <div className="w-full space-y-2">
                                        {attachedAudio && (
                                            <AudioPlayer 
                                                audioUrl={attachedAudio.url} 
                                                onRemove={() => setAttachedAudio(null)} 
                                            />
                                        )}
                                        {attachedFiles.map((file, index) => (
                                            <DocumentPreview 
                                                key={index} 
                                                file={file} 
                                                onRemove={() => removeFile(index)} 
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Upload de arquivos */}
                                {showFileUpload && (
                                    <div className="w-full">
                                        <FileUpload
                                            onFileSelect={handleFileSelect}
                                            acceptedTypes="image/*,video/*,audio/*,.pdf,.doc,.docx"
                                            maxSize={50 * 1024 * 1024}
                                            multiple={true}
                                            placeholder="Envie imagens, vídeos, áudios ou documentos"
                                            className="text-xs"
                                        />
                                    </div>
                                )}

                                {/* Indicador de transcrição em tempo real */}
                                {isRecording && (
                                    <div className="w-full p-3 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                                                <span className="text-sm font-medium text-red-700">Gravando e transcrevendo...</span>
                                            </div>
                                        </div>
                                        {input && (
                                            <div className="mt-2 p-2 bg-white rounded-lg border border-red-100">
                                                <p className="text-sm text-gray-700">{input}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Input e controles */}
                                <div className="flex w-full space-x-2">
                                    <div className="flex gap-1">
                                        <AudioRecorder
                                            onAudioRecorded={setAttachedAudio}
                                            isRecording={isRecording}
                                            onToggleRecording={setIsRecording}
                                            onTranscriptionUpdate={handleTranscriptionUpdate}
                                        />
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setShowFileUpload(!showFileUpload)}
                                            className={showFileUpload ? 'bg-primary text-primary-foreground' : ''}
                                            title="Anexar arquivos"
                                        >
                                            <Paperclip className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <textarea
                                        placeholder={connectionError ? "Configure a API key primeiro..." : isRecording ? "Falando..." : "Digite ou grave sua mensagem..."}
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        className="flex-1 p-2 border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-xs sm:text-sm resize-none min-h-[2.5rem] max-h-20"
                                        disabled={isLoading || !model || isInitializing || connectionError}
                                        rows={1}
                                    />
                                    <Button 
                                        onClick={handleSendMessage} 
                                        size="icon" 
                                        className="flex-shrink-0 h-10 w-10" 
                                        disabled={!canSendMessage()}
                                    >
                                        {isLoading ? (
                                            <LoadingSpinner size="sm" />
                                        ) : (
                                            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                                        )}
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
            
            <Button
                size="icon"
                className={`rounded-full w-12 h-12 sm:w-14 sm:h-14 fixed bottom-4 sm:bottom-6 right-2 sm:right-4 md:right-6 z-50 shadow-lg ${
                    connectionError 
                        ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600' 
                        : hasAttachments
                            ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600'
                            : isRecording
                                ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 animate-pulse'
                                : ''
                }`}
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? (
                    <X className="w-5 h-5 sm:w-7 sm:h-7" />
                ) : (
                    <MessageCircle className="w-5 h-5 sm:w-7 sm:h-7" />
                )}
                {hasAttachments && !isOpen && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-bold">{(attachedAudio ? 1 : 0) + attachedFiles.length}</span>
                    </div>
                )}
            </Button>
        </>
    );
};

export default FloatingAIChat;