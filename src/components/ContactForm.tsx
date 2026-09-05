'use client';

import { useState, useRef } from 'react';
import styles from './ContactForm.module.css';
import { Send, Paperclip, UploadCloud, X, FileText, CheckCircle2, Image as ImageIcon } from 'lucide-react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    message: ''
  });

  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  };

  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setSubmitted(false);

    if (selectedFile.type.startsWith('image/')) {
      const url = URL.createObjectURL(selectedFile);
      setFilePreview(url);
    } else {
      setFilePreview(null);
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
    }
    setFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const subject = encodeURIComponent(
      `Contact RunVaucluse - ${formData.prenom} ${formData.nom}${file ? ` (avec pièce jointe : ${file.name})` : ''}`
    );

    const attachmentNote = file 
      ? `\n\n[PIÈCE JOINTE PRÉVUE]\nFichier : ${file.name} (${formatFileSize(file.size)})\n⚠️ Pensez à attacher ce fichier à cet email.` 
      : '';

    const body = encodeURIComponent(
      `Nom : ${formData.nom}\nPrénom : ${formData.prenom}\nEmail : ${formData.email}${attachmentNote}\n\nMessage :\n${formData.message}`
    );

    window.location.href = `mailto:contact@runvaucluse.fr?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="prenom">PRÉNOM</label>
          <input 
            type="text" 
            id="prenom" 
            name="prenom" 
            placeholder="Jean" 
            required 
            value={formData.prenom}
            onChange={handleChange}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="nom">NOM</label>
          <input 
            type="text" 
            id="nom" 
            name="nom" 
            placeholder="Dupont" 
            required 
            value={formData.nom}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="email">EMAIL</label>
        <input 
          type="email" 
          id="email" 
          name="email" 
          placeholder="jean.dupont@exemple.com" 
          required 
          value={formData.email}
          onChange={handleChange}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="message">MESSAGE</label>
        <textarea 
          id="message" 
          name="message" 
          placeholder="Précisez votre course, les modifications souhaitées, etc..." 
          rows={4} 
          required 
          value={formData.message}
          onChange={handleChange}
        />
      </div>

      {/* PIÈCE JOINTE (AFFICHE / RÈGLEMENT) */}
      <div className={styles.field}>
        <label>
          AFFICHE OU PIÈCE JOINTE <span className={styles.optionalBadge}>(FACULTATIF)</span>
        </label>
        
        <input 
          ref={fileInputRef}
          type="file" 
          id="fileAttachment" 
          accept="image/*,.pdf,.gpx"
          className={styles.hiddenFileInput}
          onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
        />

        {!file ? (
          <div 
            className={`${styles.dropzone} ${isDragging ? styles.dropzoneActive : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
          >
            <div className={styles.dropzoneIcon}>
              <UploadCloud size={28} />
            </div>
            <div className={styles.dropzoneText}>
              <span className={styles.dropzoneMain}>Cliquez ou glissez l&apos;affiche de votre course</span>
              <span className={styles.dropzoneSub}>JPG, PNG, WEBP ou PDF (max 15 Mo)</span>
            </div>
          </div>
        ) : (
          <div className={styles.fileSelectedCard}>
            <div className={styles.fileInfoGroup}>
              {filePreview ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={filePreview} alt="Aperçu affiche" className={styles.thumbPreview} />
              ) : (
                <div className={styles.fileIconBox}>
                  {file.type === 'application/pdf' ? <FileText size={24} /> : <Paperclip size={24} />}
                </div>
              )}
              <div className={styles.fileMeta}>
                <span className={styles.fileName}>{file.name}</span>
                <span className={styles.fileSize}>{formatFileSize(file.size)}</span>
              </div>
            </div>

            <div className={styles.fileActions}>
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className={styles.fileChangeBtn}
                title="Remplacer le fichier"
              >
                Changer
              </button>
              <button 
                type="button" 
                onClick={handleRemoveFile} 
                className={styles.fileRemoveBtn}
                title="Supprimer la pièce jointe"
                aria-label="Supprimer la pièce jointe"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {submitted && (
        <div className={styles.submissionAlert}>
          <CheckCircle2 size={20} color="#2b6cb0" className={styles.alertIcon} />
          <div>
            <strong>Votre client de messagerie s&apos;est ouvert !</strong>
            <p>
              {file ? (
                <>N&apos;oubliez pas d&apos;attacher directement votre fichier <strong>«&nbsp;{file.name}&nbsp;»</strong> dans l&apos;email avant de cliquer sur Envoyer.</>
              ) : (
                <>Vérifiez et confirmez l&apos;envoi de votre email vers <strong>contact@runvaucluse.fr</strong>.</>
              )}
            </p>
          </div>
        </div>
      )}

      <button type="submit" className={styles.submitBtn}>
        ENVOYER LE MESSAGE <Send size={18} />
      </button>
    </form>
  );
}

