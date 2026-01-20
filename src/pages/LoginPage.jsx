import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Pill, Sparkles, LogIn } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const LoginPage = ({ onSwitchToSignup }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { signIn } = useAuth();
    const { toast } = useToast();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await signIn(email, password);
            toast({ title: "Bem-vindo de volta!", description: "Login realizado com sucesso." });
        } catch (error) {
            toast({ title: "Erro no login", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDemoLogin = async () => {
        setIsLoading(true);
        try {
            // Demo account credentials
            await signIn('demo@babyapp.com', 'demo123456');
            toast({ title: "Modo Demo", description: "Bem-vindo ao modo demonstração!" });
        } catch (error) {
            toast({
                title: "Demo não disponível",
                description: "Crie uma conta para começar a usar o app.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <div className="flex justify-center mb-8">
                    <div className="flex items-center gap-2">
                        <div className="p-3 bg-white rounded-2xl shadow-xl">
                            <Pill className="w-8 h-8 text-blue-600" />
                        </div>
                        <h1 className="text-3xl font-bold gradient-text">Baby IAgencia</h1>
                    </div>
                </div>

                <Card className="glass-card border-white/20 shadow-2xl overflow-hidden">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold flex items-center gap-2">
                            Login <LogIn className="w-5 h-5" />
                        </CardTitle>
                        <CardDescription>
                            Entre para cuidar do seu bebê com IA
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">E-mail</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="bg-white/50 border-blue-100 focus:border-blue-300"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Senha</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="bg-white/50 border-blue-100 focus:border-blue-300"
                                />
                            </div>
                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-11" disabled={isLoading}>
                                {isLoading ? "Entrando..." : "Entrar"}
                            </Button>
                        </form>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-transparent px-2 text-gray-500">Ou use o acesso teste</span>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 h-11"
                            onClick={handleDemoLogin}
                            disabled={isLoading}
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Entrar como Demo
                        </Button>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <p className="text-sm text-center text-gray-500">
                            Não tem uma conta?{' '}
                            <button
                                onClick={onSwitchToSignup}
                                className="text-blue-600 font-semibold hover:underline"
                            >
                                Criar conta
                            </button>
                        </p>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
};

export default LoginPage;
