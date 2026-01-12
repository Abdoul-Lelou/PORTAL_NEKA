import crypto from 'crypto';

export default function handler(req, res) {
    try {
        const { fas } = req.query;
        const faskey = "1234567890"; 

        if (!fas) {
            return res.status(200).send("API NEKA: Prête. En attente du signal du routeur.");
        }

        // 1. Décodage du paramètre FAS (Base64)
        const decodedFas = Buffer.from(fas, 'base64').toString('utf-8');
        
        // 2. Extraction des données (le format est : clé1=valeur1, clé2=valeur2)
        // On nettoie les virgules et on cherche les valeurs
        const params = new URLSearchParams(decodedFas.replace(/, /g, '&'));
        
        const hid = params.get('hid'); // C'est le token haché
        const gatewayAddress = params.get('gatewayaddress'); // format "192.168.8.1:2050"

        if (!hid || !gatewayAddress) {
            return res.status(400).send("Erreur: Données de session manquantes dans le jeton FAS.");
        }

        // 3. Calcul du Hash de sécurité (SHA256)
        // Pour openNDS, le hash est : sha256(hid + faskey)
        const hash = crypto.createHash('sha256').update(hid + faskey).digest('hex');

        // 4. Construction de l'URL de retour vers le routeur
        // On sépare l'IP et le Port
        const [gw_addr, gw_port] = gatewayAddress.split(':');
        const redirectUrl = `http://${gw_addr}:${gw_port}/opennds_auth/?tok=${hid}&hash=${hash}`;

        // 5. Redirection finale pour libérer l'accès
        return res.redirect(302, redirectUrl);

    } catch (error) {
        console.error(error);
        return res.status(500).send("Erreur interne lors de l'authentification.");
    }
}