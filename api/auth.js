import crypto from 'crypto';

export default function handler(req, res) {
    try {
        let { tok, gw_addr, gw_port, fas } = req.query;
        const faskey = "1234567890"; 

        // 1. Décodage du bloc FAS si présent
        if (fas) {
            try {
                const decodedFas = Buffer.from(fas, 'base64').toString('utf-8');
                const urlParams = new URLSearchParams(decodedFas);
                
                // On ne remplace que si les valeurs existent dans le bloc décodé
                tok = urlParams.get('tok') || tok;
                gw_addr = urlParams.get('gw_addr') || gw_addr;
                gw_port = urlParams.get('gw_port') || gw_port;
            } catch (e) {
                console.error("Erreur de décodage Base64");
            }
        }

        // 2. Vérification critique des paramètres
        if (!tok || !gw_addr || !gw_port) {
            return res.status(200).send("L'API NEKA est en attente du routeur. Paramètres manquants dans le jeton FAS.");
        }

        // 3. Calcul du Hash SHA256
        const hash = crypto.createHash('sha256').update(tok + faskey).digest('hex');

        // 4. Redirection vers le routeur
        const redirectUrl = `http://${gw_addr}:${gw_port}/opennds_auth/?tok=${tok}&hash=${hash}`;

        console.log("Redirection vers:", redirectUrl);
        return res.redirect(302, redirectUrl);

    } catch (error) {
        console.error("Erreur Critique API:", error);
        return res.status(500).json({ error: "Erreur interne du serveur lors de l'authentification" });
    }
}