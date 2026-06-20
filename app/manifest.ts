import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'VO Tracker · Commercial Intelligence',
    short_name: 'VO Tracker',
    description:
      'AI-assisted variation order tracking and payment register analytics for the HW2 MEP project.',
    start_url: '/intelligence',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#002D56',
    orientation: 'portrait-primary',
    categories: ['business', 'productivity', 'finance'],
    icons: [
      { src: '/rsg-logo.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/firstfix-v2.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
