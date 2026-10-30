"use client";

import React, { useEffect, useRef } from "react";
import Script from "next/script";
import { ShieldCheck } from "lucide-react";

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void;
  onError?: (error: any) => void;
  onExpire?: () => void;
  className?: string;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          "error-callback"?: (error: any) => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact" | "flexible";
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

export default function TurnstileWidget({
  onSuccess,
  onError,
  onExpire,
  className = "",
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);

  const siteKey =
    process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY ||
    "1x00000000000000000000AA"; // Cloudflare official pass-through testing sitekey

  function renderWidget() {
    if (!containerRef.current || !window.turnstile) return;

    // Clean up previous widget instance if any
    if (widgetIdRef.current) {
      try {
        window.turnstile.remove(widgetIdRef.current);
      } catch (e) {
        // ignore
      }
      widgetIdRef.current = null;
    }

    try {
      const id = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: "auto",
        callback: (token: string) => {
          onSuccess(token);
        },
        "error-callback": (err) => {
          console.warn("[Turnstile Widget] Verification error:", err);
          if (onError) onError(err);
        },
        "expired-callback": () => {
          if (onExpire) onExpire();
        },
      });
      widgetIdRef.current = id;
    } catch (err) {
      console.warn("[Turnstile] Render error:", err);
    }
  }

  useEffect(() => {
    if (typeof window !== "undefined" && window.turnstile) {
      renderWidget();
    }
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  return (
    <div className={`space-y-2 ${className}`}>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={() => {
          renderWidget();
        }}
      />
      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>Spam & Bot Protection by Cloudflare Turnstile</span>
      </div>
      <div ref={containerRef} className="min-h-[65px] flex items-center" />
    </div>
  );
}
