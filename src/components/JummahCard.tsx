"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mic,
  Clock,
  MapPin,
  Radio,
  ExternalLink,
  Share2,
  Calendar,
  Volume2,
  Check,
  Languages,
  BookOpen,
} from "lucide-react";
import { JummahSermon } from "@/lib/types";

interface JummahCardProps {
  sermon: JummahSermon;
}

export default function JummahCard({ sermon }: JummahCardProps) {
  const [copied, setCopied] = useState(false);

  function handleShare(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const shareText = `🎙️ *Jummah Khutbah & Bayan*\n\n` +
      `👤 *Speaker:* ${sermon.khateebTitle} ${sermon.khateebName}\n` +
      `🕌 *Mosque:* ${sermon.masjidName}, ${sermon.locality}, ${sermon.city}\n` +
      `📖 *Topic:* ${sermon.topic}\n` +
      `🕒 *Timeline:*\n` +
      `• Bayan: ${sermon.bayanTime}\n` +
      `• Khutbah: ${sermon.khutbahTime}\n` +
      `• Jama'at: ${sermon.jamatTime}\n` +
      (sermon.livestreamUrl ? `🔴 *Live Stream:* ${sermon.livestreamUrl}\n\n` : `\n`) +
      `Shared via All Masjid Timing: https://all-masjid-timing.vercel.app/jummah/${sermon.slug}`;

    if (navigator.share) {
      navigator.share({
        title: `${sermon.khateebName} - Jummah Bayan`,
        text: shareText,
        url: window.location.origin + `/jummah/${sermon.slug}`,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  const hasLive = Boolean(sermon.livestreamUrl);
  const hasAudio = Boolean(sermon.audioOnlyUrl);

  const languageLabels: Record<string, string> = {
    urdu: "اردو (Urdu)",
    english: "English",
    arabic: "العربية (Arabic)",
    pashto: "پښتو (Pashto)",
    punjabi: "ਪੰਜਾਬੀ (Punjabi)",
    sindhi: "سنڌي (Sindhi)",
    kashmiri: "کٲشُر (Kashmiri)",
    bengali: "বাংলা (Bengali)",
    other: "Other",
  };

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden relative">
      {/* Top Banner & Status */}
      <div className="p-5 sm:p-6 pb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Title / Honorific Badge */}
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
              <Mic className="w-3 h-3 text-emerald-600" />
              {sermon.khateebTitle}
            </span>

            {/* Language Tag */}
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <Languages className="w-3 h-3 text-slate-400" />
              {languageLabels[sermon.language] || sermon.language}
            </span>

            {sermon.secondaryLanguage && (
              <span className="text-[11px] text-slate-500 font-medium">
                + {sermon.secondaryLanguage}
              </span>
            )}
          </div>

          {/* Live / Audio Indicator */}
          {hasLive ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 animate-pulse">
              <Radio className="w-3 h-3 text-rose-600 animate-spin-slow" />
              Live Stream
            </span>
          ) : hasAudio ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
              <Volume2 className="w-3 h-3 text-amber-600" />
              Audio Broadcast
            </span>
          ) : null}
        </div>

        {/* Khateeb Name */}
        <Link href={`/jummah/${sermon.slug}`} className="block group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
          <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white tracking-tight leading-snug">
            {sermon.khateebName}
          </h3>
        </Link>

        {/* Topic Title */}
        <div className="mt-2 flex items-start gap-2">
          <BookOpen className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-snug">
            {sermon.topic}
          </p>
        </div>

        {/* Mosque & City Location */}
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
            {sermon.masjidName}
          </span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span>{sermon.locality}, {sermon.city}</span>
        </div>

        {sermon.description && (
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {sermon.description}
          </p>
        )}
      </div>

      {/* Friday Timeline Section */}
      <div className="px-5 sm:px-6 py-3.5 bg-slate-50/80 dark:bg-slate-800/40 border-t border-b border-slate-100 dark:border-slate-800/80">
        <div className="grid grid-cols-3 gap-2 text-center">
          {/* Bayan Time */}
          <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-2xs">
            <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Bayan / Speech
            </span>
            <span className="text-sm sm:text-base font-extrabold text-emerald-700 dark:text-emerald-400 font-mono">
              {sermon.bayanTime}
            </span>
          </div>

          {/* Khutbah Time */}
          <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-2xs">
            <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Arabic Khutbah
            </span>
            <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white font-mono">
              {sermon.khutbahTime}
            </span>
          </div>

          {/* Jama'at Time */}
          <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-emerald-500/20 dark:border-emerald-500/20 shadow-2xs">
            <span className="block text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 tracking-wider">
              Jama&apos;at Prayer
            </span>
            <span className="text-sm sm:text-base font-extrabold text-emerald-800 dark:text-emerald-300 font-mono">
              {sermon.jamatTime}
            </span>
          </div>
        </div>

        {sermon.specialDate && (
          <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] font-medium text-amber-700 dark:text-amber-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>Special Date: {new Date(sermon.specialDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
          </div>
        )}
      </div>

      {/* Card Actions Footer */}
      <div className="p-4 sm:p-5 flex items-center justify-between gap-3 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-2">
          {hasLive ? (
            <a
              href={sermon.livestreamUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Watch Live</span>
              <ExternalLink className="w-3 h-3 opacity-80" />
            </a>
          ) : hasAudio ? (
            <a
              href={sermon.audioOnlyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600 transition-all"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Listen Stream</span>
            </a>
          ) : (
            <Link
              href={`/jummah/${sermon.slug}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all"
            >
              <span>View Details</span>
            </Link>
          )}

          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(sermon.masjidName + " " + sermon.city)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium transition-all"
            title="Directions on Google Maps"
          >
            <MapPin className="w-4 h-4 text-emerald-600" />
          </a>
        </div>

        {/* Share Button */}
        <button
          type="button"
          onClick={handleShare}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-all flex items-center gap-1.5 text-xs font-semibold"
          title="Share Khutbah via WhatsApp"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-700 font-bold">Copied</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
