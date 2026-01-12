// api/auth.js (Version compatible Level 1)
import crypto from 'crypto';

export default function handler(req, res) {
    const { tok, gw_addr, gw_port } = req.query;
    const faskey = "1234567890"; 

    if (!tok || !gw_addr || !gw_port) {
        return res.status(200).send("API NEKA: Prête. En attente du token du routeur.");
    }

    // Hash simple pour le Level 1
    const hash = crypto.createHash('sha256').update(tok + faskey).digest('hex');
    const redirectUrl = `http://${gw_addr}:${gw_port}/opennds_auth/?tok=${tok}&hash=${hash}`;

    return res.redirect(302, redirectUrl);
}