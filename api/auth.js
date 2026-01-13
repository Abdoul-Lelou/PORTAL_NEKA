import crypto from 'crypto';

export default function auth(req, res) {
    try {
        const { fas } = req.query;
        const faskey = "1234567890"; 

        if (!fas) {
            return res.status(200).json({ error: "En attente du routeur" });
        }

        const decodedFas = Buffer.from(fas, 'base64').toString('utf-8');
        
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

        const hash = crypto.createHash('sha256').update(hid + faskey).digest('hex');

        // --- CHANGEMENT ICI ---
        // On définit l'URL où l'utilisateur ira APRES que le routeur ait ouvert Internet.
        // On le renvoie vers ton site Vercel avec un paramètre ?status=connected
        const successPage = "https://portal-neka-3yhx.vercel.app/?status=connected";
        
        const [gw_addr, gw_port] = gatewayaddress.split(':');
        
        // On ajoute &redir=... pour que openNDS sache où renvoyer l'utilisateur
        const authUrl = `http://${gw_addr}:${gw_port}/opennds_auth/?tok=${hid}&hash=${hash}&redir=${encodeURIComponent(successPage)}`;

        return res.status(200).json({ 
            success: true, 
            authUrl: authUrl 
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}