-- Each member's choice of light mode, dark mode, or matching their device.
alter table public.profiles
  add column theme text not null default 'system' check (theme in ('system', 'light', 'dark'));
