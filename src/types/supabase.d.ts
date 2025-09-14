// Type definitions for @supabase/supabase-js
// This file helps TypeScript understand the Supabase client types

declare module '@supabase/supabase-js' {
  export type SupabaseClient = any;
  export type User = any;
  export type AuthError = any;
  export type PostgrestError = any;
  export type Session = any;
  
  export function createClient(url: string, key: string): SupabaseClient;
  
  // Add other Supabase types and functions as needed
}
