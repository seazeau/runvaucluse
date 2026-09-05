export default function LogoIcon({ className, size = 32 }: { className?: string, size?: number | string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      {/* Anneau Écusson Officiel */}
      <circle cx="24" cy="24" r="21" stroke="currentColor" strokeWidth="3" />
      
      {/* Tête de l'athlète */}
      <circle cx="28" cy="13" r="3" fill="currentColor" />
      
      {/* Buste formant la boucle du R */}
      <path 
        d="M 18 19 C 22 16 28 16 30 20 C 31 23 28 26 22 26" 
        stroke="currentColor" 
        strokeWidth="3.5" 
        strokeLinecap="round" 
      />
      
      {/* Foulée dynamique formant le V */}
      <path 
        d="M 15 34 L 22 26 L 31 34" 
        stroke="currentColor" 
        strokeWidth="3.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  );
}
