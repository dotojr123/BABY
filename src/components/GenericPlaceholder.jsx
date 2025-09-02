
import React from 'react';
import { motion } from 'framer-motion';
import { Baby, Pill, TrendingUp, Camera, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const iconMap = {
    Pill: Pill,
    TrendingUp: TrendingUp,
    Camera: Camera,
    Users: Users,
    Default: Baby,
};

const GenericPlaceholder = ({ title = "Funcionalidade em Desenvolvimento", icon = "Default" }) => {
    const IconComponent = iconMap[icon] || iconMap.Default;

    const handleRequestFeature = () => {
        toast({
            title: "Obrigado pelo seu feedback!",
            description: "Anotamos seu interesse nesta funcionalidade. Fique de olho nas próximas atualizações! 🚀",
        });
    };
    
    return (
        <motion.div 
            className="medical-card rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[400px]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <IconComponent className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-gray-600 mb-4 max-w-md">
                Esta seção está sendo desenvolvida com muito carinho para oferecer a melhor experiência no cuidado infantil.
            </p>
            <Button onClick={handleRequestFeature}>
                Solicitar Funcionalidade
            </Button>
        </motion.div>
    );
};

export default GenericPlaceholder;