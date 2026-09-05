'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';
import LogoIcon from './LogoIcon';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const isHome = pathname === '/';

  return (
    <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''} ${isMobileMenuOpen ? styles.mobileOpen : ''}`}>
      <div className={styles.navContainer}>
        <Link href="/" className={styles.logo} onClick={() => setIsMobileMenuOpen(false)}>
          <LogoIcon className={styles.logoIcon} size={28} />
          <span>RUNVAUCLUSE</span>
          <span className={styles.registered}>®</span>
        </Link>

        <div className={`${styles.links} ${isMobileMenuOpen ? styles.linksVisible : ''}`}>
          <Link href={isHome ? "#accueil" : "/"} className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>Accueil</Link>
          <Link href={isHome ? "#calendrier" : "/#calendrier"} className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>Calendrier</Link>
          {/* <Link href="/explorer" className={`${styles.navLink} ${pathname.startsWith('/explorer') ? styles.active : ''}`} onClick={() => setIsMobileMenuOpen(false)}>Explorer</Link> */}
          <Link href="/resultats" className={`${styles.navLink} ${pathname.startsWith('/resultats') ? styles.active : ''}`} onClick={() => setIsMobileMenuOpen(false)}>RÉSULTATS</Link>
          <Link href="/records" className={`${styles.navLink} ${pathname.startsWith('/records') || pathname.startsWith('/wall-of-fame') ? styles.active : ''}`} onClick={() => setIsMobileMenuOpen(false)}>RECORDS</Link>
          <Link href={isHome ? "#clubs" : "/#clubs"} className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>Clubs</Link>
          <Link href={isHome ? "#contact" : "/#contact"} className={styles.navLink} onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>
        </div>

        <button className={styles.mobileToggle} onClick={toggleMobileMenu} aria-label="Toggle menu">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );
}
