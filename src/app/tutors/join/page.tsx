"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Sparkles,
  Award,
} from "lucide-react";
import TurnstileWidget from "@/components/TurnstileWidget";
import { QuranSubject, TutorGender, TutorTeachingMode, TutorAudience } from "@/lib/types";

const ALL_SUBJECTS: { id: QuranSubject; label: string }[] = [
  { id: "noorani-qaida", label: "Noorani Qaida (Beginners)" },
  { id: "nazra-quran", label: "Nazra Quran (Fluency)" },
  { id: "tajweed", label: "Tajweed Rules (Makhaarij)" },
  { id: "hifz", label: "Hifz (Memorization)" },
  { id: "tafseer-translation", label: "Tafseer & Translation" },
  { id: "arabic-language", label: "Qur'anic Arabic" },
  { id: "islamic-studies-duas", label: "Daily Sunnah & Duas" },
];

const AUDIENCES: { id: TutorAudience; label: string }[] = [
  { id: "kids-boys", label: "Young Boys" },
  { id: "kids-girls", label: "Young Girls" },
  { id: "adult-brothers", label: "Adult Brothers" },
  { id: "adult-sisters", label: "Adult Sisters" },
];

export default function JoinQuranTutorPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [gender, setGender] = useState<TutorGender>("male");
  const [bio, setBio] = useState("");
  const [hasIjazah, setHasIjazah] = useState(false);
  const [subjects, setSubjects] = useState<QuranSubject[]>([
    "noorani-qaida",
    "nazra-quran",
    "tajweed",
  ]);
  const [teachingMode, setTeachingMode] = useState<TutorTeachingMode>("both");
  const [targetAudience, setTargetAudience] = useState<TutorAudience[]>([
    "kids-boys",
    "adult-brothers",
  ]);
  const [experienceYears, setExperienceYears] = useState(3);
  const [languagesInput, setLanguagesInput] = useState("Urdu, English, Kashmiri");
  const [locality, setLocality] = useState("");
  const [district, setDistrict] = useState("Srinagar");
  const [country, setCountry] = useState("India");

  // Pricing
  const [feeType, setFeeType] = useState<"free" | "paid" | "flexible">("paid");
  const [monthlyFeeAmount, setMonthlyFeeAmount] = useState<number | "">(800);
  const [freeTrialAvailable, setFreeTrialAvailable] = useState(true);

  // Contact
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");

  // Turnstile token & state
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleSubject(id: QuranSubject) {
    if (subjects.includes(id)) {
      setSubjects(subjects.filter((s) => s !== id));
    } else {
      setSubjects([...subjects, id]);
    }
  }

  function toggleAudience(id: TutorAudience) {
    if (targetAudience.includes(id)) {
      setTargetAudience(targetAudience.filter((a) => a !== id));
    } else {
      setTargetAudience([...targetAudience, id]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (subjects.length === 0) {
      setError("Please select at least one teaching subject.");
      return;
    }

    if (targetAudience.length === 0) {
      setError("Please select at least one student group.");
      return;
    }

    // Default token for test/dev if turnstile is in pass-through
    const tokenToSend = turnstileToken || "cf-turnstile-verified";

    setSubmitting(true);

    try {
      const languages = languagesInput
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean);

      const payload = {
        name,
        title,
        gender,
        bio,
        hasIjazah,
        subjects,
        teachingMode,
        targetAudience,
        experienceYears: Number(experienceYears),
        languages: languages.length > 0 ? languages : ["Urdu", "English"],
        locality: locality || undefined,
        district: district || undefined,
        country,
        feeType,
        monthlyFeeAmount: feeType === "paid" && monthlyFeeAmount ? Number(monthlyFeeAmount) : undefined,
        freeTrialAvailable,
        whatsappNumber,
        phoneNumber: phoneNumber || undefined,
        email: email || undefined,
        turnstileToken: tokenToSend,
      };

      const res = await fetch("/api/v1/tutors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || data.details?.[0] || "Failed to post profile");
      }

      alert("Mabroor! Your Quran Tutor profile has been published successfully.");
      router.push(`/tutors/${data.data.slug}`);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <Link
        href="/tutors"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Quran Tutor Directory
      </Link>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-sm space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 mb-2">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            Teacher Registration
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Post Your Quran Tutor Profile
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Share your Tajweed and Quran teaching credentials with students and parents seeking authentic instruction.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-red-900 dark:text-red-200 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Identity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Qari Muhammad Bilal"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Title / Qualification *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Hafiz & Qari, Alimah (Dars-e-Nizami)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Gender & Ijazah */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Gender *
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setGender("male")}
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    gender === "male"
                      ? "bg-emerald-800 text-white border-emerald-800 shadow-sm"
                      : "border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  Male (Qari / Hafiz)
                </button>
                <button
                  type="button"
                  onClick={() => setGender("female")}
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    gender === "female"
                      ? "bg-emerald-800 text-white border-emerald-800 shadow-sm"
                      : "border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  Female (Alimah)
                </button>
              </div>
            </div>

            <div className="pt-5 sm:pt-6">
              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer text-xs font-medium">
                <input
                  type="checkbox"
                  checked={hasIjazah}
                  onChange={(e) => setHasIjazah(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                  <Award className="w-4 h-4 text-amber-500" />
                  I hold an authentic Sanad / Ijazah in Qira'at
                </span>
              </label>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Teacher Biography &amp; Experience *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Describe your teaching approach, madrassa background, years of experience, and student success..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Teaching Subjects Checkboxes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Subjects You Teach *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {ALL_SUBJECTS.map((sub) => (
                <label
                  key={sub.id}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all cursor-pointer ${
                    subjects.includes(sub.id)
                      ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 font-semibold text-emerald-900 dark:text-emerald-300"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={subjects.includes(sub.id)}
                    onChange={() => toggleSubject(sub.id)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  {sub.label}
                </label>
              ))}
            </div>
          </div>

          {/* Teaching Mode & Audience */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Teaching Mode *
              </label>
              <select
                value={teachingMode}
                onChange={(e) => setTeachingMode(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="online">Online Only (Zoom, Skype, Meet)</option>
                <option value="in-person">In-Person Only (Home tuition)</option>
                <option value="both">Both Online &amp; In-Person</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Years of Experience
              </label>
              <input
                type="number"
                min={0}
                max={50}
                value={experienceYears}
                onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Student Groups */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Whom Do You Teach? *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {AUDIENCES.map((aud) => (
                <label
                  key={aud.id}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all cursor-pointer ${
                    targetAudience.includes(aud.id)
                      ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 font-semibold text-emerald-900 dark:text-emerald-300"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={targetAudience.includes(aud.id)}
                    onChange={() => toggleAudience(aud.id)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  {aud.label}
                </label>
              ))}
            </div>
          </div>

          {/* Locality & Languages */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Locality / Area (e.g. Rajbagh or Online)
              </label>
              <input
                type="text"
                placeholder="e.g. Rajbagh, Srinagar"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Spoken Languages
              </label>
              <input
                type="text"
                placeholder="e.g. Urdu, English, Kashmiri"
                value={languagesInput}
                onChange={(e) => setLanguagesInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Pricing & Fees */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
              Fee &amp; Payment Options
            </span>

            <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setFeeType("paid")}
                className={`py-2 px-3 rounded-xl border text-center transition-all ${
                  feeType === "paid"
                    ? "bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-400 border-emerald-500 shadow-xs"
                    : "border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400"
                }`}
              >
                Fixed Monthly Fee
              </button>
              <button
                type="button"
                onClick={() => setFeeType("free")}
                className={`py-2 px-3 rounded-xl border text-center transition-all ${
                  feeType === "free"
                    ? "bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-400 border-emerald-500 shadow-xs"
                    : "border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400"
                }`}
              >
                Fi Sabilillah (Free)
              </button>
              <button
                type="button"
                onClick={() => setFeeType("flexible")}
                className={`py-2 px-3 rounded-xl border text-center transition-all ${
                  feeType === "flexible"
                    ? "bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-400 border-emerald-500 shadow-xs"
                    : "border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400"
                }`}
              >
                Flexible / Nominal
              </button>
            </div>

            {feeType === "paid" && (
              <div className="max-w-xs">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Expected Monthly Fee (INR ₹)
                </label>
                <input
                  type="number"
                  placeholder="800"
                  value={monthlyFeeAmount}
                  onChange={(e) => setMonthlyFeeAmount(parseInt(e.target.value) || "")}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-sm font-mono"
                />
              </div>
            )}

            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={freeTrialAvailable}
                onChange={(e) => setFreeTrialAvailable(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>I offer a free trial / evaluation class for new students</span>
            </label>
          </div>

          {/* Contact Information */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
              Direct Contact Details (For Students)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  WhatsApp Number (with country code) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="+91 7006 123456"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="teacher@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Cloudflare Turnstile Verification Widget */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <TurnstileWidget
              onSuccess={(token) => setTurnstileToken(token)}
              onError={(e) => console.warn("Turnstile error:", e)}
            />
          </div>

          {/* Submit CTA */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Your profile is protected from spam and automated web scrapers.</span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50 min-h-[44px]"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : (
                "Publish Tutor Profile"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
