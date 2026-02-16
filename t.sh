#!/bin/sh
# Theme NEKA - UI1: Supabase + Validation / UI2: Iframe
# Version corrigée pour nftables et compatibilité mobile

title="theme_neka_supabase"

# ==========================================
# CONFIGURATION
# ==========================================
MY_ROUTER_ID="GL-X750_AGENCE_01"
SUPABASE_EDGE_FUNCTION="https://jshjrfizhxylvdiabkrk.supabase.co/functions/v1/get-campaign"
FALLBACK_URL="https://portal-neka-3yhx.vercel.app"

# ==========================================
# FONCTION: Extraction robuste du domaine depuis URL
# ==========================================
# extract_domain() {
#     local url="$1"
#     # Supprime le protocole (http:// ou https://)
#     local domain=$(echo "$url" | sed -e 's|^https\?://||' -e 's|/.*$||')
#     # Supprime le port si présent (ex: domain.com:8080 -> domain.com)
#     domain=$(echo "$domain" | cut -d':' -f1)
#     # Supprime www. uniquement au début
#     domain=$(echo "$domain" | sed 's|^www\.||')
#     # Retourne le FQDN propre
#     echo "$domain"
# }

# ==========================================
# FONCTION: Ajout au Walled Garden OpenNDS
# ==========================================
add_to_walled_garden() {
    local domain="$1"
    
    # Validation du domaine
    if [ -z "$domain" ] || [ "$domain" = " " ]; then
        echo "Invalid domain, skipping" >> /tmp/neka_debug.log
        return 1
    fi
    
    # Vérifie si le domaine est déjà dans le Walled Garden
    if ndsctl status 2>/dev/null | grep -qi "$domain"; then
        echo "Domain $domain already in Walled Garden" >> /tmp/neka_debug.log
        return 0
    fi
    
    # Ajout via la commande correcte pour les domaines
    # CORRECTION: ndsctl walledgarden add (pas "trust" qui est pour les MACs)
    if ndsctl walledgarden add "$domain" 2>/dev/null; then
        echo "✓ Added $domain to Walled Garden" >> /tmp/neka_debug.log
        return 0
    else
        echo "✗ Failed to add $domain to Walled Garden" >> /tmp/neka_debug.log
        return 1
    fi
}

# ==========================================
# INITIALISATION DU WALLED GARDEN
# Domaines essentiels pour le fonctionnement
# ==========================================
echo "=== NEKA WiFi Script Started ===" > /tmp/neka_debug.log
echo "Router ID: $MY_ROUTER_ID" >> /tmp/neka_debug.log
echo "Timestamp: $(date)" >> /tmp/neka_debug.log
echo "" >> /tmp/neka_debug.log

# Domaines critiques à autoriser AVANT toute autre opération
ESSENTIAL_DOMAINS="
jshjrfizhxylvdiabkrk.supabase.co
supabase.co
portal-neka-3yhx.vercel.app
vercel.app
cdnjs.cloudflare.com
fonts.googleapis.com
fonts.gstatic.com
"

echo "Adding essential domains to Walled Garden..." >> /tmp/neka_debug.log

for domain in $ESSENTIAL_DOMAINS; do
    add_to_walled_garden "$domain"
done

echo "" >> /tmp/neka_debug.log

# ==========================================
# RÉCUPÉRATION DE L'URL DE CAMPAGNE
# ==========================================
echo "Fetching campaign URL for $MY_ROUTER_ID..." >> /tmp/neka_debug.log

AD_URL=$(curl -s --max-time 4 --connect-timeout 3 "${SUPABASE_EDGE_FUNCTION}?router_id=${MY_ROUTER_ID}")

# Validation stricte de la réponse
if [ -z "$AD_URL" ] || [ "$AD_URL" = " " ] || [ "$AD_URL" = "null" ] || [ "$AD_URL" = "undefined" ]; then
    echo "⚠ No valid URL from Supabase, using fallback" >> /tmp/neka_debug.log
    AD_URL="$FALLBACK_URL"
else
    echo "✓ Campaign URL received: $AD_URL" >> /tmp/neka_debug.log
fi

# ==========================================
# GESTION DYNAMIQUE DU WALLED GARDEN
# ==========================================
CAMPAIGN_DOMAIN=$(extract_domain "$AD_URL")
echo "Extracted campaign domain: $CAMPAIGN_DOMAIN" >> /tmp/neka_debug.log

