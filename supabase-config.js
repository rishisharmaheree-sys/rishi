const SUPABASE_URL = 'https://vxwpbnvemtdpjxyskoaz.supabase.co';
const SUPABASE_KEY = 'sb_publishable_SGRRbBCWVSU7E_TFoZAHNw_WiZeeUgA';

// Initialize the Supabase client
// The CDN script creates a global 'supabase' object containing the createClient function.
// We assign our client instance to 'supabaseClient' to avoid naming conflicts.
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
