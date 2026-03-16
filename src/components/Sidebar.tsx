'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  href: string;
  label: string;
}

const navItems: NavItem[] = [
  { href: '/', label: 'Dashboard' },
  { href: '/test-cases', label: 'Test Cases' },
  { href: '/test-plans', label: 'Test Plans' },
  { href: '/automation', label: 'Automation' },
  { href: '/reports', label: 'Reports' },
  { href: '/settings', label: 'Settings' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-56 flex-col border-r border-gray-200 bg-white px-3 py-6">
      <p className="mb-6 px-3 text-sm font-semibold uppercase tracking-widest text-gray-400">
        QA Automation
      </p>
      <nav className="flex flex-col gap-1">
        {navItems.map(({ href, label }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
