'use client';

import { useState, useRef } from 'react';
import styles from './RouteSubmissionForm.module.css';
import { Send, CheckCircle, Image as ImageIcon, X } from 'lucide-react';

export default function RouteSubmissionForm() {
  const [submitted, setSubmitted] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate submission
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages(prev => {
        const combined = [...prev, ...newFiles].slice(0, 5);
        return combined;
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  if (submitted) {
    return (
      <div className={styles.success}>
        <CheckCircle size={48} className={styles.successIcon} />
        <h3>MERCI !</h3>
        <p>Votre itinéraire a été envoyé pour validation. Il apparaîtra bientôt sur RunVaucluse.</p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.inputGroup}>
        <label>NOM DE L&apos;ITINÉRAIRE</label>
        <input type="text" placeholder="Ex: Le tour des Dentelles de Montmirail" required />
      </div>

      <div className={styles.row}>
        <div className={styles.inputGroup}>
          <label>DISTANCE (KM)</label>
          <input type="number" step="0.1" placeholder="Ex: 15.5" required />
        </div>
        <div className={styles.inputGroup}>
          <label>DÉLEVELÉ (D+)</label>
          <input type="number" placeholder="Ex: 600" required />
        </div>
      </div>

      <div className={styles.inputGroup}>
        <label>LIEN GPX / STRAVA / KOMOOT</label>
        <input type="url" placeholder="https://www.strava.com/routes/..." required />
      </div>

      <div className={styles.inputGroup}>
        <label>PHOTOS (MAX 5)</label>
        <div className={styles.imageUploadArea} onClick={() => fileInputRef.current?.click()}>
          <ImageIcon size={24} />
          <span>{images.length > 0 ? `${images.length} photo(s) sélectionnée(s)` : "Cliquez pour ajouter des photos"}</span>
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleImageChange}
            multiple 
            accept="image/*" 
            style={{ display: 'none' }} 
          />
        </div>
        
        {images.length > 0 && (
          <div className={styles.imagePreviewGrid}>
            {images.map((img, index) => (
              <div key={index} className={styles.previewItem}>
                <div className={styles.previewName}>{img.name.substring(0, 10)}...</div>
                <button type="button" onClick={() => removeImage(index)} className={styles.removeBtn}>
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.inputGroup}>
        <label>DESCRIPTION & CONSEILS</label>
        <textarea rows={4} placeholder="Parlez-nous des points d'intérêt, de la difficulté..."></textarea>
      </div>

      <button type="submit" className={styles.submitBtn}>
        ENVOYER L&apos;ITINÉRAIRE <Send size={16} />
      </button>
    </form>
  );
}
