"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Masjid } from "@/lib/types";
import { formatDistance } from "@/lib/geo";
import { Sparkles, MapPin, Navigation, Clock, ChevronRight } from "lucide-react";

interface Props {
  masjids: Array<Masjid & { distanceMeters?: number }>;
  userLocation: { lat: number; lng: number } | null;
  onSelectMasjid?: (masjid: Masjid) => void;
  className?: string;
}

export default function InteractiveMap({
  masjids,
  userLocation,
  onSelectMasjid,
  className = "",
}: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  useEffect(() => {
    // Dynamically inject Leaflet CSS if not already present
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    let isMounted = true;

    // Dynamically import Leaflet to ensure SSR safety
    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Clean up previous instance if exists
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      // Default center: Srinagar pilot (34.0837, 74.7973) or user location
      const initialLat = userLocation?.lat || (masjids.length > 0 ? masjids[1]?.latitude || 34.0837 : 34.0837);
      const initialLng = userLocation?.lng || (masjids.length > 0 ? masjids[1]?.longitude || 74.7973 : 74.7973);

      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: true,
      }).setView([initialLat, initialLng], 13);

      // OpenStreetMap tile layer (clean & high resolution)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      // Create Custom SVG Mosque Pin Icon
      const createMosqueIcon = (category: string) => {
        const isLandmark = category === "landmark";
        const bgColor = isLandmark ? "#D97706" : "#047857";
        const borderColor = isLandmark ? "#B45309" : "#064E3B";

        return L.divIcon({
          className: "custom-mosque-pin",
          html: `
            <div style="
              background: ${bgColor};
              width: 34px;
              height: 34px;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              border: 2px solid ${borderColor};
              box-shadow: 0 4px 10px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
            ">
              <svg style="transform: rotate(45deg); width: 18px; height: 18px; fill: white;" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
          `,
          iconSize: [34, 34],
          iconAnchor: [17, 34],
          popupAnchor: [0, -34],
        });
      };

      // User location pulsing beacon icon
      const userBeaconIcon = L.divIcon({
        className: "user-location-beacon",
        html: `
          <div style="position: relative; width: 20px; height: 20px;">
            <div style="position: absolute; inset: -8px; background: rgba(16, 185, 129, 0.4); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: absolute; inset: 0; background: #059669; border: 2px solid white; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      // Add user location marker if available
      if (userLocation) {
        L.marker([userLocation.lat, userLocation.lng], { icon: userBeaconIcon })
          .addTo(map)
          .bindPopup("<strong>You Are Here</strong>");
      }

      // Add markers for all masjids
      const markerGroup = L.featureGroup();

      masjids.forEach((masjid) => {
        const marker = L.marker([masjid.latitude, masjid.longitude], {
          icon: createMosqueIcon(masjid.category),
        });

        // Rich HTML Popup Content
        const popupContent = document.createElement("div");
        popupContent.className = "p-1 space-y-2 text-slate-900";
        popupContent.innerHTML = `
          <div style="font-family: inherit; min-width: 200px;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 4px; margin-bottom: 4px;">
              <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: ${
                masjid.category === "landmark" ? "#B45309" : "#047857"
              }; background: ${
          masjid.category === "landmark" ? "#FEF3C7" : "#ECFDF5"
        }; padding: 2px 6px; border-radius: 9999px;">
                ${masjid.category}
              </span>
              <span style="font-size: 11px; color: #64748B;">
                ${masjid.distanceMeters !== undefined ? formatDistance(masjid.distanceMeters) : ""}
              </span>
            </div>
            <h4 style="font-size: 14px; font-weight: 800; margin: 0 0 2px 0; line-height: 1.2;">
              ${masjid.name}
            </h4>
            <p style="font-size: 11px; color: #64748B; margin: 0 0 8px 0;">
              ${masjid.locality}, ${masjid.district}
            </p>

            <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px; background: #F8FAFC; border: 1px solid #E2E8F0; padding: 4px; border-radius: 8px; text-align: center; font-size: 10px; margin-bottom: 8px;">
              <div><strong>F</strong><br/>${masjid.timings.fajr?.iqamahTime || "--"}</div>
              <div><strong>D</strong><br/>${masjid.timings.dhuhr?.iqamahTime || "--"}</div>
              <div><strong>A</strong><br/>${masjid.timings.asr?.iqamahTime || "--"}</div>
              <div><strong>M</strong><br/>${masjid.timings.maghrib?.iqamahTime || "--"}</div>
              <div><strong>I</strong><br/>${masjid.timings.isha?.iqamahTime || "--"}</div>
            </div>

            <div style="display: flex; gap: 4px;">
              <a href="/masjids/${masjid.slug}" style="flex: 1; text-align: center; background: #047857; color: white; padding: 6px; border-radius: 6px; text-decoration: none; font-size: 11px; font-weight: 700;">
                View &amp; Vote
              </a>
              <a href="https://www.google.com/maps/dir/?api=1&destination=${masjid.latitude},${masjid.longitude}" target="_blank" rel="noopener noreferrer" style="background: #F1F5F9; color: #334155; padding: 6px 10px; border-radius: 6px; text-decoration: none; font-size: 11px; font-weight: 600;">
                Route
              </a>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on("click", () => {
          if (onSelectMasjid) onSelectMasjid(masjid);
        });

        marker.addTo(markerGroup);
      });

      markerGroup.addTo(map);

      // Fit bounds if markers exist
      if (masjids.length > 0) {
        // Center around closest cluster
        const localBounds = markerGroup.getBounds();
        map.fitBounds(localBounds, { padding: [40, 40], maxZoom: 14 });
      }

      mapInstanceRef.current = map;
      setLeafletLoaded(true);
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [masjids, userLocation]);

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full min-h-[500px] z-0" />

      {/* Map Control Overlay */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
        <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-2.5 shadow-md text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <span className="w-3 h-3 rounded-full bg-emerald-700"></span>
            <span>Masjid (Local/Major)</span>
          </div>
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <span className="w-3 h-3 rounded-full bg-gold-600"></span>
            <span>Landmark Mosque</span>
          </div>
          {userLocation && (
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Your GPS Location</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
