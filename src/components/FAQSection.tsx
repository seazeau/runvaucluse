'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldCheck } from 'lucide-react';
import styles from './FAQSection.module.css';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "Quel justificatif médical ou PPS est obligatoire pour courir en Vaucluse en 2026 ?",
    answer: "Pour toute la saison 2026, la Fédération Française d'Athlétisme (FFA) a généralisé le Parcours Prévention Santé (PPS) qui remplace le certificat médical pour tous les coureurs majeurs non-licenciés. Il vous suffit d'effectuer votre attestation gratuitement en 3 minutes sur pps.athle.fr moins de 3 mois avant le départ de votre épreuve."
  },
  {
    question: "Quels sont les trails incontournables à courir dans le Vaucluse (84) ?",
    answer: "Le département offre des terrains exceptionnels : le mythique Trail du Ventoux et le Grand Raid Ventoux (GRV) à Malaucène et Bédoin, la Traversée des Dentelles de Montmirail à Gigondas, le Trail de Beaumes-de-Venise, le Trail de Venasque ou encore les épreuves sauvages des Monts de Vaucluse et du Luberon."
  },
  {
    question: "Où consulter les résultats et classements officiels des courses du département ?",
    answer: "RunVaucluse centralise tous les classements officiels du 84 dans sa section Résultats dès la fin des épreuves du week-end. Vous pouvez également consulter votre historique complet, vos kilomètres cumulés et votre carte finisher sur votre Fiche Coureur."
  },
  {
    question: "Comment ajouter ou modifier une course sur le calendrier officiel ?",
    answer: "Vous êtes organisateur d'un trail, d'un 10 km, semi ou foulée festive en Vaucluse ? Utilisez notre formulaire organisateur disponible en bas de page d'accueil pour nous envoyer vos dates, règlements ou affiches. Le référencement est 100% gratuit pour faire rayonner les épreuves provençales."
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };

  return (
    <section className={styles.faqSection} id="faq">
      {/* Google FAQPage Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="container">
        <div className={styles.faqHeader}>
          <div className={styles.faqBadge}>
            <HelpCircle size={15} color="#c05621" />
            <span>GUIDE DU COUREUR EN VAUCLUSE</span>
          </div>
          <h2 className={styles.faqTitle}>QUESTIONS FRÉQUENTES</h2>
          <p className={styles.faqSubtitle}>
            Tout ce qu&apos;il faut savoir pour préparer vos dossards et courir en Provence en 2026.
          </p>
        </div>

        <div className={styles.faqList}>
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index} 
                className={`${styles.faqCard} ${isOpen ? styles.faqCardOpen : ''}`}
              >
                <button 
                  className={styles.faqQuestionBtn} 
                  onClick={() => toggleFAQ(index)}
                  aria-expanded={isOpen}
                >
                  <span className={styles.faqQuestionText}>{faq.question}</span>
                  <ChevronDown 
                    size={20} 
                    className={`${styles.faqIcon} ${isOpen ? styles.faqIconRotated : ''}`} 
                  />
                </button>
                {isOpen && (
                  <div className={styles.faqAnswer}>
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
