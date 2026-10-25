"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "./Logo";

export type NavItem = { href: string; label: string; soon?: boolean };

export function Nav({ items, userName }: { items: NavItem[]; userName: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <aside className="fixed-colors bg-slate-900 text-slate-100 md:min-h-screen md:w-60 md:shrink-0">
      <div className="flex items-center justify-between px-4 py-3 md:py-5">
        <Link href="/" className="flex items-center gap-2.5 text-lg font-semibold">
          <Logo className="h-6" />
          MRBC Safety Team
        </Link>
        <button
          className="rounded-md border border-slate-700 px-3 py-1 text-sm md:hidden"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
        >
          Menu
        </button>
      </div>
      <nav className={`${open ? "block" : "hidden"} pb-4 md:block`}>
        <ul>
          {items.map((item) => (
            <li key={item.href}>
              {item.soon ? (
                <span className="block px-4 py-2 text-sm text-slate-500">
                  {item.label} <span className="text-xs">(coming soon)</span>
                </span>
              ) : (
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`block px-4 py-2 text-sm ${
                    isActive(item.href) ? "bg-slate-700 font-medium" : "hover:bg-slate-800"
                  }`}
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-4 border-t border-slate-700 px-4 pt-4 text-sm">
          <p className="mb-2 text-slate-400">Signed in as {userName}</p>
          <form action="/auth/signout" method="post">
            <button className="text-slate-300 underline hover:text-white">Sign out</button>
          </form>
        </div>
      </nav>
    </aside>
  );
}
