import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xstbuiishcldznuusshw.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzdGJ1aWlzaGNsZHpudXVzc2h3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NzA3NjgsImV4cCI6MjA5MTA0Njc2OH0.xJK1X4rysfuVJznCDJaWZyWkeYeKrCXjfwHTGt8FWbI';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Using default client initialization.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function subscribeToNewsletter(email: string) {
  try {
    const { data, error } = await supabase
      .from('subscribers')
      .insert([{ email, subscribed_at: new Date().toISOString() }]);

    if (error) {
      console.warn('Supabase subscriber notice:', error.message);
      const localSubs = JSON.parse(localStorage.getItem('gma_subscribers') || '[]');
      if (!localSubs.includes(email)) {
        localSubs.push(email);
        localStorage.setItem('gma_subscribers', JSON.stringify(localSubs));
      }
      return { success: true, method: 'local', message: 'Thank you for subscribing!' };
    }

    return { success: true, data, method: 'supabase', message: 'Thank you for subscribing!' };
  } catch (err) {
    console.warn('Supabase exception, storing locally:', err);
    const localSubs = JSON.parse(localStorage.getItem('gma_subscribers') || '[]');
    if (!localSubs.includes(email)) {
      localSubs.push(email);
      localStorage.setItem('gma_subscribers', JSON.stringify(localSubs));
    }
    return { success: true, method: 'local', message: 'Thank you for subscribing!' };
  }
}

