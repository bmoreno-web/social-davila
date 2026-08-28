import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO, subDays } from "date-fns";
import { es } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num)) return "0";
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return new Intl.NumberFormat("es-CO").format(Math.round(num));
}

export function formatPercentage(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return "0.0%";
  const sign = val > 0 ? "+" : "";
  return `${sign}${val.toFixed(1)}%`;
}

export function formatDateRange(start: Date | string, end: Date | string): string {
  try {
    const s = typeof start === "string" ? parseISO(start) : start;
    const e = typeof end === "string" ? parseISO(end) : end;
    return `${format(s, "d MMM yyyy", { locale: es })} - ${format(e, "d MMM yyyy", { locale: es })}`;
  } catch {
    return "";
  }
}

export function formatDateSpanish(date: Date | string, pattern = "d 'de' MMMM, yyyy"): string {
  try {
    const d = typeof date === "string" ? parseISO(date) : date;
    return format(d, pattern, { locale: es });
  } catch {
    return String(date);
  }
}

export function calculateDelta(current: number, previous: number): { value: number; isPositive: boolean; formatted: string } {
  if (previous === 0) {
    const val = current > 0 ? 100 : 0;
    return { value: val, isPositive: current >= 0, formatted: `+${val.toFixed(1)}%` };
  }
  const diff = ((current - previous) / Math.abs(previous)) * 100;
  return {
    value: diff,
    isPositive: diff >= 0,
    formatted: `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}%`
  };
}

export const PLATFORM_INFO: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  INSTAGRAM: { label: "Instagram", color: "#E1306C", bg: "bg-pink-500/10 text-pink-400 border-pink-500/20", icon: "instagram" },
  FACEBOOK: { label: "Facebook", color: "#1877F2", bg: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: "facebook" },
  TIKTOK: { label: "TikTok", color: "#00F2FE", bg: "bg-teal-500/10 text-teal-400 border-teal-500/20", icon: "video" },
  LINKEDIN: { label: "LinkedIn", color: "#0A66C2", bg: "bg-sky-500/10 text-sky-400 border-sky-500/20", icon: "linkedin" },
  YOUTUBE: { label: "YouTube", color: "#FF0000", bg: "bg-red-500/10 text-red-400 border-red-600/20", icon: "youtube" },
  PINTEREST: { label: "Pinterest", color: "#BD081C", bg: "bg-red-600/10 text-red-400 border-red-600/20", icon: "pin" },
  THREADS: { label: "Threads", color: "#000000", bg: "bg-zinc-500/10 text-zinc-300 border-zinc-500/20", icon: "at-sign" },
  X: { label: "X / Twitter", color: "#1DA1F2", bg: "bg-slate-500/10 text-slate-300 border-slate-500/20", icon: "twitter" }
};

export function normalizeMediaUrl(url: string | null | undefined): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();

  // If already base64 data url
  if (trimmed.startsWith('data:image/')) return trimmed;

  // Google Drive Link Converter (e.g. drive.google.com/file/d/ID/view or open?id=ID)
  const driveFileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveFileMatch && driveFileMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveFileMatch[1]}`;
  }
  const driveIdMatch = trimmed.match(/id=([a-zA-Z0-9_-]+)/);
  if (trimmed.includes('drive.google.com') && driveIdMatch && driveIdMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveIdMatch[1]}`;
  }

  // Dropbox link converter (replace dl=0 with raw=1)
  if (trimmed.includes('dropbox.com')) {
    if (trimmed.includes('?dl=0')) return trimmed.replace('?dl=0', '?raw=1');
    if (trimmed.includes('&dl=0')) return trimmed.replace('&dl=0', '&raw=1');
    if (!trimmed.includes('raw=1')) return `${trimmed}${trimmed.includes('?') ? '&' : '?'}raw=1`;
  }

  return trimmed;
}

