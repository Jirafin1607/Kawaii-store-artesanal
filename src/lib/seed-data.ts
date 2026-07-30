// Embedded seed data - works without database

export const categories = [
  { id: 'cat-pines', name: 'Pines', slug: 'pines', icon: '📌', order: 1, _count: { products: 5 } },
  { id: 'cat-llaveros', name: 'Llaveros', slug: 'llaveros', icon: '🔑', order: 2, _count: { products: 5 } },
  { id: 'cat-dibujos', name: 'Dibujos Impresos', slug: 'dibujos', icon: '🎨', order: 3, _count: { products: 5 } },
  { id: 'cat-ropa', name: 'Ropa Modificada', slug: 'ropa', icon: '👕', order: 4, _count: { products: 3 } },
  { id: 'cat-joyeria', name: 'Joyería Económica', slug: 'joyeria', icon: '💍', order: 5, _count: { products: 3 } },
];

export const products = [
  // Pines
  { id: 'pin-kawaii-rosa', name: 'Pin Kawaii Rosa', description: 'Pin redondo con diseño kawaii estilo anime. Personaje con ojos grandes y mejillas rosadas, ideal para decorar mochilas y ropa.', price: 25, stock: 15, categoryId: 'cat-pines', images: '[]', featured: true, active: true, category: categories[0] },
  { id: 'pin-chibi-azul', name: 'Pin Chibi Azul', description: 'Pin con personaje chibi estilo anime en tonos azules. Broche de metal resistente, perfecto para coleccionistas.', price: 25, stock: 12, categoryId: 'cat-pines', images: '[]', featured: true, active: true, category: categories[0] },
  { id: 'pin-horror', name: 'Pin Estilo Horror', description: 'Pin con diseño oscuro de calavera en blanco y negro. Para fans del anime dark y gótico.', price: 30, stock: 8, categoryId: 'cat-pines', images: '[]', featured: false, active: true, category: categories[0] },
  { id: 'pack-pines', name: 'Pack 3 Pines Kawaii', description: 'Paquete de 3 pines con diseños variados estilo kawaii: amarillo, rosa y azul. ¡Gran oferta!', price: 60, stock: 10, categoryId: 'cat-pines', images: '[]', featured: true, active: true, category: categories[0] },
  { id: 'pin-monstruo', name: 'Pin Monstruo Verde', description: 'Pin con adorable monstruo verde estilo anime. Diseño original hecho a mano.', price: 20, stock: 20, categoryId: 'cat-pines', images: '[]', featured: false, active: true, category: categories[0] },
  // Llaveros
  { id: 'llavero-sailor', name: 'Llavero Sailor Chibi', description: 'Llavero de acrílico con figura chibi de sailor. Colores brillantes y anilla de metal resistente.', price: 45, stock: 10, categoryId: 'cat-llaveros', images: '[]', featured: true, active: true, category: categories[1] },
  { id: 'llavero-corazon', name: 'Llavero Corazón Anime', description: 'Llavero transparente en forma de corazón con diseño de ojos de anime en el interior.', price: 35, stock: 14, categoryId: 'cat-llaveros', images: '[]', featured: false, active: true, category: categories[1] },
  { id: 'llavero-cinta', name: 'Llavero Cinta Multicolor', description: 'Llavero artesanal con cintas de colores enrolladas combinadas con plástico brillante.', price: 30, stock: 18, categoryId: 'cat-llaveros', images: '[]', featured: true, active: true, category: categories[1] },
  { id: 'llavero-chica', name: 'Llavero Chica Rosa', description: 'Llavero con figura de chica de pelo rosa y vestido blanco, estilo kawaii. Resina de alta calidad.', price: 50, stock: 7, categoryId: 'cat-llaveros', images: '[]', featured: false, active: true, category: categories[1] },
  { id: 'llavero-dupla', name: 'Llavero Dupla Rubia', description: 'Llavero con dos personajes de pelo rubio, perfecto para parejas de anime. Acrílico doble cara.', price: 55, stock: 5, categoryId: 'cat-llaveros', images: '[]', featured: true, active: true, category: categories[1] },
  // Dibujos
  { id: 'dibujo-chibi', name: 'Impresión Chibi Verde', description: 'Impresión en papel fotográfico de alta calidad. Personaje chibi verde con fondo colorido y texto "PIZZA". Tamaño 4x6 pulgadas.', price: 40, stock: 8, categoryId: 'cat-dibujos', images: '[]', featured: true, active: true, category: categories[2] },
  { id: 'dibujo-kawaii', name: 'Impresión Kawaii Corazones', description: 'Impresión de personaje con pelo verde y corazones sobre fondo amarillo. Estilo adorable y brillante. Papel fotográfico premium.', price: 45, stock: 6, categoryId: 'cat-dibujos', images: '[]', featured: true, active: true, category: categories[2] },
  { id: 'dibujo-dark', name: 'Impresión Dark Goth', description: 'Impresión de personaje con pelo negro y rayas rosas sobre fondo oscuro. Estilo gótico-anime para fans del género.', price: 50, stock: 4, categoryId: 'cat-dibujos', images: '[]', featured: false, active: true, category: categories[2] },
  { id: 'dibujo-retro', name: 'Impresión Retro Demon', description: 'Impresión estilo retro con personaje de gafas y ropa roja sobre fondo negro. Texto "DEMON XTER" incluido.', price: 55, stock: 3, categoryId: 'cat-dibujos', images: '[]', featured: true, active: true, category: categories[2] },
  { id: 'dibujo-poster', name: 'Poster Grande Anime', description: 'Poster grande de personaje anime en estilo kawaii. Impresión en papel fotográfico de alta resolución. Tamaño 8.5x11 pulgadas.', price: 80, stock: 5, categoryId: 'cat-dibujos', images: '[]', featured: true, active: true, category: categories[2] },
  // Ropa
  { id: 'ropa-short', name: 'Short Modificado Anime', description: 'Pantalón de segunda mano transformado en short con bordado de personaje anime. Modificación artesanal única, talla M.', price: 250, stock: 3, categoryId: 'cat-ropa', images: '[]', featured: true, active: true, category: categories[3] },
  { id: 'ropa-blusa', name: 'Blusa Manga Larga Custom', description: 'Blusa de manga corta modificada con mangas largas agregadas y cuello estilo anime. Estampado de personaje kawaii. Talla S.', price: 320, stock: 2, categoryId: 'cat-ropa', images: '[]', featured: true, active: true, category: categories[3] },
  { id: 'ropa-camiseta', name: 'Camiseta Pines Anime', description: 'Camiseta de segunda mano con pines de anime cosidos y pegados. Diseño exclusivo con múltiples personajes. Talla L.', price: 280, stock: 4, categoryId: 'cat-ropa', images: '[]', featured: false, active: true, category: categories[3] },
  // Joyería
  { id: 'joy-collar', name: 'Collar Estrella Kawaii', description: 'Collar con dije de estrella estilo kawaii en tonos rosa y dorado. Cadena ajustable de acero inoxidable.', price: 65, stock: 10, categoryId: 'cat-joyeria', images: '[]', featured: true, active: true, category: categories[4] },
  { id: 'joy-pulsera', name: 'Pulsera Chibi Rosa', description: 'Pulsera de cuentas con charms de personajes chibi en rosa y blanco. Elástico resistente, ajustable.', price: 45, stock: 12, categoryId: 'cat-joyeria', images: '[]', featured: false, active: true, category: categories[4] },
  { id: 'joy-aretes', name: 'Aretes Luna Anime', description: 'Aretes de luna creciente con detalles de anime en acabado plateado. Hypoalergénicos, perfectos para fans.', price: 55, stock: 8, categoryId: 'cat-joyeria', images: '[]', featured: true, active: true, category: categories[4] },
];

