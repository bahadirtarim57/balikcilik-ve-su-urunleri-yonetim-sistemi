import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = 'https://uyyprvcnmmndxwyljsxr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5eXBydmNubW1uZHh3eWxqc3hyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3MTM3MzIsImV4cCI6MjA5NjI4OTczMn0.H026hi3dmfvRHvZwnwn8BARg6L3mF6uOjjinudOVAVs';
const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateData() {
    try {
        console.log('Migrating Tesisler...');
        const tesislerData = JSON.parse(fs.readFileSync(path.resolve('src/data/sinopTesisler_Master.json'), 'utf-8'));
        
        if (Array.isArray(tesislerData) && tesislerData.length > 0) {
            const { data, error } = await supabase.from('tesisler').insert(tesislerData);
            if (error) console.error('Tesisler Error:', error);
            else console.log('Tesisler inserted successfully!');
        }

        // Skip cezalar for now, we will handle it later if needed. The user mainly cares about Tesisler.
        console.log('Migration Completed.');
    } catch (e) {
        console.error('Migration failed:', e.message);
    }
}

migrateData();
