"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import {
  motion,
  AnimatePresence,
  useAnimation,
  useDragControls,
  type PanInfo,
} from "framer-motion";
import {
  Bell,
  ShoppingCart,
  Search,
  SlidersHorizontal,
  Shirt,
  Footprints,
  Backpack,
  Shield,
  Crosshair,
  Compass,
  Star,
  Heart,
  Home,
  LayoutGrid,
  User,
  Flame,
  X,
  ArrowDownUp,
  Ticket,
  Truck,
  Sparkles,
  Check,
  Maximize2,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  الأنواع (Types)                                                    */
/* ------------------------------------------------------------------ */

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  sold: number;
  images: string[];
  isNew: boolean;
  isFavorite: boolean;
  category: "ملابس" | "أحذية" | "عتاد";
  colors?: ProductColor[];
  sizes?: string[];
}

export interface Category {
  id: number;
  name: string;
  icon: LucideIcon;
  bgColor: string;
  filterValue: "الكل" | "ملابس" | "أحذية" | "عتاد";
}

type Filter = "الكل" | "ملابس" | "أحذية" | "عتاد";
type SortOption = "default" | "priceAsc" | "priceDesc" | "rating";

/* ------------------------------------------------------------------ */
/*  البيانات الوهمية (خارج المكوّنات)                                  */
/* ------------------------------------------------------------------ */

const TACTICAL_COLORS: ProductColor[] = [
  { name: "أسود", hex: "#1A1A1A" },
  { name: "بني", hex: "#5C4033" },
  { name: "فضي", hex: "#A8A9AD" },
  { name: "زيتي", hex: "#4B5320" },
  { name: "بيج", hex: "#F5F5DC" },
  { name: "مموه", hex: "url(#camo)" },
];

const CATEGORIES: Category[] = [
  {
    id: 1,
    name: "ملابس",
    icon: Shirt,
    bgColor: "bg-stone-200",
    filterValue: "ملابس",
  },
  {
    id: 2,
    name: "أحذية",
    icon: Footprints,
    bgColor: "bg-[#4B5320]/15",
    filterValue: "أحذية",
  },
  {
    id: 3,
    name: "حقائب",
    icon: Backpack,
    bgColor: "bg-amber-100",
    filterValue: "عتاد",
  },
  {
    id: 4,
    name: "حماية",
    icon: Shield,
    bgColor: "bg-stone-300",
    filterValue: "عتاد",
  },
  {
    id: 5,
    name: "بصريات",
    icon: Crosshair,
    bgColor: "bg-emerald-100",
    filterValue: "عتاد",
  },
  {
    id: 6,
    name: "ملاحة",
    icon: Compass,
    bgColor: "bg-orange-100",
    filterValue: "عتاد",
  },
];

/* ألوان الهوية البصرية للمتجر */
const BRAND_OLIVE = "#4B5320"; // اللون الأساسي (زيتي عسكري)
const BRAND_AMBER = "#D9A441"; // لون النكهة (عنبري صحراوي / براسي)

/* بانرات الكوبونات الإعلانية */
const PROMO_BANNERS: {
  id: number;
  badge: string;
  title: string;
  subtitle: string;
  code: string;
  discount: string;
  icon: LucideIcon;
  gradient: string;
  highlight: string;
}[] = [
  {
    id: 1,
    badge: "عرض محدود",
    title: "خصم 20% على الملابس التكتيكية",
    subtitle: "على تشكيلة الجاكيتات والقمصان الميدانية",
    code: "TAC20",
    discount: "20%",
    icon: Shirt,
    gradient: "bg-gradient-to-l from-[#2F3513] via-[#4B5320] to-[#6C7433]",
    highlight: "text-[#FFD98A]",
  },
  {
    id: 2,
    badge: "شحن مجاني",
    title: "توصيل مجاني للطلبات فوق 100$",
    subtitle: "لجميع المدن خلال 48 ساعة",
    code: "FREESHIP",
    discount: "مجاناً",
    icon: Truck,
    gradient: "bg-gradient-to-l from-[#5A3A0E] via-[#946117] to-[#C8912E]",
    highlight: "text-white",
  },
  {
    id: 3,
    badge: "وصل حديثاً",
    title: "خصم 15% على العتاد الجديد",
    subtitle: "حافظات وحقائب تكتيكية بإصدارات 2025",
    code: "GEAR15",
    discount: "15%",
    icon: Backpack,
    gradient: "bg-gradient-to-l from-[#1C1D17] via-[#2E3220] to-[#4B5320]",
    highlight: "text-[#FFD98A]",
  },
];

const BRANDS = [
  "5.11 تكتیكال",
  "ميكانيكس",
  "كوندور",
  "إي إس إس",
  "كولومبيا",
  "فيرتكس",
  "كراي بريسيجن",
];

