import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://uyyprvcnmmndxwyljsxr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Rm2azC2TuJYUBwGjA3hiWQ_0oZ8-aDe';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
