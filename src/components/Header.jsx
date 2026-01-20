import React from 'react';
import { Baby, Bell, User, Menu, Settings, LogOut, UserCircle, MessageSquare as MessageSquareWarning, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Header = ({ setSidebarOpen, setActiveTab, baby }) => {
  const { logout, user } = useAuth();
  const handleFeatureClick = (feature) => {
    toast({
      title: "🚧 Funcionalidade em desenvolvimento",
      description: `A funcionalidade de ${feature} ainda não foi implementada.`,
      duration: 3000,
    });
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Até logo!",
      description: "Você saiu com sucesso.",
    });
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-20 shadow-sm">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden mr-2 hover:bg-blue-50 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </Button>

            {/* Mobile logo */}
            <div className="lg:hidden flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-pink-500 rounded-lg flex items-center justify-center mr-2">
                <Baby className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-bold gradient-text flex items-center">
                Baby IAgencia
                <Sparkles className="w-4 h-4 ml-1 text-yellow-500" />
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-blue-50 transition-colors">
                  <Bell className="w-5 h-5" />
                  {/* Notification badge */}
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-red-400 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">2</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 rounded-2xl shadow-xl border-0 bg-white/95 backdrop-blur-md" align="end">
                <DropdownMenuLabel className="text-center py-3 border-b border-gray-100">
                  <div className="flex items-center justify-center gap-2">
                    <Bell className="w-4 h-4 text-blue-500" />
                    <span className="font-semibold">Notificações</span>
                  </div>
                </DropdownMenuLabel>
                <div className="p-2">
                  <DropdownMenuItem className="p-3 rounded-xl hover:bg-blue-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="font-medium text-sm">Vacina Pentavalente</p>
                        <p className="text-xs text-gray-600">Agendada para amanhã às 14:00</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="p-3 rounded-xl hover:bg-blue-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="font-medium text-sm">Consulta Pediatra</p>
                        <p className="text-xs text-gray-600">Dr. House - Hoje às 16:30</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-blue-50 transition-colors w-10 h-10 rounded-full p-0">
                  <Avatar className="w-8 h-8 border border-white shadow-sm">
                    <AvatarImage src={baby?.photo} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-400 to-purple-500 text-white">
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 rounded-2xl shadow-xl border-0 bg-white/95 backdrop-blur-md" align="end">
                <DropdownMenuLabel className="text-center py-3 border-b border-gray-100">
                  <div className="flex flex-col items-center gap-2">
                    <Avatar className="w-12 h-12 border-2 border-white shadow-md">
                      <AvatarImage src={baby?.photo} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-400 to-purple-500 text-white text-lg">
                        {user?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{user?.name || 'Usuário'}</p>
                      <p className="text-xs text-gray-500">Conta Premium</p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <div className="p-2">
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onClick={() => handleFeatureClick('Meu Perfil')}
                      className="rounded-xl hover:bg-blue-50 transition-colors"
                    >
                      <UserCircle className="mr-2 h-4 w-4 text-blue-500" />
                      <span>Meu Perfil</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setActiveTab('settings')}
                      className="rounded-xl hover:bg-blue-50 transition-colors"
                    >
                      <Settings className="mr-2 h-4 w-4 text-gray-500" />
                      <span>Configurações</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="rounded-xl hover:bg-red-50 text-red-600 transition-colors"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
