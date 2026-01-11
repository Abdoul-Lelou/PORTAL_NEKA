import crypto from 'crypto';

export default function handler(req, res) {
    try {
        const { tok, gw_addr, gw_port } = req.query;
        const faskey = "1234567890"; // Doit être identique au routeur

        // Test de bon fonctionnement sans paramètres
        if (!tok || !gw_addr || !gw_port) {
            return res.status(200).send("L'API NEKA est opérationnelle. En attente du routeur...");
        }

        // Calcul du Hash SHA256
        const hash = crypto
            .createHash('sha256')
            .update(tok + faskey)
            .digest('hex');

        // URL de redirection vers le routeur
        const redirectUrl = `http://${gw_addr}:${gw_port}/opennds_auth/?tok=${tok}&hash=${hash}`;

        // Redirection
        return res.redirect(302, redirectUrl);

    } catch (error) {
        console.error("Erreur d'authentification:", error);
        return res.status(500).json({ error: "Erreur interne du serveur" });
    }
}