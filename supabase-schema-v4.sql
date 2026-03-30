-- Add profile fields
alter table profiles add column if not exists full_name varchar;
alter table profiles add column if not exists bio varchar(120);
alter table profiles add column if not exists company varchar;
