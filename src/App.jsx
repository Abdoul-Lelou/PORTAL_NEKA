import React, { useState, useEffect } from 'react';
import sha256 from 'js-sha256'; // Ajoute cette dépendance : npm install js-sha256

function App() {
  const [step, setStep] = useState(1);
  const [fasParams, setFasParams] = useState(null); // On garde les params décodés
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [canActivate, setCanActivate] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const FASKY = "1234567890"; // Ta clé secrète (à changer en prod !)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.get('status') === 'connected') {
      setIsConnected(true);
      return;
    }

    const fas = urlParams.get('fas');
    if (fas) {
      // Décodage direct dans le frontend
      const decoded = Buffer.from(fas, 'base64').toString('utf-8');
      const params = {};
      decoded.split(/[,&]/).forEach(pair => {
        const [k, v] = pair.split('=');
        if (k && v) params[k] = decodeURIComponent(v);
      });
      setFasParams(params);
    }
  }, []);

  // Timer
  useEffect(() => {
    if (step === 2 && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setCanActivate(true);
    }
  }, [step, timeLeft]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    setStep(2);
  };

  const handleActivateInternet = () => {
    if (!fasParams) {
      alert("Erreur : reconnectez-vous au WiFi");
      return;
    }

    setIsLoading(true);

    const hid = fasParams.hid;
    const gatewayaddress = fasParams.gatewayaddress;

    if (!hid || !gatewayaddress) {
      alert("Paramètres manquants");
      setIsLoading(false);
      return;
    }

    // Calcul du hash directement dans le navigateur
    const hash = sha256(hid + FASKY);

    const successPage = "https://portal-neka-3yhx.vercel.app/?status=connected";

    const [gw_addr, gw_port] = gatewayaddress.split(':');
    const authUrl = `http://${gw_addr}:${gw_port}/opennds_auth/?tok=${hid}&hash=${hash}&redir=${encodeURIComponent(successPage)}`;

    // Redirection complète → contourne Mixed Content
    window.location.href = authUrl;
  };

  if (isConnected) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>NEKA <span style={styles.wifi}>WiFi</span></h1>
          <div style={styles.successZone}>
            <div style={{fontSize: '4rem', marginBottom: '20px'}}>🎉</div>
            <p style={styles.readyText}>VOUS ÊTES CONNECTÉ !</p>
            <p style={{color: '#666', marginBottom: '30px'}}>Profitez de votre navigation internet.</p>
            <button onClick={() => window.location.href = 'https://google.com'} style={styles.button}>
              Aller sur Google
            </button>
          </div>
          <p style={styles.footer}>Campus France 2026</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>NEKA <span style={styles.wifi}>WiFi</span></h1>
        
        {step === 1 ? (
          <form onSubmit={handleSubmit} style={styles.form}>
            <p style={styles.subtitle}>Enregistrez-vous pour accéder au réseau</p>
            <input name="name" placeholder="Nom complet" required style={styles.input} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            <input name="email" type="email" placeholder="Email" required style={styles.input} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            <button type="submit" style={styles.button}>Accéder à la visite 3D</button>
          </form>
        ) : (
          <div style={styles.successZone}>
            <div style={styles.adHeader}>
              {canActivate ? (
                <p style={styles.readyText}>🚀 Internet est prêt !</p>
              ) : (
                <p style={styles.timerText}>Publicité : Accès internet dans <strong>{timeLeft}s</strong>...</p>
              )}
            </div>
            
            <div style={styles.videoContainer}>
              <iframe src="https://visite-3-d-1yfd.vercel.app/" style={styles.iframe} title="Visite 3D" />
            </div>

            <button 
              onClick={handleActivateInternet}
              disabled={!canActivate || isLoading}
              style={{
                ...styles.authBtn,
                background: canActivate ? '#34a853' : '#ccc',
                cursor: canActivate ? 'pointer' : 'not-allowed'
              }}
            >
              {isLoading ? "ACTIVATION..." : (canActivate ? "ACTIVER INTERNET" : `PATIENTEZ (${timeLeft}s)`)}
            </button>
          </div>
        )}
        <p style={styles.footer}>Campus France 2026 • Projet NEKA</p>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%)', padding: '20px' },
  card: { background: 'white', padding: '30px', borderRadius: '24px', maxWidth: '500px', width: '100%', textAlign: 'center' },
  title: { fontSize: '2rem', color: '#1a73e8', fontWeight: '800' },
  wifi: { color: '#34a853' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '10px', width: '90%' },
  button: { padding: '15px', borderRadius: '8px', border: 'none', background: '#1a73e8', color: 'white', fontWeight: 'bold', width: '100%' },
  subtitle: { color: '#666', marginBottom: '25px' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  successZone: { textAlign: 'center' },
  adHeader: { marginBottom: '15px', padding: '10px', borderRadius: '8px', background: '#f8f9fa' },
  timerText: { color: '#d93025', fontSize: '0.9rem', margin: 0 },
  readyText: { color: '#34a853', fontWeight: 'bold', margin: 0 },
  videoContainer: { borderRadius: '12px', overflow: 'hidden', border: '1px solid #eee', marginBottom: '15px' },
  iframe: { width: '100%', height: '300px', border: 'none' },
  authBtn: { width: '100%', padding: '18px', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.1rem' },
  footer: { marginTop: '20px', fontSize: '0.7rem', color: '#999' }
};


export default App;


