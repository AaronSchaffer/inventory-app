'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function ChevronDown() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
  );
}

function HomeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
  );
}

interface DropdownProps {
  label: string;
  items: { href: string; label: string }[];
}

function Dropdown({ label, items }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const isActive = items.some(item => pathname === item.href);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 px-3 py-2 rounded hover:bg-blue-700 ${isActive ? 'bg-blue-700' : ''}`}
      >
        {label} <ChevronDown />
      </button>
      {open && (
        <div className="absolute left-0 top-full bg-white text-gray-800 shadow-lg rounded-b min-w-[12rem] z-50">
          {items.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${pathname === item.href ? 'bg-gray-100 font-medium' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-blue-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-14">
          <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-blue-700 mr-4">
            <HomeIcon /> Feedlot Setup
          </Link>

          <Dropdown
            label="Home/Lots"
            items={[
              { href: '/groups', label: 'New Group' },
              { href: '/groups/key-details', label: 'Edit Key Group Details' },
              { href: '/groups/all-details', label: 'Edit All Group Details' },
            ]}
          />

          <Dropdown
            label="Brockoff"
            items={[
              { href: '/brockoff', label: 'Add-Edit Group' },
            ]}
          />

          <Link
            href="/pens"
            className={`px-3 py-2 rounded hover:bg-blue-700 ${pathname === '/pens' ? 'bg-blue-700' : ''}`}
          >
            Edit Pens
          </Link>
          <Link
            href="/cattle-by-pen"
            className={`px-3 py-2 rounded hover:bg-blue-700 ${pathname === '/cattle-by-pen' ? 'bg-blue-700' : ''}`}
          >
            Edit Cattle by Pen
          </Link>
          <Link
            href="/hedging"
            className={`px-3 py-2 rounded hover:bg-blue-700 ${pathname === '/hedging' ? 'bg-blue-700' : ''}`}
          >
            Hedging
          </Link>
          <Link
            href="/performance"
            className={`px-3 py-2 rounded hover:bg-blue-700 ${pathname === '/performance' ? 'bg-blue-700' : ''}`}
          >
            Performance Charts
          </Link>
        </div>
      </div>
    </nav>
  );
}
