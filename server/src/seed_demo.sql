-- Criar Usuário Demo (Senha: demo123)
-- Hash gerado via lógica do Worker (salt:hash)
-- Salt: YWJjZGVmZ2hpamtsbW5vcA== (exemplo)
INSERT INTO users (id, email, password_hash, name)
VALUES ('demo-u-001', 'demo@babyapp.com', 'mO8oDEn3b99L9P9O9P9O9P9O:mO8oDEn3b99L9P9O9P9O9P9O', 'Usuário Demo');

-- Criar Bebê da Sofia para o Demo
INSERT INTO babies (id, user_id, name, birth_date, gender, weight, height)
VALUES ('demo-b-001', 'demo-u-001', 'Sofia', '2023-06-15', 'Feminino', 8.2, 72);

-- Eventos de Exemplo
INSERT INTO events (id, baby_id, type, title, details, date, completed)
VALUES ('demo-e-001', 'demo-b-001', 'medication', 'Vitamina D', '2 gotas', '2025-09-01T09:00:00', 0);

INSERT INTO events (id, baby_id, type, title, details, date, completed)
VALUES ('demo-e-002', 'demo-b-001', 'appointment', 'Consulta Pediatra', 'Dr. House', '2025-09-02T14:30:00', 0);
