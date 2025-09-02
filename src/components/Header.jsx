import React from 'react';
import { Baby, Bell, User, Menu, Settings, LogOut, UserCircle, MessageSquare as MessageSquareWarning } from 'lucide-react';
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

const Header = ({ setSidebarOpen, setActiveTab }) => {
    const handleFeatureClick = (feature) => {
        toast({
          title: "🚧 Funcionalidade em desenvolvimento",
          description: `A funcionalidade de ${feature} ainda não foi implementada.`,
          duration: 3000,
        });
    };

    return (
        <header className="bg-card border-b sticky top-0 z-20">
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden mr-2"
                >
                  <Menu className="w-6 h-6" />
                </Button>
                <div className="hidden lg:flex items-center space-x-2">
                  {/* O logo é mostrado na sidebar em telas grandes */}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Bell className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80" align="end">
                    <DropdownMenuLabel>Notificações</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <MessageSquareWarning className="mr-2 h-4 w-4 text-yellow-500" />
                      <span>Vacina Pentavalente em 2 dias.</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <MessageSquareWarning className="mr-2 h-4 w-4 text-blue-500" />
                      <span>Consulta com Dr. House amanhã.</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={() => handleFeatureClick('Meu Perfil')}>
                        <UserCircle className="mr-2 h-4 w-4" />
                        <span>Meu Perfil</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setActiveTab('settings')}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Configurações</span>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleFeatureClick('Sair')}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sair</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>
    );
};

export default Header;