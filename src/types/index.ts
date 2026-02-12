// ========================================
// SwapSociety — TypeScript Types
// ========================================

export type ListingType = 'rent' | 'sale' | 'both';
export type ListingCondition = 'like-new' | 'good' | 'fair' | 'well-used';
export type ListingStatus = 'active' | 'sold' | 'rented' | 'paused';
export type OrderStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type RentalDuration = 'day' | 'week' | 'month';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  university: string;
  bio: string;
  isVerified: boolean;
  rating: number;
  totalReviews: number;
  createdAt: string;
  listings: string[];       // listing IDs
  wishlist: string[];        // listing IDs
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  images: string[];          // URLs
  category: Category;
  condition: ListingCondition;
  listingType: ListingType;
  price: number;             // sale price or rental price
  rentalDuration?: RentalDuration;
  deposit?: number;
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  sellerUniversity: string;
  sellerRating: number;
  status: ListingStatus;
  views: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
}

export type Category =
  | 'clothing'
  | 'electronics'
  | 'books'
  | 'shoes'
  | 'watches'
  | 'accessories'
  | 'furniture'
  | 'sports'
  | 'music'
  | 'other';

export interface CategoryInfo {
  id: Category;
  label: string;
  icon: string;
  color: string;
}

export interface Review {
  id: string;
  listingId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CartItem {
  listing: Listing;
  quantity: number;
  isRental: boolean;
  rentalDays?: number;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  listingId?: string;
  read: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface Order {
  id: string;
  buyerId: string;
  sellerId: string;
  listing: Listing;
  status: OrderStatus;
  isRental: boolean;
  rentalDays?: number;
  totalPrice: number;
  createdAt: string;
}

export interface FilterState {
  category: Category | 'all';
  listingType: ListingType | 'all';
  condition: ListingCondition | 'all';
  priceMin: number;
  priceMax: number;
  sortBy: 'newest' | 'price-asc' | 'price-desc' | 'popular';
  search: string;
}