# Ajoute le domaine de la campagne au Walled Garden
if [ "$CAMPAIGN_DOMAIN" != "portal-neka-3yhx.vercel.app" ]; then
    add_to_walled_garden "$CAMPAIGN_DOMAIN"
fi

# Si l'URL contient des sous-domaines, ajouter aussi le domaine principal
# Ex: si campaign = "shop.example.com", ajouter aussi "example.com"
BASE_DOMAIN=$(echo "$CAMPAIGN_DOMAIN" | awk -F. '{print $(NF-1)"."$NF}')
if [ "$BASE_DOMAIN" != "$CAMPAIGN_DOMAIN" ] && [ -n "$BASE_DOMAIN" ]; then
    echo "Also adding base domain: $BASE_DOMAIN" >> /tmp/neka_debug.log
    add_to_walled_garden "$BASE_DOMAIN"
fi

# ==========================================
# CONSTRUCTION DE L'URL FINALE
# ==========================================
# Ajoute les paramètres MAC et Router ID proprement
if echo "$AD_URL" | grep -q "?"; then
    FINAL_URL="${AD_URL}&mac=${clientmac}&router=${MY_ROUTER_ID}"
else
    FINAL_URL="${AD_URL}?mac=${clientmac}&router=${MY_ROUTER_ID}"
fi

echo "Final URL: $FINAL_URL" >> /tmp/neka_debug.log
echo "==================================" >> /tmp/neka_debug.log
echo "" >> /tmp/neka_debug.log

# ==========================================
# LOGIQUE OPENNDS
# ==========================================
generate_splash_sequence() {
    click_to_continue
}

