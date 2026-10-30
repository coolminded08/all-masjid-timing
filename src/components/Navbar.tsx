"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  MapPin,
  Clock,
  PlusCircle,
  Menu,
  X,
  Code2,
  Tv,
  CheckCircle2,
  Layers,
  Calendar,
  Sparkles,
  ChevronDown,
} from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link
            href="/"
            className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-xl p-1"
          >
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-800 via-emerald-700 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-900/15 group-hover:scale-105 transition-all">
              <Clock className="w-5 h-5 text-emerald-100" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">
                  All Masjid Timing
                </span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                  Live
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 -mt-0.5">
                Verified Iqamah &amp; Community Directory
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links - Clean & Grouped */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-lg transition-all ${
                isActive("/")
                  ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold"
                  : "hover:text-emerald-700 hover:bg-slate-50"
              }`}
            >
              Nearest Masjids
            </Link>

            <Link
              href="/map"
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                isActive("/map")
                  ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold"
                  : "hover:text-emerald-700 hover:bg-slate-50"
              }`}
            >
              <MapPin className="w-4 h-4 text-emerald-600" />
              Interactive Map
            </Link>

            <Link
              href="/catch"
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                isActive("/catch")
                  ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold"
                  : "hover:text-emerald-700 hover:bg-slate-50"
              }`}
            >
              <Compass className="w-4 h-4 text-emerald-600 animate-spin-slow" />
              Catch Jama&apos;ah
            </Link>

            <Link
              href="/qibla"
              className={`px-3 py-1.5 rounded-lg transition-all ${
                isActive("/qibla")
                  ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold"
                  : "hover:text-emerald-700 hover:bg-slate-50"
              }`}
            >
              Qibla Finder
            </Link>

            {/* Dropdown for Secondary Tools to prevent navbar squish */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setToolsOpen(!toolsOpen)}
                onBlur={() => setTimeout(() => setToolsOpen(false), 200)}
                className="px-3 py-1.5 rounded-lg hover:text-emerald-700 hover:bg-slate-50 transition-all flex items-center gap-1 font-semibold"
              >
                <span>Features</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {toolsOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <Link
                    href="/ramadan"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
                  >
                    <Calendar className="w-4 h-4 text-amber-500" />
                    <div>
                      <div className="font-bold">Ramadan &amp; Eid Calendar</div>
                      <div className="text-[10px] text-slate-400">Suhoor &amp; Iftar schedules</div>
                    </div>
                  </Link>
                  <Link
                    href="/regions"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
                  >
                    <Layers className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="font-bold">Region Hierarchy</div>
                      <div className="text-[10px] text-slate-400">States, Districts &amp; Localities</div>
                    </div>
                  </Link>
                  <Link
                    href="/display/masjid-al-haram-makkah"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
                  >
                    <Tv className="w-4 h-4 text-blue-500" />
                    <div>
                      <div className="font-bold">Masjid TV Display</div>
                      <div className="text-[10px] text-slate-400">Smart TV kiosk mode with Azkar</div>
                    </div>
                  </Link>
                  <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                  <Link
                    href="/admin"
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4 text-slate-400" />
                    <span>Moderation Dashboard</span>
                  </Link>
                  <Link
                    href="/docs"
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
                  >
                    <Code2 className="w-4 h-4 text-slate-400" />
                    <span>Open API Documentation</span>
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {/* Action Button: Add Masjid */}
          <div className="flex items-center gap-3">
            <Link
              href="/masjids/add"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-800 hover:to-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-800/20 hover:shadow-lg transition-all min-h-[42px]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Masjid</span>
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-semibold text-sm text-slate-800 dark:text-slate-200 hover:bg-emerald-50"
          >
            <Clock className="w-4 h-4 text-emerald-600" />
            Nearest Masjids
          </Link>
          <Link
            href="/map"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-semibold text-sm text-slate-800 dark:text-slate-200 hover:bg-emerald-50"
          >
            <MapPin className="w-4 h-4 text-emerald-600" />
            Interactive Map
          </Link>
          <Link
            href="/catch"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-semibold text-sm text-slate-800 dark:text-slate-200 hover:bg-emerald-50"
          >
            <Compass className="w-4 h-4 text-emerald-600" />
            Catch My Jama&apos;ah
          </Link>
          <Link
            href="/qibla"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-semibold text-sm text-slate-800 dark:text-slate-200 hover:bg-emerald-50"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            Qibla Finder
          </Link>
          <Link
            href="/ramadan"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-semibold text-sm text-slate-800 dark:text-slate-200 hover:bg-emerald-50"
          >
            <Calendar className="w-4 h-4 text-amber-500" />
            Ramadan &amp; Eid Calendar
          </Link>
          <Link
            href="/regions"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-semibold text-sm text-slate-800 dark:text-slate-200 hover:bg-emerald-50"
          >
            <Layers className="w-4 h-4 text-slate-500" />
            Region Hierarchy
          </Link>
          <Link
            href="/display/masjid-al-haram-makkah"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-semibold text-sm text-slate-800 dark:text-slate-200 hover:bg-emerald-50"
          >
            <Tv className="w-4 h-4 text-blue-500" />
            Masjid TV Display Mode
          </Link>
          <Link
            href="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-semibold text-sm text-slate-800 dark:text-slate-200 hover:bg-emerald-50"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Moderator Dashboard
          </Link>
          <Link
            href="/docs"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-semibold text-sm text-slate-800 dark:text-slate-200 hover:bg-emerald-50"
          >
            <Code2 className="w-4 h-4 text-slate-500" />
            Open API Docs
          </Link>
        </div>
      )}
    </header>
  );
}
