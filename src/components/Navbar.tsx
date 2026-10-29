"use client";

import React, { useState } from "react";
import Link from "next/link";
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
} from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-lg p-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-800 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-900/10 group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-slate-900 tracking-tight">
                  All Masjid Timing
                </span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                  Open Data
                </span>
              </div>
              <p className="text-xs text-slate-500 -mt-0.5">
                Verified Iqamah & Jumu&apos;ah Directory
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600">
            <Link
              href="/"
              className="px-3 py-2 rounded-md hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
            >
              Nearest Masjids
            </Link>
            <Link
              href="/catch"
              className="px-3 py-2 rounded-md hover:text-emerald-700 hover:bg-emerald-50 transition-colors flex items-center gap-1.5"
            >
              <Compass className="w-4 h-4 text-emerald-600" />
              Catch My Jama&apos;ah
            </Link>
            <Link
              href="/regions"
              className="px-3 py-2 rounded-md hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
            >
              Hierarchy
            </Link>
            <Link
              href="/api/v1/export"
              target="_blank"
              className="px-3 py-2 rounded-md hover:text-emerald-700 hover:bg-emerald-50 transition-colors flex items-center gap-1.5"
            >
              <Code2 className="w-4 h-4 text-slate-400" />
              Open API
            </Link>
          </nav>

          {/* CTA & Actions */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/display/historic-jamia-masjid-srinagar"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-emerald-800 rounded-lg hover:bg-slate-100 transition-colors"
              title="Launch full-screen Masjid TV Display"
            >
              <Tv className="w-4 h-4 text-slate-500" />
              Masjid TV
            </Link>
            <Link
              href="/masjids/add"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-medium shadow-sm shadow-emerald-900/10 transition-all hover:shadow hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 min-h-[44px]"
            >
              <PlusCircle className="w-4 h-4" />
              Add Masjid
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/masjids/add"
              className="inline-flex items-center justify-center p-2 rounded-lg bg-emerald-700 text-white min-w-[44px] min-h-[44px]"
              aria-label="Add Masjid"
            >
              <PlusCircle className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-md text-base font-medium text-slate-800 hover:bg-emerald-50 hover:text-emerald-700"
          >
            Nearest Masjids
          </Link>
          <Link
            href="/catch"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-md text-base font-medium text-slate-800 hover:bg-emerald-50 hover:text-emerald-700"
          >
            Catch My Jama&apos;ah
          </Link>
          <Link
            href="/regions"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-md text-base font-medium text-slate-800 hover:bg-emerald-50 hover:text-emerald-700"
          >
            Geographic Directory
          </Link>
          <Link
            href="/display/historic-jamia-masjid-srinagar"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-md text-base font-medium text-slate-800 hover:bg-emerald-50 hover:text-emerald-700"
          >
            Masjid TV Display Mode
          </Link>
          <Link
            href="/api/v1/export"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-md text-base font-medium text-slate-800 hover:bg-emerald-50 hover:text-emerald-700"
          >
            Download Open Data (JSON)
          </Link>
        </div>
      )}
    </header>
  );
}
