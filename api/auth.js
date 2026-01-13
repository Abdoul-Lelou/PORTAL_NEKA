import crypto from 'crypto';

export default function auth(req, res) {
    try {
        const { fas } = req.query;
        const faskey = "1234567890"; // Ta clé

        if (!fas) {
            return res.status(200).json({ error: "En attente du routeur" });
        }

        // 1. Décodage
        const decodedFas = Buffer.from(fas, 'base64').toString('utf-8');
        
        // 2. Extraction robuste
        const params = {};
        decodedFas.split(/[,&]\s*/).forEach(pair => {
            const [key, value] = pair.split('=');
            if (key && value) params[key.trim()] = value.trim();
        });
                
        const hid = params.hid; 
        const gatewayaddress = params.gatewayaddress; 

        if (!hid || !gatewayaddress) {
            return res.status(400).json({ error: "Paramètres manquants" });
        }

        // 3. Hash de sécurité
        const hash = crypto.createHash('sha256').update(hid + faskey).digest('hex');

        // 4. Construction de l'URL d'activation (C'est ce que le frontend attend)
        const [gw_addr, gw_port] = gatewayaddress.split(':');
        // On n'a plus besoin de 'redir' car on reste sur la page, mais openNDS le demande parfois
        const authUrl = `http://${gw_addr}:${gw_port}/opennds_auth/?tok=${hid}&hash=${hash}`;

        // 5. Réponse JSON
        return res.status(200).json({ 
            success: true, 
            authUrl: authUrl 
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}