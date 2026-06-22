/**
 * FooterV23.tsx — Footer Section
 * 
 * Displays footer with logo, social links, navigation, and legal links.
 */

import React from 'react';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterProps {
  logo?: string;
  slogan?: string;
  navLinks?: FooterLink[];
  legalLinks?: FooterLink[];
  socialLinks?: Array<{ icon: string; href: string; label: string }>;
}

export function FooterV23({
  logo = "BYSIS",
  slogan = "Votre destination shopping de confiance",
  navLinks = [
    { label: "À propos", href: "#" },
    { label: "Boutiques", href: "#" },
    { label: "Support", href: "#" },
  ],
  legalLinks = [
    { label: "Conditions", href: "#" },
    { label: "Confidentialité", href: "#" },
    { label: "Cookies", href: "#" },
  ],
  socialLinks = [],
}: FooterProps) {
  return (
    <footer className="site-footer">
      {/* Logo and Slogan */}
      <div className="footer-logo">{logo}</div>
      <p className="footer-slogan">{slogan}</p>

      {/* Social Links */}
      {socialLinks.length > 0 && (
        <div className="social-links">
          {socialLinks.map((link, index) => (
            <a
              key={index}
              href={link.href}
              className="social-link"
              title={link.label}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,.14)',
                background: 'rgba(255,255,255,.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                cursor: 'pointer',
                transition: 'all 200ms ease',
                textDecoration: 'none',
              }}
            >
              {link.icon}
            </a>
          ))}
        </div>
      )}

      {/* Navigation Links */}
      {navLinks.length > 0 && (
        <nav className="footer-nav">
          {navLinks.map((link, index) => (
            <a key={index} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
      )}

      {/* Legal Links */}
      {legalLinks.length > 0 && (
        <div className="legal-links">
          {legalLinks.map((link, index) => (
            <a key={index} href={link.href}>
              {link.label}
            </a>
          ))}
        </div>
      )}

      {/* Copyright */}
      <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,.08)', fontSize: '12px', color: '#8996a3' }}>
        © 2026 Bysis. Tous droits réservés.
      </div>
    </footer>
  );
}

export default FooterV23;
