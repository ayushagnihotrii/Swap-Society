import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'SwapSociety',
        short_name: 'SwapSociety',
        description: 'The Gen Z student marketplace. Rent or buy from university students near you.',
        start_url: '/',
        display: 'standalone',
        background_color: '#0A0A0F',
        theme_color: '#E94560',
        icons: [
            {
                src: '/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    };
}
