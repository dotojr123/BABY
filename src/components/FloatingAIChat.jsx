import React, { useState, useRef, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAppContext } from '@/App';
import { GoogleGenerativeAI } from '@google/generative-ai';

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

const ChatSkeleton = () => (
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
);

const FloatingAIChat = () => {
    const { settings } = useAppContext();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);
    const chatEndRef = useRef(null);
    const [chat, setChat] = useState(null);

    useEffect(() => {
        const initializeChat = async () => {
            setIsInitializing(true);
            
            if (settings.geminiApiKey) {
                try {
                    // Simulate initialization delay
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    const genAI = new GoogleGenerativeAI(settings.geminiApiKey);
                    const model = genAI.getGenerativeModel({ model: "gemini-pro"});
                    const newChat = model.startChat({
                        history: [],
                        generationConfig: {
                            maxOutputTokens: 500,
                        },
                    });
                    setChat(newChat);
                    
                    if (messages.length === 0) {
                        setMessages([{
                            id: 1,
                            role: 'model',
                            parts: "Olá! Sou a Angel IA. Como posso ajudar com o desenvolvimento, saúde ou rotina do seu bebê hoje?"
                        }]);
                    }
                } catch (error) {
                    console.error("Erro ao inicializar o Gemini:", error);
                    if (messages.length === 0) {
                        setMessages([{
                            id: 1,
                            role: 'model',
                            parts: "A chave da API Gemini parece inválida ou está faltando. Por favor, verifique em Configurações."
                        }]);
                    }
                }
            } else if (messages.length === 0) {
                setMessages([{
                    id: 1,
                    role: 'model',
                    parts: "Olá! Para começar, por favor, insira sua chave da API do Google Gemini na página de Configurações."
                }]);
            }
            
            setIsInitializing(false);
        };

        initializeChat();
    }, [settings.geminiApiKey]);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async () => {
        if (input.trim() === '' || isLoading || !chat) return;

        const userMessage = { id: Date.now(), role: 'user', parts: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const result = await chat.sendMessage(input);
            const response = await result.response;
            const text = response.text();
            const aiMessage = { id: Date.now() + 1, role: 'model', parts: text };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error("Erro ao enviar mensagem para o Gemini:", error);
            const errorMessage = { 
                id: Date.now() + 1, 
                role: 'model', 
                parts: "Desculpe, ocorreu um erro ao processar sua solicitação. Verifique sua conexão e tente novamente." 
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

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
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-pink-500 rounded-full flex items-center justify-center">
                                        <Bot className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-sm sm:text-base">Angel IA</h3>
                                        <p className="text-xs text-muted-foreground">
                                            {isInitializing ? 'Inicializando...' : 'Online'}
                                        </p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                                </Button>
                            </CardHeader>
                            
                            <CardContent className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
                                {isInitializing ? (
                                    <ChatSkeleton />
                                ) : (
                                    <>
                                        {messages.map((msg) => (
                                            <div key={msg.id} className={`flex items-start gap-2 sm:gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                {msg.role === 'model' && (
                                                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0">
                                                        <Bot className="w-3 h-3 sm:w-5 sm:h-5" />
                                                    </div>
                                                )}
                                                <div className={`max-w-[75%] sm:max-w-xs md:max-w-sm p-2 sm:p-3 rounded-2xl text-xs sm:text-sm ${
                                                    msg.role === 'user' 
                                                        ? 'bg-primary text-primary-foreground rounded-br-none' 
                                                        : 'bg-secondary text-secondary-foreground rounded-bl-none'
                                                }`}>
                                                   <p style={{whiteSpace: 'pre-wrap', wordBreak: 'break-word'}}>{msg.parts}</p>
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
                            
                            <CardFooter className="p-3 sm:p-4 border-t">
                                <div className="flex w-full space-x-2">
                                    <textarea
                                        placeholder="Digite sua pergunta..."
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        className="flex-1 p-2 border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-xs sm:text-sm resize-none min-h-[2.5rem] max-h-20"
                                        disabled={isLoading || !chat || isInitializing}
                                        rows={1}
                                    />
                                    <Button 
                                        onClick={handleSendMessage} 
                                        size="icon" 
                                        className="flex-shrink-0 h-10 w-10" 
                                        disabled={isLoading || !chat || isInitializing || !input.trim()}
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
                className="rounded-full w-12 h-12 sm:w-14 sm:h-14 fixed bottom-4 sm:bottom-6 right-2 sm:right-4 md:right-6 z-50 shadow-lg"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? (
                    <X className="w-5 h-5 sm:w-7 sm:h-7" />
                ) : (
                    <MessageCircle className="w-5 h-5 sm:w-7 sm:h-7" />
                )}
            </Button>
        </>
    );
};

export default FloatingAIChat;