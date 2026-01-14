import crypto from 'crypto';

export default function handler(req, res) {
  // Récupération des paramètres envoyés par openNDS (via l'URL)
  const { fas } = req.query;
  
  // Ta clé faskey (Doit être identique à celle du fichier config)
  const faskey = '1234567890'; 

  if (!fas) {
    return res.status(400).send("Erreur : Paramètre FAS manquant.");
  }

  // 1. Décodage du FAS (Base64)
  // En niveau 1, fas contient : hid, gatewayname, clientip, etc.
  const decodedFas = Buffer.from(fas, 'base64').toString('utf-8');
  
  // Parsing manuel de la chaine (ex: "hid=xxx, clientip=xxx")
  const params = {};
  decodedFas.split(', ').forEach(pair => {
    const [key, value] = pair.split('=');
    if (key) params[key] = value;
  });

  const hid = params.hid; // Le Hash ID du client
  const gatewayAddress = params.gatewayaddress || '192.168.8.1'; // Adresse par défaut si manquante
  const gatewayPort = '2050'; // Port par défaut openNDS

  // 2. Vérification (Simulation)
  // Ici, tu peux vérifier si l'email ou le nom sont valides.
  
  // 3. Construction du Jeton de Validation (Token)
  // La formule magique pour le Niveau 1 est : sha256(hid + faskey)
  const token = crypto.createHash('sha256').update(hid + faskey).digest('hex');

  // 4. Libération immédiate !
  // On redirige l'utilisateur vers le routeur avec le token calculé.
  // Le routeur va comparer ce token avec son propre calcul. Si ça matche -> Internet ouvert.
  
  const authUrl = `http://${gatewayAddress}:${gatewayPort}/opennds_auth/?tok=${token}`;

  // Redirection
  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <html>
      <body style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; font-family:sans-serif;">
        <h2>Connexion réussie !</h2>
        <p>Cliquez sur le bouton ci-dessous pour activer votre accès internet.</p>
        <a href="${authUrl}" style="padding:15px 30px; background:#0070f3; color:white; text-decoration:none; border-radius:5px; font-weight:bold;">
          ACTIVER INTERNET
        </a>
      </body>
    </html>
  `);
}