const FILTERS: Filter[] = ["الكل", "ملابس", "أحذية", "عتاد"];

const PRODUCTS: Product[] = [
  {
    id: 1,
    title: "طقم مطر تكتيكي ",
    description:
      "طقم مطر خفيف ومقاوم للماء (جاكيت وبنطال) بتصميم عملي، مثالي للظروف الجوية القاسية والمهام الميدانية.",
    price: 45.0,
    originalPrice: 60.0,
    discount: 25,
    rating: 4.7,
    sold: 850,
    images: ["/imgs/Screenshot 2026-10-23 194524.png"],
    isNew: true,
    isFavorite: false,
    category: "ملابس",
    colors: [TACTICAL_COLORS[1], TACTICAL_COLORS[3]],
    sizes: ["S", "M", "L", "XL", "2XL"],
  },
  {
    id: 2,
    title: "قميص تكتيكي أسود بنصف سحاب",
    description:
      "قميص رياضي وتكتيكي مصمم للراحة القصوى، يتميز بجيب جانبي بسحاب وتصميم مرن يسمح بحرية الحركة.",
    price: 35.0,
    rating: 4.8,
    sold: 1200,
    images: [
      "imgs/IMG-20261101-WA0481.jpg",
      "imgs/IMG-20261101-WA0473.jpg",
      "imgs/IMG-20261101-WA0466.jpg",
    ],
    isNew: false,
    isFavorite: false,
    category: "ملابس",
    colors: [TACTICAL_COLORS[0]],
    sizes: ["M", "L", "XL"],
  },
  {
    id: 3,
    title: "حافظة مسدس للاخفاء العميق",
    description:
      "حافظة مسدس داخلية (IWB) قابلة للتعديل، توفر راحة وأماناً أثناء الارتداء المخفي مع إمكانية السحب السريع.",
    price: 25.0,
    originalPrice: 32.0,
    discount: 22,
    rating: 4.9,
    sold: 320,
    images: ["imgs/IMG-20261101-WA0438.jpg"],
    isNew: true,
    isFavorite: true,
    category: "عتاد",
    colors: [TACTICAL_COLORS[0]],
  },
  {
    id: 4,
    title: "منصة تعليق حافظة تكتيكية",
    description:
      "منصة فخذ (Drop Leg Platform) قابلة للتعديل من بوليمر عالي الجودة، متوافقة مع مختلف الحافظات والمعدات التكتيكية.",
    price: 20.0,
    rating: 4.6,
    sold: 410,
    images: ["imgs/IMG-20261101-WA0438.jpg"],
    isNew: false,
    isFavorite: false,
    category: "عتاد",
    colors: [TACTICAL_COLORS[1], TACTICAL_COLORS[3]],
  },
  {
    id: 5,
    title: "جاكيت كولومبيا فليس ",
    description:
      "جاكيت صوف فليس دافئ ومضاد للرياح من كولومبيا، مثالي للاستخدام اليومي والمهام الباردة مع جيوب متعددة.",
    price: 65.0,
    originalPrice: 85.0,
    discount: 23,
    rating: 4.8,
    sold: 950,
    images: [
      "/imgs/IMG-20261101-WA0426.jpg",
      "imgs/IMG-20261101-WA0420.jpg",
      "/imgs/IMG-20261101-WA0412.jpg",
      "/imgs/IMG-20261101-WA0404.jpg",
      "/imgs/IMG-20261101-WA0044.jpg",
    ],
    isNew: false,
    isFavorite: false,
    category: "ملابس",
    colors: TACTICAL_COLORS,
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: 6,
    title: "حذاء تكتيكي صحراوي",
    description:
      "حذاء ميداني متين مقاوم للماء، يوفر ثباتاً ممتازاً وراحة طوال اليوم.",
    price: 110.0,
    rating: 4.7,
    sold: 620,
    images: [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFMyQAT2FZb0xYnJPulFcZqXyD5RHR4DAUMYtB4LIeDQ&s",
    ],
    isNew: false,
    isFavorite: false,
    category: "أحذية",
    colors: [TACTICAL_COLORS[4], TACTICAL_COLORS[1]],
    sizes: ["40", "41", "42", "43", "44"],
  },
];

const NAV_ITEMS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "home", label: "الرئيسية", icon: Home },
  { id: "categories", label: "الفئات", icon: LayoutGrid },
  { id: "cart", label: "السلة", icon: ShoppingCart },
  { id: "favorites", label: "المفضلة", icon: Heart },
  { id: "profile", label: "حسابي", icon: User },
];

/* ------------------------------------------------------------------ */
/*  دوال مساعدة                                                        */
/* ------------------------------------------------------------------ */

const formatSold = (sold: number) =>
  sold >= 1000 ? `${(sold / 1000).toFixed(1)} ألف` : `${sold}`;

