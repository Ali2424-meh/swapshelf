import {
  BookOpen,
  Gamepad2,
  Puzzle,
  Blocks,
  Disc3,
  Laptop,
  Scissors,
  type LucideIcon,
} from "lucide-react";

export const CATEGORIES: { name: string; slug: string; icon: LucideIcon }[] = [
  { name: "Books", slug: "books", icon: BookOpen },
  { name: "Video Games", slug: "video-games", icon: Gamepad2 },
  { name: "Board Games", slug: "board-games", icon: Puzzle },
  { name: "Toys", slug: "toys", icon: Blocks },
  { name: "Music & DVDs", slug: "music-dvds", icon: Disc3 },
  { name: "Tech", slug: "tech", icon: Laptop },
  { name: "Craft & Hobby", slug: "craft-hobby", icon: Scissors },
];

export const RADIUS_OPTIONS = ["Within 5 km", "Within 10 km", "Within 25 km", "Within 50 km"];

export type Listing = {
  id: string;
  title: string;
  category: string;
  distanceKm: number;
  ownerName: string;
  ownerInitials: string;
  rating: number;
  imageGradient: string;
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
    imageGradient: "from-slate-300 to-slate-400",
  },
  {
    id: "2",
    title: "Dune — Hardcover",
    category: "Books",
    distanceKm: 1.2,
    ownerName: "Sam K.",
    ownerInitials: "SK",
    rating: 4.9,
    imageGradient: "from-amber-200 to-amber-300",
  },
  {
    id: "3",
    title: "Catan — Complete Set",
    category: "Board Games",
    distanceKm: 4.1,
    ownerName: "Jordan P.",
    ownerInitials: "JP",
    rating: 4.6,
    imageGradient: "from-emerald-200 to-emerald-300",
  },
];

export const ADMIN_STATS = {
  totalUsers: 1248,
  usersGrowth: "12%",
  activeListings: 3892,
  listingsGrowth: "8%",
  pendingReports: 14,
};
