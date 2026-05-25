import type { ComponentType } from "react";
import {
  IconBlocks,
  IconBookOpen,
  IconDisc,
  IconGamepad,
  IconLaptop,
  IconPuzzle,
  IconScissors,
} from "@/components/icons";

type IconComponent = ComponentType<{ className?: string; strokeWidth?: number }>;

export type CategoryDisplay = {
  id?: string;
  name: string;
  slug: string;
  icon: IconComponent;
  emoji: string;
  active?: boolean;
  sort_order?: number;
};

export const FALLBACK_CATEGORIES: CategoryDisplay[] = [
  { name: "Books", slug: "books", icon: IconBookOpen, emoji: "Books", active: true, sort_order: 10 },
  { name: "Video Games", slug: "video-games", icon: IconGamepad, emoji: "Games", active: true, sort_order: 20 },
  { name: "Board Games", slug: "board-games", icon: IconPuzzle, emoji: "Board", active: true, sort_order: 30 },
  { name: "Toys", slug: "toys", icon: IconBlocks, emoji: "Toys", active: true, sort_order: 40 },
  { name: "Music & DVDs", slug: "music-dvds", icon: IconDisc, emoji: "Music", active: true, sort_order: 50 },
  { name: "Tech", slug: "tech", icon: IconLaptop, emoji: "Tech", active: true, sort_order: 60 },
  { name: "Craft & Hobby", slug: "craft-hobby", icon: IconScissors, emoji: "Craft", active: true, sort_order: 70 },
];

export const AREA_SCOPE_OPTIONS = [
  { label: "Same barangay", value: "barangay" },
  { label: "Same city/municipality", value: "city" },
  { label: "Same province", value: "province" },
  { label: "All Philippines", value: "all" },
];

export const RADIUS_OPTIONS = [
  { label: "Within 5 km", value: 5 },
  { label: "Within 10 km", value: 10 },
  { label: "Within 25 km", value: 25 },
  { label: "Within 50 km", value: 50 },
];

export type Listing = {
  id: string;
  title: string;
  description?: string | null;
  wants?: string | null;
  category: string;
  categorySlug?: string;
  categoryEmoji?: string;
  distanceKm: number | null;
  areaLabel?: string | null;
  areaRank?: number | null;
  ownerId?: string;
  ownerName: string;
  ownerInitials: string;
  ownerAvatarUrl?: string | null;
  rating: number | null;
  reviewCount: number;
  imageUrl?: string | null;
  imageGradient: string;
  condition: "Like New" | "Good" | "Fair";
  isSaved?: boolean;
  isOwn?: boolean;
};

export const FALLBACK_LISTINGS: Listing[] = [
  {
    id: "demo-1",
    title: "The Last of Us Part II (PS4)",
    category: "Video Games",
    categorySlug: "video-games",
    categoryEmoji: "Games",
    distanceKm: null,
    areaLabel: "Cebu City, Cebu",
    ownerName: "Alex M.",
    ownerInitials: "AM",
    rating: null,
    reviewCount: 0,
    imageGradient: "from-slate-400 to-slate-600",
    condition: "Like New",
    isSaved: false,
    isOwn: false,
  },
  {
    id: "demo-2",
    title: "Dune Hardcover First Edition",
    category: "Books",
    categorySlug: "books",
    categoryEmoji: "Books",
    distanceKm: null,
    areaLabel: "Quezon City, Metro Manila",
    ownerName: "Sam K.",
    ownerInitials: "SK",
    rating: null,
    reviewCount: 0,
    imageGradient: "from-amber-300 to-orange-400",
    condition: "Good",
    isSaved: false,
    isOwn: false,
  },
  {
    id: "demo-3",
    title: "Catan Complete Set",
    category: "Board Games",
    categorySlug: "board-games",
    categoryEmoji: "Board",
    distanceKm: null,
    areaLabel: "Davao City, Davao del Sur",
    ownerName: "Jordan P.",
    ownerInitials: "JP",
    rating: null,
    reviewCount: 0,
    imageGradient: "from-emerald-400 to-teal-500",
    condition: "Like New",
    isSaved: false,
    isOwn: false,
  },
];

export function iconForCategory(slug?: string): IconComponent {
  const map: Record<string, IconComponent> = {
    books: IconBookOpen,
    "video-games": IconGamepad,
    "board-games": IconPuzzle,
    toys: IconBlocks,
    "music-dvds": IconDisc,
    tech: IconLaptop,
    "craft-hobby": IconScissors,
  };
  return map[slug ?? ""] ?? IconBlocks;
}
