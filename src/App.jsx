import React, { useState, useEffect } from 'react';

function App() {
  const [step, setStep] = useState(1);
  const [fasParams, setFasParams] = useState("");
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [canActivate, setCanActivate] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    
    // CAS 1 : L'utilisateur revient du routeur avec Internet activé
    if (urlParams.get('status') === 'connected') {
      setIsConnected(true);
      return;
    }

    // CAS 2 : L'utilisateur arrive du portail captif
    const fas = urlParams.get('fas');
    if (fas) {
      setFasParams(`fas=${fas}`);
    }
  }, []);

  // Timer logique
  useEffect(() => {
    if (step === 2 && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setCanActivate(true);
    }
  }, [step, timeLeft]);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    setIsLoading(true);
    setTimeout(() => {
      setStep(2);
      setIsLoading(false);
    }, 1000);
  };

  // --- CORRECTION MAJEURE ICI ---
  const handleActivateInternet = async () => {
    if (!fasParams) {
      alert("Erreur paramètres. Reconnectez-vous au WiFi.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. On demande l'URL signée à ton API Vercel
      const response = await fetch(`/api/auth?${fasParams}`);
      const data = await response.json();

      if (data.success && data.authUrl) {
        // 2. REDIRECTION FORCÉE (Contourne le problème de Mixed Content)
        // Le navigateur va aller sur http://192.168.8.1...
        // Le routeur va valider et rediriger vers la page de succès
        window.location.href = data.authUrl;
      } else {
        alert("Erreur de génération du lien");
        setIsLoading(false);
      }

    } catch (error) {
      console.error(error);
      alert("Erreur de connexion API");
      setIsLoading(false);
    }
  };

  // --- PAGE DE SUCCÈS FINALE ---
  if (isConnected) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>NEKA <span style={styles.wifi}>WiFi</span></h1>
          <div style={styles.successZone}>
             <div style={{fontSize: '4rem', marginBottom: '20px'}}>🎉</div>
             <p style={styles.readyText}>VOUS ÊTES CONNECTÉ !</p>
             <p style={{color: '#666', marginBottom: '30px'}}>Profitez de votre navigation internet.</p>
             <button 
               onClick={() => window.location.href = 'https://google.com'}
               style={styles.button}
             >
               Aller sur Google
             </button>
          </div>
          <p style={styles.footer}>Campus France 2026</p>
        </div>
      </div>
    );
  }

  // --- Reste du code (Formulaire normal) ---
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>NEKA <span style={styles.wifi}>WiFi</span></h1>
        
        {step === 1 ? (
          <form onSubmit={handleSubmit} style={styles.form}>
            <p style={styles.subtitle}>Enregistrez-vous pour accéder au réseau</p>
            <input name="name" placeholder="Nom complet" required style={styles.input} onChange={handleInputChange} />
            <input name="email" type="email" placeholder="Email" required style={styles.input} onChange={handleInputChange} />
            <button type="submit" style={styles.button} disabled={isLoading}>
              {isLoading ? "Chargement..." : "Accéder à la visite 3D"}
            </button>
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
              <iframe 
                src="https://visite-3-d-1yfd.vercel.app/" 
                style={styles.iframe}
                title="Visite 3D"
              />
            </div>

            <button 
              onClick={handleActivateInternet}
              disabled={!canActivate || isLoading}
              style={{
                ...styles.authBtn,
                background: canActivate ? '#34a853' : '#ccc',
                cursor: (canActivate && !isLoading) ? 'pointer' : 'not-allowed',
                opacity: isLoading ? 0.7 : 1
              }}
            >
              {isLoading ? "ACTIVATION EN COURS..." : (canActivate ? "ACTIVER INTERNET MAINTENANT" : `PATIENTEZ (${timeLeft}s)`)}
            </button>
            <p style={{fontSize: '0.7rem', color: '#ccc', marginTop: '10px'}}>
               Vous serez redirigé momentanément pour l'activation.
            </p>
          </div>
        )}
        <p style={styles.footer}>Campus France 2026 • Projet NEKA</p>
      </div>
    </div>
  );
}

// ... Tes styles restent les mêmes ...
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