import type { Metadata, Viewport } from "next";
import "./globals.css";
import Script from "next/script";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: "RunVaucluse | Course Vaucluse, Running & Calendrier 2026",
    template: "%s | RunVaucluse"
  },
  description: "Le guide ultime de la course à pied en Vaucluse (84). Calendrier complet 2026 des trails, marathons et running. Résultats, clubs et itinéraires en Provence.",
  keywords: [
    "course vaucluse", 
    "running vaucluse", 
    "course à pied vaucluse", 
    "trail vaucluse 2026", 
    "calendrier running 84", 
    "marathon vaucluse", 
    "trail ventoux", 
    "challenge vauclusien", 
    "résultats course vaucluse"
  ],
  authors: [{ name: "RunVaucluse Team" }],
  creator: "RunVaucluse",
  publisher: "RunVaucluse",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://runvaucluse.fr'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/favicon.ico?v=2', sizes: 'any' },
      { url: '/icon.svg?v=2', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico?v=2',
    apple: '/apple-touch-icon.png?v=2',
  },

  openGraph: {
    title: "RunVaucluse | Le Calendrier Officiel des Courses en Vaucluse",
    description: "Le calendrier moderne et complet des trails et courses sur route en Vaucluse (84). Inscrivez-vous aux plus belles épreuves du Géant de Provence.",
    url: 'https://runvaucluse.fr',
    siteName: 'RunVaucluse',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'RunVaucluse - Calendrier des courses',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "RunVaucluse | Courses & Trails en Vaucluse",
    description: "Le calendrier 2026 des plus belles épreuves de course à pied du Vaucluse.",
    images: ['/images/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        {/* Google Tag Manager */}
        <Script id="gtm-script" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-TZ6FN9LH');`}
        </Script>
        
        {/* JSON-LD Structured Data for Organization & Search */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "RunVaucluse",
              "url": "https://runvaucluse.fr",
              "logo": "https://runvaucluse.fr/icon.svg",
              "description": "Le calendrier officiel des courses à pied et trails en Vaucluse (84).",
              "sameAs": [
                "https://www.instagram.com/runvaucluse",
                "https://www.facebook.com/runvaucluse"
              ]
            }),
          }}
        />
      </head>
      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe 
            src="https://www.googletagmanager.com/ns.html?id=GTM-TZ6FN9LH"
            height="0" 
            width="0" 
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        <Navbar />
        <main>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
