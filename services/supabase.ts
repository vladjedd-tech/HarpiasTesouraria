
import { createClient } from '@supabase/supabase-js';
import { CLOUD_CONFIG } from '../constants';

if (!CLOUD_CONFIG.SUPABASE_URL || !CLOUD_CONFIG.SUPABASE_KEY) {
  console.warn("Supabase URL ou Key não configuradas no constants.ts. O sistema usará localStorage como fallback.");
}

export const supabase = createClient(
  CLOUD_CONFIG.SUPABASE_URL || 'https://placeholder.supabase.co',
  CLOUD_CONFIG.SUPABASE_KEY || 'placeholder'
);

export const isCloudEnabled = !!CLOUD_CONFIG.SUPABASE_URL && !!CLOUD_CONFIG.SUPABASE_KEY;
