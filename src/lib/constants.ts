import type { ComponentType } from "react";
import {
  IconBookOpen, IconGamepad, IconPuzzle, IconBlocks,
  IconDisc, IconLaptop, IconScissors,
} from "@/components/icons";

type IconComponent = ComponentType<{ className?: string; strokeWidth?: number }>;

export const CATEGORIES: { name: string; slug: string; icon: IconComponent; emoji: string }[] = [
  { name: "Books",       slug: "books",       icon: IconBookOpen, emoji: "📚" },
  { name: "Video Games", slug: "video-games", icon: IconGamepad,  emoji: "🎮" },
  { name: "Board Games", slug: "board-games", icon: IconPuzzle,   emoji: "🧩" },
  { name: "Toys",        slug: "toys",        icon: IconBlocks,   emoji: "🧸" },
  { name: "Music & DVDs",slug: "music-dvds",  icon: IconDisc,     emoji: "💿" },
  { name: "Tech",        slug: "tech",        icon: IconLaptop,   emoji: "💻" },
  { name: "Craft & Hobby",slug: "craft-hobby",icon: IconScissors, emoji: "✂️" },
];

export const RADIUS_OPTIONS = [
  "Within 5 km",
  "Within 10 km",
  "Within 25 km",
  "Within 50 km",
];

export type Listing = {
  id: string;
  title: string;
  category: string;
  distanceKm: number;
  ownerName: string;
  ownerInitials: string;
  rating: number;
  imageGradient: string;
  condition: "Like New" | "Good" | "Fair";
};

export const NEARBY_LISTINGS: Listing[] = [
  {
    id: "1",
    title: "The Last of Us Part II (PS4)",
    category: "Video Games",
    distanceKm: 2.5,
    ownerName: "Alex M.",
    ownerInitials: "AM",
    rating: 4.8,
    imageGradient: "from-slate-400 to-slate-600",
    condition: "Like New",
  },
  {
    id: "2",
    title: "Dune — Hardcover First Edition",
    category: "Books",
    distanceKm: 1.2,
    ownerName: "Sam K.",
    ownerInitials: "SK",
    rating: 4.9,
    imageGradient: "from-amber-300 to-orange-400",
    condition: "Good",
  },
  {
    id: "3",
    title: "Catan — Complete Set",
    category: "Board Games",
    distanceKm: 4.1,
    ownerName: "Jordan P.",
    ownerInitials: "JP",
    rating: 4.6,
    imageGradient: "from-emerald-400 to-teal-500",
    condition: "Like New",
  },
  {
    id: "4",
    title: "MacBook Pro Sleeve (13-inch)",
    category: "Tech",
    distanceKm: 0.8,
    ownerName: "Maya R.",
    ownerInitials: "MR",
    rating: 4.7,
    imageGradient: "from-sky-400 to-blue-500",
    condition: "Like New",
  },
  {
    id: "5",
    title: "Elden Ring (Xbox Series X)",
    category: "Video Games",
    distanceKm: 3.3,
    ownerName: "Leo T.",
    ownerInitials: "LT",
    rating: 5.0,
    imageGradient: "from-yellow-500 to-amber-600",
    condition: "Good",
  },
  {
    id: "6",
    title: "Watercolour Starter Kit",
    category: "Craft & Hobby",
    distanceKm: 5.7,
    ownerName: "Nina W.",
    ownerInitials: "NW",
    rating: 4.5,
    imageGradient: "from-rose-300 to-pink-500",
    condition: "Fair",
  },
];

export const ADMIN_STATS = {
  totalUsers: 1248,
  usersGrowth: "+12%",
  activeListings: 3892,
  listingsGrowth: "+8%",
  completedSwaps: 9641,
  swapsGrowth: "+21%",
  pendingReports: 14,
};
