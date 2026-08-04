import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'URBATEAM | Site en construction',
  description: 'Notre nouveau site internet est en cours de création. À très vite !',
  robots: {
    index: false,
    follow: false,
  },
};

export default function EnConstructionPage() {
  return (
    <div style={styles.container}>
      <div style={styles.backgroundGlow1} />
      <div style={styles.backgroundGlow2} />
      
      <main style={styles.card}>
        <div style={styles.logoWrapper}>
          <Image
            src="/logo-urbateam.svg"
            alt="URBATEAM"
            width={260}
            height={85}
            priority
            style={{ height: 'auto', width: 'auto', maxHeight: '75px' }}
          />
        </div>

        <div style={styles.badge}>
          <span style={styles.badgeDot} />
          Site en préparation
        </div>

        <h1 style={styles.title}>
          Notre nouveau site arrive <span style={styles.highlight}>bientôt</span>
        </h1>

        <p style={styles.description}>
          Le cabinet <strong>URBATEAM</strong>{' '}peaufine son nouvel espace web pour mieux vous accompagner
          dans l&apos;ensemble de vos projets d&apos;expertise foncière, de topographie et d&apos;aménagement du territoire.
        </p>

        <div style={styles.infoGrid}>
          <div style={styles.infoBox}>
            <h3 style={styles.infoTitle}>📍 Agence Saint-Renan</h3>
            <p style={styles.infoText}>Saint-Renan (Finistère Nord)</p>
          </div>

          <div style={styles.infoBox}>
            <h3 style={styles.infoTitle}>📍 Agence Douarnenez</h3>
            <p style={styles.infoText}>Douarnenez (Finistère Sud)</p>
          </div>
        </div>

        <div style={styles.actions}>
          <a href="mailto:contact@urbateam.fr" style={styles.primaryBtn}>
            ✉️ Nous contacter par email
          </a>
          <Link href="/admin" style={styles.secondaryBtn}>
            🔐 Espace Administration
          </Link>
        </div>

        <footer style={styles.footer}>
          &copy; {new Date().getFullYear()} URBATEAM — Géomètres-Experts &amp; Urbanistes
        </footer>
      </main>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fbf8f7', // --warm-white
    fontFamily: 'var(--font-montserrat), sans-serif',
    color: '#3c3c3c', // --secondary-color
    padding: '24px',
    boxSizing: 'border-box',
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundGlow1: {
    position: 'absolute',
    top: '-10%',
    left: '-10%',
    width: '50vw',
    height: '50vw',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(193, 223, 196, 0.45) 0%, rgba(251, 248, 247, 0) 70%)',
    pointerEvents: 'none',
  },
  backgroundGlow2: {
    position: 'absolute',
    bottom: '-10%',
    right: '-10%',
    width: '50vw',
    height: '50vw',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(235, 219, 205, 0.55) 0%, rgba(251, 248, 247, 0) 70%)',
    pointerEvents: 'none',
  },
  card: {
    position: 'relative',
    zIndex: 10,
    width: '100%',
    maxWidth: '680px',
    backgroundColor: '#ffffff',
    border: '1px solid rgba(121, 160, 129, 0.25)',
    borderRadius: '24px',
    padding: '48px 40px',
    textAlign: 'center',
    boxShadow: '0 20px 60px -10px rgba(60, 60, 60, 0.08)',
    boxSizing: 'border-box',
  },
  logoWrapper: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '28px',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 18px',
    borderRadius: '9999px',
    backgroundColor: '#ebdbcd', // --beige
    color: '#3c3c3c',
    fontSize: '0.875rem',
    fontWeight: '600',
    marginBottom: '24px',
    letterSpacing: '0.025em',
  },
  badgeDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#79a081', // --primary-color
    boxShadow: '0 0 6px #79a081',
  },
  title: {
    fontFamily: 'var(--font-righteous), cursive',
    fontWeight: 400,
    fontSize: '2.25rem',
    lineHeight: '1.25',
    marginBottom: '20px',
    color: '#79a081', // Vert Urbateam
    letterSpacing: '-0.01em',
  },
  highlight: {
    color: '#3c3c3c',
    textDecoration: 'underline',
    textDecorationColor: '#d6b99f', // Kraft
    textUnderlineOffset: '6px',
  },
  description: {
    fontSize: '1.05rem',
    lineHeight: '1.7',
    color: '#555555',
    marginBottom: '36px',
    maxWidth: '560px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '16px',
    marginBottom: '36px',
    textAlign: 'left',
  },
  infoBox: {
    backgroundColor: '#fbf8f7', // --warm-white
    border: '1px solid rgba(214, 185, 159, 0.4)', // Kraft border
    borderRadius: '16px',
    padding: '18px 20px',
  },
  infoTitle: {
    fontFamily: 'var(--font-righteous), cursive',
    fontWeight: 400,
    fontSize: '1.05rem',
    color: '#79a081',
    marginBottom: '6px',
  },
  infoText: {
    fontSize: '0.875rem',
    color: '#666666',
    margin: 0,
  },
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '14px',
    justifyContent: 'center',
    marginBottom: '32px',
  },
  primaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '14px 28px',
    borderRadius: '12px',
    backgroundColor: '#79a081', // Vert Urbateam
    color: '#ffffff',
    fontWeight: '700',
    fontSize: '0.95rem',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 14px rgba(121, 160, 129, 0.3)',
  },
  secondaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '14px 24px',
    borderRadius: '12px',
    backgroundColor: '#ebdbcd', // Beige
    color: '#3c3c3c',
    fontWeight: '600',
    fontSize: '0.95rem',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    border: '1px solid rgba(214, 185, 159, 0.5)',
  },
  footer: {
    fontSize: '0.8rem',
    color: '#888888',
    borderTop: '1px solid #ebdbcd',
    paddingTop: '20px',
  },
};
