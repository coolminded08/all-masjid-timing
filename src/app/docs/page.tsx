"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Code2,
  Play,
  Copy,
  Check,
  Terminal,
  ShieldCheck,
  Globe2,
  ArrowLeft,
  ChevronDown,
  Loader2,
} from "lucide-react";

interface EndpointDoc {
  method: "GET" | "POST";
  path: string;
  summary: string;
  description: string;
  sampleQuery?: string;
  sampleBody?: string;
}

const ENDPOINTS: EndpointDoc[] = [
  {
    method: "GET",
    path: "/api/v1/masjids",
    summary: "Search Masjids by GPS coordinates or text query",
    description: "Returns an array of masjids with live calculated Azaan times, Iqamah congregation timings, and trust provenance labels.",
    sampleQuery: "lat=34.08&lng=74.79&radius=10000",
  },
  {
    method: "GET",
    path: "/api/v1/masjids/historic-jamia-masjid-srinagar",
    summary: "Get specific masjid timings & live astronomical times",
    description: "Returns detailed schedule, Jumu'ah shifts, facilities, and live astronomical Azaan times via UmmahAPI / AlAdhan.",
  },
  {
    method: "POST",
    path: "/api/v1/masjids",
    summary: "Register a new masjid with duplicate check",
    description: "Accepts name, GPS coordinates, locality, and initial timings. Automatically rejects duplicates within 50 meters.",
    sampleBody: JSON.stringify(
      {
        name: "Masjid Umar Farooq",
        latitude: 34.075,
        longitude: 74.815,
        locality: "Batmaloo",
        district: "Srinagar",
        state: "Jammu & Kashmir",
        country: "India",
        amenities: { hasLadiesSection: false, hasParking: true, hasWarmWaterWudu: true },
        timings: {
          fajr: { azaanTime: "05:15", iqamahTime: "05:40", isFixed: true },
          dhuhr: { azaanTime: "12:20", iqamahTime: "12:45", isFixed: true },
          asr: { azaanTime: "15:40", iqamahTime: "16:05", isFixed: true },
          maghrib: { azaanTime: "17:42", iqamahTime: "17:47", isFixed: false },
          isha: { azaanTime: "19:05", iqamahTime: "19:30", isFixed: true },
        },
      },
      null,
      2
    ),
  },
  {
    method: "POST",
    path: "/api/v1/masjids/m-jamia-srinagar/vote",
    summary: "Submit proximity-weighted community vote",
    description: "Accepts 'correct' or 'wrong' votes on a specific prayer timing. If GPS coordinates are within 500m of the masjid, vote receives 100% full weight.",
    sampleBody: JSON.stringify(
      {
        prayer: "asr",
        value: "correct",
        userLatitude: 34.0931,
        userLongitude: 74.8118,
      },
      null,
      2
    ),
  },
  {
    method: "GET",
    path: "/api/v1/export",
    summary: "Download bulk open data dump (JSON)",
    description: "Returns the complete database of masjids, verified schedules, and coordinates under an Open Data Commons Attribution License (ODC-By).",
  },
];

export default function ApiDocsPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointDoc>(ENDPOINTS[0]);
  const [testOutput, setTestOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleSendRequest() {
    setLoading(true);
    setTestOutput(null);
    try {
      let url = selectedEndpoint.path;
      if (selectedEndpoint.sampleQuery) {
        url += `?${selectedEndpoint.sampleQuery}`;
      }

      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers: { "Content-Type": "application/json" },
      };

      if (selectedEndpoint.method === "POST" && selectedEndpoint.sampleBody) {
        options.body = selectedEndpoint.sampleBody;
      }

      const res = await fetch(url, options);
      const json = await res.json();
      setTestOutput(JSON.stringify(json, null, 2));
    } catch (e: any) {
      setTestOutput(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (!testOutput) return;
    navigator.clipboard.writeText(testOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Directory
        </Link>
        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          OpenAPI 3.1 &bull; REST v1
        </span>
      </div>

      {/* Header */}
      <div className="space-y-2 border-b border-slate-200 pb-6">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-3 py-1 rounded-full">
          <Code2 className="w-3.5 h-3.5 text-emerald-700" />
          Developer Platform (Module 10)
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Public REST API Documentation
        </h1>
        <p className="text-sm text-slate-500 max-w-2xl">
          Build mobile widgets, smartwatch watchfaces, digital signage clocks, or Islamic apps
          powered by live crowdsourced congregation timings.
        </p>
      </div>

      {/* Grid: Endpoints Navigation (Left) + Interactive Runner (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Endpoints List (5 cols) */}
        <div className="lg:col-span-5 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Available Endpoints
          </span>
          {ENDPOINTS.map((ep) => (
            <button
              key={`${ep.method}-${ep.path}`}
              onClick={() => {
                setSelectedEndpoint(ep);
                setTestOutput(null);
              }}
              className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                selectedEndpoint.path === ep.path && selectedEndpoint.method === ep.method
                  ? "bg-white border-emerald-500 shadow-md ring-1 ring-emerald-500"
                  : "bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white"
              }`}
            >
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded font-mono uppercase shrink-0 mt-0.5 ${
                  ep.method === "GET"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-emerald-100 text-emerald-800"
                }`}
              >
                {ep.method}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-mono text-xs font-bold text-slate-900 truncate">
                  {ep.path}
                </div>
                <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                  {ep.summary}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Live Test Console (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 font-mono text-xs">
              <span
                className={`font-black px-2 py-0.5 rounded uppercase ${
                  selectedEndpoint.method === "GET"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-emerald-100 text-emerald-800"
                }`}
              >
                {selectedEndpoint.method}
              </span>
              <span className="font-bold text-slate-900">{selectedEndpoint.path}</span>
            </div>

            <button
              onClick={handleSendRequest}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm transition-all"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-white" />
              )}
              <span>Send Request</span>
            </button>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {selectedEndpoint.description}
          </p>

          {/* Sample Query / Body */}
          {selectedEndpoint.sampleQuery && (
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Query Parameters
              </span>
              <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-mono text-xs text-slate-800">
                ?{selectedEndpoint.sampleQuery}
              </div>
            </div>
          )}

          {/* Live Response Box */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 uppercase tracking-wider mb-1">
              <span>Response (JSON)</span>
              {testOutput && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[11px] text-emerald-700 hover:underline"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy JSON"}
                </button>
              )}
            </div>

            <pre className="bg-slate-950 text-emerald-400 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-72 border border-slate-800">
              {testOutput || "// Click 'Send Request' to execute live API query..."}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
