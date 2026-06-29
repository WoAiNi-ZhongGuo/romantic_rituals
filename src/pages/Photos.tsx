import { useState, useEffect, useRef } from 'react';
import { Upload, Download, X, ImageIcon, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { compressImage, generatePhotoKey, formatDate } from '../lib/utils';
import type { Photo } from '../types/database';

export default function Photos() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<Photo | null>(null);
  const [caption, setCaption] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase
      .from('photos')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setPhotos(data);
      });

    const subscription = supabase
      .channel('photos')
      .on<Photo>(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'photos' },
        (payload) => {
          setPhotos((prev) => [payload.new as Photo, ...prev]);
        }
      )
      .subscribe();

    return () => { void subscription.unsubscribe(); };
  }, []);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    try {
      // 生成缩略图
      const thumbBlob = await compressImage(file, 720, 0.85);
      // 高质分享版
      const originalBlob = await compressImage(file, 4096, 0.95);

      const baseKey = generatePhotoKey('shared', file);
      const thumbKey = `thumbnails/${baseKey}`;
      const originalKey = `originals/${baseKey}`;

      // 上传到 Supabase Storage
      const [thumbResult, originalResult] = await Promise.all([
        supabase.storage.from('photos').upload(thumbKey, thumbBlob, {
          contentType: 'image/webp',
          upsert: false,
        }),
        supabase.storage.from('photos').upload(originalKey, originalBlob, {
          contentType: file.type,
          upsert: false,
        }),
      ]);

      if (thumbResult.error) throw thumbResult.error;
      if (originalResult.error) throw originalResult.error;

      // 获取公开 URL
      const { data: thumbUrlData } = supabase.storage
        .from('photos')
        .getPublicUrl(thumbKey);
      const { data: originalUrlData } = supabase.storage
        .from('photos')
        .getPublicUrl(originalKey);

      const thumbUrl = thumbUrlData.publicUrl;
      const originalUrl = originalUrlData.publicUrl;

      // 记录到数据库
      const { data } = await supabase
        .from('photos')
        .insert({
          url: originalUrl,
          thumbnail_url: thumbUrl,
          caption: caption.trim() || null,
          uploaded_by: '我',
          taken_at: new Date().toISOString(),
          is_backed_up: false,
        })
        .select()
        .single();

      if (data) {
        setPhotos((prev) => [data, ...prev]);
        setCaption('');
      }
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function handleDelete(photo: Photo) {
    try {
      // 从数据库中删除记录 (照片会在后续清理)
      await supabase.from('photos').delete().eq('id', photo.id);
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
      if (preview?.id === photo.id) setPreview(null);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  }

  async function handleDownload(url: string, filename: string) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (err) {
      console.error('Download failed:', err);
    }
  }

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">私密相册</h2>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="bg-love-500 text-white p-2 rounded-xl hover:bg-love-600 disabled:opacity-50 transition-colors"
        >
          {uploading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Upload className="w-5 h-5" />
          )}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* 上传时的备注输入 */}
      <div className="flex gap-2">
        <input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="添加备注（选填）"
          className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-love-400"
        />
      </div>

      {/* 相册网格 */}
      {photos.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>还没有照片</p>
          <p className="text-sm mt-1">点击右上角上传第一张</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo) => (
            <button
              key={photo.id}
              onClick={() => setPreview(photo)}
              className="aspect-square rounded-xl overflow-hidden bg-gray-100 relative group"
            >
              <img
                src={photo.thumbnail_url || photo.url}
                alt={photo.caption || ''}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            </button>
          ))}
        </div>
      )}

      {/* 预览 Modal */}
      {preview && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="relative max-w-full max-h-full">
            <img
              src={preview.url}
              alt={preview.caption || ''}
              className="max-w-full max-h-[80vh] rounded-xl object-contain"
            />
            <div className="flex items-center justify-between mt-3">
              <div>
                {preview.caption && (
                  <p className="text-white text-sm">{preview.caption}</p>
                )}
                <p className="text-white/60 text-xs mt-0.5">
                  {preview.uploaded_by} · {formatDate(preview.created_at)}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownload(preview.url, `lover-${preview.id}.jpg`)}
                  className="bg-white/20 text-white p-2 rounded-xl hover:bg-white/30 transition-colors"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(preview)}
                  className="bg-white/20 text-white p-2 rounded-xl hover:bg-red-500/50 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setPreview(null)}
                  className="bg-white/20 text-white p-2 rounded-xl hover:bg-white/30 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