export const galleryItems = [
  { id: 'gallery-1', title: 'Expo Anime Ciudad 2025', type: 'image', url: '/products/pines-1.jpg', thumbnail: '/products/pines-1.jpg', order: 1 },
  { id: 'gallery-2', title: 'Mi stand en la expo', type: 'image', url: '/products/llaveros-1.jpg', thumbnail: '/products/llaveros-1.jpg', order: 2 },
  { id: 'gallery-3', title: 'Productos en exhibición', type: 'image', url: '/products/dibujos-1.jpg', thumbnail: '/products/dibujos-1.jpg', order: 3 },
];

export const defaultSettings = {
  id: 'default',
  storeName: 'Kawaii Anime Store',
  storeDescription: 'Artesanías únicas de anime: pines, llaveros, dibujos, ropa modificada y joyería económica. ¡Hecho con amor!',
  primaryColor: '#e91e8c',
  accentColor: '#a855f7',
  bgColor: '#0f0a1a',
  textColor: '#f8fafc',
  whatsappNumber: '5215512345678',
  email: 'tienda@kawaianime.com',
  facebookUrl: 'https://facebook.com/kawaianimestore',
  mercadoLibreUrl: 'https://mercadolibre.com',
  heroImage: '/products/pines-1.jpg',
  adminPassword: 'admin123',
};
