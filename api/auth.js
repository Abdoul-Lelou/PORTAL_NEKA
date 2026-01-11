const crypto = require('crypto');

export default function handler(req, res) {
    const { tok, gw_addr, gw_port } = req.query;
    const faskey = "1234567890"; // Clé identique au routeur

    if (!tok) return res.status(400).send("Token manquant");

    // Calcul du Hash SHA256 pour OpenNDS FAS Level 3
    const hash = crypto.createHash('sha256').update(tok + faskey).digest('hex');

    // Redirection vers le routeur
    const redirectUrl = `http://${gw_addr}:${gw_port}/opennds_auth/?tok=${tok}&hash=${hash}`;
    res.redirect(302, redirectUrl);
}