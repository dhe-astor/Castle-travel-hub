
window.CASTLE_CONFIG = {
    // Supabase project URL 
    SUPABASE_URL: 'https://arefpgcmeewlsmcezrwr.supabase.co',
    
    // Supabase Public Anon Key
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyZWZwZ2NtZWV3bHNtY2V6cndyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1NjY4NjMsImV4cCI6MjEwMjE0Mjg2M30.Pl5tzA_DDPtLB7avGybyG9oQWDjtdV18-cv4TEi7IT8',
    
    // Web3Forms access key for email notifications
    WEB3FORMS_ACCESS_KEY: 'b865e85a-6c77-40e9-a1ec-2bb36d47dce1',
    
    // Check if live Supabase is configured
    isLiveConfigured() {
        return Boolean(this.SUPABASE_URL && this.SUPABASE_ANON_KEY && this.SUPABASE_URL.startsWith('http'));
    }
};
