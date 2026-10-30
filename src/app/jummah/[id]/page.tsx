"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Mic,
  Clock,
  MapPin,
  Radio,
  ExternalLink,
  Share2,
  Calendar,
  ArrowLeft,
  BookOpen,
  Volume2,
  Check,
  Building2,
  Languages,
  Phone,
  Sparkles,
  Info,
} from "lucide-react";
import { JummahSermon } from "@/lib/types";

export default function JummahDetailPage() {
  const params = useParams();
  const idOrSlug = params.id as string;

  const [sermon, setSermon] = useState<JummahSermon | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (idOrSlug) {
      fetchSermon();
    }
  }, [idOrSlug]);

  async function fetchSermon() {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/jummah/${idOrSlug}`);
      const json = await res.json();
      if (json.success && json.data) {
        setSermon(json.data);
      }
    } catch (err) {
      console.error("Failed to load sermon:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleShare() {
    if (!sermon) return;

    const shareText = `🎙️ *Jummah Khutbah & Bayan*\n\n` +
      `👤 *Speaker:* ${sermon.khateebTitle} ${sermon.khateebName}\n` +
      `🕌 *Mosque:* ${sermon.masjidName}, ${sermon.locality}, ${sermon.city}\n` +
      `📖 *Topic:* ${sermon.topic}\n` +
      `🕒 *Timeline:*\n` +
      `• Bayan: ${sermon.bayanTime}\n` +
      `• Khutbah: ${sermon.khutbahTime}\n` +
      `• Jama'at: ${sermon.jamatTime}\n` +
      (sermon.livestreamUrl ? `🔴 *Live Stream:* ${sermon.livestreamUrl}\n\n` : `\n`) +
      `View full details on All Masjid Timing: https://all-masjid-timing.vercel.app/jummah/${sermon.slug}`;

    if (navigator.share) {
      navigator.share({
        title: `${sermon.khateebName} - Jummah Bayan`,
        text: shareText,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  // Extract YouTube Video ID for embed if valid
  function getYouTubeEmbedUrl(url?: string): string | null {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?autoplay=0`;
    }
    // Handle channel live URLs like youtube.com/@Channel/live
    if (url.includes("youtube.com") && url.includes("/live")) {
      return null; // Channels require redirect
    }
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-500">Loading Friday Sermon details...</p>
        </div>
      </div>
    );
  }

  if (!sermon) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center shadow-lg">
          <Info className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Sermon Not Found</h2>
          <p className="text-sm text-slate-500 mt-2 mb-6">
            The Friday sermon you are looking for may have been updated, paused, or relocated.
          </p>
          <Link
            href="/jummah"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Jummah Directory</span>
          </Link>
        </div>
      </div>
    );
  }

  const embedUrl = getYouTubeEmbedUrl(sermon.livestreamUrl || sermon.recordingUrl);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Top Banner Navigation */}
      <div className="bg-slate-900 text-white border-b border-slate-800 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link
            href="/jummah"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Jummah Sermons</span>
          </Link>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold transition-all border border-slate-700"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Invite Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-300" />
                <span>Share Khutbah</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Main Content Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl mb-8">
          {/* Header Banner */}
          <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-white p-6 sm:p-8 relative">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Mic className="w-3.5 h-3.5 text-emerald-400" />
                {sermon.khateebTitle}
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300">
                <Languages className="w-3.5 h-3.5 text-slate-400" />
                {sermon.language.toUpperCase()}
                {sermon.secondaryLanguage ? ` + ${sermon.secondaryLanguage}` : ""}
              </span>

              {sermon.livestreamUrl && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
                  <Radio className="w-3.5 h-3.5 text-rose-400" />
                  Live Broadcast Available
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
              {sermon.khateebName}
            </h1>

            <div className="mt-4 flex items-start gap-2 bg-emerald-900/30 border border-emerald-500/30 p-3.5 rounded-2xl">
              <BookOpen className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-400 block">
                  Friday Lecture Topic
                </span>
                <p className="text-base sm:text-lg font-bold text-white">
                  {sermon.topic}
                </p>
              </div>
            </div>
          </div>

          {/* Friday Timeline Cards */}
          <div className="p-6 sm:p-8 bg-slate-50/60 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Friday Congregation Timeline (Standard Local Time)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Step 1: Bayan */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    1. Preliminary Bayan
                  </span>
                  <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center justify-center">
                    1
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 dark:text-emerald-400 font-mono">
                  {sermon.bayanTime}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Topic explanation &amp; community guidance
                </p>
              </div>

              {/* Step 2: Khutbah */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    2. Arabic Khutbah
                  </span>
                  <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
                  {sermon.khutbahTime}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Sunnah Arabic recitation on the pulpit
                </p>
              </div>

              {/* Step 3: Jama'at */}
              <div className="bg-white dark:bg-slate-900 border-2 border-emerald-500/40 rounded-2xl p-4 shadow-xs relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                    3. Jummah Jama&apos;at
                  </span>
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                    3
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-800 dark:text-emerald-300 font-mono">
                  {sermon.jamatTime}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  2 Rak&apos;at congregational Friday prayer
                </p>
              </div>
            </div>
          </div>

          {/* Embedded Video or Stream Access */}
          {embedUrl ? (
            <div className="p-6 sm:p-8 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Radio className="w-4 h-4 text-rose-600" />
                <span>Live Video Broadcast / Recording</span>
              </h3>
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md">
                <iframe
                  src={embedUrl}
                  title={`${sermon.khateebName} - Jummah Lecture`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </div>
          ) : sermon.livestreamUrl ? (
            <div className="p-6 sm:p-8 bg-rose-50/50 dark:bg-rose-950/20 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Radio className="w-4 h-4 text-rose-600 animate-pulse" />
                  Live Broadcast Available
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Stream the pre-Khutbah Bayan and Friday prayers live on the official channel.
                </p>
              </div>
              <a
                href={sermon.livestreamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all self-start sm:self-auto"
              >
                <span>Open Live Stream</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ) : null}

          {/* Details & Location Section */}
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Speaker Bio & Description */}
            <div>
              <h3 className="text-sm uppercase tracking-wider font-extrabold text-slate-400 mb-3">
                About the Speaker &amp; Lecture
              </h3>
              {sermon.khateebBio && (
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  {sermon.khateebBio}
                </p>
              )}
              {sermon.description && (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {sermon.description}
                </div>
              )}
            </div>

            {/* Right: Mosque & Directions */}
            <div>
              <h3 className="text-sm uppercase tracking-wider font-extrabold text-slate-400 mb-3">
                Mosque Venue &amp; Directions
              </h3>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-base text-slate-900 dark:text-white">
                      {sermon.masjidName}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      {sermon.address || `${sermon.locality}, ${sermon.city}, ${sermon.country}`}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(sermon.masjidName + " " + sermon.city)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-xs"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Get Directions</span>
                  </a>

                  {sermon.contactNumber && (
                    <a
                      href={`tel:${sermon.contactNumber}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-all"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{sermon.contactNumber}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
