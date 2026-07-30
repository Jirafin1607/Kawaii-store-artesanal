'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useStore, type CartItem } from '@/store/useStore';

// shadcn/ui components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// lucide-react icons
import {
  Star,
  ShoppingCart,
  Menu,
  X,
  Plus,
  Minus,
  Trash2,
  Heart,
  Sparkles,
  Package,
  Key as KeychainIcon,
  Image as ImageIcon,
  Shirt,
  Gem,
  Settings,
  Send,
  MessageCircle,
  Upload,
  Pencil,
  Play,
  Facebook,
  ExternalLink,
  Phone,
  Mail,
  LogOut,
  ChevronLeft,
  Palette,
  Store,
  ShoppingBag,
  CreditCard,
  Check,
  Loader2,
  DollarSign,
  FolderOpen,
  Grid3x3,
  Info,
  Search,
  MapPin,
  Clock,
  Download,
  Upload as UploadIcon,
  XCircle,
  Tag,
  ArrowUpDown,
  Percent,
  Megaphone,
} from 'lucide-react';

// ===================== TYPES =====================

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  images: string;
  featured: boolean;
  active: boolean;
  category?: { id: string; name: string; slug: string; icon: string };
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  order: number;
  _count?: { products: number };
}

interface GalleryItem {
  id: string;
  title: string;
  type: string;
  url: string;
  thumbnail: string;
  order: number;
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: string;
  total: number;
  status: string;
  createdAt: string;
}

interface ChatMessage {
  id: string;
  sessionId: string;
  role: string;
  content: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  isForwarded: boolean;
  createdAt: string;
}

// ===================== HELPERS =====================

function formatPrice(price: number): string {
  return `$${price.toFixed(2)} MXN`;
}

