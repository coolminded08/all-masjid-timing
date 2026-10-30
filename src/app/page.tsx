"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Search,
  MapPin,
  Compass,
  Sparkles,
  ShieldCheck,
  Code2,
  Navigation,
  Loader2,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import MasjidCard from "@/components/MasjidCard";
import { Masjid } from "@/lib/types";

// Dynamic import for Three.js 3D Mosque viewer to ensure client-side rendering
const Mosque3DViewer = dynamic(() => import("@/components/Mosque3DViewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[340px] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
    </div>
  ),
});

export default function HomePage() {
  const [masjids, setMasjids] = useState<Array<Masjid & { distanceMeters?: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "landmark" | "srinagar">("all");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    fetchMasjids();
  }, []);

  async function fetchMasjids(lat?: number, lng?: number) {
    setLoading(true);
    try {
      let url = "/api/v1/masjids";
      if (lat && lng) {
        url += `?lat=${lat}&lng=${lng}&radius=25000`;
      }
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setMasjids(json.data);
      }
    } catch (e) {
      console.error("Failed to load masjids", e);
    } finally {
      setLoading(false);
    }
  }

  function handleUseLocation() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setLocating(false);
        fetchMasjids(latitude, longitude);
      },
      (err) => {
        setLocating(false);
        alert("Unable to retrieve location: " + err.message);
      },
      { timeout: 8000 }
    );
  }

  // Filter masjids
  const filteredMasjids = masjids.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.locality.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.district.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedFilter === "landmark") return m.category === "landmark";
    if (selectedFilter === "srinagar") return m.district.toLowerCase().includes("srinagar");
    return true;
  });

  return (
    <div className="space-y-12 pb-20">
      {/* 3D Immersive Hero Section with High-Contrast Background */}
      <section className="relative overflow-hidden bg-slate-950 text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-emerald-900/60 shadow-2xl">
        {/* Layered Rich Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-slate-950 to-emerald-950 pointer-events-none" />
        <div className="absolute top-0 right-1/3 w-[500px] h-[500px] bg-emerald-600/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[90px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Heading, Value Prop & Search */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-900/90 text-emerald-300 border border-emerald-500/40 backdrop-blur-md shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Next-Gen Community Iqamah Directory</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.12]">
              Know Exactly When <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">
                The Congregation Stands.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-200 max-w-xl font-normal leading-relaxed">
              Azaan calls you to prayer; <strong className="text-emerald-300 font-semibold">Iqamah</strong> is when the prayer begins in Jama&apos;ah.
              Real-time timings crowdsourced by local worshippers and secured with cryptographic proximity checks.
            </p>

            {/* Search & Location Bar */}
            <div className="pt-2 max-w-xl flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search mosque, locality, or city (e.g. Lal Chowk, Makkah)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white text-slate-900 placeholder-slate-500 text-sm font-semibold shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
                />
              </div>

              <button
                onClick={handleUseLocation}
                disabled={locating}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-950/60 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-300 min-h-[48px] hover:scale-[1.02] active:scale-[0.98]"
              >
                {locating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Navigation className="w-4 h-4 text-emerald-100" />
                )}
                <span>{userLocation ? "Location Locked" : "Locate Near Me"}</span>
              </button>
            </div>

            {/* Badges */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-slate-200">
              <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700/80 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                4-Tier Verification Engine
              </span>
              <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700/80 shadow-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                500m GPS Proximity Proof
              </span>
              <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700/80 shadow-xs">
                <Code2 className="w-4 h-4 text-emerald-400" />
                Free Open Data API
              </span>
            </div>
          </div>

          {/* Right Column: 3D Interactive Kaaba & Celestial Orbital Ring */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-full max-w-[420px] aspect-square rounded-3xl bg-slate-900/90 border border-emerald-500/30 backdrop-blur-xl shadow-2xl p-2 flex items-center justify-center overflow-hidden">
              <Mosque3DViewer />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation Tabs & Quick Action Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedFilter("all")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                selectedFilter === "all"
                  ? "bg-emerald-700 text-white shadow-md shadow-emerald-800/20"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              All Mosques ({masjids.length})
            </button>
            <button
              onClick={() => setSelectedFilter("landmark")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                selectedFilter === "landmark"
                  ? "bg-emerald-700 text-white shadow-md shadow-emerald-800/20"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              Landmarks &amp; Holy Mosques
            </button>
            <button
              onClick={() => setSelectedFilter("srinagar")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                selectedFilter === "srinagar"
                  ? "bg-emerald-700 text-white shadow-md shadow-emerald-800/20"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              Srinagar Pilot
            </button>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/catch"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-900 text-xs font-bold transition-all"
            >
              <Compass className="w-4 h-4 text-amber-600" />
              <span>Catch My Jama&apos;ah</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
            </Link>
          </div>
        </div>

        {/* Directory Listing Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <p className="text-sm font-semibold text-slate-500">
              Synchronizing astronomical and community timings...
            </p>
          </div>
        ) : filteredMasjids.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No masjids found</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              No mosques match your search query. Be the first to register this mosque to help local worshippers!
            </p>
            <Link
              href="/masjids/add"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 text-white text-xs font-bold shadow-md hover:bg-emerald-800 transition-colors"
            >
              + Register New Mosque
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMasjids.map((masjid) => (
              <MasjidCard key={masjid.id} masjid={masjid} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
