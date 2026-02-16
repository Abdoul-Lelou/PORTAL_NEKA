// supabase/functions/get-campaign/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Extraction du router_id
    const url = new URL(req.url);
    const routerId = url.searchParams.get('router_id');

    if (!routerId) {
      console.error('Missing router_id parameter');
      return new Response("MISSING_ROUTER_ID", { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      });
    }

    console.log(`Received request for router_id: ${routerId}`);

    // Connexion Supabase avec SERVICE_ROLE_KEY (bypass RLS)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Récupération de l'URL depuis la table
    const { data, error } = await supabase
      .from('router_management')
      .select('ad_url, router_id, location')
      .eq('router_id', routerId)
      .maybeSingle();

    // Debug logging
    if (error) {
      console.error('Database error:', error.message, error.details, error.hint);
      return new Response("DATABASE_ERROR", { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      });
    }

    if (!data) {
      console.error(`No record found for router_id: ${routerId}`);
      return new Response("NO_CAMPAIGN_FOUND", { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      });
    }

    if (!data.ad_url || data.ad_url.trim() === '') {
      console.error(`Empty ad_url for router_id: ${routerId}`);
      return new Response("EMPTY_AD_URL", { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      });
    }

    const adUrl = data.ad_url.trim();
    console.log(`Success: Returning URL for ${routerId}: ${adUrl}`);

    // Mise à jour optionnelle du last_seen
    await supabase
      .from('router_management')
      .update({ last_seen: new Date().toISOString() })
      .eq('router_id', routerId);

    // Retour de l'URL en plain text
    return new Response(adUrl, {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
    });

  } catch (err) {
    console.error('Unexpected error:', err);
    return new Response("INTERNAL_ERROR", { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
    });
  }
});