const noScrollbar =
  "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden";

/* ------------------------------------------------------------------ */
/*  خطاف التقليب اللانهائي للصور (Infinite carousel hook)              */
/* ------------------------------------------------------------------ */

function useInfiniteCarousel(total: number, initialIndex = 0) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const isJumping = useRef(false);
  const scrollEndTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialIndexRef = useRef(initialIndex);

  // ضبط موضع البداية على أول صورة حقيقية (وليس الكلون)
  useEffect(() => {
    let canceled = false;
    const tryScroll = (attempts = 0) => {
      if (canceled) return;
      const el = scrollRef.current;
      if (!el) return;
      const w = el.offsetWidth;
      if (w === 0 && attempts < 10) {
        requestAnimationFrame(() => tryScroll(attempts + 1));
        return;
      }
      if (w > 0 && total > 1) {
        el.scrollTo({
          left: (initialIndexRef.current + 1) * w,
          behavior: "auto",
        });
      }
      setActiveIndex(initialIndexRef.current);
    };
    const raf = requestAnimationFrame(() => tryScroll(0));
    return () => {
      canceled = true;
      cancelAnimationFrame(raf);
    };
  }, [total]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el || isJumping.current) return;
    const w = el.offsetWidth;
    if (w === 0) return;

    const idx = Math.round(Math.abs(el.scrollLeft) / w);
    let real = idx;
    if (total > 1) {
      if (idx === 0) real = total - 1;
      else if (idx === total + 1) real = 0;
      else real = idx - 1;
    }
    if (real >= 0 && real < total) setActiveIndex(real);

    // كشف نهاية التمرير ثم القفز الصامت من الكلون إلى الصورة الحقيقية
    if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current);
    scrollEndTimer.current = setTimeout(() => {
      const el2 = scrollRef.current;
      if (!el2 || total <= 1) return;
      const w2 = el2.offsetWidth;
      if (w2 === 0) return;
      const idx2 = Math.round(Math.abs(el2.scrollLeft) / w2);
      if (idx2 === 0) {
        isJumping.current = true;
        el2.scrollTo({ left: total * w2, behavior: "auto" });
        requestAnimationFrame(() => {
          isJumping.current = false;
        });
      } else if (idx2 === total + 1) {
        isJumping.current = true;
        el2.scrollTo({ left: w2, behavior: "auto" });
        requestAnimationFrame(() => {
          isJumping.current = false;
        });
      }
    }, 140);
  };

  const scrollToIndex = (realIndex: number) => {
    setActiveIndex(realIndex);
    const el = scrollRef.current;
    if (!el || total <= 1) return;
    const w = el.offsetWidth;
    if (w === 0) return;
    isJumping.current = true;
    el.scrollTo({ left: (realIndex + 1) * w, behavior: "auto" });
    requestAnimationFrame(() => {
      isJumping.current = false;
    });
  };

  useEffect(() => {
    return () => {
      if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current);
    };
  }, []);

  return { scrollRef, activeIndex, handleScroll, scrollToIndex };
}

/* ------------------------------------------------------------------ */
/*  بانرات العروض والكوبونات (Promo Banners Carousel)                  */
/* ------------------------------------------------------------------ */

