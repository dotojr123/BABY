-- Reset do Banco de Dados para Nova Arquitetura Multi-Usuário
-- ATENÇÃO: Isso apagará os dados de teste locais e recriará a estrutura correta.

DROP INDEX IF EXISTS idx_events_baby_date;
DROP INDEX IF EXISTS idx_documents_baby;
DROP INDEX IF EXISTS idx_babies_user;
DROP INDEX IF EXISTS idx_users_email;

DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS babies;
DROP TABLE IF EXISTS users;
