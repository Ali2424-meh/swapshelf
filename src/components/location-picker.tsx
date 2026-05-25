"use client";

import { useState } from "react";
import { IconCheck, IconMapPin } from "@/components/icons";

type LocationPickerProps = {
  defaultLat?: number | null;
  defaultLng?: number | null;
};

export function LocationPicker({ defaultLat, defaultLng }: LocationPickerProps) {
  const [lat, setLat] = useState<number | "">(defaultLat ?? "");
  const [lng, setLng] = useState<number | "">(defaultLng ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detected, setDetected] = useState(false);

  function detect() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(Number(position.coords.latitude.toFixed(6)));
        setLng(Number(position.coords.longitude.toFixed(6)));
        setLoading(false);
        setDetected(true);
      },
      () => {
        setError("Could not detect location. Check browser permissions.");
        setLoading(false);
      },
      { timeout: 8000 },
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={detect}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition hover:border-green hover:text-green disabled:cursor-wait disabled:opacity-60"
        >
          {loading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-green border-t-transparent" />
          ) : detected ? (
            <IconCheck className="h-4 w-4 text-green" strokeWidth={2.5} />
          ) : (
            <IconMapPin className="h-4 w-4" />
          )}
          {loading ? "Detecting..." : detected ? "Location detected" : "Detect my location"}
        </button>
        {(lat !== "" || lng !== "") && (
          <span className="rounded-lg bg-green-light px-3 py-1.5 text-xs font-medium text-green">
            {Number(lat).toFixed(4)}, {Number(lng).toFixed(4)}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <p className="text-xs text-muted">
        Used to calculate distances to nearby listings. Stored approximately, never your exact address.
      </p>
      <input type="hidden" name="latitude" value={lat} />
      <input type="hidden" name="longitude" value={lng} />
    </div>
  );
}
