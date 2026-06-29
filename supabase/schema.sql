-- Lover 数据库建表脚本
-- 在 Supabase SQL Editor 中运行

-- 恋爱信息
create table relationship (
  id serial primary key,
  start_date date not null,
  created_at timestamptz default now()
);

-- 插入初始数据（修改为你们的真正纪念日）
insert into relationship (start_date) values ('2024-01-01');

-- 纪念日
create table anniversaries (
  id serial primary key,
  title text not null,
  date date not null,
  type text default 'normal' check (type in ('normal', 'lunar')),
  is_recurring boolean default true,
  created_at timestamptz default now()
);

-- 共享日记
create table diaries (
  id serial primary key,
  content text not null,
  mood text,
  author text not null check (author in ('我', 'TA')),
  created_at timestamptz default now()
);

-- 打卡任务定义
create table missions (
  id serial primary key,
  title text not null,
  description text,
  frequency text default 'daily' check (frequency in ('daily', 'weekly', 'custom')),
  created_by text not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 打卡记录
create table mission_logs (
  id serial primary key,
  mission_id int references missions(id) on delete cascade,
  completed_by text not null check (completed_by in ('我', 'TA')),
  completed_at timestamptz default now()
);

-- 照片记录
create table photos (
  id serial primary key,
  url text not null,
  thumbnail_url text,
  caption text,
  uploaded_by text not null,
  taken_at timestamptz,
  is_backed_up boolean default false,
  created_at timestamptz default now()
);

-- 开启 Realtime（用于共享日记和相册的实时同步）
alter publication supabase_realtime add table diaries;
alter publication supabase_realtime add table photos;

-- 开启 RLS（简单模式下先全放开，后续可按需收紧）
alter table relationship enable row level security;
alter table anniversaries enable row level security;
alter table diaries enable row level security;
alter table missions enable row level security;
alter table mission_logs enable row level security;
alter table photos enable row level security;

-- 公开访问策略（固定密码鉴权，不涉及用户系统）
create policy "允许所有操作" on relationship for all using (true) with check (true);
create policy "允许所有操作" on anniversaries for all using (true) with check (true);
create policy "允许所有操作" on diaries for all using (true) with check (true);
create policy "允许所有操作" on missions for all using (true) with check (true);
create policy "允许所有操作" on mission_logs for all using (true) with check (true);
create policy "允许所有操作" on photos for all using (true) with check (true);
