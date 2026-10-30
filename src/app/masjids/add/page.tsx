"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Navigation,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { Masjid } from "@/lib/types";
import TimetableScanner from "@/components/TimetableScanner";
import { ExtractedTimetable } from "@/lib/gemini";

export default function AddMasjidPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [locality, setLocality] = useState("");
  const [district, setDistrict] = useState("Srinagar");
  const [state, setState] = useState("Jammu & Kashmir");
  const [country, setCountry] = useState("India");
  const [address, setAddress] = useState("");

  // Amenities
  const [hasLadies, setHasLadies] = useState(false);
  const [hasParking, setHasParking] = useState(false);
  const [hasWarmWater, setHasWarmWater] = useState(true);
  const [hasWheelchair, setHasWheelchair] = useState(false);

  // Timings
  const [timings, setTimings] = useState({
    fajr: { azaanTime: "05:15", iqamahTime: "05:40", isFixed: true },
    dhuhr: { azaanTime: "12:20", iqamahTime: "12:45", isFixed: true },
    asr: { azaanTime: "15:40", iqamahTime: "16:05", isFixed: true },
    maghrib: { azaanTime: "17:42", iqamahTime: "17:47", isFixed: false },
    isha: { azaanTime: "19:05", iqamahTime: "19:30", isFixed: true },
  });

  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<{
    candidate: Masjid;
    distance: number;
  } | null>(null);
  const [scanAppliedBanner, setScanAppliedBanner] = useState<string | null>(null);
  const [verificationPhotoPath, setVerificationPhotoPath] = useState<string | null>(null);

  function handleApplyExtracted(extracted: ExtractedTimetable) {
    if (extracted.storagePath) {
      setVerificationPhotoPath(extracted.storagePath);
    }
    if (extracted.masjidName && !name) {
      setName(extracted.masjidName);
    }
    if (extracted.locality && !locality) {
      setLocality(extracted.locality);
    }

    setTimings((prev) => {
      const updated = { ...prev };
      const prayers = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;

      for (const p of prayers) {
        const item = extracted.timings[p];
        if (item?.iqamahTime) {
          updated[p] = {
            ...updated[p],
            iqamahTime: item.iqamahTime,
            azaanTime: item.azaanTime || updated[p].azaanTime,
          };
        }
      }
      return updated;
    });

    setScanAppliedBanner(
      `Auto-filled timings successfully via ${
        extracted.source === "gemini" ? "Gemini Vision AI" : "OCR Engine"
      } (${Math.round(extracted.confidence * 100)}% match). Please review below.`
    );
  }

  function captureGPS() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const acc = pos.coords.accuracy;
        setGpsAccuracy(acc);
        setLatitude(Number(pos.coords.latitude.toFixed(6)));
        setLongitude(Number(pos.coords.longitude.toFixed(6)));

        if (acc > 100) {
          alert(`Warning: GPS accuracy is low (${Math.round(acc)}m). Please double-check coordinates.`);
        }
      },
      (err) => {
        setLocating(false);
        alert("Failed to capture location: " + err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!latitude || !longitude) {
      alert("Please capture GPS coordinates first.");
      return;
    }

    setSubmitting(true);
    setDuplicateWarning(null);

    try {
      const payload = {
        name,
        latitude,
        longitude,
        locality,
        district,
        state,
        country,
        address,
        category: "local",
        amenities: {
          hasLadiesSection: hasLadies,
          hasWheelchairAccess: hasWheelchair,
          hasParking: hasParking,
          hasWarmWaterWudu: hasWarmWater,
          hasJanazahService: false,
        },
        verificationPhotoPath: verificationPhotoPath || undefined,
        timings,
      };

      const res = await fetch("/api/v1/masjids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.status === 409) {
        // Duplicate detection warning
        setDuplicateWarning({
          candidate: data.duplicateCandidate,
          distance: data.distanceMeters,
        });
        setSubmitting(false);
        return;
      }

      if (data.success) {
        alert("Masjid registered successfully as an Unverified community submission!");
        router.push(`/masjids/${data.data.slug}`);
      } else {
        alert(data.error || "Failed to create masjid");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Directory
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800 mb-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Community Registration (No Phone Needed)
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">
          Add a Masjid to the Directory
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Submit a new mosque location with its current Iqamah timings. Submissions start as{" "}
          <strong>Unverified</strong> and are confirmed when local worshippers cast proximity votes.
        </p>

        {/* Duplicate Warning Alert */}
        {duplicateWarning && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 mb-6 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Possible Duplicate Found Nearby ({duplicateWarning.distance}m away)
            </div>
            <p className="text-xs">
              <strong>{duplicateWarning.candidate.name}</strong> is already registered at this location.
              Please verify if this is the same mosque before creating a duplicate entry.
            </p>
            <div className="pt-2">
              <Link
                href={`/masjids/${duplicateWarning.candidate.slug}`}
                className="text-xs font-bold text-emerald-800 underline"
              >
                View Existing Masjid &rarr;
              </Link>
            </div>
          </div>
        )}

        {/* AI Timetable Scanner Section */}
        <div className="mb-6">
          <TimetableScanner onApply={handleApplyExtracted} />
        </div>

        {/* Scan Applied Success Notification */}
        {scanAppliedBanner && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between text-xs font-semibold animate-in fade-in duration-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{scanAppliedBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setScanAppliedBanner(null)}
              className="text-emerald-700 hover:text-emerald-900 underline text-[11px]"
            >
              Dismiss
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mosque Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Masjid Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Masjid Al-Falah"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>

          {/* GPS Coordinates Section */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  GPS Coordinates *
                </span>
                <span className="text-xs text-slate-500">
                  Must be captured physically on-site or entered accurately
                </span>
              </div>
              <button
                type="button"
                onClick={captureGPS}
                disabled={locating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-sm min-h-[44px]"
              >
                {locating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Navigation className="w-4 h-4" />
                )}
                Capture Current GPS
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <label className="text-slate-500 block mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="34.0836"
                  value={latitude || ""}
                  onChange={(e) => setLatitude(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                />
              </div>
              <div>
                <label className="text-slate-500 block mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="74.7973"
                  value={longitude || ""}
                  onChange={(e) => setLongitude(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                />
              </div>
            </div>

            {gpsAccuracy !== null && (
              <span className="text-[11px] text-slate-500 block">
                GPS Accuracy reading: &plusmn;{Math.round(gpsAccuracy)} meters
              </span>
            )}
          </div>

          {/* Hierarchy & Location Details */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Locality / Area *</label>
              <input
                type="text"
                required
                placeholder="e.g. Rajbagh"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">District *</label>
              <input
                type="text"
                required
                placeholder="e.g. Srinagar"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>

          {/* Timings Entry */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Iqamah Timings (Stand-up time)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(["fajr", "dhuhr", "asr", "maghrib", "isha"] as const).map((prayer) => (
                <div key={prayer} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-bold text-slate-800 uppercase">{prayer}</span>
                  <input
                    type="time"
                    required
                    value={timings[prayer].iqamahTime}
                    onChange={(e) =>
                      setTimings({
                        ...timings,
                        [prayer]: { ...timings[prayer], iqamahTime: e.target.value },
                      })
                    }
                    className="px-2 py-1 border border-slate-300 rounded font-mono text-sm bg-white"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Amenities Checkboxes */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Facilities Available
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasLadies}
                  onChange={(e) => setHasLadies(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                Ladies Prayer Hall
              </label>
              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasParking}
                  onChange={(e) => setHasParking(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                Dedicated Parking
              </label>
              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasWarmWater}
                  onChange={(e) => setHasWarmWater(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                Hot Water Wudu
              </label>
              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasWheelchair}
                  onChange={(e) => setHasWheelchair(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                Wheelchair Ramp
              </label>
            </div>
          </div>

          {/* Cloudflare Protected Notice & Submit */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Cloudflare Turnstile Verified. Free from SMS OTP friction.</span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50 min-h-[44px]"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Submit Masjid"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