header() {
    echo "<!DOCTYPE html>
<html lang=\"fr\">
<head>
    <meta charset=\"utf-8\">
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no\">
    <meta name=\"mobile-web-app-capable\" content=\"yes\">
    <meta name=\"apple-mobile-web-app-capable\" content=\"yes\">
    
    <title>$gatewayname - WiFi NEKA</title>
    <style>
    /* Reset & Base - Suppression des calculs complexes */
    * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
    body { font-family: sans-serif; background-color: #f0f2f5; margin: 0; padding: 10px; }
    
    /* Conteneur */
    .insert { 
        max-width: 450px !important; 
        margin: 0 auto; 
        background: #ffffff !important; 
        border: none !important; 
        border-radius: 15px !important; 
        box-shadow: 0 4px 12px rgba(0,0,0,0.1); 
        padding: 20px !important;
    }

    /* Titres */
    med-blue { color: #764ba2; font-size: 22px; font-weight: 800; display: block; margin-bottom: 10px; text-align: center; }
    big-red { color: #333; font-size: 20px; font-weight: 700; display: block; margin-bottom: 5px; }

    /* Formulaire */
    .form-box { background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 10px; padding: 15px; margin: 15px 0; }
    .input-group { margin-bottom: 12px; }
    .input-group label { display: block; font-size: 13px; font-weight: 600; color: #495057; margin-bottom: 5px; }
    .input-group input { 
        width: 100%; padding: 14px; border: 2px solid #ced4da; border-radius: 8px; 
        font-size: 16px; transition: border-color 0.2s; 
    }
    .input-group input:focus { border-color: #764ba2; outline: none; }

    /* BOUTONS STYLE 3D - HAUTE VISIBILITÉ */
    #btn_supabase, #real_submit_form input[type=\"submit\"], #btn_final input[type=\"submit\"] {
        width: 100%; padding: 18px !important; border: none !important; border-radius: 10px !important;
        font-weight: 800 !important; font-size: 16px !important; cursor: pointer;
        text-transform: uppercase; letter-spacing: 0.5px; transition: 0.1s;
    }

    /* Bouton Enregistrer (Vert) */
    #btn_supabase { 
        background: #24b47e !important; color: white !important;
        border-bottom: 4px solid #1a8a60 !important;
    }
    #btn_supabase:active { transform: translateY(2px); border-bottom-width: 2px !important; }

    /* Bouton Publicité (Bleu) */
    #real_submit_form input[type=\"submit\"] { 
        background: #007bff !important; color: white !important;
        border-bottom: 4px solid #0056b3 !important;
    }
    #real_submit_form input[type=\"submit\"]:active { transform: translateY(2px); border-bottom-width: 2px !important; }

    /* Bouton Final (Orange/Vert clignotant) */
    #btn_final input[type=\"submit\"] {
        background: #24b47e !important; color: white !important;
        border-bottom: 4px solid #1a8a60 !important;
        animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.8; }
        100% { opacity: 1; }
    }

    .loader { display: none; color: #24b47e; font-weight: bold; text-align: center; margin-top: 10px; font-size: 14px; }
    iframe { border: 1px solid #ddd; border-radius: 8px; width: 100%; }
</style>
</head>
<body>
    <div class=\"container\">
        <div class=\"header-brand\">
            <h1>🌐 WiFi NEKA</h1>
            <p>Connexion Internet Gratuite</p>
        </div>
        <div class=\"content\">
"
}

footer() {
    echo "        </div>
    </div>
</body>
</html>"
    exit 0
}

click_to_continue() {
    if [ "$continue" = "clicked" ]; then
        thankyou_page
        footer
    fi
    continue_form
    footer
}

continue_form() {
    echo "<input type=\"hidden\" id=\"client_mac_val\" value=\"$clientmac\">"
    echo "<input type=\"hidden\" id=\"router_id_val\" value=\"$MY_ROUTER_ID\">"
    echo "
        <div class=\"page-title\">📝 Identification</div>
        <p class=\"page-subtitle\">Enregistrez-vous pour accéder au WiFi gratuitement</p>

        <div class=\"form-box\">
            <div class=\"input-group\">
                <label>👤 Nom complet</label>
                <input type=\"text\" id=\"nom\" placeholder=\"Ex: Mamadou Diallo\" autocomplete=\"name\">
            </div>
            <div class=\"input-group\">
                <label>📱 Numéro de téléphone</label>
                <input type=\"tel\" id=\"tel\" placeholder=\"Ex: 621234567\" autocomplete=\"tel\">
            </div>
            
            <button id=\"btn_supabase\" onclick=\"sendToSupabase()\">
                ENREGISTRER & CONTINUER →
            </button>
            <div id=\"status_msg\" class=\"loader\">📡 Envoi des données...</div>
        </div>

        <form id=\"real_submit_form\" action=\"/opennds_preauth/\" method=\"get\">
            <input type=\"hidden\" name=\"fas\" value=\"$fas\">
            <input type=\"hidden\" name=\"continue\" value=\"clicked\">
            <input type=\"submit\" value=\"📺 Voir la publicité →\">
        </form>

        <script>
            const SB_URL = 'https://jshjrfizhxylvdiabkrk.supabase.co';
            const SB_KEY = 'sb_publishable_H2NQyODOLUS441JicHnhgA_AVjT-K-9';
            const SB_TABLE = 'wifi_users';

            async function sendToSupabase() {
                const nom = document.getElementById('nom').value.trim();
                const tel = document.getElementById('tel').value.trim();
                const mac = document.getElementById('client_mac_val').value;
                const router = document.getElementById('router_id_val').value;
                const btn = document.getElementById('btn_supabase');
                const loader = document.getElementById('status_msg');
                const realForm = document.getElementById('real_submit_form');

                // Validation
                if (nom.length < 2) {
                    alert('❌ Veuillez entrer votre nom complet');
                    return;
                }
                
                if (tel.length < 8) {
                    alert('❌ Veuillez entrer un numéro de téléphone valide (min. 8 chiffres)');
                    return;
                }

                // UI Loading
                btn.disabled = true;
                btn.innerHTML = '⏳ PATIENTEZ...';
                loader.style.display = 'block';

                try {
                    const response = await fetch(\`\${SB_URL}/rest/v1/\${SB_TABLE}\`, {
                        method: 'POST',
                        headers: {
                            'apikey': SB_KEY,
                            'Authorization': \`Bearer \${SB_KEY}\`,
                            'Content-Type': 'application/json',
                            'Prefer': 'return=minimal'
                        },
                        body: JSON.stringify({ 
                            full_name: nom, 
                            phone: tel,
                            mac_address: mac,
                            router_origin: router,
                            connected_at: new Date().toISOString(),
                            created_at: new Date().toISOString()
                        })
                    });

                    if (response.ok || response.status === 201) {
                        loader.innerHTML = '✅ Données enregistrées avec succès !';
                        loader.style.color = '#24b47e';
                        loader.style.fontWeight = 'bold';
                        
                        setTimeout(() => {
                            btn.style.display = 'none';
                            loader.style.display = 'none';
                            realForm.style.display = 'block';
                        }, 800);
                    } else {
                        throw new Error('Erreur Supabase: ' + response.status);
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('❌ Erreur de connexion. Vérifiez votre connexion et réessayez.');
                    btn.disabled = false;
                    btn.innerHTML = 'ENREGISTRER & CONTINUER →';
                    loader.style.display = 'none';
                }
            }

            // Auto-focus sur le premier champ
            document.addEventListener('DOMContentLoaded', function() {
                document.getElementById('nom').focus();
            });
        </script>
    "
    footer
}

thankyou_page() {
    echo "
        <div class=\"page-title\">🎯 Partenaire NEKA</div>
        <p class=\"page-subtitle\">Découvrez notre offre du moment</p>

        <div style=\"margin: 15px 0; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);\">
            <iframe 
                src=\"$FINAL_URL\" 
                style=\"width:100%; height:420px; border:none; display:block;\"
                scrolling=\"auto\"
                frameborder=\"0\"
                loading=\"eager\">
            </iframe>
        </div>

        <div id=\"timer_msg\" style=\"background:#fff3cd; color:#856404; font-weight:600; padding:12px; border-radius:8px; text-align:center; margin:15px 0;\">
            ⏳ Activation possible dans <span id=\"cnt\">10</span> secondes...
        </div>

        <form id=\"btn_final\" action=\"/opennds_preauth/\" method=\"get\" style=\"display:none;\">
            <input type=\"hidden\" name=\"fas\" value=\"$fas\">
            <input type=\"hidden\" name=\"landing\" value=\"yes\">
            <input 
                type=\"submit\" 
                value=\"✅ ACTIVER MA CONNEXION INTERNET\" 
                style=\"background:linear-gradient(135deg, #24b47e 0%, #1ea06a 100%); color:white; padding:18px; width:100%; border:none; border-radius:8px; font-weight:bold; cursor:pointer; font-size:16px;\">
        </form>

        <script>
            (function() {
                let sec = 10;
                const cntSpan = document.getElementById('cnt');
                const timerDiv = document.getElementById('timer_msg');
                const finalBtn = document.getElementById('btn_final');
                
                const countdown = setInterval(() => {
                    sec--;
                    if (cntSpan) cntSpan.textContent = sec;
                    
                    if (sec <= 0) {
                        clearInterval(countdown);
                        if (timerDiv) {
                            timerDiv.style.display = 'none';
                        }
                        if (finalBtn) {
                            finalBtn.style.display = 'block';
                        }
                    }
                }, 1000);

                // Écoute du signal de l'iframe (communication cross-origin)
                window.addEventListener('message', function(event) {
                    // Vérification de sécurité basique
                    if (event.data === 'NEKA_FORM_SUCCESS') {
                        console.log('✓ Formulaire validé sur iframe externe');
                        clearInterval(countdown);
                        if (timerDiv) {
                            timerDiv.innerHTML = '✅ <strong>Formulaire complété !</strong> Vous pouvez activer votre connexion.';
                            timerDiv.style.background = '#d4edda';
                            timerDiv.style.color = '#155724';
                        }
                        if (finalBtn) {
                            finalBtn.style.display = 'block';
                        }
                    }
                }, false);

                // Message de debug pour mobile
                console.log('NEKA WiFi Portal loaded');
                console.log('Campaign URL:', '$FINAL_URL');
            })();
        </script>
    "
    footer
}

landing_page() {
    auth_log
    echo "
        <div style=\"text-align:center; padding:40px 20px;\">
            <div style=\"font-size:64px; margin-bottom:20px;\">✅</div>
            <h2 style=\"color:#24b47e; font-size:24px; margin-bottom:10px;\">
                Connexion Internet Activée !
            </h2>
            <p style=\"color:#666; font-size:16px; margin-bottom:20px;\">
                Vous êtes maintenant connecté au réseau WiFi NEKA.
            </p>
            <p style=\"color:#999; font-size:14px;\">
                📶 Bonne navigation !
            </p>
        </div>
    "
    footer
}

# ==========================================
# CONFIGURATION QUOTAS OPENNDS
# ==========================================
session_length="0"
upload_rate="0"
download_rate="0"
upload_quota="0"
download_quota="0"
quotas="$session_length $upload_rate $download_rate $upload_quota $download_quota"
userinfo="$title"