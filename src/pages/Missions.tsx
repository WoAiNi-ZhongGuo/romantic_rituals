import { useState, useEffect } from 'react';
import { Plus, CheckCircle2, Circle, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Mission, MissionLog, Author } from '../types/database';

export default function Missions() {
  const [missions, setMissions] = useState<(Mission & { logs: MissionLog[] })[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');

  useEffect(() => {
    loadMissions();
  }, []);

  async function loadMissions() {
    const { data: missionData } = await supabase
      .from('missions')
      .select('*')
      .eq('is_active', true)
      .order('created_at');

    if (missionData) {
      const missionsWithLogs = await Promise.all(
        missionData.map(async (mission) => {
          const today = new Date().toISOString().split('T')[0];
          const { data: logs } = await supabase
            .from('mission_logs')
            .select('*')
            .eq('mission_id', mission.id)
            .gte('completed_at', today)
            .order('completed_at');
          return { ...mission, logs: logs || [] };
        })
      );
      setMissions(missionsWithLogs);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const { data } = await supabase
      .from('missions')
      .insert({
        title: title.trim(),
        description: description.trim() || null,
        frequency,
        created_by: '我',
        is_active: true,
      })
      .select()
      .single();
    if (data) {
      setMissions((prev) => [...prev, { ...data, logs: [] }]);
      setTitle('');
      setDescription('');
      setShowForm(false);
    }
  }

  async function handleCheckIn(missionId: number, completedBy: Author) {
    const { data } = await supabase
      .from('mission_logs')
      .insert({
        mission_id: missionId,
        completed_by: completedBy,
      })
      .select()
      .single();
    if (data) {
      setMissions((prev) =>
        prev.map((m) =>
          m.id === missionId ? { ...m, logs: [...m.logs, data] } : m
        )
      );
    }
  }

  async function handleDelete(missionId: number) {
    await supabase.from('missions').update({ is_active: false }).eq('id', missionId);
    setMissions((prev) => prev.filter((m) => m.id !== missionId));
  }

  const authors: Author[] = ['我', 'TA'];

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-medium text-gray-500 tracking-wide">共同打卡</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-9 h-9 rounded-xl bg-gradient-to-br from-love-500 to-rose-400 text-white flex items-center justify-center shadow-sm hover:shadow-md transition-all card-hover"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/60 shadow-sm space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="打卡任务（如：喝水8杯）"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-love-300 focus:border-transparent"
            autoFocus
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="备注说明（可选）"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-love-400"
          />
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as 'daily' | 'weekly')}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-love-400"
          >
            <option value="daily">每天</option>
            <option value="weekly">每周</option>
          </select>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-love-500 to-rose-400 text-white py-2.5 rounded-xl font-medium hover:shadow-md transition-all"
          >
            创建任务
          </button>
        </form>
      )}

      {missions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <p>还没有打卡任务</p>
          <p className="text-sm mt-1">创建一些两人一起坚持的小目标</p>
        </div>
      ) : (
        <div className="space-y-3">
          {missions.map((mission) => {
            const todayLogs = mission.logs;
            const meDone = todayLogs.some((l) => l.completed_by === '我');
            const taDone = todayLogs.some((l) => l.completed_by === 'TA');

            return (
              <div
                key={mission.id}
                className="bg-white rounded-xl p-4 shadow-sm border border-love-100"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium text-sm text-gray-800">{mission.title}</p>
                    {mission.description && (
                      <p className="text-xs text-gray-400">{mission.description}</p>
                    )}
                    <span className="text-xs text-gray-300 mt-1">{mission.frequency === 'daily' ? '每天' : '每周'}</span>
                  </div>
                  <button
                    onClick={() => handleDelete(mission.id)}
                    className="text-gray-300 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex gap-2">
                  {authors.map((author) => {
                    const isDone = author === '我' ? meDone : taDone;
                    return (
                      <button
                        key={author}
                        onClick={() => !isDone && handleCheckIn(mission.id, author)}
                        disabled={isDone}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          isDone
                            ? 'bg-green-50 text-green-600 border border-green-200'
                            : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-love-50 hover:text-love-600 hover:border-love-200'
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                        {author}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
