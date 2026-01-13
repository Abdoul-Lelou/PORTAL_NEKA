import React, { useState, useEffect } from 'react';

function App() {
  const [step, setStep] = useState(1);
  const [fasParams, setFasParams] = useState("");
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [canActivate, setCanActivate] = useState(false);
  
  // NOUVEAU : État pour la notification
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const fas = urlParams.get('fas');
    if (fas) setFasParams(`fas=${fas}`);
  }, []);

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

  // --- LA NOUVELLE LOGIQUE D'ACTIVATION SILENCIEUSE ---
  const handleActivateInternet = async () => {
    if (!fasParams) {
      showNotification("❌ Erreur : Connectez-vous au WiFi NEKA", "error");
      return;
    }

    setIsLoading(true);

    try {
      // 1. On demande à Vercel de calculer le Hash et l'URL
      const response = await fetch(`/api/auth?${fasParams}`);
      const data = await response.json();

      if (data.success && data.authUrl) {
        
        // 2. On appelle le routeur SILENCIEUSEMENT (mode 'no-cors')
        // 'no-cors' est vital ici car on appelle du HTTP depuis du HTTPS
        await fetch(data.authUrl, { mode: 'no-cors' });

        // 3. Succès ! On affiche la notif
        showNotification("✅ Internet Activé ! Profitez de la visite.", "success");
        setCanActivate(false); // On désactive le bouton pour éviter le double clic

      } else {
        throw new Error("Réponse invalide du serveur");
      }

    } catch (error) {
      console.error(error);
      showNotification("⚠️ Problème d'activation. Réessayez.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    // La notif disparait après 4 secondes
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div style={styles.container}>
      
      {/* Composant de Notification Flottante */}
      {notification && (
        <div style={{
          ...styles.notification,
          backgroundColor: notification.type === 'success' ? '#34a853' : '#d93025'
        }}>
          {notification.message}
        </div>
      )}

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
              {isLoading ? "ACTIVATION..." : (canActivate ? "ACTIVER INTERNET MAINTENANT" : `PATIENTEZ (${timeLeft}s)`)}
            </button>
          </div>
        )}
        <p style={styles.footer}>Campus France 2026 • Projet NEKA</p>
      </div>
    </div>
  );
}

const styles = {
  // ... tes styles précédents ...
  // Ajoute le style de notification :
  notification: {
    position: 'fixed',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    color: 'white',
    padding: '15px 25px',
    borderRadius: '50px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
    zIndex: 1000,
    fontWeight: 'bold',
    animation: 'slideIn 0.5s ease-out'
  },
  // ... Copie le reste de tes styles ici ...
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