"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Search,
  MapPin,
  Navigation,
  Loader2,
  List,
  Map as MapIcon,
  Sparkles,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import { Masjid } from "@/lib/types";
import { formatDistance } from "@/lib/geo";
import ConfidenceBadge from "@/components/ConfidenceBadge";

// Dynamic import with SSR disabled for Leaflet container
const InteractiveMap = dynamic(() => import("@/components/InteractiveMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-slate-100 text-slate-400 rounded-2xl">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      <span className="ml-2 text-sm font-medium">Loading interactive map...</span>
    </div>
  ),
});

export default function MapExplorerPage() {
  const [masjids, setMasjids] = useState<Array<Masjid & { distanceMeters?: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMasjid, setSelectedMasjid] = useState<Masjid | null>(null);
  const [mobileView, setMobileView] = useState<"map" | "list">("map");

  useEffect(() => {
    fetchMasjids();
  }, []);

  async function fetchMasjids(lat?: number, lng?: number) {
    setLoading(true);
    try {
      let url = "/api/v1/masjids";
      if (lat && lng) url += `?lat=${lat}&lng=${lng}&radius=25000`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) setMasjids(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function handleLocateMe() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);
        fetchMasjids(coords.lat, coords.lng);
      },
      (err) => {
        setLocating(false);
        alert("Location access failed: " + err.message);
      },
      { timeout: 8000 }
    );
  }

  const filtered = masjids.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.locality.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.district.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-emerald-700"
            title="Back to home"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              <MapIcon className="w-5 h-5 text-emerald-700" />
              Live Interactive Masjid Map
            </h1>
            <p className="text-xs text-slate-500">
              Browse congregations geographically across your district
            </p>
          </div>
        </div>

        {/* Search & Location Actions */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search map..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            onClick={handleLocateMe}
            disabled={locating}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-sm min-h-[38px]"
          >
            {locating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">My Location</span>
          </button>

          {/* Mobile Toggle Map / List */}
          <div className="sm:hidden flex bg-slate-200 p-1 rounded-xl">
            <button
              onClick={() => setMobileView("map")}
              className={`p-1.5 rounded-lg text-xs font-bold ${
                mobileView === "map" ? "bg-white text-emerald-800 shadow-sm" : "text-slate-600"
              }`}
            >
              <MapIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileView("list")}
              className={`p-1.5 rounded-lg text-xs font-bold ${
                mobileView === "list" ? "bg-white text-emerald-800 shadow-sm" : "text-slate-600"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-210px)] min-h-[550px]">
        {/* Sidebar List (4 cols) */}
        <div
          className={`lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-4 overflow-y-auto flex flex-col justify-between space-y-3 ${
            mobileView === "map" ? "hidden lg:flex" : "flex"
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider pb-2 border-b border-slate-100">
              <span>Masjids in View ({filtered.length})</span>
              <span>Iqamah Time</span>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                <span className="text-xs">Loading masjids...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No matching masjids found on map.
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMasjid(m)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      selectedMasjid?.id === m.id
                        ? "border-emerald-500 bg-emerald-50/50 shadow-sm"
                        : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          {m.category === "landmark" && (
                            <span className="text-[10px] font-bold text-gold-700 bg-gold-50 px-1.5 py-0.2 rounded">
                              Landmark
                            </span>
                          )}
                          <ConfidenceBadge
                            tier={m.timings.fajr?.sourceTier || 2}
                            confirmedCount={m.timings.fajr?.confirmedCount}
                          />
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{m.name}</h4>
                        <p className="text-xs text-slate-500">
                          {m.locality} {m.distanceMeters !== undefined && `• ${formatDistance(m.distanceMeters)}`}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-emerald-800 font-mono block">
                          Asr: {m.timings.asr?.iqamahTime || "--:--"}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          Mag: {m.timings.maghrib?.iqamahTime || "--:--"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Tap to focus pin</span>
                      <Link
                        href={`/masjids/${m.slug}`}
                        className="font-bold text-emerald-700 hover:underline flex items-center gap-0.5"
                      >
                        Details &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Map View Container (8 cols) */}
        <div
          className={`lg:col-span-8 h-full rounded-2xl overflow-hidden ${
            mobileView === "list" ? "hidden lg:block" : "block"
          }`}
        >
          <InteractiveMap
            masjids={filtered}
            userLocation={userLocation}
            onSelectMasjid={(m) => setSelectedMasjid(m)}
            className="h-full w-full"
          />
        </div>
      </div>
    </div>
  );
}
