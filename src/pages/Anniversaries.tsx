import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getDaysUntil, formatDate } from '../lib/utils';
import type { Anniversary } from '../types/database';

export default function Anniversaries() {
  const [list, setList] = useState<Anniversary[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState<'normal' | 'lunar'>('normal');
  const [recurring, setRecurring] = useState(true);

  useEffect(() => {
    supabase
      .from('anniversaries')
      .select('*')
      .order('date')
      .then(({ data }) => {
        if (data) setList(data);
      });
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !date) return;
    const { data } = await supabase
      .from('anniversaries')
      .insert({ title, date, type, is_recurring: recurring })
      .select()
      .single();
    if (data) {
      setList((prev) => [...prev, data].sort((a, b) => a.date.localeCompare(b.date)));
      setTitle('');
      setDate('');
      setShowForm(false);
    }
  }

  async function handleDelete(id: number) {
    await supabase.from('anniversaries').delete().eq('id', id);
    setList((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-medium text-gray-500 tracking-wide">纪念日</h2>
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
            placeholder="纪念日名称（如：在一起）"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-love-300 focus:border-transparent"
            autoFocus
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-love-400"
          />
          <div className="flex gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="radio"
                checked={type === 'normal'}
                onChange={() => setType('normal')}
              />
              公历
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="radio"
                checked={type === 'lunar'}
                onChange={() => setType('lunar')}
              />
              农历
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={recurring}
              onChange={(e) => setRecurring(e.target.checked)}
            />
            每年重复
          </label>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-love-500 to-rose-400 text-white py-2.5 rounded-xl font-medium hover:shadow-md transition-all"
          >
            添加
          </button>
        </form>
      )}

      {list.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <p>还没有纪念日</p>
          <p className="text-sm mt-1">点击右上角 + 添加</p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((ann) => {
            const days = getDaysUntil(ann.date);
            return (
              <div
                key={ann.id}
                className="bg-white rounded-xl p-4 shadow-sm border border-love-100"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm text-gray-800">{ann.title}</p>
                    <p className="text-xs text-gray-400">
                      {formatDate(ann.date)}
                      {ann.type === 'lunar' && '（农历）'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-2xl font-light text-love-600">
                        {days > 0 ? days : days === 0 ? '今天' : `已过${Math.abs(days)}天`}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(ann.id)}
                      className="text-gray-300 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
