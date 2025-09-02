import React, { useState, useRef, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { useAppContext } from '@/App';
import { GoogleGenerativeAI } from '@google/generative-ai';

const FloatingAIChat = () => {
    const { settings } = useAppContext();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef(null);
    const [chat, setChat] = useState(null);

    useEffect(() => {
        if (settings.geminiApiKey) {
            try {
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
            const errorMessage = { id: Date.now() + 1, role: 'model', parts: "Desculpe, ocorreu um erro ao processar sua solicitação." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
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
                        className="fixed bottom-24 right-4 sm:right-6 z-40"
                    >
                        <Card className="w-[calc(100vw-2rem)] max-w-sm h-[60vh] flex flex-col shadow-2xl">
                            <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
                                <div className="flex items-center space-x-2">
                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-pink-500 rounded-full flex items-center justify-center">
                                        <Bot className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Angel IA</h3>
                                        <p className="text-xs text-muted-foreground">Online</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                                    <X className="w-5 h-5" />
                                </Button>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messages.map((msg) => (
                                    <div key={msg.id} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        {msg.role === 'model' && <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0"><Bot className="w-5 h-5" /></div>}
                                        <div className={`max-w-xs md:max-w-sm p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-secondary text-secondary-foreground rounded-bl-none'}`}>
                                           <p style={{whiteSpace: 'pre-wrap'}}>{msg.parts}</p>
                                        </div>
                                         {msg.role === 'user' && <div className="w-8 h-8 bg-muted-foreground text-background rounded-full flex items-center justify-center flex-shrink-0"><User className="w-5 h-5" /></div>}
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="p-3 rounded-2xl bg-secondary text-secondary-foreground rounded-bl-none">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                                                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                                                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </CardContent>
                            <CardFooter className="p-4 border-t">
                                <div className="flex w-full space-x-2">
                                    <input
                                        type="text"
                                        placeholder="Digite sua pergunta..."
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                        className="flex-1 p-2 border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                                        disabled={isLoading || !chat}
                                    />
                                    <Button onClick={handleSendMessage} size="icon" className="flex-shrink-0" disabled={isLoading || !chat}>
                                        <Send className="w-5 h-5" />
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
            <Button
                size="icon"
                className="rounded-full w-14 h-14 fixed bottom-6 right-4 sm:right-6 z-50 shadow-lg"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X className="w-7 h-7" /> : <MessageCircle className="w-7 h-7" />}
            </Button>
        </>
    );
};

export default FloatingAIChat;