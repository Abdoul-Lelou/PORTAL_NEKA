import React, { useState, useEffect } from 'react';

function App() {
  const [step, setStep] = useState(1);
  const [fasParams, setFasParams] = useState("");
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Récupérer les paramètres FAS de l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const fas = urlParams.get('fas');
    
    if (fas) {
      setFasParams(`fas=${fas}`);
      console.log("✅ Paramètres FAS détectés");
    } else {
      console.warn("⚠️ Aucun paramètre FAS détecté - Mode démo");
      setError("Mode démo - Connectez-vous au WiFi NEKA pour l'activation complète");
    }
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      alert("Veuillez remplir tous les champs");
      return;
    }

    setIsLoading(true);
    
    // Simuler l'enregistrement (vous pouvez envoyer à une API ici)
    setTimeout(() => {
      console.log("Inscription:", formData);
      setStep(2);
      setIsLoading(false);
    }, 1000);
  };

  const handleActivateInternet = () => {
    if (!fasParams) {
      alert("Erreur: Paramètres d'authentification manquants. Reconnectez-vous au WiFi NEKA.");
      return;
    }
    
    // Rediriger vers l'API d'authentification
    window.location.href = `/api/auth?${fasParams}`;
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>
          NEKA <span style={styles.wifi}>WiFi</span>
        </h1>
        
        {error && (
          <div style={styles.warningBanner}>
            ⚠️ {error}
          </div>
        )}
        
        {step === 1 ? (
          <form onSubmit={handleSubmit} style={styles.form}>
            <p style={styles.subtitle}>
              Veuillez vous enregistrer pour accéder au réseau
            </p>
            
            <input 
              type="text" 
              name="name"
              placeholder="Nom complet" 
              required 
              style={styles.input}
              value={formData.name}
              onChange={handleInputChange}
              disabled={isLoading}
            />
            
            <input 
              type="email" 
              name="email"
              placeholder="Adresse Email" 
              required 
              style={styles.input}
              value={formData.email}
              onChange={handleInputChange}
              disabled={isLoading}
            />
            
            <button 
              type="submit" 
              style={{
                ...styles.button,
                opacity: isLoading ? 0.6 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
              disabled={isLoading}
            >
              {isLoading ? "Chargement..." : "Continuer vers la visite 3D"}
            </button>
          </form>
        ) : (
          <div style={styles.successZone}>
            <p style={styles.successText}>✅ Inscription réussie !</p>
            <p style={styles.welcomeText}>
              Bienvenue <strong>{formData.name}</strong> !
            </p>
            
            <div style={styles.videoContainer}>
              <iframe 
                src="https://visite-3-d-1yfd.vercel.app/" 
                style={styles.iframe}
                title="Visite 3D NEKA"
                allow="accelerometer; gyroscope"
              />
            </div>

            <button 
              onClick={handleActivateInternet}
              style={styles.authBtn}
            >
              🚀 ACTIVER INTERNET MAINTENANT
            </button>
            
            {!fasParams && (
              <p style={styles.debugInfo}>
                Debug: Reconnectez-vous au WiFi pour obtenir les paramètres FAS
              </p>
            )}
          </div>
        )}
        
        <p style={styles.footer}>
          Projet Campus France 2026-2027 • NEKA WiFi
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '100vh', 
    background: 'linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%)', 
    padding: '20px',
    boxSizing: 'border-box'
  },
  card: { 
    background: 'white', 
    padding: '40px', 
    borderRadius: '24px', 
    boxShadow: '0 20px 40px rgba(0,0,0,0.3)', 
    maxWidth: '500px', 
    width: '100%',
    textAlign: 'center'
  },
  title: { 
    fontSize: '2.5rem', 
    marginBottom: '10px', 
    color: '#1a73e8', 
    fontWeight: '800', 
    fontFamily: 'sans-serif' 
  },
  wifi: { color: '#34a853' },
  subtitle: { 
    color: '#666', 
    marginBottom: '25px', 
    fontSize: '1rem',
    lineHeight: '1.5'
  },
  warningBanner: {
    background: '#fff3cd',
    color: '#856404',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '0.9rem',
    border: '1px solid #ffeaa7'
  },
  form: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '15px' 
  },
  input: { 
    padding: '16px', 
    borderRadius: '12px', 
    border: '2px solid #e0e0e0', 
    fontSize: '1rem',
    transition: 'border 0.3s',
    outline: 'none'
  },
  button: { 
    padding: '18px', 
    borderRadius: '12px', 
    border: 'none', 
    background: '#1a73e8', 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: '1.1rem', 
    cursor: 'pointer',
    transition: 'background 0.3s'
  },
  successZone: { textAlign: 'center' },
  successText: { 
    color: '#34a853', 
    fontWeight: 'bold', 
    fontSize: '1.3rem', 
    marginBottom: '10px' 
  },
  welcomeText: {
    color: '#666',
    fontSize: '1rem',
    marginBottom: '20px'
  },
  videoContainer: { 
    borderRadius: '15px', 
    overflow: 'hidden', 
    border: '2px solid #e0e0e0',
    marginBottom: '20px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
  },
  iframe: { 
    width: '100%', 
    height: '350px', 
    border: 'none' 
  },
  authBtn: { 
    width: '100%',
    padding: '20px', 
    background: '#34a853', 
    color: 'white', 
    border: 'none',
    borderRadius: '12px', 
    fontWeight: 'bold',
    fontSize: '1.2rem',
    cursor: 'pointer',
    transition: 'background 0.3s'
  },
  footer: { 
    marginTop: '30px', 
    fontSize: '0.8rem', 
    color: '#999' 
  },
  debugInfo: {
    marginTop: '15px',
    fontSize: '0.75rem',
    color: '#d93025',
    fontStyle: 'italic'
  }
};

export default App;