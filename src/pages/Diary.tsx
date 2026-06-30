import { useState, useEffect, useRef } from 'react';
import { Send, User, Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatDate } from '../lib/utils';
import type { Diary as DiaryEntry, Author } from '../types/database';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export default function Diary() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState<Author>('我');
  const [mood, setMood] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase
      .from('diaries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
      .then(({ data }) => {
        if (data) setEntries(data.reverse());
      });

    const subscription = supabase
      .channel('diaries')
      .on<DiaryEntry>(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'diaries' },
        (payload: RealtimePostgresChangesPayload<DiaryEntry>) => {
          setEntries((prev) => [...prev, payload.new as DiaryEntry]);
        }
      )
      .subscribe();

    return () => { void subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    const { data } = await supabase
      .from('diaries')
      .insert({
        content: content.trim(),
        author,
        mood: mood || null,
      })
      .select()
      .single();

    if (data) {
      setContent('');
      setMood('');
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] pt-2">
      <h2 className="text-base font-medium text-gray-500 tracking-wide mb-3">共享日记</h2>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Heart className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>还没有日记</p>
            <p className="text-sm mt-1">写点什么吧</p>
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className={`flex ${entry.author === '我' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  entry.author === '我'
                    ? 'bg-gradient-to-l from-love-600 to-rose-500 text-white rounded-br-md shadow-sm'
                    : 'bg-white/80 backdrop-blur-sm text-gray-800 border border-white/60 rounded-bl-md shadow-sm'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <User className="w-3.5 h-3.5 opacity-70" />
                  <span className={`text-xs ${entry.author === '我' ? 'text-white/80' : 'text-gray-400'}`}>
                    {entry.author}
                  </span>
                  {entry.mood && (
                    <span className="text-xs opacity-70">· {entry.mood}</span>
                  )}
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{entry.content}</p>
                <p className={`text-[10px] mt-1.5 ${entry.author === '我' ? 'text-white/60' : 'text-gray-300'}`}>
                  {formatDate(entry.created_at)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="mt-3 bg-white/80 backdrop-blur-sm rounded-2xl p-3 border border-white/60 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <select
            value={author}
            onChange={(e) => setAuthor(e.target.value as Author)}
            className="text-xs px-2 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-love-400"
          >
            <option value="我">我</option>
            <option value="TA">TA</option>
          </select>
          <input
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            placeholder="心情（可选）"
            className="flex-1 text-xs px-2 py-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-love-400"
            maxLength={10}
          />
        </div>
        <div className="flex gap-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="今天发生了什么..."
            rows={2}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-love-300 focus:border-transparent"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <button
            type="submit"
            disabled={!content.trim()}
            className="bg-gradient-to-r from-love-500 to-rose-400 text-white p-3 rounded-xl hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all self-end"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
