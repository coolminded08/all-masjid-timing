"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Mic,
  Search,
  Filter,
  Radio,
  MapPin,
  Calendar,
  Languages,
  PlusCircle,
  RefreshCw,
  Sparkles,
  BookOpen,
  Volume2,
} from "lucide-react";
import JummahCard from "@/components/JummahCard";
import { JummahSermon, JummahLanguage } from "@/lib/types";

export default function JummahDirectoryPage() {
  const [sermons, setSermons] = useState<JummahSermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [onlyLive, setOnlyLive] = useState(false);

  // Check if today is Friday (Day 5 in JS getDay())
  const isFriday = new Date().getDay() === 5;

  useEffect(() => {
    fetchSermons();
  }, []);

  async function fetchSermons() {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/jummah");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setSermons(json.data);
      }
    } catch (err) {
      console.error("Failed to load Jummah sermons:", err);
    } finally {
      setLoading(false);
    }
  }

  // Extract unique cities
  const cities = useMemo(() => {
    const set = new Set<string>();
    sermons.forEach((s) => {
      if (s.city) set.add(s.city);
    });
    return Array.from(set).sort();
  }, [sermons]);

  // Filtered List
  const filteredSermons = useMemo(() => {
    return sermons.filter((s) => {
      // City filter
      if (selectedCity !== "all" && s.city.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }

      // Language filter
      if (selectedLanguage !== "all" && s.language !== selectedLanguage) {
        return false;
      }

      // Live stream filter
      if (onlyLive && !s.livestreamUrl && !s.audioOnlyUrl) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesKhateeb = s.khateebName.toLowerCase().includes(q) || s.khateebTitle.toLowerCase().includes(q);
        const matchesTopic = s.topic.toLowerCase().includes(q);
        const matchesMasjid = s.masjidName.toLowerCase().includes(q);
        const matchesCity = s.city.toLowerCase().includes(q);
        const matchesLocality = s.locality.toLowerCase().includes(q);
        return matchesKhateeb || matchesTopic || matchesMasjid || matchesCity || matchesLocality;
      }

      return true;
    });
  }, [sermons, selectedCity, selectedLanguage, onlyLive, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Top Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-950 text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-emerald-900/40">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold mb-3">
                <Mic className="w-3.5 h-3.5 text-emerald-400" />
                <span>Friday Congregation &amp; Scholars Directory</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                Jummah Khutbah &amp; Bayan
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                Explore scholar schedules, preliminary Bayan topics, Arabic Khutbah timelines, and live broadcasts for Friday prayers across mosques.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3 self-start md:self-auto">
              <Link
                href="/jummah/add"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-900/30 transition-all hover:scale-102"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Submit Khutbah Schedule</span>
              </Link>
            </div>
          </div>

          {/* Friday Status Banner */}
          {isFriday ? (
            <div className="mt-8 p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 backdrop-blur-md flex items-center justify-between gap-4 text-rose-200">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
                </span>
                <div>
                  <h4 className="font-bold text-sm sm:text-base text-white">
                    Today is Friday (Sayyid-ul-Ayyam)!
                  </h4>
                  <p className="text-xs text-rose-300">
                    Live broadcasts and Bayan lectures are streaming right now. Check the red &quot;Live Stream&quot; badges.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOnlyLive(!onlyLive)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  onlyLive
                    ? "bg-rose-600 text-white"
                    : "bg-rose-900/40 hover:bg-rose-900/70 text-rose-200 border border-rose-700/60"
                }`}
              >
                {onlyLive ? "Show All Sermons" : "Filter Live Only"}
              </button>
            </div>
          ) : (
            <div className="mt-8 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/20 backdrop-blur-md flex items-center gap-3 text-emerald-200 text-xs sm:text-sm">
              <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Plan your upcoming Friday: Preview Khateeb lecture topics, exact Jama&apos;at start times, and satellite links in advance.
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Main Content & Filters */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        {/* Filter Bar Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-lg mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search scholar (e.g. Mufti Taqi Usmani, Tariq Jamil), topic, or mosque..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* City & Language Selectors */}
            <div className="flex flex-wrap items-center gap-3">
              {/* City Dropdown */}
              <div className="relative min-w-[140px]">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">All Cities</option>
                  {cities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Language Dropdown */}
              <div className="relative min-w-[140px]">
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">All Languages</option>
                  <option value="urdu">Urdu (اردو)</option>
                  <option value="english">English</option>
                  <option value="arabic">Arabic (العربية)</option>
                  <option value="kashmiri">Kashmiri (کٲشُر)</option>
                  <option value="pashto">Pashto (پښتو)</option>
                  <option value="punjabi">Punjabi</option>
                  <option value="sindhi">Sindhi</option>
                </select>
              </div>

              {/* Live Stream Toggle */}
              <button
                type="button"
                onClick={() => setOnlyLive(!onlyLive)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                  onlyLive
                    ? "bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-slate-950 dark:text-slate-300 dark:border-slate-800"
                }`}
              >
                <Radio className={`w-3.5 h-3.5 ${onlyLive ? "text-rose-600 animate-pulse" : "text-slate-400"}`} />
                <span>Live Stream Only</span>
              </button>
            </div>
          </div>

          {/* Quick Active Filters Feedback */}
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              Showing <strong className="text-emerald-700 dark:text-emerald-400">{filteredSermons.length}</strong> Friday sermon{filteredSermons.length === 1 ? "" : "s"}
            </span>

            {(searchQuery || selectedCity !== "all" || selectedLanguage !== "all" || onlyLive) && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCity("all");
                  setSelectedLanguage("all");
                  setOnlyLive(false);
                }}
                className="text-emerald-600 hover:text-emerald-700 font-semibold underline"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Sermons Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-500">Loading Friday Khutbahs &amp; Bayans...</p>
          </div>
        ) : filteredSermons.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-xs">
            <Mic className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">No Jummah Sermons Found</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
              We couldn&apos;t find any Friday sermon matching your current search or filter combination.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCity("all");
                  setSelectedLanguage("all");
                  setOnlyLive(false);
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 transition-all"
              >
                Clear Filters
              </button>
              <Link
                href="/jummah/add"
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-all"
              >
                Submit Sermon Details
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSermons.map((sermon) => (
              <JummahCard key={sermon.id} sermon={sermon} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
