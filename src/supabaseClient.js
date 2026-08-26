import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://uyyprvcnmmndxwyljsxr.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5eXBydmNubW1uZHh3eWxqc3hyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3MTM3MzIsImV4cCI6MjA5NjI4OTczMn0.H026hi3dmfvRHvZwnwn8BARg6L3mF6uOjjinudOVAVs';

export const supabase = createClient(supabaseUrl, supabaseKey);
