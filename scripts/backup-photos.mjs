import { createClient } from '@supabase/supabase-js';
import { writeFileSync, mkdirSync } from 'fs';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const BACKUP_DIR = process.env.BACKUP_DIR || './backup-photos';

async function download(url, destPath) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Download failed: ${resp.status}`);
  const buffer = Buffer.from(await resp.arrayBuffer());
  writeFileSync(destPath, buffer);
}

async function main() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // 查询未备份的照片
  const { data: photos, error } = await supabase
    .from('photos')
    .select('*')
    .eq('is_backed_up', false)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Query failed:', error.message);
    process.exit(1);
  }

  if (!photos || photos.length === 0) {
    console.log('No new photos to backup.');
    return;
  }

  console.log(`Found ${photos.length} photos to backup.`);

  const backedUpIds = [];

  for (const photo of photos) {
    try {
      // 构造存储路径：按日期分组
      const date = new Date(photo.created_at).toISOString().split('T')[0];
      const dirPath = `${BACKUP_DIR}/${date}`;
      mkdirSync(dirPath, { recursive: true });

      // 下载原图
      const originalExt = photo.url.split('.').pop() || 'jpg';
      const originalPath = `${dirPath}/${photo.id}-original.${originalExt}`;
      console.log(`  Downloading original: ${photo.id}`);
      await download(photo.url, originalPath);

      // 下载缩略图
      if (photo.thumbnail_url) {
        const thumbPath = `${dirPath}/${photo.id}-thumb.webp`;
        await download(photo.thumbnail_url, thumbPath);
      }

      // 写入元数据
      const meta = {
        id: photo.id,
        caption: photo.caption,
        uploaded_by: photo.uploaded_by,
        taken_at: photo.taken_at,
        created_at: photo.created_at,
        original_url: photo.url,
        thumbnail_url: photo.thumbnail_url,
      };
      writeFileSync(`${dirPath}/${photo.id}.meta.json`, JSON.stringify(meta, null, 2));

      backedUpIds.push(photo.id);
    } catch (err) {
      console.error(`  Failed to backup photo ${photo.id}:`, err.message);
    }
  }

  // 标记为已备份
  if (backedUpIds.length > 0) {
    const { error: updateError } = await supabase
      .from('photos')
      .update({ is_backed_up: true })
      .in('id', backedUpIds);

    if (updateError) {
      console.error('Failed to mark photos as backed up:', updateError.message);
    } else {
      console.log(`Marked ${backedUpIds.length} photos as backed up.`);
    }
  }

  // 写入汇总 manifest
  const manifest = {
    backed_up_at: new Date().toISOString(),
    total: photos.length,
    succeeded: backedUpIds.length,
    failed: photos.length - backedUpIds.length,
    ids: backedUpIds,
  };
  writeFileSync(`${BACKUP_DIR}/manifest.json`, JSON.stringify(manifest, null, 2));

  console.log(`Backup complete: ${backedUpIds.length}/${photos.length} succeeded.`);
}

main().catch((err) => {
  console.error('Backup failed:', err);
  process.exit(1);
});
