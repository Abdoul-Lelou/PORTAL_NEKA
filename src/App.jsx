import React, { useState, useEffect } from 'react';

function App() {
  const [step, setStep] = useState(1);
  const [params, setParams] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setParams(urlParams.toString());
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setStep(2);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>NEKA <span style={styles.wifi}>WiFi</span></h1>
        
        {step === 1 ? (
          <form onSubmit={handleSubmit} style={styles.form}>
            <p style={styles.subtitle}>Veuillez vous enregistrer pour accéder au réseau</p>
            
            <input type="text" placeholder="Nom complet" required style={styles.input} />
            <input type="email" placeholder="Adresse Email" required style={styles.input} />
            
            <button type="submit" style={styles.button}>
              Continuer vers la visite 3D
            </button>
          </form>
        ) : (
          <div style={styles.successZone}>
            <p style={styles.successText}>✅ Inscription réussie !</p>
            
            <div style={styles.videoContainer}>
               <iframe 
                src="https://visite-3-d-1yfd.vercel.app/" 
                style={styles.iframe}
                title="Visite 3D"
              />
            </div>

            {params ? (
              <a href={`/api/auth?${params}`} style={styles.authBtn}>
                ACTIVER INTERNET MAINTENANT
              </a>
            ) : (
              <p style={styles.error}>Erreur : Reconnectez-vous au WiFi Neka</p>
            )}
          </div>
        )}
        
        <p style={styles.footer}>Projet Campus France 2026-2027</p>
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
    width: '100vw', 
    background: 'linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%)', 
    margin: 0,
    padding: 0, // Mis à 0 pour éviter les décalages
    position: 'fixed',
    top: 0,
    left: 0,
    overflowY: 'auto',
    boxSizing: 'border-box'
  },
  card: { 
    background: 'white', 
    padding: '40px', 
    borderRadius: '24px', 
    boxShadow: '0 20px 40px rgba(0,0,0,0.3)', 
    maxWidth: '450px', 
    width: '90%', // Pour le responsive mobile
    textAlign: 'center',
    margin: '20px auto'
  },
  title: { fontSize: '2.2rem', marginBottom: '10px', color: '#1a73e8', fontWeight: '800', fontFamily: 'sans-serif' },
  wifi: { color: '#34a853' },
  subtitle: { color: '#666', marginBottom: '25px', fontFamily: 'sans-serif' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  input: { padding: '15px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '1rem', outline: 'none' },
  button: { padding: '16px', borderRadius: '12px', border: 'none', background: '#1a73e8', color: 'white', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' },
  successZone: { textAlign: 'center' },
  successText: { color: '#34a853', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '15px' },
  videoContainer: { borderRadius: '15px', overflow: 'hidden', border: '1px solid #eee', background: '#000' },
  iframe: { width: '100%', height: '300px', border: 'none' },
  authBtn: { display: 'block', padding: '18px', background: '#34a853', color: 'white', textDecoration: 'none', borderRadius: '12px', fontWeight: 'bold', marginTop: '20px' },
  footer: { marginTop: '25px', fontSize: '0.75rem', color: '#aaa', fontFamily: 'sans-serif' },
  error: { color: '#d93025', fontSize: '0.8rem', marginTop: '10px' }
};

export default App;