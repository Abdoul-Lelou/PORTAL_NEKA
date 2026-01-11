// On utilise le module natif crypto de Node.js
const crypto = require('crypto');

module.exports = (req, res) => {
    try {
        const { tok, gw_addr, gw_port } = req.query;
        const faskey = "1234567890"; // Doit être identique au routeur

        // Si on accède à l'API sans paramètres (pour test)
        if (!tok || !gw_addr || !gw_port) {
            return res.status(200).json({ 
                status: "En attente", 
                message: "L'API est prête. En attente des paramètres du routeur." 
            });
        }

        // Calcul du Hash SHA256
        const hash = crypto.createHash('sha256').update(tok + faskey).digest('hex');

        // Construction de l'URL de redirection vers le GL-X750
        const redirectUrl = `http://${gw_addr}:${gw_port}/opennds_auth/?tok=${tok}&hash=${hash}`;

        // Redirection
        res.redirect(302, redirectUrl);
        
    } catch (error) {
        console.error("Erreur API Auth:", error);
        res.status(500).json({ error: "Erreur interne lors du calcul du hash" });
    }
};