function parseImages(imagesStr: string): string[] {
  try {
    const parsed = JSON.parse(imagesStr);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getStockBadge(stock: number) {
  if (stock === 0)
    return <Badge variant="destructive">Agotado</Badge>;
  if (stock <= 5)
    return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Quedan {stock}</Badge>;
  return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">En stock</Badge>;
}

function getCategoryIcon(slug: string): React.ReactNode {
  const iconMap: Record<string, React.ReactNode> = {
    pines: <Package className="size-6" />,
    llaveros: <KeychainIcon className="size-6" />,
    'dibujos-impresos': <ImageIcon className="size-6" />,
    'ropa-modificada': <Shirt className="size-6" />,
    'joyeria-economica': <Gem className="size-6" />,
  };
  return iconMap[slug] || <Package className="size-6" />;
}

// LocalStorage persistence keys
const LS_SETTINGS = 'kawaii-settings';
const LS_PRODUCTS = 'kawaii-products';
const LS_CATEGORIES = 'kawaii-categories';
const LS_ORDERS = 'kawaii-orders';
const LS_GALLERY = 'kawaii-gallery';

function loadLS<T>(key: string, fallback: T | null): T | null {
  try {
    if (typeof window === 'undefined') return fallback;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch { return fallback; }
}

function saveLS(key: string, data: unknown) {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

const sessionId = typeof crypto !== 'undefined'
  ? crypto.randomUUID()
  : Math.random().toString(36).slice(2);

// ===================== MAIN PAGE =====================

export default function HomePage() {
  const store = useStore();

  // Local state
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoggingIn, setAdminLoggingIn] = useState(false);

  // Admin form states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [galleryViewOpen, setGalleryViewOpen] = useState<GalleryItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: string; id: string; name: string } | null>(null);

  // Checkout form
  const [checkoutName, setCheckoutName] = useState('');
  const [checkoutEmail, setCheckoutEmail] = useState('');
  const [checkoutPhone, setCheckoutPhone] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [forwardInfo, setForwardInfo] = useState<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const messageCountRef = useRef(0);

  // Product form state
  const [pFormName, setPFormName] = useState('');
  const [pFormDesc, setPFormDesc] = useState('');
  const [pFormPrice, setPFormPrice] = useState('');
  const [pFormStock, setPFormStock] = useState('');
  const [pFormCategory, setPFormCategory] = useState('');
  const [pFormImages, setPFormImages] = useState<string[]>([]);
  const [pFormFeatured, setPFormFeatured] = useState(false);
  const [pFormActive, setPFormActive] = useState(true);

  // Category form state
  const [cFormName, setCFormName] = useState('');
  const [cFormSlug, setCFormSlug] = useState('');
  const [cFormIcon, setCFormIcon] = useState('📦');
  const [cFormOrder, setCFormOrder] = useState('0');

  // Admin price change
  const [pricePercent, setPricePercent] = useState('');

  // Settings form
  const [sFormName, setSFormName] = useState('');
  const [sFormDesc, setSFormDesc] = useState('');
  const [sFormWhatsapp, setSFormWhatsapp] = useState('');
  const [sFormEmail, setSFormEmail] = useState('');
  const [sFormFbUrl, setSFormFbUrl] = useState('');
  const [sFormMlUrl, setSFormMlUrl] = useState('');
  const [sFormPassword, setSFormPassword] = useState('');
  const [sFormPrimary, setSFormPrimary] = useState('#e91e8c');
  const [sFormAccent, setSFormAccent] = useState('#a855f7');
  const [sFormBg, setSFormBg] = useState('#0f0a1a');
  const [sFormText, setSFormText] = useState('#f8fafc');
  const [sFormAddress, setSFormAddress] = useState('');
  const [sFormHours, setSFormHours] = useState('');
  // Promo form
  const [promoText, setPromoText] = useState('');
  const [promoDiscount, setPromoDiscount] = useState('');
  const [promoCategoryId, setPromoCategoryId] = useState('');
  const [promoProductId, setPromoProductId] = useState('');
  const [promoImage, setPromoImage] = useState('');
  const [promoActive, setPromoActive] = useState(false);

  // Product detail quantity
  const [detailQty, setDetailQty] = useState(1);
  const [detailImgIdx, setDetailImgIdx] = useState(0);

  // Search & filter
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [sortBy, setSortBy] = useState('default');
  const [filterMinPrice, setFilterMinPrice] = useState('');
  const [filterMaxPrice, setFilterMaxPrice] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);

  // Promo banner
  const [promoOpen, setPromoOpen] = useState(false);

  // Secret admin access
  const adminClickCount = useRef(0);
  const adminClickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ===================== DATA LOADING =====================

  useEffect(() => {
    async function loadInitial() {
      try {
        const [settingsRes, catsRes, featuredRes] = await Promise.all([
          fetch('/api/settings'),
          fetch('/api/categories'),
          fetch('/api/products?featured=true'),
        ]);
        const [settingsData, catsData, featuredData] = await Promise.all([
          settingsRes.json(),
          catsRes.json(),
          featuredRes.json(),
        ]);
        // Use localStorage overrides if available
        // Load all products from API first (needed as base for localStorage)
        const allRes = await fetch('/api/products');
        const allDataFromApi = await allRes.json();

        // Settings: prefer localStorage over API
        const savedSettings = loadLS(LS_SETTINGS, null);
        const finalSettings = savedSettings || settingsData;
        store.setSettings(finalSettings);
        if (!savedSettings) saveLS(LS_SETTINGS, settingsData);

        // Categories: prefer localStorage over API
        const savedCats = loadLS<Category[]>(LS_CATEGORIES, null);
        const finalCats = savedCats || catsData || [];
        setCategories(finalCats);
        if (!savedCats) saveLS(LS_CATEGORIES, catsData || []);

        // Products: prefer localStorage over API
        const savedProducts = loadLS<Product[]>(LS_PRODUCTS, null);
        if (savedProducts && savedProducts.length > 0) {
          setFeaturedProducts(savedProducts.filter((p: Product) => p.featured && p.active));
        } else {
          // First visit: save API products to localStorage
          if (allDataFromApi && allDataFromApi.length > 0) {
            saveLS(LS_PRODUCTS, allDataFromApi);
          }
          setFeaturedProducts(featuredData || []);
        }
      } catch (err) {
        console.error('Failed to load initial data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInitial();

  }, []);

  // Load products when catalog is opened
  useEffect(() => {
    if (store.currentView === 'catalog') {
      loadAllProducts();
    }

  }, [store.currentView, store.selectedCategoryId]);

  async function loadAllProducts() {
    try {
      // Check localStorage first
      const savedProducts = loadLS<Product[]>(LS_PRODUCTS, null);
      if (savedProducts && savedProducts.length > 0) {
        let filtered = savedProducts.filter((p: Product) => p.active);
        if (store.selectedCategoryId) filtered = filtered.filter(p => p.categoryId === store.selectedCategoryId);
        setAllProducts(filtered);
        return;
      }
      let url = '/api/products';
      if (store.selectedCategoryId) {
        url += `?categoryId=${store.selectedCategoryId}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setAllProducts(data || []);
      // Save to localStorage for future use
      if (data && data.length > 0) saveLS(LS_PRODUCTS, data);
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  }

  // Load all products for admin (including inactive)
  async function loadAdminProducts() {
    try {
      // Check localStorage first
      const savedProducts = loadLS<Product[]>(LS_PRODUCTS, null);
      if (savedProducts && savedProducts.length > 0) {
        setAllProducts(savedProducts);
        return;
      }
      const res = await fetch('/api/products?featured=false');
      const activeRes = await fetch('/api/products');
      const [inactive, active] = await Promise.all([res.json(), activeRes.json()]);
      const activeIds = new Set((active || []).map((p: Product) => p.id));
      const inactiveOnly = (inactive || []).filter((p: Product) => !activeIds.has(p.id));
      const all = [...(active || []), ...inactiveOnly];
      setAllProducts(all);
      // Save to localStorage for future use
      if (all.length > 0) saveLS(LS_PRODUCTS, all);
    } catch (err) {
      console.error('Failed to load admin products:', err);
    }
  }

  // Load gallery
  async function loadGallery() {
    // First try localStorage
    const savedGallery = loadLS<GalleryItem[]>(LS_GALLERY, null);
    if (savedGallery && savedGallery.length > 0) {
      setGalleryItems(savedGallery);
      return;
    }
    try {
      const res = await fetch('/api/gallery');
      const data = await res.json();
      setGalleryItems(data || []);
    } catch (err) {
      console.error('Failed to load gallery:', err);
    }
  }

  // Load orders for admin (from localStorage)
  function loadOrders() {
    const savedOrders = loadLS<Order[]>(LS_ORDERS, null);
    setOrders(savedOrders || []);
  }

  // Load chat messages
  async function loadChat() {
    try {
      const res = await fetch(`/api/chat?sessionId=${sessionId}`);
      const data = await res.json();
      setChatMessages(data || []);
      messageCountRef.current = (data || []).filter((m: ChatMessage) => m.role === 'user').length;
    } catch (err) {
      console.error('Failed to load chat:', err);
    }
  }

  useEffect(() => {
    if (store.chatOpen) loadChat();

  }, [store.chatOpen]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Admin view effects
  useEffect(() => {
    if (store.isAdmin) {
      if (store.adminView === 'products' || store.adminView === 'orders') loadAdminProducts();
      if (store.adminView === 'orders') loadOrders();
      if (store.adminView === 'gallery') loadGallery();
      if (store.adminView === 'categories') {
        const savedCats = loadLS(LS_CATEGORIES, null);
        if (savedCats) {
          setCategories(savedCats);
        } else {
          fetch('/api/categories').then((r) => r.json()).then(setCategories);
        }
      }
    }

  }, [store.isAdmin, store.adminView]);

  // Gallery view effect
  useEffect(() => {
    if (store.currentView === 'gallery') {
      const savedGallery = loadLS<GalleryItem[]>(LS_GALLERY, null);
      if (savedGallery && savedGallery.length > 0) setGalleryItems(savedGallery);
      else loadGallery();
    }

  }, [store.currentView]);

  // Populate settings form when settings load
  useEffect(() => {
    if (store.settings) {
      setSFormName(store.settings.storeName || '');
      setSFormDesc(store.settings.storeDescription || '');
      setSFormWhatsapp(store.settings.whatsappNumber || '');
      setSFormEmail(store.settings.email || '');
      setSFormFbUrl(store.settings.facebookUrl || '');
      setSFormMlUrl(store.settings.mercadoLibreUrl || '');
      setSFormPrimary(store.settings.primaryColor || '#e91e8c');
      setSFormAccent(store.settings.accentColor || '#a855f7');
      setSFormBg(store.settings.bgColor || '#0f0a1a');
      setSFormText(store.settings.textColor || '#f8fafc');
      setSFormAddress(store.settings.address || '');
      setSFormHours(store.settings.hours || '');
      setPromoText(store.settings.promoText || '');
      setPromoDiscount(store.settings.promoDiscount || '');
      setPromoCategoryId(store.settings.promoCategoryId || '');
      setPromoProductId(store.settings.promoProductId || '');
      setPromoImage(store.settings.promoImage || '');
      setPromoActive(store.settings.promoActive || false);
    }
  }, [store.settings]);

  // Apply saved colors as CSS custom properties AND override Tailwind classes
  useEffect(() => {
    if (store.settings && typeof document !== 'undefined') {
      const root = document.documentElement;
      const primary = store.settings.primaryColor || '#e91e8c';
      const accent = store.settings.accentColor || '#a855f7';
      const bg = store.settings.bgColor || '#0f0a1a';
      const text = store.settings.textColor || '#f8fafc';

      root.style.setProperty('--color-primary', primary);
      root.style.setProperty('--color-accent', accent);
      root.style.setProperty('--color-bg', bg);
      root.style.setProperty('--color-text', text);

      // Override Tailwind color classes dynamically
      let styleEl = document.getElementById('dynamic-theme') as HTMLStyleElement;
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'dynamic-theme';
        document.head.appendChild(styleEl);
      }
      styleEl.textContent = `
        .anime-gradient { background-color: ${bg} !important; color: ${text} !important; }
        .text-pink-400, .text-pink-500 { color: ${primary} !important; }
        .text-pink-600 { color: ${primary} !important; }
        .bg-pink-500, .bg-pink-600, .bg-pink-700 { background-color: ${primary} !important; }
        .hover\:bg-pink-700:hover { background-color: ${primary} !important; }
        .hover\:bg-pink-600:hover { background-color: ${primary} !important; }
        .hover\:text-pink-400:hover { color: ${primary} !important; }
        .border-pink-500\/20 { border-color: ${primary}33 !important; }
        .border-pink-500\/30 { border-color: ${primary}4d !important; }
        .bg-pink-500\/10 { background-color: ${primary}1a !important; }
        .bg-pink-500\/20 { background-color: ${primary}33 !important; }
        .bg-pink-500\/80 { background-color: ${primary}cc !important; }
        .text-purple-400, .text-purple-500 { color: ${accent} !important; }
        .bg-purple-600, .bg-purple-700 { background-color: ${accent} !important; }
        .hover\:bg-purple-700:hover { background-color: ${accent} !important; }
        .hover\:text-purple-400:hover { color: ${accent} !important; }
        .border-purple-500\/20, .border-purple-500\/30, .border-purple-500\/50 { border-color: ${accent}33 !important; }
        .bg-purple-500\/10, .bg-purple-500\/20 { background-color: ${accent}1a !important; }
        .pink-glow { box-shadow: 0 0 25px ${primary}40, 0 0 50px ${primary}20 !important; }
        .fill-pink-500 { fill: ${primary} !important; }
        .from-pink-500\/10 { --tw-gradient-from: ${primary}1a !important; }
        .via-purple-500\/5 { --tw-gradient-via: ${accent}0d !important; }
        .data-\[state\=active\]\:bg-pink-500\/20[data-state=active] { background-color: ${primary}33 !important; }
        .data-\[state\=active\]\:text-pink-400[data-state=active] { color: ${primary} !important; }
        input[type=color] { background: transparent !important; }
      `;
    }
  }, [store.settings?.primaryColor, store.settings?.accentColor, store.settings?.bgColor, store.settings?.textColor]);

  // ===================== HANDLERS =====================

  // Secret admin: 5 rapid clicks on store name
  function handleSecretAdmin() {
    adminClickCount.current += 1;
    if (adminClickTimer.current) clearTimeout(adminClickTimer.current);
    adminClickTimer.current = setTimeout(() => { adminClickCount.current = 0; }, 2000);
    if (adminClickCount.current >= 5) {
      adminClickCount.current = 0;
      setAdminLoginOpen(true);
    }
  }

  // Search & autocomplete
  function getSearchResults(query: string): Product[] {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return allProducts
      .filter(p => p.active)
      .map(p => {
        const name = p.name.toLowerCase();
        const desc = p.description.toLowerCase();
        const catName = (p.category?.name || '').toLowerCase();
        let score = 0;
        if (name === q) score = 100;
        else if (name.startsWith(q)) score = 80;
        else if (name.includes(q)) score = 60;
        if (desc.includes(q)) score += 20;
        if (catName.includes(q)) score += 15;
        // Partial word matching
        const words = q.split(/\s+/);
        for (const w of words) {
          if (w.length < 2) continue;
          if (name.includes(w)) score += 10;
          if (desc.includes(w)) score += 5;
        }
        return { ...p, _score: score };
      })
      .filter(p => (p as any)._score > 0)
      .sort((a, b) => (b as any)._score - (a as any)._score)
      .slice(0, 8);
  }

  // Filtered & sorted products for catalog
  function getFilteredProducts(): Product[] {
    let prods = allProducts.filter(p => p.active);
    // Category filter
    if (store.selectedCategoryId) {
      prods = prods.filter(p => p.categoryId === store.selectedCategoryId);
    }
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      prods = prods.filter(p => {
        const name = p.name.toLowerCase();
        const desc = p.description.toLowerCase();
        const cat = (p.category?.name || '').toLowerCase();
        return name.includes(q) || desc.includes(q) || cat.includes(q);
      });
    }
    // Price filter
    const minP = filterMinPrice ? parseFloat(filterMinPrice) : 0;
    const maxP = filterMaxPrice ? parseFloat(filterMaxPrice) : Infinity;
    if (minP > 0 || maxP < Infinity) {
      prods = prods.filter(p => p.price >= minP && p.price <= maxP);
    }
    // Sort
    switch (sortBy) {
      case 'price-asc': prods.sort((a, b) => a.price - b.price); break;
      case 'price-desc': prods.sort((a, b) => b.price - a.price); break;
      case 'name-asc': prods.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'newest': prods.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
    }
    return prods;
  }

  // Promo banner effect
  useEffect(() => {
    if (store.isAdmin) return;
    const s = store.settings;
    if (s?.promoActive && (s.promoImage || s.promoProductId || s.promoCategoryId)) {
      const timer = setTimeout(() => setPromoOpen(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [store.settings?.promoActive, store.isAdmin]);

  // Close search on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Backup: Export all data
  function handleExportBackup() {
    const data = {
      _version: 'v10',
      _date: new Date().toISOString(),
      settings: loadLS(LS_SETTINGS, null) || store.settings,
      products: loadLS(LS_PRODUCTS, null) || allProducts,
      categories: loadLS(LS_CATEGORIES, null) || categories,
      gallery: loadLS(LS_GALLERY, null) || galleryItems,
      orders: loadLS(LS_ORDERS, null) || orders,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kawaii-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Backup descargado');
  }

  // Backup: Import data
  function handleImportBackup(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (!data._version) { toast.error('Archivo de backup inválido'); return; }
        if (data.settings) { saveLS(LS_SETTINGS, data.settings); store.setSettings(data.settings); }
        if (data.products && data.products.length) { saveLS(LS_PRODUCTS, data.products); setAllProducts(data.products); }
        if (data.categories && data.categories.length) { saveLS(LS_CATEGORIES, data.categories); setCategories(data.categories); }
        if (data.gallery && data.gallery.length) { saveLS(LS_GALLERY, data.gallery); setGalleryItems(data.gallery); }
        if (data.orders && data.orders.length) { saveLS(LS_ORDERS, data.orders); setOrders(data.orders); }
        toast.success('Backup restaurado. Recarga la página para ver todo.');
        setTimeout(() => window.location.reload(), 1500);
      } catch { toast.error('Error al leer el archivo de backup'); }
    };
    reader.readAsText(file);
  }

  function navigateTo(view: 'home' | 'catalog' | 'gallery' | 'checkout') {
    store.setCurrentView(view);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleAddToCart(product: Product, qty: number = 1) {
    if (product.stock <= 0) {
      toast.error('Producto agotado');
      return;
    }
    const inCart = store.cart.find(c => c.id === product.id);
    const currentQty = inCart ? inCart.quantity : 0;
    if (currentQty + qty > product.stock) {
      toast.error(`Solo hay ${product.stock} piezas disponibles. Ya tienes ${currentQty} en el carrito.`);
      return;
    }
    const images = parseImages(product.images);
    store.addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: qty,
      image: images[0] || '',
    });
    toast.success(`${product.name} agregado al carrito`);
  }

  async function handleSendChat() {
    if (!chatInput.trim() || chatSending) return;
    const msg = chatInput.trim();
    setChatInput('');
    setChatSending(true);

    try {
      const body: any = { sessionId, content: msg };
      if (showContactForm) {
        body.customerName = contactName;
        body.customerEmail = contactEmail;
        body.customerPhone = contactPhone;
      }
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      const newMessages = [...chatMessages, data.botMessage];
      setChatMessages(newMessages);
      messageCountRef.current += 1;

      if (data.forwardInfo) {
        setForwardInfo(data.forwardInfo);
        toast.success('¡Información de contacto enviada!');
      }

      // After 3 messages without resolution, prompt for contact info
      if (messageCountRef.current >= 3 && !showContactForm && !data.forwardInfo) {
        setShowContactForm(true);
      }
    } catch (err) {
      toast.error('Error al enviar mensaje');
    } finally {
      setChatSending(false);
    }
  }

  async function handleCheckout() {
    if (!checkoutName || !checkoutEmail || !checkoutPhone) {
      toast.error('Por favor completa todos los campos');
      return;
    }
    if (store.cart.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }
    // Validate stock before checkout
    let prodsList = [...allProducts];
    const savedProds = loadLS<Product[]>(LS_PRODUCTS, null);
    if (savedProds && savedProds.length > 0) prodsList = savedProds;
    for (const item of store.cart) {
      const prod = prodsList.find(p => p.id === item.id);
      if (!prod || prod.stock < item.quantity) {
        toast.error(`"${item.name}" - stock insuficiente (disponible: ${prod?.stock || 0})`);
        return;
      }
    }
    try {
      const total = store.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        customerName: checkoutName,
        customerEmail: checkoutEmail,
        customerPhone: checkoutPhone,
        items: JSON.stringify(store.cart.map((item) => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        }))),
        total,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      // Save to localStorage (works without database!)
      const savedOrders = loadLS<Order[]>(LS_ORDERS, null) || [];
      savedOrders.unshift(newOrder);
      saveLS(LS_ORDERS, savedOrders);
      // ---- INVENTORY: deduct stock ----
      const currentProducts = loadLS<Product[]>(LS_PRODUCTS, null);
      let prodsToSave: Product[] = [];
      if (currentProducts && currentProducts.length > 0) {
        prodsToSave = currentProducts.map(p => {
          const cartItem = store.cart.find(c => c.id === p.id);
          if (cartItem) {
            return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
          }
          return p;
        });
      } else {
        prodsToSave = allProducts.map(p => {
          const cartItem = store.cart.find(c => c.id === p.id);
          if (cartItem) {
            return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
          }
          return p;
        });
      }
      saveLS(LS_PRODUCTS, prodsToSave);
      setAllProducts(prodsToSave);
      // Send via WhatsApp if configured (before clearing cart)
      if (store.settings?.whatsappNumber) {
        const itemsText = store.cart.map(i => `${i.name} x${i.quantity} - $${(i.price * i.quantity).toFixed(2)}`).join('\n');
        const waMsg = encodeURIComponent(`Nuevo pedido de ${checkoutName}:\n${itemsText}\nTotal: $${total.toFixed(2)} MXN\nTel: ${checkoutPhone}\nEmail: ${checkoutEmail}`);
        window.open(`https://wa.me/${store.settings.whatsappNumber}?text=${waMsg}`, '_blank');
      }

      setOrderSuccess(true);
      store.clearCart();
      toast.success('¡Pedido realizado con éxito! Stock actualizado.');
    } catch (err) {
      toast.error('Error al procesar el pedido');
    }
  }

  async function handleAdminLogin() {
    if (!adminPassword) return;
    setAdminLoggingIn(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword }),
      });
      if (res.ok) {
        const data = await res.json();
        store.setIsAdmin(true);
        // IMPORTANT: Do NOT overwrite store settings with API defaults!
        // localStorage settings (already loaded) take priority over API defaults.
        // Only use API settings if nothing is saved locally.
        const savedSettings = loadLS(LS_SETTINGS, null);
        if (!savedSettings && data.settings) {
          store.setSettings(data.settings);
          saveLS(LS_SETTINGS, data.settings);
        }
        setAdminLoginOpen(false);
        setAdminPassword('');
        toast.success('Bienvenido al panel de administración');
      } else {
        toast.error('Contraseña incorrecta');
      }
    } catch {
      toast.error('Error al iniciar sesión');
    } finally {
      setAdminLoggingIn(false);
    }
  }

  function openProductForm(product?: Product) {
    if (product) {
      setEditingProduct(product);
      setPFormName(product.name);
      setPFormDesc(product.description);
      setPFormPrice(String(product.price));
      setPFormStock(String(product.stock));
      setPFormCategory(product.categoryId);
      setPFormImages(parseImages(product.images));
      setPFormFeatured(product.featured);
      setPFormActive(product.active);
    } else {
      setEditingProduct(null);
      setPFormName('');
      setPFormDesc('');
      setPFormPrice('');
      setPFormStock('');
      setPFormCategory(categories[0]?.id || '');
      setPFormImages([]);
      setPFormFeatured(false);
      setPFormActive(true);
    }
    setProductFormOpen(true);
  }

  async function handleSaveProduct() {
    if (!pFormName || !pFormPrice) {
      toast.error('Nombre y precio son requeridos');
      return;
    }
    const cat = categories.find(c => c.id === pFormCategory);
    const updatedProduct: Product = {
      id: editingProduct?.id || `prod-${Date.now()}`,
      name: pFormName,
      description: pFormDesc,
      price: parseFloat(pFormPrice),
      stock: parseInt(pFormStock) || 0,
      categoryId: pFormCategory,
      images: JSON.stringify(pFormImages),
      featured: pFormFeatured,
      active: pFormActive,
      category: cat || undefined,
      createdAt: editingProduct?.createdAt || new Date().toISOString(),
    };

    // Always get the latest products from localStorage
    let currentProducts: Product[] = [];
    const savedProds = loadLS<Product[]>(LS_PRODUCTS, null);
    if (savedProds && savedProds.length > 0) {
      currentProducts = savedProds;
    } else {
      currentProducts = [...allProducts];
    }

    if (editingProduct) {
      const idx = currentProducts.findIndex((p: Product) => p.id === editingProduct.id);
      if (idx >= 0) currentProducts[idx] = updatedProduct;
      else currentProducts.push(updatedProduct);
    } else {
      currentProducts.push(updatedProduct);
    }

    // Save to localStorage FIRST
    saveLS(LS_PRODUCTS, currentProducts);
    const newFeatured = currentProducts.filter((p: Product) => p.featured && p.active);
    setFeaturedProducts(newFeatured);
    const updatedCats = categories.map(c => ({
      ...c,
      _count: { products: currentProducts.filter((p: Product) => p.categoryId === c.id).length },
    }));
    setCategories(updatedCats);
    saveLS(LS_CATEGORIES, updatedCats);
    toast.success(editingProduct ? 'Producto actualizado' : 'Producto creado');
    setProductFormOpen(false);
    loadAdminProducts();

    // Try API in background
    try {
      await fetch('/api/products', {
        method: editingProduct ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct),
      });
    } catch {
      // Ignore - already saved locally
    }
  }

  async function handleDeleteProduct(id: string) {
    let currentProducts: Product[] = [];
    const savedProds = loadLS<Product[]>(LS_PRODUCTS, null);
    if (savedProds && savedProds.length > 0) {
      currentProducts = savedProds;
    } else {
      currentProducts = [...allProducts];
    }
    const filtered = currentProducts.filter((p: Product) => p.id !== id);
    saveLS(LS_PRODUCTS, filtered);
    const newFeatured = filtered.filter((p: Product) => p.featured && p.active);
    setFeaturedProducts(newFeatured);
    toast.success('Producto eliminado');
    loadAdminProducts();
  }

  async function handlePriceChangeAll() {
    const percent = parseFloat(pricePercent);
    if (isNaN(percent)) {
      toast.error('Ingresa un porcentaje válido');
      return;
    }
    try {
      const updated = allProducts.map((p) => ({
        ...p,
        price: Math.round(p.price * (1 + percent / 100) * 100) / 100,
      }));
      // Save all updated products to localStorage
      saveLS(LS_PRODUCTS, updated);
      const newFeatured = updated.filter((p: Product) => p.featured && p.active);
      setFeaturedProducts(newFeatured);
      toast.success(`Precios actualizados ${percent > 0 ? '+' : ''}${percent}%`);
      setPricePercent('');
      loadAdminProducts();
    } catch {
      toast.error('Error al actualizar precios');
    }
  }

  function openCategoryForm(cat?: Category) {
    if (cat) {
      setEditingCategory(cat);
      setCFormName(cat.name);
      setCFormSlug(cat.slug);
      setCFormIcon(cat.icon);
      setCFormOrder(String(cat.order));
    } else {
      setEditingCategory(null);
      setCFormName('');
      setCFormSlug('');
      setCFormIcon('📦');
      setCFormOrder('0');
    }
    setCategoryFormOpen(true);
  }

  async function handleSaveCategory() {
    if (!cFormName || !cFormSlug) {
      toast.error('Nombre y slug son requeridos');
      return;
    }
    let currentCats: Category[] = [];
    const savedCats = loadLS<Category[]>(LS_CATEGORIES, null);
    if (savedCats && savedCats.length > 0) {
      currentCats = savedCats;
    } else {
      currentCats = [...categories];
    }
    const updatedCat: Category = {
      id: editingCategory?.id || `cat-${Date.now()}`,
      name: cFormName,
      slug: cFormSlug,
      icon: cFormIcon,
      order: parseInt(cFormOrder) || 0,
      _count: editingCategory?._count || { products: 0 },
    };
    if (editingCategory) {
      const idx = currentCats.findIndex((c: Category) => c.id === editingCategory.id);
      if (idx >= 0) currentCats[idx] = { ...updatedCat, _count: editingCategory._count };
    } else {
      currentCats.push(updatedCat);
    }
    // Save to localStorage FIRST
    saveLS(LS_CATEGORIES, currentCats);
    setCategories(currentCats);
    toast.success(editingCategory ? 'Categoría actualizada' : 'Categoría creada');
    setCategoryFormOpen(false);

    // Try API in background
    try {
      await fetch('/api/categories', {
        method: editingCategory ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCat),
      });
    } catch {
      // Ignore - already saved locally
    }
  }

  async function handleDeleteCategory(id: string) {
    let currentCats: Category[] = [];
    const savedCats = loadLS<Category[]>(LS_CATEGORIES, null);
    if (savedCats && savedCats.length > 0) {
      currentCats = savedCats;
    } else {
      currentCats = [...categories];
    }
    const filtered = currentCats.filter((c: Category) => c.id !== id);
    saveLS(LS_CATEGORIES, filtered);
    setCategories(filtered);
    toast.success('Categoría eliminada');
  }

  async function handleUploadFile(file: File, _type: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      // Resize image to max 800px to avoid localStorage size limits
      const img = new Image();
      img.onload = () => {
        const MAX = 800;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) { height = (height / width) * MAX; width = MAX; }
          else { width = (width / height) * MAX; height = MAX; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  async function handleDeleteGalleryItem(id: string) {
    const current = loadLS<GalleryItem[]>(LS_GALLERY, null) || galleryItems;
    const filtered = current.filter(g => g.id !== id);
    saveLS(LS_GALLERY, filtered);
    setGalleryItems(filtered);
    toast.success('Elemento eliminado');
  }

  async function handleSaveSettings() {
    // Build new settings, merging with existing to preserve fields like id/heroImage
    const newSettings: any = {
      ...(store.settings || {}),
      id: store.settings?.id || 'default',
      heroImage: store.settings?.heroImage || '',
      storeName: sFormName,
      storeDescription: sFormDesc,
      primaryColor: sFormPrimary,
      accentColor: sFormAccent,
      bgColor: sFormBg,
      textColor: sFormText,
      whatsappNumber: sFormWhatsapp,
      email: sFormEmail,
      facebookUrl: sFormFbUrl,
      mercadoLibreUrl: sFormMlUrl,
      address: sFormAddress,
      hours: sFormHours,
      promoText,
      promoDiscount,
      promoCategoryId,
      promoProductId,
      promoImage,
      promoActive,
    };
    if (sFormPassword) newSettings.adminPassword = sFormPassword;

    // Save to localStorage FIRST (guarantees persistence even if API fails)
    saveLS(LS_SETTINGS, newSettings);
    store.setSettings(newSettings);
    toast.success('Configuración guardada');
    setSFormPassword('');

    // Try API in background (fire and forget)
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
    } catch {
      // Ignore API errors - data is already saved locally
    }
  }

  function handleUpdateOrderStatus(id: string, status: string) {
    const savedOrders = loadLS<Order[]>(LS_ORDERS, null) || [];
    const idx = savedOrders.findIndex(o => o.id === id);
    if (idx >= 0) {
      savedOrders[idx].status = status;
      saveLS(LS_ORDERS, savedOrders);
      setOrders([...savedOrders]);
      toast.success('Estado actualizado');
    }
  }

  function resetProductDetail() {
    setDetailQty(1);
    setDetailImgIdx(0);
  }

  useEffect(() => {
    if (store.selectedProduct) resetProductDetail();
  }, [store.selectedProduct]);

  const cartTotal = store.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = store.cart.reduce((sum, item) => sum + item.quantity, 0);
  const storeName = store.settings?.storeName || 'Kawaii Anime Store';
  const storeDesc = store.settings?.storeDescription || 'Tienda mexicana de anime artesanal';
  const heroImg = store.settings?.heroImage || '';

  // ===================== RENDER =====================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center anime-gradient">
        <div className="text-center">
          <Sparkles className="size-12 text-pink-500 mx-auto mb-4 animate-pulse" />
          <Skeleton className="h-8 w-48 mx-auto mb-2" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col anime-gradient" style={{ backgroundColor: 'var(--color-bg, #0f0a1a)', color: 'var(--color-text, #f8fafc)' }}>
        {/* ============ HEADER ============ */}
        <header className="sticky top-0 z-40 glass-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <button
              onClick={handleSecretAdmin}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Star className="size-6 text-pink-500 fill-pink-500" />
              <span className="font-bold text-lg hidden sm:block">{storeName}</span>
              <span className="font-bold text-lg sm:hidden">KAS</span>
            </button>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {(['home', 'catalog', 'gallery'] as const).map((view) => {
                const labels: Record<string, string> = {
                  home: 'Inicio',
                  catalog: 'Catálogo',
                  gallery: 'Galería',
                };
                const icons: Record<string, React.ReactNode> = {
                  home: <Sparkles className="size-4" />,
                  catalog: <ShoppingBag className="size-4" />,
                  gallery: <ImageIcon className="size-4" />,
                };
                return (
                  <Button
                    key={view}
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigateTo(view);
                    }}
                    className={
                      store.currentView === view && !store.isAdmin
                        ? 'text-pink-400 hover:text-pink-400'
                        : 'text-gray-300 hover:text-pink-400'
                    }
                  >
                    {icons[view]}
                    {labels[view]}
                  </Button>
                );
              })}
            </nav>

            {/* Search + Right side */}
            <div className="flex items-center gap-2">
              {/* Search bar */}
              <div className="relative hidden sm:block" ref={searchRef}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setShowSearch(true); navigateTo('catalog'); }}
                    onFocus={() => setShowSearch(true)}
                    placeholder="Buscar productos..."
                    className="w-48 lg:w-64 pl-9 h-9 bg-white/5 border-white/10 text-sm"
                  />
                  {searchQuery && (
                    <button onClick={() => { setSearchQuery(''); setShowSearch(false); }} className="absolute right-2 top-1/2 -translate-y-1/2">
                      <XCircle className="size-4 text-gray-500 hover:text-gray-300" />
                    </button>
                  )}
                </div>
                <AnimatePresence>
                  {showSearch && searchQuery.trim() && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="absolute top-full mt-1 w-full bg-[#1a1225] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
                    >
                      {getSearchResults(searchQuery).length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm">Sin resultados</div>
                      ) : (
                        getSearchResults(searchQuery).map(p => {
                          const imgs = parseImages(p.images);
                          return (
                            <button
                              key={p.id}
                              className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors text-left"
                              onClick={() => { store.setSelectedProduct(p); setShowSearch(false); setSearchQuery(''); }}
                            >
                              {imgs[0] ? (
                                <img src={imgs[0]} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0"><Package className="size-4 text-gray-600" /></div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{p.name}</p>
                                <p className="text-xs text-pink-400">{formatPrice(p.price)}</p>
                              </div>
                              {p.category && <Badge variant="outline" className="text-[10px] text-gray-500 border-white/10 flex-shrink-0">{p.category.icon}</Badge>}
                            </button>
                          );
                        })
                      )}
                      <button
                        className="w-full p-3 border-t border-white/10 text-sm text-pink-400 hover:bg-white/5 transition-colors"
                        onClick={() => { setShowSearch(false); }}
                      >
                        Ver {getSearchResults(searchQuery).length} resultado(s) en catálogo
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => store.setCartOpen(true)}
                className="relative text-gray-300 hover:text-pink-400"
              >
                <ShoppingCart className="size-5" />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-pink-500 text-white text-[10px] font-bold rounded-full size-5 flex items-center justify-center"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-gray-300 hover:text-pink-400"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="size-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Mobile Menu */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="w-72 bg-[#1a1225] border-pink-500/20">
            <SheetHeader className="mb-6">
              <SheetTitle className="text-pink-400 flex items-center gap-2">
                <Star className="size-5 fill-pink-500" /> {storeName}
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-2">
              {(['home', 'catalog', 'gallery'] as const).map((view) => {
                const labels: Record<string, string> = { home: 'Inicio', catalog: 'Catálogo', gallery: 'Galería' };
                return (
                  <Button
                    key={view}
                    variant={store.currentView === view && !store.isAdmin ? 'secondary' : 'ghost'}
                    className="justify-start text-left"
                    onClick={() => navigateTo(view)}
                  >
                    {labels[view]}
                  </Button>
                );
              })}
              {/* Mobile search */}
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); navigateTo('catalog'); }}
                  placeholder="Buscar..."
                  className="pl-9 bg-white/5 border-white/10"
                />
              </div>
              {store.isAdmin && (
                <>
                  <Separator className="my-2 bg-white/10" />
                  <Button
                    variant="secondary"
                    className="justify-start text-left"
                    onClick={() => { setMobileMenuOpen(false); store.setIsAdmin(false); toast.success('Sesión de admin cerrada'); }}
                  >
                    <LogOut className="size-4 mr-2" /> Cerrar sesión admin
                  </Button>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>

        {/* ============ MAIN CONTENT ============ */}
        <main className="flex-1">
          <AnimatePresence mode="wait">
            {/* ---- ADMIN PANEL ---- */}
            {store.isAdmin ? (
              <motion.div
                key="admin"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-7xl mx-auto px-4 sm:px-6 py-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Settings className="size-6 text-purple-400" /> Panel de Administración
                  </h1>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full" id="ls-status">
                      💾 Datos locales activos · v10
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          localStorage.removeItem(LS_SETTINGS);
                          localStorage.removeItem(LS_PRODUCTS);
                          localStorage.removeItem(LS_CATEGORIES);
                          localStorage.removeItem(LS_ORDERS);
                          localStorage.removeItem(LS_GALLERY);
                          toast.success('Datos locales limpiados. Recarga la página.');
                          window.location.reload();
                        }
                      }}
                      className="text-gray-400 text-xs"
                    >
                      Resetear datos
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => store.setIsAdmin(false)}
                      className="text-gray-300"
                    >
                      <LogOut className="size-4 mr-2" /> Salir
                    </Button>
                  </div>
                </div>

                <Tabs value={store.adminView} onValueChange={(v) => store.setAdminView(v as any)}>
                  <TabsList className="flex-wrap h-auto gap-1 bg-white/5 p-1">
                    {([
                      { value: 'products', label: 'Productos', icon: <Package className="size-4" /> },
                      { value: 'categories', label: 'Categorías', icon: <FolderOpen className="size-4" /> },
                      { value: 'orders', label: 'Pedidos', icon: <ShoppingBag className="size-4" /> },
                      { value: 'gallery', label: 'Galería', icon: <ImageIcon className="size-4" /> },
                      { value: 'appearance', label: 'Apariencia', icon: <Palette className="size-4" /> },
                      { value: 'settings', label: 'Configuración', icon: <Store className="size-4" /> },
                    ] as const).map((tab) => (
                      <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400 text-gray-400"
                      >
                        {tab.icon} {tab.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {/* ADMIN: Products */}
                  <TabsContent value="products" className="mt-6 space-y-6">
                    {/* Price Change */}
                    <Card className="glass-card">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Cambiar precios masivamente</CardTitle>
                        <CardDescription>Aplica un porcentaje de cambio a todos los productos</CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-wrap gap-3 items-end">
                        <div className="flex-1 min-w-[200px]">
                          <Label>Porcentaje (%)</Label>
                          <Input
                            type="number"
                            placeholder="Ej: 10 o -5"
                            value={pricePercent}
                            onChange={(e) => setPricePercent(e.target.value)}
                            className="bg-white/5 border-white/10"
                          />
                        </div>
                        <Button onClick={handlePriceChangeAll} className="bg-pink-600 hover:bg-pink-700">
                          <DollarSign className="size-4 mr-2" /> Aplicar
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Products Table */}
                    <Card className="glass-card">
                      <CardHeader className="flex-row items-center justify-between">
                        <CardTitle>Productos</CardTitle>
                        <Button onClick={() => openProductForm()} className="bg-pink-600 hover:bg-pink-700">
                          <Plus className="size-4 mr-2" /> Agregar
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="max-h-[500px]">
                          <Table>
                            <TableHeader>
                              <TableRow className="border-white/10 hover:bg-transparent">
                                <TableHead className="text-gray-400">Producto</TableHead>
                                <TableHead className="text-gray-400">Precio</TableHead>
                                <TableHead className="text-gray-400 hidden sm:table-cell">Stock</TableHead>
                                <TableHead className="text-gray-400 hidden md:table-cell">Categoría</TableHead>
                                <TableHead className="text-gray-400">Estado</TableHead>
                                <TableHead className="text-gray-400 text-right">Acciones</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {allProducts.length === 0 ? (
                                <TableRow>
                                  <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                                    No hay productos
                                  </TableCell>
                                </TableRow>
                              ) : (
                                allProducts.map((product) => (
                                  <TableRow key={product.id} className="border-white/10">
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell>{formatPrice(product.price)}</TableCell>
                                    <TableCell className="hidden sm:table-cell">{product.stock}</TableCell>
                                    <TableCell className="hidden md:table-cell">{product.category?.name || '-'}</TableCell>
                                    <TableCell>
                                      <div className="flex gap-1">
                                        {product.active ? (
                                          <Badge className="bg-green-500/20 text-green-400">Activo</Badge>
                                        ) : (
                                          <Badge variant="secondary">Inactivo</Badge>
                                        )}
                                        {product.featured && (
                                          <Badge className="bg-pink-500/20 text-pink-400">★ Destacado</Badge>
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <div className="flex justify-end gap-1">
                                        <Button size="icon" variant="ghost" className="size-8" onClick={() => openProductForm(product)}>
                                          <Pencil className="size-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="size-8 text-red-400" onClick={() => setDeleteConfirm({ type: 'product', id: product.id, name: product.name })}>
                                          <Trash2 className="size-4" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))
                              )}
                            </TableBody>
                          </Table>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* ADMIN: Categories */}
                  <TabsContent value="categories" className="mt-6">
                    <Card className="glass-card">
                      <CardHeader className="flex-row items-center justify-between">
                        <CardTitle>Categorías</CardTitle>
                        <Button onClick={() => openCategoryForm()} className="bg-pink-600 hover:bg-pink-700">
                          <Plus className="size-4 mr-2" /> Agregar
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {categories.length === 0 ? (
                            <p className="text-gray-500 col-span-full text-center py-8">No hay categorías</p>
                          ) : (
                            categories.map((cat) => (
                              <Card key={cat.id} className="glass-card p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">{cat.icon}</span>
                                  <div>
                                    <p className="font-medium">{cat.name}</p>
                                    <p className="text-sm text-gray-400">{cat.slug} · {cat._count?.products || 0} productos</p>
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <Button size="icon" variant="ghost" className="size-8" onClick={() => openCategoryForm(cat)}>
                                    <Pencil className="size-4" />
                                  </Button>
                                  <Button size="icon" variant="ghost" className="size-8 text-red-400" onClick={() => setDeleteConfirm({ type: 'category', id: cat.id, name: cat.name })}>
                                    <Trash2 className="size-4" />
                                  </Button>
                                </div>
                              </Card>
                            ))
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* ADMIN: Orders */}
                  <TabsContent value="orders" className="mt-6">
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle>Pedidos</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="max-h-[500px]">
                          <Table>
                            <TableHeader>
                              <TableRow className="border-white/10 hover:bg-transparent">
                                <TableHead className="text-gray-400">Fecha</TableHead>
                                <TableHead className="text-gray-400">Cliente</TableHead>
                                <TableHead className="text-gray-400 hidden sm:table-cell">Email</TableHead>
                                <TableHead className="text-gray-400">Total</TableHead>
                                <TableHead className="text-gray-400">Estado</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {orders.length === 0 ? (
                                <TableRow>
                                  <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                                    No hay pedidos
                                  </TableCell>
                                </TableRow>
                              ) : (
                                orders.map((order) => (
                                  <TableRow key={order.id} className="border-white/10">
                                    <TableCell className="text-sm text-gray-300">
                                      {new Date(order.createdAt).toLocaleDateString('es-MX')}
                                    </TableCell>
                                    <TableCell className="font-medium">{order.customerName}</TableCell>
                                    <TableCell className="hidden sm:table-cell text-gray-300">{order.customerEmail}</TableCell>
                                    <TableCell>{formatPrice(order.total)}</TableCell>
                                    <TableCell>
                                      <Select
                                        value={order.status}
                                        onValueChange={(v) => handleUpdateOrderStatus(order.id, v)}
                                      >
                                        <SelectTrigger className="w-[140px] h-8 text-xs bg-white/5 border-white/10">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="pending">Pendiente</SelectItem>
                                          <SelectItem value="confirmed">Confirmado</SelectItem>
                                          <SelectItem value="shipped">Enviado</SelectItem>
                                          <SelectItem value="delivered">Entregado</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </TableCell>
                                  </TableRow>
                                ))
                              )}
                            </TableBody>
                          </Table>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* ADMIN: Gallery */}
                  <TabsContent value="gallery" className="mt-6">
                    <Card className="glass-card">
                      <CardHeader className="flex-row items-center justify-between">
                        <CardTitle>Galería</CardTitle>
                        <label className="cursor-pointer">
                          <Button asChild className="bg-pink-600 hover:bg-pink-700">
                            <span><Upload className="size-4 mr-2" /> Subir fotos/videos</span>
                          </Button>
                          <input
                            type="file"
                            accept="image/*,video/*"
                            multiple
                            className="hidden"
                            onChange={async (e) => {
                              const files = Array.from(e.target.files || []);
                              if (!files.length) return;
                              toast.loading(`Subiendo ${files.length} archivo(s)...`, { id: 'gallery-upload' });
                              const current = loadLS<GalleryItem[]>(LS_GALLERY, null) || galleryItems;
                              const newItems: GalleryItem[] = [];
                              for (const file of files) {
                                try {
                                  const isVideo = file.type.startsWith('video');
                                  let url: string;
                                  if (isVideo) {
                                    // Videos: read as base64 (keep size reasonable)
                                    url = await new Promise<string>((resolve, reject) => {
                                      const reader = new FileReader();
                                      reader.onload = () => resolve(reader.result as string);
                                      reader.onerror = reject;
                                      // Compress video to max 10MB via canvas if possible, otherwise direct
                                      if (file.size > 10 * 1024 * 1024) {
                                        toast.warning(`El video "${file.name}" es muy pesado (${(file.size/1024/1024).toFixed(1)}MB). Se recomienda menos de 10MB.`);
                                      }
                                      reader.readAsDataURL(file);
                                    });
                                  } else {
                                    url = await handleUploadFile(file, 'gallery');
                                  }
                                  newItems.push({
                                    id: `gallery-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
                                    title: file.name.replace(/\.[^.]+$/, ''),
                                    type: isVideo ? 'video' : 'image',
                                    url,
                                    thumbnail: isVideo ? '' : url,
                                    order: current.length + newItems.length + 1,
                                  });
                                } catch (err) {
                                  toast.error(`Error al subir "${file.name}"`);
                                }
                              }
                              const updated = [...current, ...newItems];
                              saveLS(LS_GALLERY, updated);
                              setGalleryItems(updated);
                              toast.success(`${newItems.length} archivo(s) subidos`, { id: 'gallery-upload' });
                              e.target.value = '';
                            }}
                          />
                        </label>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                          {galleryItems.length === 0 ? (
                            <p className="text-gray-500 col-span-full text-center py-8">No hay elementos en la galería</p>
                          ) : (
                            galleryItems.map((item) => (
                              <div key={item.id} className="relative group">
                                {item.type === 'video' ? (
                                  <div className="aspect-square glass-card rounded-xl flex items-center justify-center relative overflow-hidden">
                                    <video src={item.url} className="w-full h-full object-cover" muted />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                      <Play className="size-10 text-white" />
                                    </div>
                                  </div>
                                ) : (
                                  <img
                                    src={item.url}
                                    alt={item.title}
                                    className="w-full aspect-square object-cover rounded-xl border border-white/10"
                                  />
                                )}
                                <Button
                                  size="icon"
                                  variant="destructive"
                                  className="absolute top-2 right-2 size-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => handleDeleteGalleryItem(item.id)}
                                >
                                  <Trash2 className="size-3" />
                                </Button>
                              </div>
                            ))
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* ADMIN: Appearance */}
                  <TabsContent value="appearance" className="mt-6">
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Palette className="size-5 text-purple-400" /> Apariencia</CardTitle>
                        <CardDescription>Cambia los colores de la tienda</CardDescription>
                      </CardHeader>
                      <CardContent className="grid sm:grid-cols-2 gap-6">
                        {[
                          { label: 'Color primario', value: sFormPrimary, setter: setSFormPrimary },
                          { label: 'Color de acento', value: sFormAccent, setter: setSFormAccent },
                          { label: 'Fondo', value: sFormBg, setter: setSFormBg },
                          { label: 'Texto', value: sFormText, setter: setSFormText },
                        ].map((color) => (
                          <div key={color.label} className="space-y-2">
                            <Label>{color.label}</Label>
                            <div className="flex items-center gap-3">
                              <input
                                type="color"
                                value={color.value}
                                onChange={(e) => color.setter(e.target.value)}
                                className="size-10 rounded-lg cursor-pointer border-0 bg-transparent"
                              />
                              <Input
                                value={color.value}
                                onChange={(e) => color.setter(e.target.value)}
                                className="bg-white/5 border-white/10"
                              />
                            </div>
                          </div>
                        ))}
                        <div className="sm:col-span-2">
                          <Button onClick={handleSaveSettings} className="bg-purple-600 hover:bg-purple-700">
                            <Check className="size-4 mr-2" /> Aplicar cambios
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* ADMIN: Settings */}
                  <TabsContent value="settings" className="mt-6">
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle>Configuración general</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Nombre de la tienda</Label>
                            <Input value={sFormName} onChange={(e) => setSFormName(e.target.value)} className="bg-white/5 border-white/10" />
                          </div>
                          <div className="space-y-2">
                            <Label>WhatsApp</Label>
                            <Input value={sFormWhatsapp} onChange={(e) => setSFormWhatsapp(e.target.value)} placeholder="+521234567890" className="bg-white/5 border-white/10" />
                          </div>
                          <div className="space-y-2 sm:col-span-2">
                            <Label>Descripción</Label>
                            <Textarea value={sFormDesc} onChange={(e) => setSFormDesc(e.target.value)} className="bg-white/5 border-white/10" />
                          </div>
                          <div className="space-y-2">
                            <Label>Email</Label>
                            <Input type="email" value={sFormEmail} onChange={(e) => setSFormEmail(e.target.value)} className="bg-white/5 border-white/10" />
                          </div>
                          <div className="space-y-2">
                            <Label>URL de Facebook</Label>
                            <Input value={sFormFbUrl} onChange={(e) => setSFormFbUrl(e.target.value)} className="bg-white/5 border-white/10" />
                          </div>
                          <div className="space-y-2 sm:col-span-2">
                            <Label>URL de Mercado Libre</Label>
                            <Input value={sFormMlUrl} onChange={(e) => setSFormMlUrl(e.target.value)} className="bg-white/5 border-white/10" />
                          </div>
                          <div className="space-y-2 sm:col-span-2">
                            <Label className="flex items-center gap-1"><MapPin className="size-3" /> Dirección / Ubicación</Label>
                            <Input value={sFormAddress} onChange={(e) => setSFormAddress(e.target.value)} placeholder="Calle, número, colonia, ciudad" className="bg-white/5 border-white/10" />
                          </div>
                          <div className="space-y-2 sm:col-span-2">
                            <Label className="flex items-center gap-1"><Clock className="size-3" /> Horario de atención</Label>
                            <Input value={sFormHours} onChange={(e) => setSFormHours(e.target.value)} placeholder="Lun-Vie 10:00-18:00, Sáb 9:00-14:00" className="bg-white/5 border-white/10" />
                          </div>
                          <div className="space-y-2 sm:col-span-2">
                            <Label>Nueva contraseña de admin (dejar vacío para no cambiar)</Label>
                            <Input type="password" value={sFormPassword} onChange={(e) => setSFormPassword(e.target.value)} className="bg-white/5 border-white/10" />
                          </div>
                        </div>
                        <Button onClick={handleSaveSettings} className="bg-pink-600 hover:bg-pink-700">
                          <Check className="size-4 mr-2" /> Guardar configuración
                        </Button>

                        <Separator className="my-6 bg-white/10" />

                        {/* Promo Banner Config */}
                        <h3 className="font-bold text-lg flex items-center gap-2 mb-4"><Megaphone className="size-5 text-pink-400" /> Banner Promocional</h3>
                        <div className="grid sm:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center gap-2 sm:col-span-2">
                            <Switch checked={promoActive} onCheckedChange={setPromoActive} />
                            <Label>Activar banner promocional</Label>
                          </div>
                          <div className="space-y-2">
                            <Label>Texto del anuncio</Label>
                            <Input value={promoText} onChange={(e) => setPromoText(e.target.value)} placeholder="Aprovecha -20% en llaveros!" className="bg-white/5 border-white/10" />
                          </div>
                          <div className="space-y-2">
                            <Label>Descuento (ej: 20%)</Label>
                            <Input value={promoDiscount} onChange={(e) => setPromoDiscount(e.target.value)} placeholder="20%" className="bg-white/5 border-white/10" />
                          </div>
                          <div className="space-y-2">
                            <Label>Categoría en oferta (opcional)</Label>
                            <Select value={promoCategoryId} onValueChange={setPromoCategoryId}>
                              <SelectTrigger className="bg-white/5 border-white/10"><SelectValue placeholder="Toda la tienda" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">Toda la tienda</SelectItem>
                                {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Producto específico (opcional)</Label>
                            <Select value={promoProductId} onValueChange={setPromoProductId}>
                              <SelectTrigger className="bg-white/5 border-white/10"><SelectValue placeholder="Ninguno" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">Ninguno</SelectItem>
                                {allProducts.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2 sm:col-span-2">
                            <Label>Imagen del anuncio (opcional)</Label>
                            <div className="flex items-center gap-3">
                              {promoImage && <img src={promoImage} alt="promo" className="w-16 h-16 rounded-lg object-cover border border-white/10" />}
                              <label className="cursor-pointer">
                                <Button asChild variant="outline" size="sm"><span><UploadIcon className="size-4 mr-2" /> Subir imagen</span></Button>
                                <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                  const f = e.target.files?.[0]; if (!f) return;
                                  const url = await handleUploadFile(f, 'promo');
                                  setPromoImage(url);
                                }} />
                              </label>
                              {promoImage && <Button variant="ghost" size="sm" onClick={() => setPromoImage('')}><Trash2 className="size-4" /></Button>}
                            </div>
                          </div>
                        </div>
                        <Button onClick={handleSaveSettings} className="bg-pink-600 hover:bg-pink-700">
                          <Check className="size-4 mr-2" /> Guardar promoción
                        </Button>

                        <Separator className="my-6 bg-white/10" />

                        {/* Backup */}
                        <h3 className="font-bold text-lg flex items-center gap-2 mb-4"><Download className="size-5 text-blue-400" /> Respaldo de datos</h3>
                        <p className="text-sm text-gray-400 mb-4">Exporta todos tus datos (productos, categorías, configuración, galería) como archivo JSON. Puedes importarlo después para restaurar todo.</p>
                        <div className="flex flex-wrap gap-3">
                          <Button onClick={handleExportBackup} variant="outline" className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10">
                            <Download className="size-4 mr-2" /> Descargar backup
                          </Button>
                          <label className="cursor-pointer">
                            <Button asChild variant="outline" className="border-green-500/30 text-green-400 hover:bg-green-500/10">
                              <span><UploadIcon className="size-4 mr-2" /> Restaurar backup</span>
                            </Button>
                            <input type="file" accept=".json" className="hidden" onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleImportBackup(f);
                            }} />
                          </label>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </motion.div>
            ) : store.currentView === 'home' ? (
              /* ---- HOME VIEW ---- */
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Hero */}
                <section className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-pink-500/10 via-purple-500/5 to-transparent" />
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24 relative">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                      <div className="text-center md:text-left">
                        <motion.div
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                        >
                          <Badge className="mb-4 bg-pink-500/20 text-pink-400 border-pink-500/30 text-sm px-4 py-1">
                            <Sparkles className="size-3 mr-1" /> Tienda Artesanal Mexicana
                          </Badge>
                        </motion.div>
                        <motion.h1
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="text-4xl md:text-6xl font-bold mb-4"
                          style={{
                            background: `linear-gradient(135deg, var(--color-primary, #e91e8c), var(--color-accent, #a855f7))`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                          }}
                        >
                          {storeName}
                        </motion.h1>
                        <motion.p
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="text-gray-300 text-lg mb-8 max-w-lg mx-auto md:mx-0"
                        >
                          {storeDesc || 'Pines, llaveros, dibujos impresos, ropa modificada y joyería con estética kawaii y anime.'}
                        </motion.p>
                        <motion.div
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                          className="flex gap-4 justify-center md:justify-start"
                        >
                          <Button
                            size="lg"
                            className="bg-pink-600 hover:bg-pink-700 rounded-full px-8 text-base"
                            onClick={() => navigateTo('catalog')}
                          >
                            <ShoppingBag className="size-5 mr-2" /> Ver Catálogo
                          </Button>
                          <Button
                            size="lg"
                            variant="outline"
                            className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 rounded-full px-8 text-base"
                            onClick={() => navigateTo('gallery')}
                          >
                            <ImageIcon className="size-5 mr-2" /> Galería
                          </Button>
                        </motion.div>
                      </div>
                      {heroImg && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 }}
                          className="hidden md:block"
                        >
                          <img
                            src={heroImg}
                            alt="Hero"
                            className="w-full max-w-md mx-auto rounded-2xl shadow-2xl pink-glow"
                          />
                        </motion.div>
                      )}
                    </div>
                  </div>
                  {/* Decorative stars */}
                  <div className="absolute top-20 left-10 text-pink-500/20 twinkle">
                    <Star className="size-6 fill-pink-500/20" />
                  </div>
                  <div className="absolute top-40 right-20 text-purple-500/20 twinkle" style={{ animationDelay: '1s' }}>
                    <Star className="size-8 fill-purple-500/20" />
                  </div>
                  <div className="absolute bottom-20 left-1/3 text-pink-500/15 twinkle" style={{ animationDelay: '0.5s' }}>
                    <Star className="size-4 fill-pink-500/15" />
                  </div>
                </section>

                {/* Featured Products */}
                {featuredProducts.length > 0 && (
                  <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                      <Heart className="size-6 text-pink-500" /> Productos Destacados
                    </h2>
                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
                      {featuredProducts.map((product) => {
                        const images = parseImages(product.images);
                        return (
                          <motion.div
                            key={product.id}
                            whileHover={{ scale: 1.03, y: -4 }}
                            className="min-w-[220px] max-w-[260px] flex-shrink-0"
                          >
                            <Card
                              className="glass-card rounded-xl cursor-pointer overflow-hidden group"
                              onClick={() => store.setSelectedProduct(product)}
                            >
                              <div className="aspect-square overflow-hidden">
                                {images[0] ? (
                                  <img
                                    src={images[0]}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-white/5 flex items-center justify-center">
                                    <Package className="size-12 text-gray-600" />
                                  </div>
                                )}
                              </div>
                              <CardContent className="p-4">
                                <h3 className="font-semibold text-sm mb-1 line-clamp-1">{product.name}</h3>
                                <p className="text-pink-400 font-bold">{formatPrice(product.price)}</p>
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* Categories */}
                {categories.length > 0 && (
                  <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                      <Grid3x3 className="size-6 text-purple-400" /> Categorías
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                      {categories.map((cat) => (
                        <motion.div key={cat.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                          <Card
                            className="glass-card rounded-xl cursor-pointer p-6 text-center group hover:border-pink-500/30 transition-colors"
                            onClick={() => {
                              store.setSelectedCategoryId(cat.id);
                              navigateTo('catalog');
                            }}
                          >
                            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{cat.icon || getCategoryIcon(cat.slug)}</div>
                            <h3 className="font-medium text-sm mb-1">{cat.name}</h3>
                            <p className="text-xs text-gray-400">{cat._count?.products || 0} productos</p>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </section>
                )}

                {/* About */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
                  <Card className="glass-card rounded-xl overflow-hidden">
                    <div className="grid md:grid-cols-2 items-center">
                      <CardContent className="p-8">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                          <Info className="size-6 text-purple-400" /> Sobre Nosotros
                        </h2>
                        <p className="text-gray-300 leading-relaxed mb-4">
                          Somos una tienda mexicana apasionada por el anime y el arte kawaii. Cada producto es hecho con amor y dedicación,
                          desde nuestros pines y llaveros hasta nuestras modificaciones de ropa únicas.
                        </p>
                        <p className="text-gray-300 leading-relaxed">
                          ¡Explora nuestro catálogo y encuentra algo especial para ti! Si no encuentras lo que buscas,
                          contáctanos y podemos crear algo personalizado.
                        </p>
                      </CardContent>
                      <div className="hidden md:flex items-center justify-center p-8">
                        <div className="text-center">
                          <Star className="size-20 text-pink-500/20 mx-auto mb-4" />
                          <p className="text-2xl font-bold" style={{ background: 'linear-gradient(135deg, var(--color-primary, #e91e8c), var(--color-accent, #a855f7))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Hecho con ❤️ en México
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </section>
              </motion.div>
            ) : store.currentView === 'catalog' ? (
              /* ---- CATALOG VIEW ---- */
              <motion.div
                key="catalog"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-7xl mx-auto px-4 sm:px-6 py-6"
              >
                <h1 className="text-3xl font-bold mb-4">Catálogo</h1>

                {/* Filters & Sort bar */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="size-4 text-gray-400" />
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-44 bg-white/5 border-white/10 h-9 text-sm">
                        <SelectValue placeholder="Ordenar por" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Predeterminado</SelectItem>
                        <SelectItem value="price-asc">Precio: menor a mayor</SelectItem>
                        <SelectItem value="price-desc">Precio: mayor a menor</SelectItem>
                        <SelectItem value="name-asc">Nombre: A-Z</SelectItem>
                        <SelectItem value="newest">Más reciente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="size-4 text-gray-400" />
                    <Input type="number" placeholder="Min $" value={filterMinPrice} onChange={(e) => setFilterMinPrice(e.target.value)} className="w-24 bg-white/5 border-white/10 h-9 text-sm" />
                    <span className="text-gray-500">-</span>
                    <Input type="number" placeholder="Max $" value={filterMaxPrice} onChange={(e) => setFilterMaxPrice(e.target.value)} className="w-24 bg-white/5 border-white/10 h-9 text-sm" />
                  </div>
                  {(sortBy !== 'default' || filterMinPrice || filterMaxPrice || searchQuery) && (
                    <Button variant="ghost" size="sm" className="text-gray-400 text-xs" onClick={() => { setSortBy('default'); setFilterMinPrice(''); setFilterMaxPrice(''); setSearchQuery(''); }}>
                      <XCircle className="size-3 mr-1" /> Limpiar filtros
                    </Button>
                  )}
                  <span className="text-xs text-gray-500 ml-auto">{getFilteredProducts().length} producto(s)</span>
                </div>

                {/* Category Tabs */}
                {categories.length > 0 && (
                  <Tabs
                    value={store.selectedCategoryId || 'all'}
                    onValueChange={(v) => {
                      store.setSelectedCategoryId(v === 'all' ? null : v);
                    }}
                    className="mb-6"
                  >
                    <TabsList className="flex-wrap h-auto gap-1 bg-white/5 p-1">
                      <TabsTrigger
                        value="all"
                        className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400 text-gray-400"
                      >
                        Todos
                      </TabsTrigger>
                      {categories.map((cat) => (
                        <TabsTrigger
                          key={cat.id}
                          value={cat.id}
                          className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400 text-gray-400"
                        >
                          <span className="mr-1">{cat.icon}</span> {cat.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                )}

                {/* Product Grid */}
                {getFilteredProducts().length === 0 ? (
                  <div className="text-center py-16">
                    <Package className="size-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No hay productos disponibles</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {getFilteredProducts().map((product) => {
                      const images = parseImages(product.images);
                      return (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ y: -4 }}
                        >
                          <Card
                            className="glass-card rounded-xl cursor-pointer overflow-hidden group"
                            onClick={() => store.setSelectedProduct(product)}
                          >
                            <div className="aspect-square overflow-hidden relative">
                              {images[0] ? (
                                <img
                                  src={images[0]}
                                  alt={product.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-full h-full bg-white/5 flex items-center justify-center">
                                  <Package className="size-12 text-gray-600" />
                                </div>
                              )}
                              {product.featured && (
                                <Badge className="absolute top-2 left-2 bg-pink-500/80 text-white text-[10px]">
                                  <Star className="size-3 mr-1 fill-white" /> Destacado
                                </Badge>
                              )}
                            </div>
                            <CardContent className="p-3">
                              <h3 className="font-semibold text-sm mb-1 line-clamp-1">{product.name}</h3>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-pink-400 font-bold text-sm">{formatPrice(product.price)}</span>
                                {getStockBadge(product.stock)}
                              </div>
                              <Button
                                size="sm"
                                className="w-full bg-pink-600 hover:bg-pink-700 rounded-full text-xs h-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddToCart(product);
                                }}
                                disabled={product.stock === 0}
                              >
                                <ShoppingCart className="size-3 mr-1" /> Agregar
                              </Button>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            ) : store.currentView === 'gallery' ? (
              /* ---- GALLERY VIEW ---- */
              <motion.div
                key="gallery"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-7xl mx-auto px-4 sm:px-6 py-6"
              >
                <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
                  <ImageIcon className="size-8 text-pink-500" /> Galería
                </h1>
                {galleryItems.length === 0 ? (
                  <div className="text-center py-16">
                    <ImageIcon className="size-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No hay elementos en la galería</p>
                  </div>
                ) : (
                  <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                    {galleryItems.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="break-inside-avoid"
                      >
                        <Card
                          className="glass-card rounded-xl overflow-hidden cursor-pointer group"
                          onClick={() => setGalleryViewOpen(item)}
                        >
                          <div className="relative">
                            {item.type === 'video' ? (
                              <div className="aspect-video bg-white/5 flex items-center justify-center">
                                <div className="text-center">
                                  <Play className="size-12 text-pink-400 mx-auto mb-2" />
                                  <p className="text-xs text-gray-400 px-2 line-clamp-2">{item.title}</p>
                                </div>
                              </div>
                            ) : (
                              <img
                                src={item.url}
                                alt={item.title}
                                className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
                                style={{ aspectRatio: `${(index % 3) + 3}/${(index % 2) + 2}` }}
                              />
                            )}
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : store.currentView === 'checkout' ? (
              /* ---- CHECKOUT VIEW ---- */
              <motion.div
                key="checkout"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-2xl mx-auto px-4 sm:px-6 py-6"
              >
                <Button variant="ghost" size="sm" onClick={() => navigateTo('catalog')} className="mb-4 text-gray-400">
                  <ChevronLeft className="size-4 mr-1" /> Seguir comprando
                </Button>

                {orderSuccess ? (
                  <Card className="glass-card rounded-xl p-8 text-center">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="size-10 text-green-400" />
                      </div>
                      <h2 className="text-2xl font-bold mb-2">¡Pedido realizado!</h2>
                      <p className="text-gray-400 mb-6">Gracias por tu compra. Nos pondremos en contacto contigo pronto.</p>
                      <Button onClick={() => { setOrderSuccess(false); navigateTo('home'); }} className="bg-pink-600 hover:bg-pink-700 rounded-full">
                        Volver al inicio
                      </Button>
                    </motion.div>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    <h1 className="text-3xl font-bold">Checkout</h1>

                    {/* Customer info */}
                    <Card className="glass-card rounded-xl">
                      <CardHeader>
                        <CardTitle className="text-lg">Datos de contacto</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Nombre completo</Label>
                          <Input value={checkoutName} onChange={(e) => setCheckoutName(e.target.value)} placeholder="Tu nombre" className="bg-white/5 border-white/10" />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Email</Label>
                            <Input type="email" value={checkoutEmail} onChange={(e) => setCheckoutEmail(e.target.value)} placeholder="tu@email.com" className="bg-white/5 border-white/10" />
                          </div>
                          <div className="space-y-2">
                            <Label>Teléfono</Label>
                            <Input type="tel" value={checkoutPhone} onChange={(e) => setCheckoutPhone(e.target.value)} placeholder="+52 123 456 7890" className="bg-white/5 border-white/10" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Order summary */}
                    <Card className="glass-card rounded-xl">
                      <CardHeader>
                        <CardTitle className="text-lg">Resumen del pedido</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {store.cart.length === 0 ? (
                          <p className="text-gray-500 text-center py-4">El carrito está vacío</p>
                        ) : (
                          <>
                            <ScrollArea className="max-h-60">
                              {store.cart.map((item) => (
                                <div key={item.id} className="flex items-center gap-3 py-2">
                                  {item.image ? (
                                    <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg" />
                                  ) : (
                                    <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center">
                                      <Package className="size-5 text-gray-600" />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{item.name}</p>
                                    <p className="text-xs text-gray-400">x{item.quantity}</p>
                                  </div>
                                  <p className="text-sm font-semibold text-pink-400">{formatPrice(item.price * item.quantity)}</p>
                                </div>
                              ))}
                            </ScrollArea>
                            <Separator className="bg-white/10" />
                            <div className="flex items-center justify-between pt-2">
                              <span className="font-bold text-lg">Total</span>
                              <span className="font-bold text-lg text-pink-400">{formatPrice(cartTotal)}</span>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>

                    {/* Payment */}
                    <Card className="glass-card rounded-xl">
                      <CardHeader>
                        <CardTitle className="text-lg">Método de pago</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button
                          className="w-full bg-pink-600 hover:bg-pink-700 rounded-full py-6 text-base"
                          onClick={handleCheckout}
                          disabled={store.cart.length === 0}
                        >
                          <CreditCard className="size-5 mr-2" /> Pagar con tarjeta (simulado)
                        </Button>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {store.settings?.mercadoLibreUrl && (
                            <Button
                              variant="outline"
                              className="rounded-full border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                              asChild
                            >
                              <a href={store.settings.mercadoLibreUrl} target="_blank" rel="noopener noreferrer">
                                Comprar por Mercado Libre <ExternalLink className="size-4 ml-2" />
                              </a>
                            </Button>
                          )}
                          {store.settings?.facebookUrl && (
                            <Button
                              variant="outline"
                              className="rounded-full border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                              asChild
                            >
                              <a href={store.settings.facebookUrl} target="_blank" rel="noopener noreferrer">
                                <Facebook className="size-4 mr-2" /> Comprar por Facebook <ExternalLink className="size-4 ml-2" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </main>

        {/* ============ PRODUCT DETAIL MODAL ============ */}
        <Dialog open={!!store.selectedProduct} onOpenChange={(open) => { if (!open) store.setSelectedProduct(null); }}>
          {store.selectedProduct && (
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-[#1a1225] border-white/10">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Images */}
                <div className="space-y-3">
                  <div className="aspect-square rounded-xl overflow-hidden bg-white/5">
                    {parseImages(store.selectedProduct.images)[detailImgIdx] ? (
                      <img
                        src={parseImages(store.selectedProduct.images)[detailImgIdx]}
                        alt={store.selectedProduct.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="size-20 text-gray-600" />
                      </div>
                    )}
                  </div>
                  {parseImages(store.selectedProduct.images).length > 1 && (
                    <div className="flex gap-2 overflow-x-auto no-scrollbar">
                      {parseImages(store.selectedProduct.images).map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setDetailImgIdx(idx)}
                          className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                            idx === detailImgIdx ? 'border-pink-500' : 'border-transparent'
                          }`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="space-y-4">
                  <DialogHeader>
                    <DialogTitle className="text-2xl">{store.selectedProduct.name}</DialogTitle>
                    <DialogDescription className="sr-only">Detalle del producto</DialogDescription>
                  </DialogHeader>

                  <div className="text-3xl font-bold text-pink-400">
                    {formatPrice(store.selectedProduct.price)}
                  </div>

                  <div className="flex items-center gap-2">
                    {getStockBadge(store.selectedProduct.stock)}
                    {store.selectedProduct.category && (
                      <Badge variant="outline" className="text-gray-400 border-white/20">
                        {store.selectedProduct.category.icon} {store.selectedProduct.category.name}
                      </Badge>
                    )}
                  </div>

                  {store.selectedProduct.description && (
                    <p className="text-gray-300 leading-relaxed">{store.selectedProduct.description}</p>
                  )}

                  <Separator className="bg-white/10" />

                  {/* Quantity */}
                  <div className="flex items-center gap-4">
                    <Label>Cantidad</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="size-9 border-white/20"
                        onClick={() => setDetailQty(Math.max(1, detailQty - 1))}
                        disabled={detailQty <= 1}
                      >
                        <Minus className="size-4" />
                      </Button>
                      <span className="w-10 text-center font-semibold">{detailQty}</span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="size-9 border-white/20"
                        onClick={() => setDetailQty(Math.min(store.selectedProduct.stock, detailQty + 1))}
                        disabled={detailQty >= store.selectedProduct.stock}
                      >
                        <Plus className="size-4" />
                      </Button>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-pink-600 hover:bg-pink-700 rounded-full py-6 text-base"
                    onClick={() => {
                      handleAddToCart(store.selectedProduct, detailQty);
                      store.setSelectedProduct(null);
                    }}
                    disabled={store.selectedProduct.stock === 0 || detailQty > store.selectedProduct.stock}
                  >
                    <ShoppingCart className="size-5 mr-2" /> {store.selectedProduct.stock === 0 ? 'Agotado' : 'Agregar al carrito'}
                  </Button>

                  <div className="space-y-2">
                    {store.settings?.mercadoLibreUrl && (
                      <Button variant="outline" className="w-full rounded-full border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10" asChild>
                        <a href={store.settings.mercadoLibreUrl} target="_blank" rel="noopener noreferrer">
                          Comprar por Mercado Libre <ExternalLink className="size-4 ml-2" />
                        </a>
                      </Button>
                    )}
                    {store.settings?.facebookUrl && (
                      <Button variant="outline" className="w-full rounded-full border-blue-500/50 text-blue-400 hover:bg-blue-500/10" asChild>
                        <a href={store.settings.facebookUrl} target="_blank" rel="noopener noreferrer">
                          <Facebook className="size-4 mr-2" /> Comprar por Facebook <ExternalLink className="size-4 ml-2" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </DialogContent>
          )}
        </Dialog>

        {/* ============ CART DRAWER ============ */}
        <Sheet open={store.cartOpen} onOpenChange={store.setCartOpen}>
          <SheetContent side="right" className="w-full sm:max-w-md bg-[#1a1225] border-pink-500/20">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2 text-pink-400">
                <ShoppingCart className="size-5" /> Carrito ({cartCount})
              </SheetTitle>
              <SheetDescription>Tus productos seleccionados</SheetDescription>
            </SheetHeader>

            {store.cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-16">
                <ShoppingCart className="size-16 text-gray-600 mb-4" />
                <p className="text-gray-400">Tu carrito está vacío</p>
                <Button variant="ghost" className="mt-4 text-pink-400" onClick={() => { store.setCartOpen(false); navigateTo('catalog'); }}>
                  Ver productos
                </Button>
              </div>
            ) : (
              <>
                <ScrollArea className="flex-1 px-4">
                  <div className="space-y-4 py-4">
                    {store.cart.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
                        ) : (
                          <div className="w-16 h-16 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package className="size-6 text-gray-600" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <p className="text-sm text-pink-400 font-semibold">{formatPrice(item.price)}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Button size="icon" variant="ghost" className="size-7" onClick={() => store.updateQuantity(item.id, item.quantity - 1)}>
                              <Minus className="size-3" />
                            </Button>
                            <span className="text-sm w-6 text-center">{item.quantity}</span>
                            <Button size="icon" variant="ghost" className="size-7" onClick={() => {
                              const prod = allProducts.find(p => p.id === item.id);
                              const maxStock = prod ? prod.stock : 999;
                              if (item.quantity >= maxStock) {
                                toast.error(`Solo hay ${maxStock} piezas disponibles`);
                                return;
                              }
                              store.updateQuantity(item.id, item.quantity + 1);
                            }}>
                              <Plus className="size-3" />
                            </Button>
                            <Button size="icon" variant="ghost" className="size-7 text-red-400 ml-auto" onClick={() => store.removeFromCart(item.id)}>
                              <Trash2 className="size-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-gray-300">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <SheetFooter className="border-t border-white/10 pt-4 space-y-3">
                  <div className="flex items-center justify-between w-full">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-xl text-pink-400">{formatPrice(cartTotal)}</span>
                  </div>
                  <Button className="w-full bg-pink-600 hover:bg-pink-700 rounded-full py-6" onClick={() => { store.setCartOpen(false); navigateTo('checkout'); }}>
                    Proceder al pago
                  </Button>
                </SheetFooter>
              </>
            )}
          </SheetContent>
        </Sheet>

        {/* ============ GALLERY VIEW MODAL ============ */}
        <Dialog open={!!galleryViewOpen} onOpenChange={(open) => { if (!open) setGalleryViewOpen(null); }}>
          {galleryViewOpen && (
            <DialogContent className="max-w-4xl bg-[#1a1225] border-white/10">
              <DialogHeader>
                <DialogTitle>{galleryViewOpen.title || 'Imagen'}</DialogTitle>
              </DialogHeader>
              {galleryViewOpen.type === 'video' ? (
                <video src={galleryViewOpen.url} controls className="w-full rounded-xl max-h-[70vh]" />
              ) : (
                <img src={galleryViewOpen.url} alt={galleryViewOpen.title} className="w-full rounded-xl" />
              )}
            </DialogContent>
          )}
        </Dialog>

        {/* ============ ADMIN LOGIN DIALOG ============ */}
        <Dialog open={adminLoginOpen} onOpenChange={setAdminLoginOpen}>
          <DialogContent className="max-w-sm bg-[#1a1225] border-white/10">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="size-5 text-purple-400" /> Acceso de Administrador
              </DialogTitle>
              <DialogDescription>Ingresa la contraseña para acceder al panel</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Contraseña</Label>
                <Input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAdminLogin(); }}
                  placeholder="••••••"
                  className="bg-white/5 border-white/10"
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setAdminLoginOpen(false)}>Cancelar</Button>
              <Button onClick={handleAdminLogin} disabled={adminLoggingIn || !adminPassword} className="bg-purple-600 hover:bg-purple-700">
                {adminLoggingIn && <Loader2 className="size-4 mr-2 animate-spin" />}
                Iniciar sesión
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ============ PRODUCT FORM DIALOG ============ */}
        <Dialog open={productFormOpen} onOpenChange={setProductFormOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#1a1225] border-white/10">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Nombre</Label>
                  <Input value={pFormName} onChange={(e) => setPFormName(e.target.value)} className="bg-white/5 border-white/10" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Descripción</Label>
                  <Textarea value={pFormDesc} onChange={(e) => setPFormDesc(e.target.value)} className="bg-white/5 border-white/10" rows={3} />
                </div>
                <div className="space-y-2">
                  <Label>Precio (MXN)</Label>
                  <Input type="number" step="0.01" value={pFormPrice} onChange={(e) => setPFormPrice(e.target.value)} className="bg-white/5 border-white/10" />
                </div>
                <div className="space-y-2">
                  <Label>Stock</Label>
                  <Input type="number" value={pFormStock} onChange={(e) => setPFormStock(e.target.value)} className="bg-white/5 border-white/10" />
                </div>
                <div className="space-y-2">
                  <Label>Categoría</Label>
                  <Select value={pFormCategory} onValueChange={setPFormCategory}>
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.icon} {cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Imágenes</Label>
                  <div className="flex flex-wrap gap-2">
                    {pFormImages.map((img, idx) => (
                      <div key={idx} className="relative w-16 h-16">
                        <img src={img} alt="" className="w-full h-full object-cover rounded-lg border border-white/10" />
                        <button
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full size-5 flex items-center justify-center text-xs"
                          onClick={() => setPFormImages(pFormImages.filter((_, i) => i !== idx))}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <label className="w-16 h-16 glass-card rounded-lg flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors">
                      <Upload className="size-5 text-gray-400" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const url = await handleUploadFile(file, 'products');
                          setPFormImages([...pFormImages, url]);
                        }}
                      />
                    </label>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Switch checked={pFormFeatured} onCheckedChange={setPFormFeatured} />
                    <Label>Destacado</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={pFormActive} onCheckedChange={setPFormActive} />
                    <Label>Activo</Label>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setProductFormOpen(false)}>Cancelar</Button>
              <Button onClick={handleSaveProduct} className="bg-pink-600 hover:bg-pink-700">
                {editingProduct ? 'Guardar cambios' : 'Crear producto'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ============ CATEGORY FORM DIALOG ============ */}
        <Dialog open={categoryFormOpen} onOpenChange={setCategoryFormOpen}>
          <DialogContent className="max-w-md bg-[#1a1225] border-white/10">
            <DialogHeader>
              <DialogTitle>{editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input value={cFormName} onChange={(e) => setCFormName(e.target.value)} className="bg-white/5 border-white/10" />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={cFormSlug} onChange={(e) => setCFormSlug(e.target.value)} placeholder="ej: pines" className="bg-white/5 border-white/10" />
              </div>
              <div className="space-y-2">
                <Label>Icono (emoji) - haz clic en uno:</Label>
                <div className="flex flex-wrap gap-1 mb-2">
                  {['📌','🔑','🎨','👕','💍','📦','🎁','⭐','🎀','🌙','🌸','🎀','💎','🎮','🧸','🎵','✨','🦋','🍀','❤️','💜','💖','🎪','🎨','👑','🛍️','📸','🪄','🩷','🫧'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setCFormIcon(emoji)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-lg hover:bg-white/10 transition-colors ${cFormIcon === emoji ? 'bg-white/20 ring-1 ring-pink-400' : ''}`}
                    >
                    {emoji}
                    </button>
                  ))}
                </div>
                <Input value={cFormIcon} onChange={(e) => setCFormIcon(e.target.value)} className="bg-white/5 border-white/10" placeholder="o escribe uno manualmente" />
              </div>
              <div className="space-y-2">
                <Label>Orden</Label>
                <Input type="number" value={cFormOrder} onChange={(e) => setCFormOrder(e.target.value)} className="bg-white/5 border-white/10" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setCategoryFormOpen(false)}>Cancelar</Button>
              <Button onClick={handleSaveCategory} className="bg-pink-600 hover:bg-pink-700">
                {editingCategory ? 'Guardar cambios' : 'Crear categoría'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ============ DELETE CONFIRMATION ============ */}
        <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => { if (!open) setDeleteConfirm(null); }}>
          <AlertDialogContent className="bg-[#1a1225] border-white/10">
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar {deleteConfirm?.type === 'product' ? 'producto' : 'categoría'}?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminará &quot;{deleteConfirm?.name}&quot; permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-white/5">Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700"
                onClick={() => {
                  if (!deleteConfirm) return;
                  if (deleteConfirm.type === 'product') handleDeleteProduct(deleteConfirm.id);
                  else handleDeleteCategory(deleteConfirm.id);
                  setDeleteConfirm(null);
                }}
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* ============ CHATBOT ============ */}
        {!store.isAdmin && (
          <>
            {/* Floating button */}
            <motion.div
              className="fixed bottom-6 right-6 z-50"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1, type: 'spring' }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    className="size-14 rounded-full bg-pink-600 hover:bg-pink-700 shadow-lg pink-glow"
                    onClick={() => store.setChatOpen(!store.chatOpen)}
                  >
                    {store.chatOpen ? <X className="size-6" /> : <MessageCircle className="size-6" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Contáctanos</TooltipContent>
              </Tooltip>
            </motion.div>

            {/* Chat Sheet */}
            <Sheet open={store.chatOpen} onOpenChange={store.setChatOpen}>
              <SheetContent side="right" className="w-full sm:max-w-sm bg-[#1a1225] border-pink-500/20 flex flex-col">
                <SheetHeader className="pb-3">
                  <SheetTitle className="flex items-center gap-2 text-pink-400">
                    <MessageCircle className="size-5" /> Contáctanos
                  </SheetTitle>
                  <SheetDescription>¡Escríbenos directo por WhatsApp o correo!</SheetDescription>
                </SheetHeader>

                {/* Quick contact buttons - ALWAYS VISIBLE */}
                <div className="px-4 py-4 space-y-3">
                  <p className="text-sm text-gray-300">¿Tienes dudas? Escríbenos directo y te respondemos al momento:</p>
                  
                  {store.settings?.whatsappNumber && (
                    <a
                      href={`https://wa.me/${store.settings.whatsappNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl bg-green-600/20 border border-green-500/30 hover:bg-green-600/30 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                        <Phone className="size-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-green-400 text-sm">WhatsApp</p>
                        <p className="text-xs text-gray-400">Chatea con nosotros al instante</p>
                      </div>
                    </a>
                  )}

                  {store.settings?.email && (
                    <a
                      href={`mailto:${store.settings.email}?subject=Consulta desde la tienda`}
                      className="flex items-center gap-3 p-3 rounded-xl bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/30 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                        <Mail className="size-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-blue-400 text-sm">Email</p>
                        <p className="text-xs text-gray-400">{store.settings.email}</p>
                      </div>
                    </a>
                  )}

                  {store.settings?.facebookUrl && (
                    <a
                      href={store.settings.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl bg-indigo-600/20 border border-indigo-500/30 hover:bg-indigo-600/30 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                        <Facebook className="size-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-indigo-400 text-sm">Facebook</p>
                        <p className="text-xs text-gray-400">Visítanos en Facebook</p>
                      </div>
                    </a>
                  )}
                </div>

                {/* Optional: Send a quick message via WhatsApp */}
                <div className="mt-auto border-t border-white/10 p-4 space-y-2">
                  <p className="text-xs text-gray-500">O envía un mensaje rápido por WhatsApp:</p>
                  <div className="flex gap-2">
                    <Input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && chatInput.trim() && store.settings?.whatsappNumber) {
                          const msg = encodeURIComponent(chatInput.trim());
                          window.open(`https://wa.me/${store.settings.whatsappNumber}?text=${msg}`, '_blank');
                          setChatInput('');
                        }
                      }}
                      placeholder="Escribe tu pregunta..."
                      className="bg-white/5 border-white/10"
                    />
                    {store.settings?.whatsappNumber ? (
                      <Button
                        size="icon"
                        className="bg-green-600 hover:bg-green-700 flex-shrink-0 rounded-full"
                        onClick={() => {
                          if (chatInput.trim()) {
                            const msg = encodeURIComponent(chatInput.trim());
                            window.open(`https://wa.me/${store.settings.whatsappNumber}?text=${msg}`, '_blank');
                            setChatInput('');
                          }
                        }}
                        disabled={!chatInput.trim()}
                      >
                        <Send className="size-4" />
                      </Button>
                    ) : (
                      <Button size="icon" className="bg-pink-600 hover:bg-pink-700 flex-shrink-0 rounded-full" disabled>
                        <Send className="size-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </>
        )}

        {/* ============ PROMO BANNER ============ */}
        <AnimatePresence>
          {promoOpen && store.settings?.promoActive && !store.isAdmin && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed bottom-24 right-4 z-40 w-72 sm:w-80 bg-[#1a1225] border border-pink-500/30 rounded-2xl shadow-2xl overflow-hidden"
            >
              <button onClick={() => setPromoOpen(false)} className="absolute top-2 right-2 z-10 bg-black/50 rounded-full p-1 hover:bg-black/70">
                <X className="size-3 text-white" />
              </button>
              {(store.settings.promoImage || store.settings.promoProductId) && (
                <div className="aspect-video bg-black/30">
                  <img
                    src={store.settings.promoImage || parseImages(allProducts.find(p => p.id === store.settings.promoProductId)?.images || '[]')[0] || ''}
                    alt="Promo"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                {store.settings.promoDiscount && (
                  <div className="inline-flex items-center gap-1 bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full text-sm font-bold mb-2">
                    <Percent className="size-3" /> -{store.settings.promoDiscount}
                  </div>
                )}
                <p className="text-sm font-semibold mb-3">{store.settings.promoText || 'Aprovecha nuestra oferta especial!'}</p>
                <Button
                  size="sm"
                  className="w-full bg-pink-600 hover:bg-pink-700 rounded-full"
                  onClick={() => {
                    setPromoOpen(false);
                    if (store.settings.promoCategoryId) {
                      store.setSelectedCategoryId(store.settings.promoCategoryId);
                      navigateTo('catalog');
                    } else if (store.settings.promoProductId) {
                      const p = allProducts.find(pr => pr.id === store.settings.promoProductId);
                      if (p) store.setSelectedProduct(p);
                    } else {
                      navigateTo('catalog');
                    }
                  }}
                >
                  Ver oferta
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ============ FOOTER ============ */}
        <footer className="mt-auto border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
              <div>
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <Star className="size-5 text-pink-500 fill-pink-500" /> {storeName}
                </h3>
                <p className="text-gray-400 text-sm">{storeDesc}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-pink-400">Enlaces</h4>
                <div className="space-y-2">
                  <button onClick={() => navigateTo('home')} className="block text-sm text-gray-400 hover:text-pink-400 transition-colors">Inicio</button>
                  <button onClick={() => navigateTo('catalog')} className="block text-sm text-gray-400 hover:text-pink-400 transition-colors">Catálogo</button>
                  <button onClick={() => navigateTo('gallery')} className="block text-sm text-gray-400 hover:text-pink-400 transition-colors">Galería</button>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-pink-400">Contacto</h4>
                <div className="space-y-2">
                  {store.settings?.whatsappNumber && (
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-green-400 p-0 h-auto block" asChild>
                      <a href={`https://wa.me/${store.settings.whatsappNumber}`} target="_blank" rel="noopener noreferrer">
                        <Phone className="size-4 mr-2" /> WhatsApp
                      </a>
                    </Button>
                  )}
                  {store.settings?.email && (
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-blue-400 p-0 h-auto block" asChild>
                      <a href={`mailto:${store.settings.email}`}><Mail className="size-4 mr-2" /> {store.settings.email}</a>
                    </Button>
                  )}
                  {store.settings?.facebookUrl && (
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-indigo-400 p-0 h-auto block" asChild>
                      <a href={store.settings.facebookUrl} target="_blank" rel="noopener noreferrer">
                        <Facebook className="size-4 mr-2" /> Facebook
                      </a>
                    </Button>
                  )}
                  {store.settings?.mercadoLibreUrl && (
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-yellow-400 p-0 h-auto block" asChild>
                      <a href={store.settings.mercadoLibreUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="size-4 mr-2" /> Mercado Libre
                      </a>
                    </Button>
                  )}
                </div>
              </div>
              {(store.settings?.address || store.settings?.hours) && (
                <div>
                  <h4 className="font-semibold mb-3 text-pink-400">Ubicación</h4>
                  <div className="space-y-3">
                    {store.settings?.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="size-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-400">{store.settings.address}</p>
                      </div>
                    )}
                    {store.settings?.hours && (
                      <div className="flex items-start gap-2">
                        <Clock className="size-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-400">{store.settings.hours}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <Separator className="bg-white/10 mb-4" />
            <div className="text-center text-sm text-gray-500">
              <p>© {new Date().getFullYear()} {storeName}. Todos los derechos reservados.</p>
            </div>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}