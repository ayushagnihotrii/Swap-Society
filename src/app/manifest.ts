import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'SwapSociety',
        short_name: 'SwapSociety',
        description: 'The Gen Z student marketplace. Rent or buy from university students near you.',
        start_url: '/',
        display: 'standalone',
        background_color: '#2D274B',
        theme_color: '#9787F3',
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
