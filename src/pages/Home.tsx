import { useState, useEffect, useMemo } from "react";
import { Heart, CalendarHeart, Sparkles } from "lucide-react";
import { supabase } from "../lib/supabase";
import { getDaysSince, getDaysUntil, formatDate } from "../lib/utils";
import type { Relationship, Anniversary } from "../types/database";

export default function Home() {
  const [relationship, setRelationship] = useState<Relationship | null>(null);
  const [anniversaries, setAnniversaries] = useState<Anniversary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [relResult, annResult] = await Promise.all([
        supabase.from("relationship").select("*").single(),
        supabase.from("anniversaries").select("*").order("date"),
      ]);
      if (relResult.data) setRelationship(relResult.data);
      if (annResult.data) setAnniversaries(annResult.data);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-love-400 to-rose-400 mx-auto flex items-center justify-center animate-heartbeat">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <p className="text-gray-400 text-sm mt-3">???...</p>
        </div>
      </div>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = useMemo(() => {
    return anniversaries
      .filter((a) => new Date(a.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);
  }, [anniversaries, today]);

  const daysCount = relationship ? getDaysSince(relationship.start_date) : 0;

  return (
    <div className="space-y-5 pt-1">
      {relationship && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-love-700 via-love-600 to-rose-500 glow-pink">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-rose-300/20 rounded-full translate-y-1/3 -translate-x-1/4 blur-2xl" />
          <div className="relative z-10 px-6 pt-6 pb-7">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CalendarHeart className="w-4 h-4 text-white/70" />
                <span className="text-xs text-white/60 tracking-wider font-medium">?????</span>
              </div>
              <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/10">
                <span className="text-[10px] text-white/70 tracking-wide">{formatDate(relationship.start_date)}</span>
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-6xl font-light tracking-tight text-white">{daysCount}</span>
              <span className="text-lg text-white/70 font-light">?</span>
            </div>
            <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-white/60 to-white/90 rounded-full transition-all duration-1000" style={{ width: Math.min((daysCount % 100) + 1, 100) + "%" }} />
            </div>
            <p className="text-xs text-white/40 mt-2 tracking-wide">?????????</p>
          </div>
        </div>
      )}
      {upcoming.length > 0 && (
        <div className="animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-love-400 to-rose-400 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 tracking-wide">????</h3>
          </div>
          <div className="space-y-2.5">
            {upcoming.map((ann) => {
              const days = getDaysUntil(ann.date);
              return (
                <div key={ann.id} className="animate-fade-in bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/60 shadow-sm card-hover">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-love-100 to-rose-100 flex items-center justify-center shrink-0">
                        <Heart className="w-4 h-4 text-love-500" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-800">{ann.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{formatDate(ann.date)}{ann.type === "lunar" && "????"}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-2xl font-light text-love-600 leading-none">{days > 0 ? days : days === 0 ? "?" : ""}</div>
                      <div className="text-[10px] text-gray-400 mt-1">{days > 0 ? "??" : days === 0 ? "??" : ""}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {!relationship && !loading && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <div className="w-14 h-14 rounded-full bg-love-50 flex items-center justify-center mb-3">
            <Sparkles className="w-6 h-6 text-love-300" />
          </div>
          <p className="text-sm">????????</p>
          <p className="text-xs mt-1.5 text-gray-300">??????? relationship ?</p>
        </div>
      )}
    </div>
  );
}