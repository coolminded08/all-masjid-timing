"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
} from "lucide-react";
import MasjidCard from "@/components/MasjidCard";
import { Masjid } from "@/lib/types";

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
        url += `?lat=${lat}&lng=${lng}&radius=20000`;
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
    <div className="space-y-8 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-emerald-850 to-emerald-950 text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-emerald-800">
        <div className="absolute inset-0 opacity-10 islamic-pattern-bg pointer-events-none" />
        <div className="relative max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-800/80 text-emerald-200 border border-emerald-700/60 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span>Community-Verified Iqamah Directory</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Know Exactly When the <br />
            <span className="text-emerald-300">Congregation (Iqamah)</span> Starts.
          </h1>

          <p className="text-sm sm:text-base text-emerald-100/90 max-w-2xl mx-auto font-normal leading-relaxed">
            Azaan timings tell you when the prayer begins; <strong>Iqamah timings</strong> tell you
            when the Jama&apos;ah stands. Verified by local worshippers and protected by Cloudflare.
          </p>

          {/* Search & Location Bar */}
          <div className="pt-4 max-w-2xl mx-auto flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by mosque name, locality (e.g. Lal Chowk, Makkah)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white text-slate-900 placeholder-slate-400 text-sm font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            <button
              onClick={handleUseLocation}
              disabled={locating}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-emerald-300 min-h-[44px]"
            >
              {locating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Navigation className="w-4 h-4 text-emerald-200" />
              )}
              <span>{userLocation ? "Location Active" : "Find Near Me"}</span>
            </button>
          </div>

          {/* Value Badges */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-emerald-200/90">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              4-Tier Trust Model
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Zero-SMS OTP (Cloudflare Verified)
            </span>
            <span className="flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-emerald-400" />
              Open API &amp; JSON Dumps
            </span>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation Tabs & Catch Jama'ah Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedFilter("all")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedFilter === "all"
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              All Masjids ({masjids.length})
            </button>
            <button
              onClick={() => setSelectedFilter("srinagar")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedFilter === "srinagar"
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              Pilot District: Srinagar
            </button>
            <button
              onClick={() => setSelectedFilter("landmark")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedFilter === "landmark"
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              Landmarks &amp; Holy Sites
            </button>
          </div>

          <Link
            href="/catch"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-50 border border-gold-200 text-gold-900 text-xs font-bold hover:bg-gold-100 transition-colors"
          >
            <Compass className="w-4 h-4 text-gold-600" />
            Try &quot;Catch My Jama&apos;ah&quot; Route Finder
          </Link>
        </div>

        {/* Masjids Listing Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <p className="text-sm">Locating masjids and live prayer timings...</p>
          </div>
        ) : filteredMasjids.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 max-w-lg mx-auto">
            <MapPin className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">No masjids found</h3>
            <p className="text-xs text-slate-500">
              No matching mosque found in this area. You can be the first to add it!
            </p>
            <Link
              href="/masjids/add"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-700 text-white text-xs font-semibold"
            >
              Add This Masjid
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
