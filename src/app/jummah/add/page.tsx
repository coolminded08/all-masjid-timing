"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mic,
  Clock,
  MapPin,
  Radio,
  BookOpen,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Sparkles,
  Building2,
  Languages,
} from "lucide-react";
import TurnstileWidget from "@/components/TurnstileWidget";
import { JummahLanguage } from "@/lib/types";

export default function AddJummahSermonPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  // Form Fields
  const [khateebName, setKhateebName] = useState("");
  const [khateebTitle, setKhateebTitle] = useState("Maulana");
  const [khateebBio, setKhateebBio] = useState("");

  const [masjidName, setMasjidName] = useState("");
  const [locality, setLocality] = useState("");
  const [city, setCity] = useState("Karachi");
  const [address, setAddress] = useState("");

  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState<JummahLanguage>("urdu");
  const [secondaryLanguage, setSecondaryLanguage] = useState("");

  const [bayanTime, setBayanTime] = useState("12:45");
  const [khutbahTime, setKhutbahTime] = useState("13:30");
  const [jamatTime, setJamatTime] = useState("13:45");

  const [livestreamUrl, setLivestreamUrl] = useState("");
  const [audioOnlyUrl, setAudioOnlyUrl] = useState("");
  const [isWeeklyRecurring, setIsWeeklyRecurring] = useState(true);
  const [contactNumber, setContactNumber] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!turnstileToken) {
      setError("Please complete the security verification below.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/v1/jummah", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          khateebName,
          khateebTitle,
          khateebBio: khateebBio || undefined,
          masjidName,
          locality,
          city,
          address: address || undefined,
          topic,
          description: description || undefined,
          language,
          secondaryLanguage: secondaryLanguage || undefined,
          bayanTime,
          khutbahTime,
          jamatTime,
          livestreamUrl: livestreamUrl || undefined,
          audioOnlyUrl: audioOnlyUrl || undefined,
          isWeeklyRecurring,
          contactNumber: contactNumber || undefined,
          turnstileToken,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to submit Friday sermon schedule.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/jummah");
      }, 2500);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Top Banner Navigation */}
      <div className="bg-slate-900 text-white border-b border-slate-800 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/jummah"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Jummah Directory</span>
          </Link>
          <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
            Community Submission
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-lg mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                Submit Jummah Khutbah &amp; Bayan
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Help worshippers discover scholar schedules, speech topics, and verified Friday timings in your area.
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-3 text-rose-700 dark:text-rose-300 text-xs sm:text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="mt-6 p-8 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Jummah Schedule Successfully Listed!
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Redirecting back to the directory...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-8">
              {/* 1. Scholar / Khateeb Details */}
              <div className="space-y-4">
                <h3 className="text-xs uppercase font-extrabold tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                  <Mic className="w-4 h-4" />
                  <span>1. Speaker / Khateeb Details</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Title / Honorific *
                    </label>
                    <select
                      value={khateebTitle}
                      onChange={(e) => setKhateebTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Mufti">Mufti</option>
                      <option value="Maulana">Maulana</option>
                      <option value="Sheikh">Sheikh</option>
                      <option value="Dr.">Dr.</option>
                      <option value="Qari">Qari</option>
                      <option value="Hafiz">Hafiz</option>
                      <option value="Scholar">Scholar</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Speaker Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={khateebName}
                      onChange={(e) => setKhateebName(e.target.value)}
                      placeholder="e.g. Justice (R) Mufti Muhammad Taqi Usmani"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Speaker Bio / Affiliation (Optional)
                  </label>
                  <input
                    type="text"
                    value={khateebBio}
                    onChange={(e) => setKhateebBio(e.target.value)}
                    placeholder="e.g. Vice President of Darul Uloom Karachi / Renowned Orator"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* 2. Mosque Venue */}
              <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-xs uppercase font-extrabold tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  <span>2. Mosque Venue &amp; Location</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Masjid Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={masjidName}
                      onChange={(e) => setMasjidName(e.target.value)}
                      placeholder="e.g. Jamia Darul Uloom Mosque"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Karachi / Lahore / Islamabad"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Locality / Area *
                    </label>
                    <input
                      type="text"
                      required
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                      placeholder="e.g. Korangi Industrial Area / Model Town"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Full Address (Optional)
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. Korangi Creek Road, Block 4"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Friday Speech Topic & Timeline */}
              <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-xs uppercase font-extrabold tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>3. Friday Bayan Topic &amp; Timeline</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Bayan / Sermon Topic *
                    </label>
                    <input
                      type="text"
                      required
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g. Islamic Ethics in Modern Commerce & Family Harmony"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Primary Language *
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as JummahLanguage)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="urdu">Urdu (اردو)</option>
                      <option value="english">English</option>
                      <option value="arabic">Arabic (العربية)</option>
                      <option value="kashmiri">Kashmiri (کٲشُر)</option>
                      <option value="pashto">Pashto (پښتو)</option>
                      <option value="punjabi">Punjabi</option>
                      <option value="sindhi">Sindhi</option>
                    </select>
                  </div>
                </div>

                {/* 3 Chronological Time Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      1. Bayan Starts (HH:mm) *
                    </label>
                    <input
                      type="time"
                      required
                      value={bayanTime}
                      onChange={(e) => setBayanTime(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-mono font-bold focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="text-[11px] text-slate-500 mt-0.5 block">
                      Preliminary lecture
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      2. Arabic Khutbah (HH:mm) *
                    </label>
                    <input
                      type="time"
                      required
                      value={khutbahTime}
                      onChange={(e) => setKhutbahTime(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-mono font-bold focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="text-[11px] text-slate-500 mt-0.5 block">
                      Pulpit delivery
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-1">
                      3. Jama&apos;at Prayer (HH:mm) *
                    </label>
                    <input
                      type="time"
                      required
                      value={jamatTime}
                      onChange={(e) => setJamatTime(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border-2 border-emerald-500/40 bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 text-sm font-mono font-bold focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="text-[11px] text-slate-500 mt-0.5 block">
                      Congregation begins
                    </span>
                  </div>
                </div>
              </div>

              {/* 4. Live Broadcasting & Links */}
              <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-xs uppercase font-extrabold tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                  <Radio className="w-4 h-4" />
                  <span>4. Online Broadcast (Optional)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      YouTube / Facebook Live Stream URL
                    </label>
                    <input
                      type="url"
                      value={livestreamUrl}
                      onChange={(e) => setLivestreamUrl(e.target.value)}
                      placeholder="https://www.youtube.com/@Channel/live"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Audio Stream / Mixlr URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={audioOnlyUrl}
                      onChange={(e) => setAudioOnlyUrl(e.target.value)}
                      placeholder="https://mixlr.com/channel-name"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* 5. Cloudflare Turnstile */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                <TurnstileWidget onSuccess={(token: string) => setTurnstileToken(token)} />
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <Link
                  href="/jummah"
                  className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Publish Jummah Schedule</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
