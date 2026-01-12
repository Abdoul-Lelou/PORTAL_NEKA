import crypto from 'crypto';

export default function handler(req, res) {
    try {
        const { fas } = req.query;
        const faskey = "1234567890"; // Doit correspondre à la config openNDS

        if (!fas) {
            return res.status(200).send("API NEKA: Prête. En attente du signal du routeur.");
        }

        // 1. Décodage du paramètre FAS (Base64)
        const decodedFas = Buffer.from(fas, 'base64').toString('utf-8');
        console.log("Decoded FAS:", decodedFas);
        
        // 2. Extraction des données
        // Format openNDS FAS niveau 1: "clientip=X, clientmac=Y, gatewayname=Z, hid=TOKEN, ..."
        const params = {};
        decodedFas.split(', ').forEach(pair => {
            const [key, value] = pair.split('=');
            if (key && value) params[key] = value;
        });
        
        const hid = params.hid; // Token haché
        const gatewayaddress = params.gatewayaddress; // Format "IP:PORT"
        const redir = params.redir || 'http://google.com'; // URL de redirection finale

        if (!hid || !gatewayaddress) {
            console.error("Missing params:", params);
            return res.status(400).send(`
                <html>
                <body style="font-family: Arial; text-align: center; padding: 50px;">
                    <h1>❌ Erreur d'authentification</h1>
                    <p>Données de session manquantes.</p>
                    <p><a href="/">Retour à l'accueil</a></p>
                </body>
                </html>
            `);
        }

        // 3. Calcul du Hash de sécurité (SHA256)
        // Pour openNDS FAS niveau 1: hash = sha256(hid + faskey)
        const hash = crypto.createHash('sha256').update(hid + faskey).digest('hex');

        // 4. Construction de l'URL de retour vers openNDS
        const [gw_addr, gw_port] = gatewayaddress.split(':');
        const authUrl = `http://${gw_addr}:${gw_port}/opennds_auth/?tok=${hid}&hash=${hash}&redir=${encodeURIComponent(redir)}`;

        console.log("Redirecting to:", authUrl);

        // 5. Page de redirection avec message
        return res.status(200).send(`
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="refresh" content="2;url=${authUrl}">
                <title>Activation Internet - NEKA WiFi</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: -apple-system, sans-serif;
                        background: linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                        color: white;
                        text-align: center;
                        padding: 20px;
                    }
                    .container {
                        background: white;
                        color: #333;
                        padding: 50px 40px;
                        border-radius: 24px;
                        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                        max-width: 500px;
                    }
                    .icon { font-size: 5em; margin-bottom: 20px; }
                    h1 { color: #34a853; font-size: 2em; margin-bottom: 15px; }
                    p { font-size: 1.1em; color: #666; line-height: 1.6; }
                    .spinner {
                        border: 4px solid #f3f3f3;
                        border-top: 4px solid #1a73e8;
                        border-radius: 50%;
                        width: 50px;
                        height: 50px;
                        animation: spin 1s linear infinite;
                        margin: 30px auto;
                    }
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    .link { 
                        display: inline-block;
                        margin-top: 20px;
                        padding: 15px 30px;
                        background: #1a73e8;
                        color: white;
                        text-decoration: none;
                        border-radius: 12px;
                        font-weight: bold;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="icon">🚀</div>
                    <h1>Activation de votre accès Internet</h1>
                    <p>Votre connexion est en cours d'activation...</p>
                    <div class="spinner"></div>
                    <p style="font-size: 0.9em; color: #999;">
                        Redirection automatique dans 2 secondes
                    </p>
                    <a href="${authUrl}" class="link">Cliquez ici si pas de redirection</a>
                </div>
            </body>
            </html>
        `);

    } catch (error) {
        console.error("Auth error:", error);
        return res.status(500).send(`
            <html>
            <body style="font-family: Arial; text-align: center; padding: 50px;">
                <h1>❌ Erreur interne</h1>
                <p>Impossible d'activer votre connexion.</p>
                <p style="color: #999; font-size: 0.9em;">${error.message}</p>
            </body>
            </html>
        `);
    }
}