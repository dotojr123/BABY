import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wtlqjbekwxpnpttiequy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0bHFqYmVrd3hwbnB0dGllcXV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5NDA2MzcsImV4cCI6MjA4NDUxNjYzN30.VVDQKoeSxfMHQaWIVy54GhJSQnwxSkddqW1OSfUNc54';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to get current user
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Helper to get current session
export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};
