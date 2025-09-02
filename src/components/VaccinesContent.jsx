import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, CheckCircle, Clock, Syringe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import LoadingSpinner from '@/components/LoadingSpinner';

const VaccinesContent = ({ baby, updateBabyData }) => {
    const [showForm, setShowForm] = useState(false);
    const [newVaccine, setNewVaccine] = useState({ name: '', date: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddVaccine = async () => {
        if (!newVaccine.name || !newVaccine.date) {
            toast({
                title: "Erro",
                description: "Por favor, preencha o nome e a data da vacina.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 800));

            const vaccineToAdd = {
                id: Date.now(),
                name: newVaccine.name,
                date: newVaccine.date,
                status: 'pending'
            };

            const updatedBaby = { 
                ...baby, 
                vaccines: [...(baby.vaccines || []), vaccineToAdd] 
            };

            updateBabyData(updatedBaby);
            toast({
                title: "Vacina Adicionada",
                description: `${newVaccine.name} foi adicionada à lista.`
            });
            setNewVaccine({ name: '', date: '' });
            setShowForm(false);
        } catch (error) {
            toast({
                title: "Erro",
                description: "Não foi possível adicionar a vacina. Tente novamente.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleVaccineStatus = (vaccineId) => {
        const updatedVaccines = (baby.vaccines || []).map(vaccine =>
            vaccine.id === vaccineId 
                ? { ...vaccine, status: vaccine.status === 'completed' ? 'pending' : 'completed' }
                : vaccine
        );
        const updatedBaby = { ...baby, vaccines: updatedVaccines };
        updateBabyData(updatedBaby);
    };

    const vaccines = baby.vaccines || [];

    return (
        <div className="space-y-4 sm:space-y-6">
          <motion.div 
            className="medical-card rounded-2xl p-4 sm:p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center">
                    <Syringe className="w-6 h-6 sm:w-8 sm:h-8 mr-3 text-blue-600" />
                    <h2 className="text-xl sm:text-2xl font-bold gradient-text">Caderneta de Vacinas 3.0</h2>
                </div>
              <Button 
                onClick={() => setShowForm(!showForm)}
                className="w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                {showForm ? 'Cancelar' : 'Nova Vacina'}
              </Button>
            </div>

            {showForm && (
                <motion.div 
                    className="mb-6 p-4 bg-white rounded-lg shadow-sm border" 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }}
                >
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <Label htmlFor="vaccineName">Nome da Vacina</Label>
                            <Input 
                                id="vaccineName"
                                type="text" 
                                placeholder="Ex: Pentavalente" 
                                value={newVaccine.name} 
                                onChange={e => setNewVaccine({ ...newVaccine, name: e.target.value })} 
                                className="mt-1"
                                disabled={isSubmitting}
                            />
                        </div>
                        <div>
                            <Label htmlFor="vaccineDate">Data</Label>
                            <Input 
                                id="vaccineDate"
                                type="date" 
                                value={newVaccine.date} 
                                onChange={e => setNewVaccine({ ...newVaccine, date: e.target.value })} 
                                className="mt-1"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>
                    <Button 
                        onClick={handleAddVaccine} 
                        className="mt-4 w-full sm:w-auto"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <div className="flex items-center gap-2">
                                <LoadingSpinner size="sm" />
                                <span>Salvando...</span>
                            </div>
                        ) : (
                            'Salvar'
                        )}
                    </Button>
                </motion.div>
            )}
            
            <div className="space-y-3 sm:space-y-4">
              {vaccines.length > 0 ? vaccines.map((vaccine, index) => (
                <motion.div 
                  key={vaccine.id || index}
                  className={`p-3 sm:p-4 rounded-xl border-2 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 ${
                    vaccine.status === 'completed' 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-yellow-50 border-yellow-200'
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => toggleVaccineStatus(vaccine.id)} 
                        className="flex-shrink-0 mt-1 sm:mt-0"
                    >
                        {vaccine.status === 'completed' ? (
                            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                        ) : (
                            <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
                        )}
                    </Button>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base">{vaccine.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {vaccine.status === 'completed' ? 'Aplicada em' : 'Agendada para'} {vaccine.date}
                      </p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => toast({ title: "Funcionalidade em breve!" })}
                    className="w-full sm:w-auto"
                  >
                    Detalhes
                  </Button>
                </motion.div>
              )) : (
                <div className="text-center py-12">
                    <Syringe className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 text-sm sm:text-base">Nenhuma vacina registrada ainda.</p>
                    <p className="text-gray-400 text-xs sm:text-sm mt-1">Clique em "Nova Vacina" para começar</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      );
};

export default VaccinesContent;