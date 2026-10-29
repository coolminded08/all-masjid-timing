import React from "react";
import Link from "next/link";
import { ShieldCheck, Heart, Globe2, Code2 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: About */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              All Masjid Timing
            </div>
            <p className="text-slate-400 text-xs sm:text-sm max-w-md leading-relaxed">
              An open, public-benefit platform providing real-time congregational Iqamah &amp;
              Jumu&apos;ah prayer times across local and landmark masjids. Data is community-verified
              with proximity checks and published under an open license.
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>4-Tier Trust Model &bull; Cloudflare Turnstile Protected</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-emerald-400 transition-colors">
                  Nearby Masjids
                </Link>
              </li>
              <li>
                <Link href="/catch" className="hover:text-emerald-400 transition-colors">
                  Catch My Jama&apos;ah Finder
                </Link>
              </li>
              <li>
                <Link href="/masjids/add" className="hover:text-emerald-400 transition-colors">
                  Submit a Masjid (GPS)
                </Link>
              </li>
              <li>
                <Link href="/regions" className="hover:text-emerald-400 transition-colors">
                  Regional Directory
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Developers & Open Data */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">
              Open Data &amp; API
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/api/v1/export"
                  target="_blank"
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  REST API v1
                </Link>
              </li>
              <li>
                <Link
                  href="/api/v1/export"
                  target="_blank"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Download Open Data (JSON)
                </Link>
              </li>
              <li>
                <span className="text-slate-500">License: ODC-By Attribution</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>&copy; {new Date().getFullYear()} All Masjid Timing Project. Non-profit &amp; Community Open Source.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3 h-3 text-emerald-500 fill-emerald-500" /> for the Ummah worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
}
