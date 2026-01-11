import crypto from 'crypto';

export default function handler(req, res) {
    try {
        // OpenNDS envoie soit tok/gw_addr soit un bloc 'fas' crypté
        let { tok, gw_addr, gw_port, fas } = req.query;
        const faskey = "1234567890"; 

        // Si on a le paramètre 'fas', on doit le décoder (Mode FAS Secure 3)
        if (fas) {
            const decodedFas = Buffer.from(fas, 'base64').toString('utf-8');
            // Le décodage de base donne une chaîne type: "tok=...&gw_addr=...&gw_port=..."
            const urlParams = new URLSearchParams(decodedFas);
            tok = urlParams.get('tok');
            gw_addr = urlParams.get('gw_addr');
            gw_port = urlParams.get('gw_port');
        }

        if (!tok || !gw_addr || !gw_port) {
            return res.status(200).send("L'API NEKA attend les paramètres du routeur (fas ou tok).");
        }

        // Calcul du Hash SHA256 (Signature de sécurité)
        const hash = crypto.createHash('sha256').update(tok + faskey).digest('hex');

        // URL de redirection finale pour libérer l'accès
        const redirectUrl = `http://${gw_addr}:${gw_port}/opennds_auth/?tok=${tok}&hash=${hash}`;

        return res.redirect(302, redirectUrl);

    } catch (error) {
        return res.status(500).json({ error: "Erreur lors du décodage FAS" });
    }
}