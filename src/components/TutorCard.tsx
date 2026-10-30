"use client";

import React from "react";
import Link from "next/link";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Globe,
  MapPin,
  MessageCircle,
  Phone,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import { QuranTutor } from "@/lib/types";

interface TutorCardProps {
  tutor: QuranTutor;
}

const SUBJECT_LABELS: Record<string, string> = {
  "noorani-qaida": "Noorani Qaida",
  "nazra-quran": "Nazra Quran",
  tajweed: "Tajweed Rules",
  hifz: "Hifz (Memorization)",
  "tafseer-translation": "Tafseer & Translation",
  "arabic-language": "Quranic Arabic",
  "islamic-studies-duas": "Islamic Studies & Duas",
};

export default function TutorCard({ tutor }: TutorCardProps) {
  // Format WhatsApp Link
  const cleanPhone = tutor.whatsappNumber.replace(/[^0-9+]/g, "");
  const whatsappUrl = `https://wa.me/${cleanPhone.replace("+", "")}?text=${encodeURIComponent(
    `Assalamu Alaikum Ustadh/Teacher ${tutor.name}, I saw your Quran tutor listing on All Masjid Timing and would like to inquire about classes.`
  )}`;

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden">
      {/* Top badges & header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-800 to-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              {tutor.gender === "female" ? "🌸" : "📖"}
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                  {tutor.name}
                </h3>
                {tutor.isVerified && (
                  <span title="Verified Community Tutor">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  </span>
                )}
                {tutor.hasIjazah && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300">
                    <Award className="w-3 h-3 text-amber-600" />
                    Ijazah Holder
                  </span>
                )}
              </div>
              <p className="text-xs font-medium text-emerald-800 dark:text-emerald-400">
                {tutor.title}
              </p>
            </div>
          </div>

          {/* Mode Pill */}
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
            {tutor.teachingMode === "online" ? (
              <>
                <Globe className="w-3 h-3 text-blue-500" /> Online
              </>
            ) : tutor.teachingMode === "in-person" ? (
              <>
                <MapPin className="w-3 h-3 text-emerald-600" /> In-Person
              </>
            ) : (
              <>
                <Globe className="w-3 h-3 text-blue-500" /> Online &amp; In-Person
              </>
            )}
          </span>
        </div>

        {/* Bio Excerpt */}
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
          {tutor.bio}
        </p>

        {/* Subjects Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {tutor.subjects.map((sub) => (
            <span
              key={sub}
              className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/40"
            >
              {SUBJECT_LABELS[sub] || sub}
            </span>
          ))}
        </div>

        {/* Metadata info: Languages & Location */}
        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-slate-400 py-2.5 border-t border-slate-100 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate">
              {tutor.gender === "female" ? "Sisters & Kids" : "All Students"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate">
              {tutor.locality ? `${tutor.locality}, ${tutor.country}` : tutor.country}
            </span>
          </div>
        </div>
      </div>

      {/* Footer: Fee & Contact CTAs */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase font-bold text-slate-400">Fee</div>
          <div className="font-extrabold text-sm text-slate-900 dark:text-white">
            {tutor.feeType === "free" ? (
              <span className="text-emerald-600 dark:text-emerald-400">
                Fi Sabilillah (Free)
              </span>
            ) : tutor.monthlyFeeAmount ? (
              <span>₹{tutor.monthlyFeeAmount}<span className="text-xs font-normal text-slate-500">/mo</span></span>
            ) : (
              <span>Flexible</span>
            )}
          </div>
          {tutor.freeTrialAvailable && (
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold block">
              ✓ Free Trial Class
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {tutor.phoneNumber && (
            <a
              href={`tel:${tutor.phoneNumber}`}
              className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              title="Call Tutor"
            >
              <Phone className="w-4 h-4" />
            </a>
          )}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>WhatsApp</span>
          </a>
          <Link
            href={`/tutors/${tutor.slug}`}
            className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}
