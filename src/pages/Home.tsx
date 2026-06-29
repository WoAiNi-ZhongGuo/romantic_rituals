import { useState, useEffect } from 'react';
import { Heart, CalendarHeart, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getDaysSince, getDaysUntil, formatDate } from '../lib/utils';
import type { Relationship, Anniversary } from '../types/database';

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
        supabase.from('relationship').select('*').single(),
        supabase.from('anniversaries').select('*').order('date'),
      ]);
      if (relResult.data) setRelationship(relResult.data);
      if (annResult.data) setAnniversaries(annResult.data);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Heart className="w-8 h-8 text-love-400 animate-pulse" />
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];
  const upcoming = anniversaries
    .filter((a) => {
      const dateStr = a.type === 'lunar' ? a.date : a.date;
      return dateStr >= today;
    })
    .slice(0, 3);

  return (
    <div className="space-y-6 pt-2">
      {/* 恋爱天数 */}
      {relationship && (
        <div className="bg-gradient-to-br from-love-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-medium opacity-90">
              在一起的第
            </h2>
            <CalendarHeart className="w-5 h-5 opacity-80" />
          </div>
          <div className="text-5xl font-bold mb-1">
            {getDaysSince(relationship.start_date)}
          </div>
          <div className="text-sm opacity-80">
            天 · 始于 {formatDate(relationship.start_date)}
          </div>
        </div>
      )}

      {/* 纪念日倒计时 */}
      {upcoming.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            即将到来的纪念日
          </h3>
          <div className="space-y-3">
            {upcoming.map((ann) => {
              const days = getDaysUntil(ann.date);
              return (
                <div
                  key={ann.id}
                  className="bg-white rounded-xl p-4 shadow-sm border border-love-100"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">{ann.title}</p>
                      <p className="text-sm text-gray-400">
                        {formatDate(ann.date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-love-500">
                        {days > 0 ? days : '今天'}
                      </div>
                      <div className="text-xs text-gray-400">天后</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 空状态 */}
      {!relationship && !loading && (
        <div className="text-center py-16 text-gray-400">
          <Heart className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>在 Supabase 中创建 relationship 表</p>
          <p className="text-sm mt-1">即可看到恋爱天数统计</p>
        </div>
      )}
    </div>
  );
}
