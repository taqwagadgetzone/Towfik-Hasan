import { Check } from 'lucide-react';
import React, { useState } from 'react';
import { SiteConfig } from '../../types/cms';
import { ContactButtonsStrip } from './ContactButtonsStrip';

interface StorefrontFooterProps {
  config: SiteConfig;
  onNavigate: (target: string) => void;
}

export function StorefrontFooter({ config, onNavigate }: StorefrontFooterProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const { footer, theme, contact } = config;

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
  };

  if (theme.footerLayout === 'minimal') {
    return (
      <footer
        style={{
          backgroundColor: theme.surfaceColor,
          color: theme.textColor,
          fontFamily: `"${theme.bodyFont}", sans-serif`,
        }}
        className="border-t border-black/10 py-10 px-4 sm:px-6"
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <p className="font-bold text-base" style={{ fontFamily: `"${theme.headingFont}", sans-serif` }}>
              {config.siteName}
            </p>
            <p className="text-xs opacity-70">{footer.copyrightText}</p>
          </div>
          <div className="flex flex-wrap gap-5 text-sm">
            {[...(footer.quickLinks || []), ...(footer.policyLinks || [])].map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => onNavigate(link.target)}
                className="opacity-75 hover:opacity-100 transition-opacity whitespace-nowrap"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer
      style={{
        backgroundColor: theme.footerLayout === 'editorial' ? theme.primaryColor : theme.surfaceColor,
        color: theme.footerLayout === 'editorial' ? '#F8FAFC' : theme.textColor,
        fontFamily: `"${theme.bodyFont}", sans-serif`,
      }}
      className="border-t border-black/10 py-14 px-4 sm:px-6"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-5 space-y-4">
          <h3
            className="text-xl font-bold tracking-tight"
            style={{ fontFamily: `"${theme.headingFont}", sans-serif` }}
          >
            {config.siteName}
          </h3>
          <p className="text-sm opacity-75 leading-relaxed max-w-md">{footer.aboutText}</p>
          {footer.showSocialLinks && <ContactButtonsStrip contact={contact} compact />}
        </div>

        <div className="md:col-span-2 space-y-3">
          <h4 className="text-xs font-semibold tracking-wider uppercase opacity-65">Explore</h4>
          <ul className="space-y-2 text-sm">
            {(footer.quickLinks || []).map((link) => (
              <li key={link.id}>
                <button
                  type="button"
                  onClick={() => onNavigate(link.target)}
                  className="opacity-80 hover:opacity-100 transition-opacity text-left"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2 space-y-3">
          <h4 className="text-xs font-semibold tracking-wider uppercase opacity-65">Policies</h4>
          <ul className="space-y-2 text-sm">
            {(footer.policyLinks || []).map((link) => (
              <li key={link.id}>
                <button
                  type="button"
                  onClick={() => onNavigate(link.target)}
                  className="opacity-80 hover:opacity-100 transition-opacity text-left"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-3 space-y-3">
          {footer.showNewsletter && (
            <>
              <h4 className="text-xs font-semibold tracking-wider uppercase opacity-65">
                Restock Updates
              </h4>
              {subscribed ? (
                <div className="flex items-center gap-2 text-sm font-medium py-2">
                  <Check className="w-4 h-4" />
                  <span>Subscribed to hardware alerts.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="flex-1 min-w-0 px-3 py-2 text-sm rounded-md border border-current/20 bg-transparent focus:outline-none focus:ring-1 focus:ring-current"
                  />
                  <button
                    type="submit"
                    style={{
                      backgroundColor:
                        theme.footerLayout === 'editorial'
                          ? theme.secondaryColor
                          : theme.buttonBgColor,
                      color: theme.buttonTextColor,
                    }}
                    className="px-4 py-2 text-xs font-semibold rounded-md whitespace-nowrap shrink-0 hover:opacity-90"
                  >
                    Join
                  </button>
                </form>
              )}
            </>
          )}
          {contact.address?.enabled && contact.address?.value && (
            <p className="text-xs opacity-70 pt-2">{contact.address.value}</p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-current/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs opacity-65">
        <p>{footer.copyrightText}</p>
        <p>{config.tagline}</p>
      </div>
    </footer>
  );
}
