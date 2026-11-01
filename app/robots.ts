import type {MetadataRoute} from 'next';
import {SITE_URL} from '@/lib/seo/site';

// Crawl only public screens (2026-11-01). Member-only and payment screens also carry noindex; media files stay
// fetchable so share previews can load images, while the API itself enforces paid/adult access.
export default function robots():MetadataRoute.Robots{
 return{rules:[{userAgent:'*',allow:['/service/','/api/v1/media/','/og/','/brand/'],disallow:['/api/','/preview/','/design-system','/card','/service/studio','/service/beans','/service/settings','/service/messages','/service/notifications','/service/subscriptions','/service/following','/service/followers','/service/payment-methods','/service/checkout','/service/billing','/service/payment','/service/member/','/service/signup','/service/login','/service/reset-password','/service/screens']}],sitemap:`${SITE_URL}/sitemap.xml`,host:SITE_URL};
}
