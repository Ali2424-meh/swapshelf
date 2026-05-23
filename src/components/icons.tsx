// Pure SVG icon components — no external icon library needed
type IconProps = { className?: string; strokeWidth?: number; filled?: boolean };

const ic = (paths: string, vb = "0 0 24 24") =>
  ({ className = "h-5 w-5", strokeWidth = 2, filled = false }: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox={vb} fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"} strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round" className={className}
      dangerouslySetInnerHTML={{ __html: paths }} />
  );

export const IconSearch = ic('<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>');
export const IconMapPin = ic('<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>');
export const IconChevronDown = ic('<path d="m6 9 6 6 6-6"/>');
export const IconChevronRight = ic('<path d="m9 18 6-6-6-6"/>');
export const IconHeart = ic('<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>');
export const IconStar = ic('<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>');
export const IconArrowLeftRight = ic('<path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/>');
export const IconPackageOpen = ic('<path d="M12 22v-9"/><path d="M15.17 2.21a1.67 1.67 0 0 1 1.63 0L21 4.57a1.93 1.93 0 0 1 0 3.36L17 10l-5-3Z"/><path d="M7 10 3 7.93a1.93 1.93 0 0 1 0-3.36l4.2-2.36a1.67 1.67 0 0 1 1.63 0L12 4.57l-5 3Z"/><path d="m7 10-5 3.07A1.93 1.93 0 0 0 2 16v4l10 2V13Z"/><path d="m17 10 5 3.07A1.93 1.93 0 0 1 22 16v4l-10 2V13Z"/><path d="M7 10l5 3 5-3"/>');
export const IconMessageCircle = ic('<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>');
export const IconBox = ic('<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>');
export const IconLogOut = ic('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>');
export const IconUser = ic('<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>');
export const IconLayoutDashboard = ic('<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>');
export const IconShield = ic('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>');
export const IconShieldAlert = ic('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="M12 8v4"/><path d="M12 16h.01"/>');
export const IconTag = ic('<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>');
export const IconUserPlus = ic('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>');
export const IconList = ic('<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>');
export const IconBookOpen = ic('<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>');
export const IconGamepad = ic('<line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/><rect x="2" y="6" width="20" height="12" rx="2"/>');
export const IconPuzzle = ic('<path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-3.408 0l-1.569-1.567a.881.881 0 0 0-.878-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a.881.881 0 0 0-.289-.878L2.582 10.09a2.402 2.402 0 0 1 0-3.408l1.567-1.569a.881.881 0 0 0 .29-.878C4.365 3.736 3.935 3.389 3.47 3.21a2.5 2.5 0 1 1 3.237-3.237c.18.463.527.894 1.02.967a.881.881 0 0 0 .878-.29l1.61-1.61a2.402 2.402 0 0 1 3.408 0l1.569 1.568c.23.23.556.338.878.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.894.527-.967 1.02Z"/>');
export const IconBlocks = ic('<rect width="7" height="7" x="14.5" y="14.5" rx="1"/><path d="M14.5 4.5H21a1 1 0 0 1 1 1V12"/><path d="M2 9.5V4a1 1 0 0 1 1-1h5.5"/><path d="M9.5 21.5H4a1 1 0 0 1-1-1V15"/><path d="M21.5 9.5v5.5"/><path d="M9.5 2v7.5H2"/>');
export const IconDisc = ic('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>');
export const IconLaptop = ic('<path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"/>');
export const IconScissors = ic('<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/>');
export const IconBell = ic('<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>');
export const IconMenu = ic('<line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>');
export const IconX = ic('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>');
export const IconPlus = ic('<path d="M5 12h14"/><path d="M12 5v14"/>');
export const IconCheck = ic('<polyline points="20 6 9 17 4 12"/>');
export const IconUpload = ic('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>');
export const IconTrendingUp = ic('<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>');
export const IconAlertCircle = ic('<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>');
export const IconExternalLink = ic('<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>');
