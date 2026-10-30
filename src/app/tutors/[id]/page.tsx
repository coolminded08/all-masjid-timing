import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle2,
  Globe,
  MapPin,
  MessageCircle,
  Phone,
  Mail,
  ShieldCheck,
  Users,
  Sparkles,
  HeartHandshake,
} from "lucide-react";
import { getQuranTutorBySlugOrId } from "@/lib/store";

interface PageProps {
  params: Promise<{ id: string }>;
}

const SUBJECT_DESCRIPTIONS: Record<string, { title: string; desc: string }> = {
  "noorani-qaida": {
    title: "Noorani Qaida",
    desc: "Arabic alphabet fundamentals, vowel markers (Harakat), joining letters, and foundational phonetics.",
  },
  "nazra-quran": {
    title: "Nazra Quran",
    desc: "Fluent recitation directly from the Mus'haf with proper stops (Waqf) and rhythm.",
  },
  tajweed: {
    title: "Tajweed Rules",
    desc: "Accurate articulation points (Makhaarij), characteristics of letters (Sifaat), Ghunnah, and Ikhfa.",
  },
  hifz: {
    title: "Hifz (Memorization)",
    desc: "Structured daily Sabaq, Sabqi, and Manzil revision tracking for complete or partial Surahs.",
  },
  "tafseer-translation": {
    title: "Tafseer & Translation",
    desc: "Understanding the divine message, contextual revelation (Asbab al-Nuzul), and vocabulary.",
  },
  "arabic-language": {
    title: "Qur'anic Arabic",
    desc: "Grammar (Nahw & Sarf) enabling direct comprehension of the Holy Quran.",
  },
  "islamic-studies-duas": {
    title: "Daily Sunnah & Duas",
    desc: "Essential Masnoon Duas, Salah mannerisms, and character-building (Akhlaaq).",
  },
};

export default async function TutorDetailPage({ params }: PageProps) {
  const { id } = await params;
  const tutor = getQuranTutorBySlugOrId(id);

  if (!tutor) {
    notFound();
  }

  const cleanPhone = tutor.whatsappNumber.replace(/[^0-9+]/g, "");
  const whatsappUrl = `https://wa.me/${cleanPhone.replace("+", "")}?text=${encodeURIComponent(
    `Assalamu Alaikum Ustadh/Teacher ${tutor.name}, I am interested in Quran lessons via your listing on All Masjid Timing.`
  )}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Back button */}
      <Link
        href="/tutors"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Quran Tutor Directory
      </Link>

      {/* Main Profile Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-sm space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-800 to-emerald-600 flex items-center justify-center text-white text-2xl shadow-md shrink-0">
              {tutor.gender === "female" ? "🌸" : "📖"}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {tutor.name}
                </h1>
                {tutor.isVerified && (
                  <span title="Verified Community Tutor">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  </span>
                )}
                {tutor.hasIjazah && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    Ijazah Holder
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-400">
                {tutor.title}
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  {tutor.teachingMode === "online"
                    ? "Online Only"
                    : tutor.teachingMode === "in-person"
                    ? "In-Person Only"
                    : "Online & In-Person"}
                </span>
                {tutor.locality && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {tutor.locality}, {tutor.country}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick CTA */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
            <div className="text-left sm:text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400">Pricing</div>
              <div className="text-lg font-black text-slate-900 dark:text-white">
                {tutor.feeType === "free" ? (
                  <span className="text-emerald-600 dark:text-emerald-400">Fi Sabilillah (Free)</span>
                ) : tutor.monthlyFeeAmount ? (
                  <span>₹{tutor.monthlyFeeAmount}<span className="text-xs font-normal text-slate-500">/month</span></span>
                ) : (
                  <span>Flexible</span>
                )}
              </div>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              Chat on WhatsApp
            </a>
          </div>
        </div>

        {/* Bio Section */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            About the Teacher &amp; Methodology
          </h2>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {tutor.bio}
          </p>
        </div>

        {/* Subjects Grid */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Subjects Offered
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tutor.subjects.map((sub) => {
              const info = SUBJECT_DESCRIPTIONS[sub] || { title: sub, desc: "" };
              return (
                <div
                  key={sub}
                  className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800/40 space-y-1"
                >
                  <div className="font-bold text-xs text-emerald-950 dark:text-emerald-300 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                    {info.title}
                  </div>
                  {info.desc && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      {info.desc}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Overview Details */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Experience</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {tutor.experienceYears} Years
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Students</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {tutor.gender === "female" ? "Sisters & Kids" : "All Ages"}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Languages</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {tutor.languages.join(", ")}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Free Trial</span>
            <span className="font-bold text-emerald-700 dark:text-emerald-400">
              {tutor.freeTrialAvailable ? "Available" : "On Request"}
            </span>
          </div>
        </div>

        {/* Direct Contact Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white space-y-4 shadow-lg border border-slate-800">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base">Direct Contact with Teacher</h3>
          </div>
          <p className="text-xs text-slate-300">
            Reach out directly to arrange your class schedule, discuss student goals, or request a free trial lesson.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              Chat on WhatsApp ({tutor.whatsappNumber})
            </a>

            {tutor.phoneNumber && (
              <a
                href={`tel:${tutor.phoneNumber}`}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-all"
              >
                <Phone className="w-4 h-4" />
                Call {tutor.phoneNumber}
              </a>
            )}

            {tutor.email && (
              <a
                href={`mailto:${tutor.email}?subject=Inquiry%20regarding%20Quran%20Classes`}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-all"
              >
                <Mail className="w-4 h-4" />
                Send Email
              </a>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Community Notice: Please maintain Islamic adab in communication. For female students, parents or guardians are encouraged to coordinate.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
