import React, { useState, useEffect } from 'react';

function App() {
  const [fasParams, setFasParams] = useState("");
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [isFormValid, setIsFormValid] = useState(false);
  const [adCountdown, setAdCountdown] = useState(10);
  const [canActivate, setCanActivate] = useState(false);
  const [error, setError] = useState("");
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    // Récupérer les paramètres FAS de l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const fas = urlParams.get('fas');
    
    if (fas) {
      setFasParams(`fas=${fas}`);
      console.log("✅ Paramètres FAS détectés:", fas);
    } else {
      console.warn("⚠️ Aucun paramètre FAS détecté - Mode démo");
      setError("Mode test local - Connectez-vous au WiFi NEKA pour l'activation réelle");
    }
  }, []);

  // Vérifier la validité du formulaire en temps réel
  useEffect(() => {
    const nameValid = formData.name.trim().length >= 3;
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
    setIsFormValid(nameValid && emailValid);
  }, [formData]);

  // Compte à rebours uniquement si le formulaire est valide
  useEffect(() => {
    if (isFormValid && adCountdown > 0) {
      const timer = setTimeout(() => {
        setAdCountdown(adCountdown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (isFormValid && adCountdown === 0) {
      setCanActivate(true);
    }
  }, [isFormValid, adCountdown]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setShowWarning(false);
  };

  const handleActivateInternet = () => {
    if (!isFormValid) {
      setShowWarning(true);
      alert("⚠️ Veuillez remplir correctement tous les champs avant d'activer Internet !");
      return;
    }

    if (!canActivate) {
      alert(`⏳ Veuillez patienter encore ${adCountdown} secondes pour voir la publicité complète.`);
      return;
    }

    if (!fasParams) {
      alert("❌ Erreur: Paramètres d'authentification manquants. Reconnectez-vous au WiFi NEKA.");
      return;
    }
    
    console.log("📤 Redirection vers authentification avec:", formData);
    
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

        {/* FORMULAIRE D'INSCRIPTION */}
        {/* <div style={styles.formSection}>
          <p style={styles.sectionTitle}>📋 Inscription Requise</p>
          <p style={styles.instruction}>
            Remplissez ces champs <strong>correctement</strong> pour démarrer le compteur
          </p>
          
          <div style={styles.form}>
            <input 
              type="text" 
              name="name"
              placeholder="Nom complet (min. 3 caractères)" 
              required 
              style={{
                ...styles.input,
                borderColor: showWarning && formData.name.length < 3 ? '#d93025' : '#e0e0e0'
              }}
              value={formData.name}
              onChange={handleInputChange}
            />
            
            <input 
              type="email" 
              name="email"
              placeholder="Adresse Email valide" 
              required 
              style={{
                ...styles.input,
                borderColor: showWarning && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? '#d93025' : '#e0e0e0'
              }}
              value={formData.email}
              onChange={handleInputChange}
            />

            {isFormValid ? (
              <div style={styles.validBadge}>✅ Formulaire valide - Compteur actif</div>
            ) : (
              <div style={styles.invalidBadge}>⏸️ Remplissez correctement pour démarrer</div>
            )}
          </div>
        </div> */}

        {/* ZONE DE PUBLICITÉ */}
        {/* <div style={styles.adContainer}>
          <div style={styles.adBadge}>📢 PUBLICITÉ SPONSORISÉE</div>
          <p style={styles.adText}>
            <strong>Découvrez NEKA en visite virtuelle 3D</strong><br/>
            Explorez nos installations pendant la préparation de votre connexion
          </p>
          
          <div style={styles.countdownCircle}>
            <div style={styles.countdownNumber}>
              {isFormValid ? adCountdown : '⏸'}
            </div>
            <div style={styles.countdownLabel}>
              {isFormValid ? 'secondes' : 'en pause'}
            </div>
          </div>
          
          <div style={styles.progressBarContainer}>
            <div 
              style={{
                ...styles.progressBarFill,
                width: isFormValid ? `${((10 - adCountdown) / 10) * 100}%` : '0%'
              }}
            />
          </div> */}

          {/* {!isFormValid && (
            <p style={styles.pauseMessage}>
              ⚠️ Le compteur démarrera automatiquement dès que le formulaire sera valide
            </p>
          )} */}
        </div>

        {/* VISITE 3D */}
        {/* <div style={styles.videoContainer}>
          <iframe 
            src="https://visite-3-d-1yfd.vercel.app/" 
            style={styles.iframe}
            title="Visite 3D NEKA"
            allow="accelerometer; gyroscope"
          />
        </div> */}

        {/* BOUTON D'ACTIVATION */}
        {/* <button 
          onClick={handleActivateInternet}
          style={{
            ...styles.authBtn,
            opacity: (canActivate && isFormValid) ? 1 : 0.5,
            cursor: (canActivate && isFormValid) ? 'pointer' : 'not-allowed',
            background: (canActivate && isFormValid) ? '#34a853' : '#9e9e9e'
          }}
          disabled={!canActivate || !isFormValid}
        >
          {!isFormValid ? (
            <>🔒 Remplissez le formulaire d'abord</>
          ) : canActivate ? (
            <>🚀 ACTIVER INTERNET MAINTENANT</>
          ) : (
            <>⏳ Activation dans {adCountdown}s...</>
          )}
        </button>
        
        {canActivate && isFormValid && (
          <div style={styles.readyBox}>
            <p style={styles.readyText}>
              ✅ Parfait <strong>{formData.name}</strong> ! Vous pouvez maintenant activer votre connexion Internet.
            </p>
          </div>
        )} */}
        
        <p style={styles.footer}>
          Projet 2026-2027 • NEKA WiFi
        </p>
      {/* </div> */}
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
    maxWidth: '600px', 
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
  warningBanner: {
    background: '#fff3cd',
    color: '#856404',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '0.9rem',
    border: '1px solid #ffeaa7'
  },
  
  // Section Formulaire
  formSection: {
    background: '#f8f9fa',
    padding: '25px',
    borderRadius: '15px',
    marginBottom: '20px',
    border: '2px solid #e0e0e0'
  },
  sectionTitle: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#1a73e8',
    marginBottom: '10px'
  },
  instruction: {
    fontSize: '0.95rem',
    color: '#666',
    marginBottom: '20px',
    lineHeight: '1.5'
  },
  form: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '12px' 
  },
  input: { 
    padding: '16px', 
    borderRadius: '12px', 
    border: '2px solid #e0e0e0', 
    fontSize: '1rem',
    transition: 'all 0.3s',
    outline: 'none'
  },
  validBadge: {
    background: '#d4edda',
    color: '#155724',
    padding: '10px',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    border: '1px solid #c3e6cb'
  },
  invalidBadge: {
    background: '#fff3cd',
    color: '#856404',
    padding: '10px',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    border: '1px solid #ffeaa7'
  },
  
  // Zone Publicité
  adContainer: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '30px 20px',
    borderRadius: '15px',
    marginBottom: '20px',
    color: 'white',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
  },
  adBadge: {
    display: 'inline-block',
    background: 'rgba(255,255,255,0.3)',
    padding: '8px 20px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    marginBottom: '15px',
    letterSpacing: '1px'
  },
  adText: {
    fontSize: '1.1rem',
    lineHeight: '1.6',
    marginBottom: '20px',
    fontWeight: '500'
  },
  countdownCircle: {
    width: '120px',
    height: '120px',
    margin: '20px auto',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.2)',
    border: '4px solid white',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
  },
  countdownNumber: {
    fontSize: '3.5rem',
    fontWeight: 'bold',
    lineHeight: '1'
  },
  countdownLabel: {
    fontSize: '0.85rem',
    marginTop: '5px',
    opacity: 0.9
  },
  progressBarContainer: {
    width: '100%',
    height: '8px',
    background: 'rgba(255,255,255,0.3)',
    borderRadius: '10px',
    overflow: 'hidden',
    marginTop: '20px'
  },
  progressBarFill: {
    height: '100%',
    background: 'white',
    transition: 'width 1s linear',
    boxShadow: '0 0 10px rgba(255,255,255,0.5)'
  },
  pauseMessage: {
    marginTop: '15px',
    fontSize: '0.9rem',
    background: 'rgba(255,255,255,0.2)',
    padding: '10px',
    borderRadius: '8px'
  },
  
  // Visite 3D
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
  
  // Bouton
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
    transition: 'all 0.3s',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
  },
  readyBox: {
    background: '#d4edda',
    border: '2px solid #c3e6cb',
    borderRadius: '12px',
    padding: '15px',
    marginTop: '15px'
  },
  readyText: {
    color: '#155724',
    fontWeight: 'bold',
    fontSize: '1rem',
    margin: 0
  },
  footer: { 
    marginTop: '30px', 
    fontSize: '0.8rem', 
    color: '#999' 
  }
};

export default App;