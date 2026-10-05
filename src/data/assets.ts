import { FontPairing } from '../types/design';

export interface StockPhoto {
  id: string;
  category: 'Business' | 'Tech' | 'Fashion' | 'Food' | 'Fitness' | 'Lifestyle' | 'Abstract';
  url: string;
  thumbnail: string;
  alt: string;
  photographer: string;
}

export const STOCK_PHOTOS: StockPhoto[] = [
  {
    id: 'photo-1',
    category: 'Fashion',
    url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=70',
    alt: 'Vibrant modern yellow streetwear fashion model',
    photographer: 'Dom Hill',
  },
  {
    id: 'photo-2',
    category: 'Tech',
    url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=70',
    alt: 'Retro synthwave gaming setup with neon aesthetics',
    photographer: 'Lorenzo Herrera',
  },
  {
    id: 'photo-3',
    category: 'Food',
    url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=70',
    alt: 'Artisan healthy salad bowl with fresh avocado',
    photographer: 'Anna Pelzer',
  },
  {
    id: 'photo-4',
    category: 'Fitness',
    url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=400&q=70',
    alt: 'Athlete training in gym with high motivation',
    photographer: 'Scott Webb',
  },
  {
    id: 'photo-5',
    category: 'Business',
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=70',
    alt: 'Young creative team collaborating around modern laptop',
    photographer: 'Annie Spratt',
  },
  {
    id: 'photo-6',
    category: 'Lifestyle',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=70',
    alt: 'Tropical turquoise ocean waves sunset paradise',
    photographer: 'Sean Oulashin',
  },
  {
    id: 'photo-7',
    category: 'Abstract',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=70',
    alt: 'Fluid 3D holographic iridescent gradient waves',
    photographer: 'Milad Fakurian',
  },
  {
    id: 'photo-8',
    category: 'Food',
    url: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=400&q=70',
    alt: 'Artisan latte coffee art on rustic wooden cafe table',
    photographer: 'Devin Avery',
  },
  {
    id: 'photo-9',
    category: 'Business',
    url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=400&q=70',
    alt: 'Clean minimalist architectural office workplace',
    photographer: 'Alesia Kazantceva',
  },
  {
    id: 'photo-10',
    category: 'Tech',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&q=70',
    alt: 'Futuristic matrix digital cyber security code',
    photographer: 'Markus Spiske',
  },
  {
    id: 'photo-11',
    category: 'Fashion',
    url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=400&q=70',
    alt: 'Minimalist high-fashion editorial pose',
    photographer: 'Laura Chouette',
  },
  {
    id: 'photo-12',
    category: 'Fitness',
    url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=400&q=70',
    alt: 'Pilates and yoga stretch exercise mindfulness',
    photographer: 'Jonathan Borba',
  },
];

export const FONT_PAIRINGS: FontPairing[] = [
  {
    id: 'bold-impact',
    name: 'Bold Impact',
    heading: { fontFamily: 'Bebas Neue', fontWeight: 'bold' },
    subheading: { fontFamily: 'Montserrat', fontWeight: 600 },
    tag: 'Sports, Sales & High Energy',
  },
  {
    id: 'editorial-chic',
    name: 'Editorial Luxury',
    heading: { fontFamily: 'Playfair Display', fontWeight: 700, style: 'italic' },
    subheading: { fontFamily: 'Plus Jakarta Sans', fontWeight: 500 },
    tag: 'Fashion, Beauty & Real Estate',
  },
  {
    id: 'modern-tech',
    name: 'SaaS & Cyber',
    heading: { fontFamily: 'Space Grotesk', fontWeight: 700 },
    subheading: { fontFamily: 'Inter', fontWeight: 400 },
    tag: 'Tech, Crypto & Startups',
  },
  {
    id: 'warm-organic',
    name: 'Artisan & Handwritten',
    heading: { fontFamily: 'Caveat', fontWeight: 700 },
    subheading: { fontFamily: 'DM Sans', fontWeight: 500 },
    tag: 'Cafes, Wellness & Quotes',
  },
  {
    id: 'cinematic-luxury',
    name: 'Royal Heritage',
    heading: { fontFamily: 'Cinzel', fontWeight: 700 },
    subheading: { fontFamily: 'Montserrat', fontWeight: 400 },
    tag: 'Jewelry, Weddings & Premium',
  },
  {
    id: 'clean-creator',
    name: 'Creator Clean',
    heading: { fontFamily: 'Poppins', fontWeight: 800 },
    subheading: { fontFamily: 'Plus Jakarta Sans', fontWeight: 500 },
    tag: 'Podcasts, Carousels & Reels',
  },
];

export interface ColorPalette {
  id: string;
  name: string;
  category: 'Vibrant' | 'Luxury' | 'Pastel' | 'Dark & Neon' | 'Earth';
  colors: string[];
}

export const COLOR_PALETTES: ColorPalette[] = [
  {
    id: 'neon-cyber',
    name: 'Neon Horizon',
    category: 'Dark & Neon',
    colors: ['#0f172a', '#6366f1', '#ec4899', '#06b6d4', '#f8fafc'],
  },
  {
    id: 'sunset-glow',
    name: 'Sunset Euphoria',
    category: 'Vibrant',
    colors: ['#1e1b4b', '#f43f5e', '#fb923c', '#facc15', '#fff1f2'],
  },
  {
    id: 'emerald-luxe',
    name: 'Monaco Emerald',
    category: 'Luxury',
    colors: ['#062e24', '#047857', '#d97706', '#fef3c7', '#ffffff'],
  },
  {
    id: 'matcha-latte',
    name: 'Matcha & Oat',
    category: 'Earth',
    colors: ['#283618', '#606c38', '#dda15e', '#bc6c25', '#fefae0'],
  },
  {
    id: 'cotton-candy',
    name: 'Pastel Dream',
    category: 'Pastel',
    colors: ['#fdf2f8', '#f472b6', '#c084fc', '#38bdf8', '#1e293b'],
  },
  {
    id: 'deep-slate',
    name: 'Minimalist Charcoal',
    category: 'Dark & Neon',
    colors: ['#09090b', '#27272a', '#71717a', '#3b82f6', '#f4f4f5'],
  },
  {
    id: 'electric-violet',
    name: 'Electric Pulse',
    category: 'Vibrant',
    colors: ['#2e1065', '#7c3aed', '#a855f7', '#22d3ee', '#ffffff'],
  },
  {
    id: 'terracotta-sun',
    name: 'Warm Tuscan',
    category: 'Earth',
    colors: ['#451a03', '#9a3412', '#ea580c', '#fdba74', '#fff7ed'],
  },
];

export const GRADIENT_PRESETS = [
  { from: '#4f46e5', to: '#ec4899', angle: 135, name: 'Cyberpunk' },
  { from: '#0f172a', to: '#1e293b', angle: 180, name: 'Deep Midnight' },
  { from: '#f97316', to: '#e11d48', angle: 45, name: 'Flamingo Burst' },
  { from: '#06b6d4', to: '#3b82f6', angle: 120, name: 'Oceanic Wave' },
  { from: '#10b981', to: '#047857', angle: 160, name: 'Emerald Forest' },
  { from: '#8b5cf6', to: '#d946ef', angle: 90, name: 'Purple Velvet' },
  { from: '#18181b', to: '#3f3f46', angle: 135, name: 'Carbon Stealth' },
  { from: '#fde047', to: '#f97316', angle: 60, name: 'Sunrise Gold' },
];
