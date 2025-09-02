import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useAppContext } from '@/App';

const SettingsContent = () => {
    const { settings, updateSettings } = useAppContext();
    const [localSettings, setLocalSettings] = useState(settings);
    const { toast } = useToast();

    const handleSave = () => {
        updateSettings(localSettings);
        toast({
            title: "Configurações salvas!",
            description: "Suas preferências foram atualizadas com sucesso.",
        });
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Configurações</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Aparência</CardTitle>
                    <CardDescription>Personalize a aparência do aplicativo.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="theme">Tema</Label>
                        <Select
                            value={localSettings.theme}
                            onValueChange={(value) => setLocalSettings({ ...localSettings, theme: value })}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Selecione o tema" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="light">Claro</SelectItem>
                                <SelectItem value="dark">Escuro</SelectItem>
                                <SelectItem value="system">Sistema</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Angel IA (Gemini)</CardTitle>
                    <CardDescription>Configure a integração com a API do Google Gemini.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="gemini-api-key">Chave da API do Google Gemini</Label>
                        <Input 
                            id="gemini-api-key"
                            type="password"
                            placeholder="Cole sua chave da API aqui"
                            value={localSettings.geminiApiKey}
                            onChange={(e) => setLocalSettings({ ...localSettings, geminiApiKey: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">
                            Sua chave é armazenada localmente no seu navegador e não é enviada para nossos servidores.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Notificações</CardTitle>
                    <CardDescription>Gerencie suas preferências de notificação.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="push-notifications">Notificações Push</Label>
                        <Switch id="push-notifications" defaultChecked />
                    </div>
                     <div className="flex items-center justify-between">
                        <Label htmlFor="email-notifications">Notificações por E-mail</Label>
                        <Switch id="email-notifications" />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={handleSave}>Salvar Alterações</Button>
            </div>
        </div>
    );
};

export default SettingsContent;