import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Video,
  Youtube,
} from 'lucide-react';
import { ContactSettings } from '../../types/cms';

interface ContactButtonsStripProps {
  contact: ContactSettings;
  compact?: boolean;
}

function normalizeWhatsApp(val: string): string {
  const digits = val.replace(/[^\d]/g, '');
  return `https://wa.me/${digits}`;
}

export function ContactButtonsStrip({ contact, compact = false }: ContactButtonsStripProps) {
  const channels = [
    {
      key: 'phone',
      enabled: contact.phone?.enabled,
      label: contact.phone?.label || 'Phone',
      value: contact.phone?.value,
      href: `tel:${(contact.phone?.value || '').replace(/\s+/g, '')}`,
      icon: Phone,
    },
    {
      key: 'whatsapp',
      enabled: contact.whatsapp?.enabled,
      label: contact.whatsapp?.label || 'WhatsApp',
      value: contact.whatsapp?.value,
      href: normalizeWhatsApp(contact.whatsapp?.value || ''),
      icon: MessageCircle,
    },
    {
      key: 'messenger',
      enabled: contact.messenger?.enabled,
      label: contact.messenger?.label || 'Messenger',
      value: contact.messenger?.value,
      href: contact.messenger?.value || '#',
      icon: Send,
    },
    {
      key: 'facebook',
      enabled: contact.facebook?.enabled,
      label: contact.facebook?.label || 'Facebook',
      value: contact.facebook?.value,
      href: contact.facebook?.value || '#',
      icon: Facebook,
    },
    {
      key: 'instagram',
      enabled: contact.instagram?.enabled,
      label: contact.instagram?.label || 'Instagram',
      value: contact.instagram?.value,
      href: contact.instagram?.value || '#',
      icon: Instagram,
    },
    {
      key: 'tiktok',
      enabled: contact.tiktok?.enabled,
      label: contact.tiktok?.label || 'TikTok',
      value: contact.tiktok?.value,
      href: contact.tiktok?.value || '#',
      icon: Video,
    },
    {
      key: 'youtube',
      enabled: contact.youtube?.enabled,
      label: contact.youtube?.label || 'YouTube',
      value: contact.youtube?.value,
      href: contact.youtube?.value || '#',
      icon: Youtube,
    },
    {
      key: 'email',
      enabled: contact.email?.enabled,
      label: contact.email?.label || 'Email',
      value: contact.email?.value,
      href: `mailto:${contact.email?.value || ''}`,
      icon: Mail,
    },
  ].filter((c) => c.enabled && c.value);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2.5">
        {channels.map((ch) => {
          const Icon = ch.icon;
          const isExternal = ch.href.startsWith('http');
          return (
            <a
              key={ch.key}
              href={ch.href}
              target={isExternal ? '_blank' : undefined}
              rel={isExternal ? 'noopener noreferrer' : undefined}
              className={`inline-flex items-center gap-2 border border-current/20 rounded-md hover:bg-current/5 transition-colors whitespace-nowrap ${
                compact ? 'px-3 py-1.5 text-xs font-medium' : 'px-4 py-2.5 text-sm font-medium'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{ch.label}</span>
            </a>
          );
        })}
      </div>

      {contact.address?.enabled && contact.address?.value && !compact && (
        <div className="flex items-start gap-2.5 text-sm opacity-80 pt-1">
          <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{contact.address.value}</span>
        </div>
      )}
    </div>
  );
}
