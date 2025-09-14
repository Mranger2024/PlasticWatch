import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const uploadFile = async (file: File, path: string) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
  const filePath = `${path}/${fileName}`;
  
  const { data, error } = await supabase.storage
    .from('contributions')
    .upload(filePath, file);
    
  if (error) throw error;
  
  // Get the public URL
  const { data: { publicUrl } } = supabase.storage
    .from('contributions')
    .getPublicUrl(filePath);
    
  return publicUrl;
};
