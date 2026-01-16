import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'

function Page() {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);

  // Fonction pour envoyer les données et prévenir le routeur
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Enregistrement dans Supabase
      const { error } = await supabase
        .from('wifi_users') // Assure-toi que la table existe
        .insert([{ 
            name: formData.name, 
            email: formData.email,
            created_at: new Date() 
        }]);

      if (error) throw error;

      // 2. ENVOI DU SIGNAL AU ROUTEUR (IMPORTANT)
      // On utilise postMessage pour dire au script local (HTTP) de lancer le timer
      if (window.parent) {
        window.parent.postMessage("NEKA_FORM_SUCCESS", "*");
        console.log("Signal envoyé au routeur local");
      }

    } catch (err) {
      alert("Erreur lors de l'enregistrement : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.formContainer}>
      <form onSubmit={handleRegister}>
        <input 
          type="text" 
          placeholder="Nom complet"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required 
        />
        <input 
          type="email" 
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required 
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Chargement...' : 'Valider mes informations'}
        </button>
      </form>
    </div>
  )
}

export default Page