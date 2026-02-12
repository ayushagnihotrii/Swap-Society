import { Category, CategoryInfo } from '@/types';

export function formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
}

export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(date);
}

export function timeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    const intervals: [number, string][] = [
        [31536000, 'year'],
        [2592000, 'month'],
        [86400, 'day'],
        [3600, 'hour'],
        [60, 'minute'],
        [1, 'second'],
    ];

    for (const [value, unit] of intervals) {
        const count = Math.floor(seconds / value);
        if (count >= 1) {
            return `${count} ${unit}${count !== 1 ? 's' : ''} ago`;
        }
    }
    return 'just now';
}

export function truncate(str: string, maxLen: number): string {
    if (str.length <= maxLen) return str;
    return str.slice(0, maxLen).trim() + '…';
}

export function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export const CATEGORIES: CategoryInfo[] = [
    { id: 'clothing', label: 'Clothing', icon: '👕', color: '#E94560' },
    { id: 'electronics', label: 'Electronics', icon: '💻', color: '#7B2FF7' },
    { id: 'books', label: 'Books', icon: '📚', color: '#3B82F6' },
    { id: 'shoes', label: 'Shoes', icon: '👟', color: '#00D4AA' },
    { id: 'watches', label: 'Watches', icon: '⌚', color: '#FFB830' },
    { id: 'accessories', label: 'Accessories', icon: '🎒', color: '#FF6B6B' },
    { id: 'furniture', label: 'Furniture', icon: '🪑', color: '#4ECDC4' },
    { id: 'sports', label: 'Sports', icon: '⚽', color: '#45B7D1' },
    { id: 'music', label: 'Music', icon: '🎸', color: '#FF8A65' },
    { id: 'other', label: 'Other', icon: '📦', color: '#9CA3AF' },
];

export function getCategoryInfo(category: Category): CategoryInfo {
    return CATEGORIES.find(c => c.id === category) || CATEGORIES[CATEGORIES.length - 1];
}

// Mock data for development
export function generateMockListings() {
    return [
        {
            id: '1',
            title: 'MacBook Air M2 — Like New',
            description: 'Barely used MacBook Air M2, 8GB RAM, 256GB SSD. Perfect for college work. Comes with charger and original box.',
            images: ['/images/placeholder-laptop.jpg'],
            category: 'electronics' as Category,
            condition: 'like-new' as const,
            listingType: 'both' as const,
            price: 65000,
            rentalDuration: 'month' as const,
            deposit: 10000,
            sellerId: 'user1',
            sellerName: 'Arjun Patel',
            sellerAvatar: '',
            sellerUniversity: 'IIT Delhi',
            sellerRating: 4.8,
            status: 'active' as const,
            views: 234,
            likes: 45,
            createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            id: '2',
            title: 'Nike Air Jordan 1 Retro — Size 9',
            description: 'Classic Jordan 1s in great condition. Worn only a few times. Size UK 9.',
            images: ['/images/placeholder-shoes.jpg'],
            category: 'shoes' as Category,
            condition: 'good' as const,
            listingType: 'sale' as const,
            price: 4500,
            sellerId: 'user2',
            sellerName: 'Priya Sharma',
            sellerAvatar: '',
            sellerUniversity: 'BITS Pilani',
            sellerRating: 4.5,
            status: 'active' as const,
            views: 156,
            likes: 32,
            createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            id: '3',
            title: 'Zara Oversized Denim Jacket',
            description: 'Trendy oversized denim jacket from Zara. Size M. Goes with everything!',
            images: ['/images/placeholder-jacket.jpg'],
            category: 'clothing' as Category,
            condition: 'like-new' as const,
            listingType: 'rent' as const,
            price: 200,
            rentalDuration: 'day' as const,
            deposit: 1000,
            sellerId: 'user3',
            sellerName: 'Rohan Mehta',
            sellerAvatar: '',
            sellerUniversity: 'NIT Trichy',
            sellerRating: 4.2,
            status: 'active' as const,
            views: 89,
            likes: 18,
            createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            id: '4',
            title: 'Engineering Mathematics — Kreyszig 10th Ed',
            description: 'Advanced Engineering Mathematics by Kreyszig. Some highlights but overall in great shape.',
            images: ['/images/placeholder-book.jpg'],
            category: 'books' as Category,
            condition: 'good' as const,
            listingType: 'both' as const,
            price: 350,
            rentalDuration: 'month' as const,
            deposit: 200,
            sellerId: 'user4',
            sellerName: 'Sneha Gupta',
            sellerAvatar: '',
            sellerUniversity: 'VIT Vellore',
            sellerRating: 4.9,
            status: 'active' as const,
            views: 312,
            likes: 67,
            createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            id: '5',
            title: 'Casio G-Shock GA-2100',
            description: 'CasiOak watch in matte black. Barely worn, with box and papers.',
            images: ['/images/placeholder-watch.jpg'],
            category: 'watches' as Category,
            condition: 'like-new' as const,
            listingType: 'sale' as const,
            price: 6800,
            sellerId: 'user5',
            sellerName: 'Aditya Kumar',
            sellerAvatar: '',
            sellerUniversity: 'IIIT Hyderabad',
            sellerRating: 4.6,
            status: 'active' as const,
            views: 198,
            likes: 42,
            createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            id: '6',
            title: 'JBL Charge 5 Bluetooth Speaker',
            description: 'Powerful portable speaker with amazing bass. Perfect for hostel parties. Battery lasts 20+ hours.',
            images: ['/images/placeholder-speaker.jpg'],
            category: 'electronics' as Category,
            condition: 'good' as const,
            listingType: 'rent' as const,
            price: 150,
            rentalDuration: 'day' as const,
            deposit: 2000,
            sellerId: 'user1',
            sellerName: 'Arjun Patel',
            sellerAvatar: '',
            sellerUniversity: 'IIT Delhi',
            sellerRating: 4.8,
            status: 'active' as const,
            views: 445,
            likes: 89,
            createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
            updatedAt: new Date().toISOString(),
        },
    ];
}
