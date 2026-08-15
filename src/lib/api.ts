import { Stats, WardHotspot } from "@/types"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"

async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`)
  if (!res.ok) {
    throw new Error(`API error ${res.status} on ${path}`)
  }
  return res.json() as Promise<T>
}

export function fetchStats(): Promise<Stats> {
  return getJSON<Stats>("/dashboard/stats")
}

export function fetchHotspots(): Promise<WardHotspot[]> {
  return getJSON<WardHotspot[]>("/dashboard/hotspots")
}
