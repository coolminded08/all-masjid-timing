"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Search,
  Filter,
  PlusCircle,
  ShieldCheck,
  Award,
  Sparkles,
  Users,
  Globe,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { QuranTutor, QuranSubject, TutorGender, TutorTeachingMode } from "@/lib/types";
import TutorCard from "@/components/TutorCard";

const SUBJECTS_LIST: { id: QuranSubject; label: string }[] = [
  { id: "noorani-qaida", label: "Noorani Qaida" },
  { id: "nazra-quran", label: "Nazra Quran" },
  { id: "tajweed", label: "Tajweed" },
  { id: "hifz", label: "Hifz" },
  { id: "tafseer-translation", label: "Tafseer" },
  { id: "arabic-language", label: "Arabic" },
  { id: "islamic-studies-duas", label: "Duas & Sunnah" },
];

export default function QuranTutorsDirectoryPage() {
  const [tutors, setTutors] = useState<QuranTutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState<TutorGender | "all">("all");
  const [modeFilter, setModeFilter] = useState<TutorTeachingMode | "all">("all");
  const [selectedSubject, setSelectedSubject] = useState<QuranSubject | "all">("all");
  const [freeOnly, setFreeOnly] = useState(false);
  const [ijazahOnly, setIjazahOnly] = useState(false);

  useEffect(() => {
    fetchTutors();
  }, [genderFilter, modeFilter, selectedSubject, freeOnly, ijazahOnly]);

  async function fetchTutors() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (genderFilter !== "all") params.append("gender", genderFilter);
      if (modeFilter !== "all") params.append("mode", modeFilter);
      if (selectedSubject !== "all") params.append("subject", selectedSubject);
      if (freeOnly) params.append("feeType", "free");
      if (ijazahOnly) params.append("ijazah", "true");

      const res = await fetch(`/api/v1/tutors?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setTutors(data.data);
      }
    } catch (e) {
      console.error("Failed to load tutors", e);
    } finally {
      setLoading(false);
    }
  }

  // Client search query filtering
  const filteredTutors = tutors.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.title.toLowerCase().includes(q) ||
      t.bio.toLowerCase().includes(q) ||
      (t.locality && t.locality.toLowerCase().includes(q)) ||
      t.languages.some((l) => l.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 border border-emerald-500/20 p-6 sm:p-10 text-white overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <BookOpen className="w-4 h-4" />
            Verified Quran Learning Directory
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Find a Quran Tutor Near You or Online
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Connect directly with qualified Huffaz, Qaris, and female Alimahs for Noorani Qaida,
            Tajweed rules, Hifz memorization, and Quran translation. Free trial classes and
            community verified teachers.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/tutors/join"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all min-h-[44px]"
            >
              <PlusCircle className="w-4 h-4" />
              Post Your Tutor Profile (Free)
            </Link>

            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Cloudflare Protected &bull; Direct WhatsApp
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by tutor name, area (e.g. Rajbagh), language (Urdu, English), or qualification..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Filter Rows */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Gender Filter */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
            <button
              onClick={() => setGenderFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                genderFilter === "all"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              All Tutors
            </button>
            <button
              onClick={() => setGenderFilter("female")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                genderFilter === "female"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <span>🌸</span> Female (Alimah)
            </button>
            <button
              onClick={() => setGenderFilter("male")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                genderFilter === "male"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <span>📖</span> Male (Qari/Hafiz)
            </button>
          </div>

          {/* Mode Filter */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
            <button
              onClick={() => setModeFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                modeFilter === "all"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              All Modes
            </button>
            <button
              onClick={() => setModeFilter("online")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                modeFilter === "online"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Globe className="w-3 h-3 text-blue-500" /> Online
            </button>
            <button
              onClick={() => setModeFilter("in-person")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                modeFilter === "in-person"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              In-Person
            </button>
          </div>

          {/* Toggle pills: Fi Sabilillah (Free) & Ijazah */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFreeOnly(!freeOnly)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                freeOnly
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              Fi Sabilillah (Free Only)
            </button>
            <button
              onClick={() => setIjazahOnly(!ijazahOnly)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1 ${
                ijazahOnly
                  ? "bg-amber-600 text-white border-amber-600"
                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-500" /> Ijazah Holder
            </button>
          </div>
        </div>

        {/* Subject Chips */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-semibold uppercase text-[10px] mr-1 shrink-0">
            Subject:
          </span>
          <button
            onClick={() => setSelectedSubject("all")}
            className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors ${
              selectedSubject === "all"
                ? "bg-emerald-800 text-white font-bold"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
            }`}
          >
            All Subjects
          </button>
          {SUBJECTS_LIST.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubject(sub.id)}
              className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors ${
                selectedSubject === sub.id
                  ? "bg-emerald-800 text-white font-bold"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              {sub.label}
            </button>
          ))}
        </div>
      </div>

      {/* Directory Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading Quran tutors...</p>
        </div>
      ) : filteredTutors.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
          <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">
            No Tutors Found Matching Filters
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query, switching to Online/In-Person, or resetting the filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setGenderFilter("all");
              setModeFilter("all");
              setSelectedSubject("all");
              setFreeOnly(false);
              setIjazahOnly(false);
            }}
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {filteredTutors.map((tutor) => (
            <TutorCard key={tutor.id} tutor={tutor} />
          ))}
        </div>
      )}
    </div>
  );
}
