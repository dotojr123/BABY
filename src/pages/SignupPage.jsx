import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Pill, UserPlus, ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const SignupPage = ({ onSwitchToLogin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { signUp } = useAuth();
    const { toast } = useToast();

    const handleSignup = async (e) => {
        e.preventDefault();

        if (password.length < 6) {
            toast({
                title: "Senha muito curta",
                description: "A senha deve ter pelo menos 6 caracteres.",
                variant: "destructive"
            });
            return;
        }

        setIsLoading(true);
        try {
            await signUp(email, password, name);
            toast({
                title: "Conta criada!",
                description: "Verifique seu e-mail para confirmar o cadastro."
            });
            onSwitchToLogin();
        } catch (error) {
            toast({ title: "Erro ao criar conta", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-full max-w-md"
            >
                <div className="flex justify-center mb-8">
                    <div className="flex items-center gap-2">
                        <div className="p-3 bg-white rounded-2xl shadow-xl">
                            <Pill className="w-8 h-8 text-indigo-600" />
                        </div>
                        <h1 className="text-3xl font-bold gradient-text">Criar Conta</h1>
                    </div>
                </div>

                <Card className="glass-card border-white/20 shadow-2xl">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold flex items-center gap-2">
                            Cadastro <UserPlus className="w-5 h-5" />
                        </CardTitle>
                        <CardDescription>
                            Comece sua jornada de cuidado agora
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={handleSignup} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome Completo</Label>
                                <Input
                                    id="name"
                                    placeholder="Ex: Maria Silva"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="bg-white/50 border-indigo-100 focus:border-indigo-300"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">E-mail</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="bg-white/50 border-indigo-100 focus:border-indigo-300"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Senha</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Mínimo 6 caracteres"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="bg-white/50 border-indigo-100 focus:border-indigo-300"
                                />
                            </div>
                            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 h-11" disabled={isLoading}>
                                {isLoading ? "Criando..." : "Criar Minha Conta"}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter>
                        <button
                            onClick={onSwitchToLogin}
                            className="flex items-center gap-2 text-sm text-indigo-600 font-semibold hover:underline"
                        >
                            <ArrowLeft className="w-4 h-4" /> Voltar para o Login
                        </button>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
};

export default SignupPage;