function PromoBanners() {
  const [activeBanner, setActiveBanner] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const copyTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleBannerScroll = () => {
    const el = bannerRef.current;
    if (!el) return;
    const index = Math.round(Math.abs(el.scrollLeft) / el.offsetWidth);
    setActiveBanner(Math.min(index, PROMO_BANNERS.length - 1));
  };

  const goToBanner = (index: number) => {
    const el = bannerRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.offsetWidth, behavior: "smooth" });
  };

  useEffect(() => {
    const id = setInterval(() => {
      const el = bannerRef.current;
      if (!el || document.hidden) return;
      const next = (activeBanner + 1) % PROMO_BANNERS.length;
      el.scrollTo({ left: next * el.offsetWidth, behavior: "smooth" });
    }, 5000);
    return () => clearInterval(id);
  }, [activeBanner]);

  useEffect(() => {
    return () => {
      if (copyTimeout.current) clearTimeout(copyTimeout.current);
    };
  }, []);

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard?.writeText(code);
    } catch {
      /* تجاهل أخطاء الحافظة */
    }
    setCopiedCode(code);
    if (copyTimeout.current) clearTimeout(copyTimeout.current);
    copyTimeout.current = setTimeout(() => setCopiedCode(null), 1800);
  };

  return (
    <section className="mt-6">
      <div
        ref={bannerRef}
        onScroll={handleBannerScroll}
        className={`flex overflow-x-auto snap-x snap-mandatory ${noScrollbar}`}
        dir="ltr"
      >
        {PROMO_BANNERS.map((b) => (
          <div key={b.id} className="w-full shrink-0 snap-center px-5">
            <div
              dir="rtl"
              className={`relative h-[164px] overflow-hidden rounded-[1.75rem] ${b.gradient} p-4 text-white shadow-lg shadow-stone-900/10`}
            >
              <div className="pointer-events-none absolute -left-10 -top-10 h-36 w-36 rounded-full border border-white/10" />
              <div className="pointer-events-none absolute -left-3 -top-3 h-20 w-20 rounded-full bg-white/[0.06]" />
              <div className="pointer-events-none absolute -right-16 -bottom-16 h-40 w-40 rounded-full bg-white/[0.04]" />
              <b.icon
                className="pointer-events-none absolute -left-3 bottom-1 h-28 w-28 -rotate-12 text-white/10"
                strokeWidth={1.1}
              />

              <div className="relative z-10 flex h-full flex-col justify-between">
                <div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold backdrop-blur-sm">
                    <Sparkles size={10} className="text-[#FFE3A3]" />
                    {b.badge}
                  </span>
                  <h3 className="mt-2 text-[16px] font-extrabold leading-snug">
                    {b.title}
                  </h3>
                  <p className="mt-0.5 text-[11px] font-medium text-white/70">
                    {b.subtitle}
                  </p>
                </div>

                <div className="flex items-end justify-between">
                  <motion.button
                    whileTap={{ scale: 0.94 }}
                    type="button"
                    onClick={() => copyCode(b.code)}
                    aria-label={`نسخ كود الخصم ${b.code}`}
                    className="flex items-center gap-1.5 rounded-xl border border-dashed border-white/40 bg-black/20 px-3 py-1.5 backdrop-blur-sm"
                  >
                    {copiedCode === b.code ? (
                      <Check size={13} className="text-[#FFE3A3]" />
                    ) : (
                      <Ticket size={13} className="text-white/70" />
                    )}
                    <span
                      className={
                        copiedCode === b.code
                          ? "text-[11px] font-bold"
                          : "font-mono text-[11px] font-bold tracking-[0.18em]"
                      }
                    >
                      {copiedCode === b.code ? "تم النسخ" : b.code}
                    </span>
                  </motion.button>

                  <span
                    className={`text-[28px] font-black leading-none ${b.highlight}`}
                  >
                    {b.discount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-center gap-1.5">
        {PROMO_BANNERS.map((b, i) => (
          <button
            key={b.id}
            type="button"
            onClick={() => goToBanner(i)}
            aria-label={`عرض البانر ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === activeBanner
                ? "w-5 bg-[#4B5320]"
                : "w-1.5 bg-stone-300 hover:bg-stone-400"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  كرت المنتج (Product Card)                                          */
/* ------------------------------------------------------------------ */

function ProductCard({
  product,
  onToggleFavorite,
  onClick,
}: {
  product: Product;
  onToggleFavorite: (id: number) => void;
  onClick: (product: Product) => void;
}) {
  return (
    <motion.article
      whileTap={{ scale: 0.97 }}
      className="flex flex-col cursor-pointer group"
      onClick={() => onClick(product)}
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-stone-100">
        <Image
          src={product.images[0]}
          alt={product.title}
          fill
          unoptimized
          sizes="(max-width: 448px) 45vw, 200px"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {product.isNew && (
          <span className="absolute right-2 top-2 rounded-md bg-[#D9A441] px-2 py-[3px] text-[10px] font-bold tracking-wide text-stone-900 shadow-sm">
            جديد
          </span>
        )}

        {product.discount && (
          <span className="absolute bottom-2 right-2 rounded-md bg-[#D9A441] px-1.5 py-0.5 text-[10px] font-bold text-stone-900 shadow-sm">
            -{product.discount}%
          </span>
        )}

        <motion.button
          whileTap={{ scale: 0.8 }}
          type="button"
          aria-label="تبديل المفضلة"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(product.id);
          }}
          className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur"
        >
          <Heart
            size={16}
            className={
              product.isFavorite
                ? "fill-red-600 text-red-600"
                : "text-stone-500"
            }
          />
        </motion.button>
      </div>

      <div className="mt-2.5 flex flex-1 flex-col">
        <h3 className="line-clamp-2 text-[13px] font-semibold leading-snug text-stone-900">
          {product.title}
        </h3>

        <div className="mt-1.5 flex flex-wrap items-baseline gap-x-1.5">
          <span className="text-[15px] font-bold text-stone-900">
            {product.price.toFixed(2)} $
          </span>
          {product.originalPrice && (
            <span className="text-[11px] font-medium text-stone-400 line-through">
              {product.originalPrice.toFixed(2)} $
            </span>
          )}
        </div>

        <div className="mt-1 flex items-center gap-1 text-[11px] text-stone-500">
          <Star size={12} className="fill-amber-400 text-amber-400" />
          <span className="font-semibold text-stone-700">{product.rating}</span>
          <span className="text-stone-300">•</span>
          <span>{formatSold(product.sold)} مبيعات</span>
        </div>
      </div>
    </motion.article>
  );
}

/* ------------------------------------------------------------------ */
/*  عارض الصور بملء الشاشة (Fullscreen Viewer)                         */
/* ------------------------------------------------------------------ */

function FullscreenViewer({
  images,
  initialIndex,
  onClose,
}: {
  images: string[];
  initialIndex: number;
  onClose: (finalIndex: number) => void;
}) {
  const total = images.length;
  const extended =
    total > 1 ? [images[total - 1], ...images, images[0]] : images;
  const { scrollRef, activeIndex, handleScroll } = useInfiniteCarousel(
    total,
    initialIndex,
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="absolute inset-0 z-20 flex flex-col bg-black"
      dir="ltr"
    >
      {/* شريط علوي: زر إغلاق + مؤشر الصورة */}
      <div
        className="relative z-10 flex items-center justify-between p-4 text-white"
        dir="rtl"
      >
        <button
          type="button"
          onClick={() => onClose(activeIndex)}
          aria-label="إغلاق العرض"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur transition hover:bg-white/20"
        >
          <X size={20} />
        </button>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur">
          {activeIndex + 1} / {total}
        </span>
      </div>

      {/* منطقة الصور */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className={`flex flex-1 overflow-x-auto overflow-y-hidden snap-x snap-mandatory overscroll-contain ${noScrollbar}`}
        dir="ltr"
      >
        {extended.map((img, i) => (
          <div key={i} className="relative h-full w-full shrink-0 snap-center">
            <Image
              src={img}
              alt={`صورة ${i + 1}`}
              fill
              unoptimized
              className="object-contain p-4"
            />
          </div>
        ))}
      </div>

      {/* نقاط المؤشر */}
      {total > 1 && (
        <div className="flex items-center justify-center gap-1.5 pb-6">
          {images.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeIndex ? "w-5 bg-white" : "w-1.5 bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  نافذة تفاصيل المنتج (Product Bottom Sheet)                         */
/* ------------------------------------------------------------------ */

function ProductBottomSheet({
  product,
  onClose,
  onAddToCart,
}: {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, color?: string, size?: string) => void;
}) {
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    product.colors ? product.colors[0].name : undefined,
  );
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.sizes ? product.sizes[0] : undefined,
  );
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);

  const total = product.images.length;
  const extendedImages =
    total > 1
      ? [product.images[total - 1], ...product.images, product.images[0]]
      : product.images;

  const { scrollRef, activeIndex, handleScroll, scrollToIndex } =
    useInfiniteCarousel(total);

  const sheetRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const dragControls = useDragControls();
  const isClosing = useRef(false);

  // كشف الضغط على الصورة (بدون تفاعل مع السحب)
  const pointerInfo = useRef<{
    startX: number;
    startY: number;
    moved: boolean;
  } | null>(null);

  // قفل تمرير الصفحة الخلفية أثناء فتح النافذة
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  // تشغيل أنميشن الدخول الناعم
  useEffect(() => {
    controls.start({
      y: 0,
      transition: { type: "spring", stiffness: 220, damping: 28, mass: 1 },
    });
  }, [controls]);

  const closeSheet = async () => {
    if (isClosing.current) return;
    isClosing.current = true;
    onClose();
  };

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (isClosing.current) return;

    const sheetHeight = sheetRef.current?.offsetHeight ?? 0;
    const dismissDistance = Math.min(160, Math.max(90, sheetHeight * 0.2));
    if (
      info.offset.y > dismissDistance ||
      (info.offset.y > 32 && info.velocity.y > 650)
    ) {
      closeSheet();
    } else {
      controls.start({
        y: 0,
        transition: { type: "spring", stiffness: 300, damping: 30 },
      });
    }
  };

  const realIndexForExtended = (i: number) => {
    if (total <= 1) return i;
    if (i === 0) return total - 1;
    if (i === total + 1) return 0;
    return i - 1;
  };

  const handleCarouselPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    pointerInfo.current = {
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
    };
  };

  const handleCarouselPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const p = pointerInfo.current;
    if (!p || p.moved) return;
    if (
      Math.abs(e.clientX - p.startX) > 8 ||
      Math.abs(e.clientY - p.startY) > 8
    ) {
      p.moved = true;
    }
  };

  const handleCarouselPointerUp = () => {
    const p = pointerInfo.current;
    pointerInfo.current = null;
    if (!p || p.moved) return;
    // ضغطة نظيفة → افتح العرض الكامل على الصورة الحالية
    setFullscreenIndex(activeIndex);
  };

  const handleCarouselPointerCancel = () => {
    pointerInfo.current = null;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
      {/* الخلفية المعتمة */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={closeSheet}
        className="absolute inset-0 bg-black/50"
      />

      {/* النافذة المنزلقة */}
      <motion.div
        ref={sheetRef}
        initial={{ y: "100%" }}
        animate={controls}
        exit={{ y: "100%" }}
        transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
        drag="y"
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.55 }}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        className="relative flex h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
      >
        {/* مقبض السحب */}
        <div
          className="flex w-full justify-center py-4 cursor-grab active:cursor-grabbing touch-none select-none"
          onPointerDown={(event) => dragControls.start(event)}
        >
          <div className="h-1.5 w-12 rounded-full bg-stone-300" />
        </div>

        {/* الترويسة العلوية */}
        <div className="flex items-center justify-between px-5 pb-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={closeSheet}
            className="rounded-full bg-stone-100 p-2 text-stone-800"
          >
            <X size={20} />
          </motion.button>
          <h2 className="text-sm font-bold text-stone-500">تفاصيل المنتج</h2>
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="rounded-full bg-stone-100 p-2 text-stone-800"
          >
            <Heart
              size={20}
              className={product.isFavorite ? "fill-red-600 text-red-600" : ""}
            />
          </motion.button>
        </div>

        {/* محتوى قابل للتمرير عمودياً (مع إخفاء شريط التمرير) */}
        <div
          className={`flex-1 overflow-y-auto overflow-x-hidden pb-24 ${noScrollbar}`}
        >
          {/* معرض الصور */}
          <div className="relative">
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              onPointerDown={handleCarouselPointerDown}
              onPointerMove={handleCarouselPointerMove}
              onPointerUp={handleCarouselPointerUp}
              onPointerCancel={handleCarouselPointerCancel}
              className={`flex overflow-x-auto snap-x snap-mandatory overscroll-contain cursor-zoom-in ${noScrollbar}`}
              dir="ltr"
            >
              {extendedImages.map((img, i) => (
                <div
                  key={i}
                  className="relative h-[300px] w-full shrink-0 snap-center bg-stone-50"
                >
                  <Image
                    src={img}
                    alt={`${product.title} - ${realIndexForExtended(i) + 1}`}
                    fill
                    unoptimized
                    draggable={false}
                    className="object-contain p-4 pointer-events-none select-none"
                  />
                </div>
              ))}
            </div>

            {/* زر العرض بملء الشاشة */}
            <button
              type="button"
              onClick={() => setFullscreenIndex(activeIndex)}
              aria-label="عرض الصور بملء الشاشة"
              className="absolute left-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-stone-800 shadow-sm backdrop-blur transition hover:bg-white"
            >
              <Maximize2 size={16} />
            </button>

            {total > 1 && (
              <div className="pointer-events-none absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
                {product.images.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === activeIndex
                        ? "w-4 bg-stone-800"
                        : "w-1.5 bg-stone-300"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* محتوى المنتج */}
          <div className="px-6 pt-4">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-xl font-extrabold text-stone-900 leading-tight">
                {product.title}
              </h3>
              <div className="text-left">
                <span className="text-xl font-black text-stone-900">
                  {product.price.toFixed(2)} $
                </span>
                {product.originalPrice && (
                  <span className="block text-xs font-medium text-stone-400 line-through">
                    {product.originalPrice.toFixed(2)} $
                  </span>
                )}
              </div>
            </div>

            <div className="mt-2 flex items-center gap-2 text-sm text-stone-500">
              <Star size={16} className="fill-amber-400 text-amber-400" />
              <span className="font-semibold text-stone-700">
                {product.rating}
              </span>
              <span>({formatSold(product.sold)} تقييم)</span>
            </div>

            <div className="mt-5">
              <h4 className="text-sm font-bold text-stone-900">التفاصيل</h4>
              <p className="mt-1 text-[13px] leading-relaxed text-stone-500">
                {product.description}
              </p>
            </div>

            {/* الألوان */}
            {product.colors && product.colors.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-bold text-stone-900">
                  اللون:{" "}
                  <span className="font-normal text-stone-500">
                    {selectedColor}
                  </span>
                </h4>
                <div className="mt-2.5 flex gap-3">
                  {product.colors.map((color) => (
                    <motion.button
                      key={color.name}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedColor(color.name)}
                      className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                        selectedColor === color.name
                          ? "border-stone-900 scale-110"
                          : "border-transparent"
                      }`}
                    >
                      <span
                        className="h-7 w-7 rounded-full shadow-sm"
                        style={{
                          backgroundColor:
                            color.name === "مموه" ? "#5C4033" : color.hex,
                          backgroundImage:
                            color.name === "مموه"
                              ? "repeating-linear-gradient(45deg, #4B5320 0, #4B5320 2px, #5C4033 2px, #5C4033 4px)"
                              : "none",
                        }}
                      />
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* المقاسات */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-bold text-stone-900">المقاس</h4>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <motion.button
                      key={size}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedSize(size)}
                      className={`flex h-10 min-w-[3rem] items-center justify-center rounded-xl border px-3 text-sm font-semibold transition-all ${
                        selectedSize === size
                          ? "border-stone-900 bg-stone-900 text-white shadow-md"
                          : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
                      }`}
                    >
                      {size}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* زر الإضافة للسلة */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-stone-100 bg-white/95 p-4 pb-6">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              onAddToCart(product, selectedColor, selectedSize);
              closeSheet();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#4B5320] py-4 text-sm font-bold text-white shadow-lg transition-colors hover:bg-[#3b4219]"
          >
            <ShoppingCart size={18} />
            إضافة إلى السلة - {product.price.toFixed(2)} $
          </motion.button>
        </div>
      </motion.div>

      {/* عارض الصور بملء الشاشة */}
      <AnimatePresence>
        {fullscreenIndex !== null && (
          <FullscreenViewer
            images={product.images}
            initialIndex={fullscreenIndex}
            onClose={(finalIndex) => {
              setFullscreenIndex(null);
              scrollToIndex(finalIndex);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  الصفحة الرئيسية                                                    */
/* ------------------------------------------------------------------ */

export default function TacticalStorePage() {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [activeFilter, setActiveFilter] = useState<Filter>("الكل");
  const [activeNav, setActiveNav] = useState("home");
  const [query, setQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [sortOption, setSortOption] = useState<SortOption>("default");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const toggleFavorite = (id: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p)),
    );
  };

  const handleAddToCart = (product: Product, color?: string, size?: string) => {
    setCartCount((prev) => prev + 1);
    console.log(
      "تمت إضافة:",
      product.title,
      "| اللون:",
      color,
      "| المقاس:",
      size,
    );
  };

  const visibleProducts = useMemo(() => {
    let filtered = products.filter((p) => {
      const matchesFilter =
        activeFilter === "الكل" || p.category === activeFilter;
      const matchesQuery = p.title
        .toLowerCase()
        .includes(query.trim().toLowerCase());
      return matchesFilter && matchesQuery;
    });

    if (sortOption === "priceAsc") filtered.sort((a, b) => a.price - b.price);
    else if (sortOption === "priceDesc")
      filtered.sort((a, b) => b.price - a.price);
    else if (sortOption === "rating")
      filtered.sort((a, b) => b.rating - a.rating);

    return filtered;
  }, [products, activeFilter, query, sortOption]);

  return (
    <div className="min-h-screen bg-stone-50" dir="rtl">
      <main className="mx-auto max-w-md bg-white min-h-screen pb-24 shadow-sm">
        {/* الترويسة */}
        <header className="flex items-start justify-between px-5 pt-6">
          <div>
            <p className="text-xs font-medium text-stone-500">
              مرحباً بعودتك، أيها العميل
            </p>
            <h1 className="mt-0.5 text-2xl font-extrabold tracking-tight text-stone-900">
              Northgate
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#4B5320]/10 text-[#4B5320]"
            >
              <Bell size={18} />
              <span className="absolute left-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-red-600" />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#4B5320]/10 text-[#4B5320]"
            >
              <ShoppingCart size={18} />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -left-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </header>

        {/* شريط البحث */}
        <div className="mt-5 px-5">
          <div className="flex h-12 items-center gap-2.5 rounded-2xl bg-stone-100 px-4 transition-shadow focus-within:ring-2 focus-within:ring-[#4B5320]/20">
            <Search size={18} className="shrink-0 text-stone-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث عن عتاد تكتيكي..."
              className="h-full flex-1 bg-transparent text-sm text-stone-900 outline-none placeholder:text-stone-400"
            />
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="shrink-0 text-stone-900"
            >
              <SlidersHorizontal size={18} />
            </motion.button>
          </div>
        </div>

        {/* الفئات */}
        <section className="mt-6">
          <div
            className={`flex gap-4 overflow-x-auto px-5 pb-1 ${noScrollbar}`}
          >
            {CATEGORIES.map((cat) => (
              <motion.button
                whileTap={{ scale: 0.9 }}
                key={cat.id}
                onClick={() => setActiveFilter(cat.filterValue)}
                className="flex w-14 shrink-0 flex-col items-center gap-2 group"
              >
                <span
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl ${cat.bgColor} text-stone-800 transition-all group-hover:ring-2 ring-[#D9A441]/60`}
                >
                  <cat.icon size={22} strokeWidth={1.8} />
                </span>
                <span className="truncate text-[11px] font-medium text-stone-600">
                  {cat.name}
                </span>
              </motion.button>
            ))}
          </div>
        </section>

        {/* بانرات العروض والكوبونات */}
        <PromoBanners />

        {/* العلامات التجارية */}
        <section className="mt-7">
          <h2 className="px-5 text-base font-bold tracking-tight text-stone-900">
            أفضل العلامات التجارية
          </h2>
          <div
            className={`mt-3 flex gap-3 overflow-x-auto px-5 pb-1 ${noScrollbar}`}
          >
            {BRANDS.map((brand) => (
              <motion.div
                whileHover={{ y: -2 }}
                key={brand}
                className="flex h-16 w-28 shrink-0 items-center justify-center rounded-2xl border border-stone-100 bg-white px-3 shadow-sm cursor-pointer transition-colors hover:border-[#D9A441]/60"
              >
                <span className="text-center text-[12px] font-bold uppercase tracking-wide text-stone-700">
                  {brand}
                </span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* العتاد الرائج */}
        <section className="mt-7 px-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-base font-bold tracking-tight text-stone-900">
              <Flame size={16} className="text-[#D9A441]" />
              العتاد الرائج
            </h2>

            <div className="relative group">
              <button className="flex items-center gap-1 text-xs font-semibold text-stone-500 transition hover:text-[#4B5320]">
                <ArrowDownUp size={14} />
                ترتيب
              </button>
              <div className="absolute left-0 top-full z-10 mt-1 hidden w-36 flex-col overflow-hidden rounded-xl bg-white py-1 shadow-lg ring-1 ring-stone-100 group-hover:flex">
                <button
                  onClick={() => setSortOption("default")}
                  className={`px-3 py-2 text-right text-xs hover:bg-stone-50 ${sortOption === "default" ? "font-bold text-[#4B5320]" : "text-stone-600"}`}
                >
                  الافتراضي
                </button>
                <button
                  onClick={() => setSortOption("priceAsc")}
                  className={`px-3 py-2 text-right text-xs hover:bg-stone-50 ${sortOption === "priceAsc" ? "font-bold text-[#4B5320]" : "text-stone-600"}`}
                >
                  السعر: الأقل أولاً
                </button>
                <button
                  onClick={() => setSortOption("priceDesc")}
                  className={`px-3 py-2 text-right text-xs hover:bg-stone-50 ${sortOption === "priceDesc" ? "font-bold text-[#4B5320]" : "text-stone-600"}`}
                >
                  السعر: الأعلى أولاً
                </button>
                <button
                  onClick={() => setSortOption("rating")}
                  className={`px-3 py-2 text-right text-xs hover:bg-stone-50 ${sortOption === "rating" ? "font-bold text-[#4B5320]" : "text-stone-600"}`}
                >
                  الأعلى تقييماً
                </button>
              </div>
            </div>
          </div>

          <div
            className={`mt-3 flex gap-2 overflow-x-auto pb-1 ${noScrollbar}`}
          >
            {FILTERS.map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`relative shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                    isActive ? "text-white" : "text-stone-600 bg-stone-100"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeFilter"
                      className="absolute inset-0 rounded-full bg-[#4B5320] shadow-sm"
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative z-10">{filter}</span>
                </button>
              );
            })}
          </div>

          <motion.div layout className="mt-4 grid grid-cols-2 gap-x-4 gap-y-6">
            <AnimatePresence>
              {visibleProducts.map((product) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  key={product.id}
                >
                  <ProductCard
                    product={product}
                    onToggleFavorite={toggleFavorite}
                    onClick={setSelectedProduct}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {visibleProducts.length === 0 && (
            <div className="mt-10 flex flex-col items-center justify-center text-stone-400">
              <Search size={40} className="mb-2 opacity-20" />
              <p className="text-sm font-medium">لا يوجد عتاد يطابق بحثك.</p>
            </div>
          )}
        </section>
      </main>

      {/* نافذة تفاصيل المنتج */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductBottomSheet
            key={selectedProduct.id}
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={handleAddToCart}
          />
        )}
      </AnimatePresence>

      {/* شريط التنقل السفلي */}
      <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md border-t border-stone-200 bg-white/90 backdrop-blur-md pb-safe">
        <div className="flex h-16 items-center justify-around px-2">
          {NAV_ITEMS.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <motion.button
                whileTap={{ scale: 0.9 }}
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className="flex flex-1 flex-col items-center justify-center gap-1 py-2"
              >
                <div className="relative">
                  <item.icon
                    size={20}
                    className={isActive ? "text-[#4B5320]" : "text-stone-400"}
                    strokeWidth={isActive ? 2.4 : 1.9}
                  />
                  {item.id === "cart" && cartCount > 0 && (
                    <span className="absolute -right-2 -top-1.5 flex h-[14px] min-w-[14px] items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-bold text-white">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] font-semibold ${
                    isActive ? "text-[#4B5320]" : "text-stone-400"
                  }`}
                >
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
