
import React from 'react';
import { motion } from 'framer-motion';
import { Plus, CheckCircle, Clock, Syringe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const VaccinesContent = ({ baby, updateBabyData }) => {

    const handleAddVaccine = () => {
        const newVaccine = {
            id: Date.now(),
            name: `Nova Vacina ${baby.vaccines.length + 1}`,
            date: new Date().toISOString().split('T')[0],
            status: 'pending'
        };
        const updatedBaby = { ...baby, vaccines: [...baby.vaccines, newVaccine] };
        updateBabyData(updatedBaby);
        toast({
            title: "Vacina Adicionada",
            description: "Uma nova vacina pendente foi adicionada à lista."
        });
    };

    return (
        <div className="space-y-6">
          <motion.div 
            className="medical-card rounded-2xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <Syringe className="w-8 h-8 mr-3 text-blue-600" />
                    <h2 className="text-2xl font-bold gradient-text">Caderneta de Vacinas 3.0</h2>
                </div>
              <Button onClick={handleAddVaccine}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Vacina
              </Button>
            </div>
            
            <div className="space-y-4">
              {baby.vaccines?.map((vaccine, index) => (
                <motion.div 
                  key={vaccine.id || index}
                  className={`p-4 rounded-xl border-2 ${
                    vaccine.status === 'completed' 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-yellow-50 border-yellow-200'
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {vaccine.status === 'completed' ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <Clock className="w-6 h-6 text-yellow-600" />
                      )}
                      <div>
                        <h3 className="font-semibold">{vaccine.name}</h3>
                        <p className="text-sm text-gray-600">
                          {vaccine.status === 'completed' ? 'Aplicada em' : 'Agendada para'} {vaccine.date}
                        </p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => toast({ title: "Funcionalidade em breve!" })}
                    >
                      Detalhes
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      );
};

export default VaccinesContent;