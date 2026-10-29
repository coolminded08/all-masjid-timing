"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Compass,
  Navigation,
  MapPin,
  Sparkles,
  ArrowLeft,
  Loader2,
  Info,
  CheckCircle2,
} from "lucide-react";

const MAKKAH_COORDS = { lat: 21.4225, lng: 39.8262 };

/**
 * Calculates initial bearing from current location to Makkah in degrees (0-360)
 */
function calculateQiblaBearing(lat: number, lng: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;

  const φ1 = toRad(lat);
  const φ2 = toRad(MAKKAH_COORDS.lat);
  const Δλ = toRad(MAKKAH_COORDS.lng - lng);

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  const θ = Math.atan2(y, x);
  return (toDeg(θ) + 360) % 360;
}

/**
 * Calculates distance to Makkah in kilometers
 */
function calculateDistanceToMakkahKm(lat: number, lng: number): number {
  const R = 6371; // Earth radius in km
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(MAKKAH_COORDS.lat - lat);
  const dLng = toRad(MAKKAH_COORDS.lng - lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat)) *
      Math.cos(toRad(MAKKAH_COORDS.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export default function QiblaCompassPage() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState<string>("Locating...");
  const [qiblaAngle, setQiblaAngle] = useState<number>(258); // Default Srinagar Qibla ~258° WSW
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [distanceKm, setDistanceKm] = useState<number>(3720);
  const [locating, setLocating] = useState<boolean>(true);
  const [hasCompassSupport, setHasCompassSupport] = useState<boolean>(false);

  useEffect(() => {
    // 1. Get GPS coordinates
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserLocation({ lat, lng });
          const bearing = calculateQiblaBearing(lat, lng);
          const dist = calculateDistanceToMakkahKm(lat, lng);
          setQiblaAngle(Math.round(bearing));
          setDistanceKm(dist);
          setLocationName(`GPS: ${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E`);
          setLocating(false);
        },
        (err) => {
          // Default fallback: Srinagar
          setUserLocation({ lat: 34.0837, lng: 74.7973 });
          setLocationName("Srinagar, Jammu & Kashmir (Default)");
          setQiblaAngle(258);
          setDistanceKm(3720);
          setLocating(false);
        },
        { timeout: 8000 }
      );
    } else {
      setLocating(false);
    }

    // 2. Listen to device compass orientation if supported (mobile)
    function handleOrientation(e: DeviceOrientationEvent) {
      if (e.alpha !== null) {
        setHasCompassSupport(true);
        // alpha represents rotation around z axis (0 to 360)
        setDeviceHeading(Math.round(e.alpha));
      }
    }

    if (typeof window !== "undefined" && window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", handleOrientation);
    }

    return () => {
      if (typeof window !== "undefined" && window.DeviceOrientationEvent) {
        window.removeEventListener("deviceorientation", handleOrientation);
      }
    };
  }, []);

  // Compute needle rotation angle relative to device heading
  const needleRotation = (qiblaAngle - deviceHeading + 360) % 360;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6 text-center">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Directory
        </Link>
        <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          Spherical Trigonometry Engine
        </span>
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold-700 bg-gold-100/70 px-3 py-1 rounded-full">
          <Sparkles className="w-3.5 h-3.5 text-gold-600" />
          Direction to the Holy Kaaba
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Interactive Qibla Compass
        </h1>
        <p className="text-sm text-slate-500">
          Find the exact direction of prayer towards the Holy Kaaba in Makkah al-Mukarramah.
        </p>
      </div>

      {/* Compass Circle Display */}
      <div className="relative w-72 h-72 sm:w-80 sm:h-80 mx-auto my-8 flex items-center justify-center">
        {/* Outer Ring */}
        <div className="absolute inset-0 rounded-full border-4 border-slate-200 bg-gradient-to-tr from-slate-50 to-white shadow-xl flex items-center justify-center">
          {/* Cardinal directions */}
          <span className="absolute top-3 font-bold text-xs text-rose-600">N</span>
          <span className="absolute right-3 font-bold text-xs text-slate-400">E</span>
          <span className="absolute bottom-3 font-bold text-xs text-slate-400">S</span>
          <span className="absolute left-3 font-bold text-xs text-slate-400">W</span>

          {/* Degree ticks */}
          <div className="w-64 h-64 rounded-full border border-dashed border-slate-300 flex items-center justify-center">
            {/* Center Pivot Point */}
            <div className="w-6 h-6 rounded-full bg-emerald-700 border-2 border-white shadow-md z-20"></div>
          </div>
        </div>

        {/* Rotating Qibla Needle */}
        <div
          className="absolute inset-4 z-10 transition-transform duration-500 ease-out flex items-center justify-center"
          style={{ transform: `rotate(${needleRotation}deg)` }}
        >
          {/* Top Half of Needle (Points directly to Kaaba with Golden Star) */}
          <div className="absolute top-4 flex flex-col items-center">
            <div className="w-7 h-7 rounded-full bg-gold-500 border-2 border-white shadow-md flex items-center justify-center text-white text-[11px] font-bold">
              🕋
            </div>
            <div className="w-1.5 h-24 bg-gradient-to-t from-emerald-600 to-gold-500 rounded-t-full shadow-sm"></div>
          </div>

          {/* Bottom Half of Needle (Opposite Direction) */}
          <div className="absolute bottom-4 flex flex-col items-center">
            <div className="w-1.5 h-24 bg-slate-300 rounded-b-full"></div>
            <div className="w-3 h-3 rounded-full bg-slate-400"></div>
          </div>
        </div>
      </div>

      {/* Angle & Distance Metrics */}
      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm text-center">
          <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">
            Qibla Bearing
          </span>
          <span className="text-3xl font-black text-emerald-800 font-mono">
            {qiblaAngle}&deg;
          </span>
          <span className="text-xs text-slate-500 block mt-1">West-Southwest (WSW)</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm text-center">
          <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">
            Distance to Makkah
          </span>
          <span className="text-3xl font-black text-slate-900 font-mono">
            {distanceKm.toLocaleString()}
          </span>
          <span className="text-xs text-slate-500 block mt-1">Kilometers away</span>
        </div>
      </div>

      {/* Location Status Banner */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{locationName}</span>
        </div>
        {hasCompassSupport ? (
          <span className="text-emerald-700 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Live Gyro
          </span>
        ) : (
          <span className="text-slate-400">Fixed Compass Mode</span>
        )}
      </div>

      <p className="text-[11px] text-slate-400 max-w-md mx-auto">
        Tip: On smartphones, hold your device flat in the palm of your hand away from magnetic
        interference (metal, laptops) for live compass tracking.
      </p>
    </div>
  );
}
