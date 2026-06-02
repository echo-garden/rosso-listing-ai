import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rosso Listing AI",
  description: "Mobile-first listing assistant for Rosso&Nero"
};

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/products", label: "Products" },
  { href: "/products/new", label: "New" },
  { href: "/settings", label: "Settings" }
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <div className="mx-auto min-h-screen max-w-3xl bg-white pb-24 shadow-sm">
          <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur">
            <Link href="/" className="block text-lg font-bold text-rosso-700">
              Rosso Listing AI
            </Link>
          </header>
          <main className="px-4 py-5">{children}</main>
          <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-zinc-200 bg-white">
            <div className="mx-auto grid max-w-3xl grid-cols-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="min-h-14 px-2 py-3 text-center text-xs font-semibold text-zinc-700"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </body>
    </html>
  );
}
