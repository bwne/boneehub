import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});
const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "BoneHub — Roblox Script Archive",
  description: "A Roblox script archive with descriptions, previews, and a community.",
};

const DISCORD_URL = "https://discord.gg/DQe6WkqcHA";
const YOUTUBE_URL = "https://youtube.com/@the_bonehub";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="font-body min-h-screen flex flex-col">
        <header className="sticky top-0 z-40 border-b border-line/70 bg-base/80 backdrop-blur-xl">
          <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="h-2 w-2 rounded-full bg-violet shadow-glow animate-pulse" />
              <span className="font-display text-lg font-bold tracking-tight">
                Bone<span className="text-violet">Hub</span>
              </span>
            </Link>
            <nav className="flex items-center gap-1 text-sm font-medium">
              <Link
                href="/"
                className="px-3 py-1.5 rounded-md text-ink/90 hover:bg-surface transition-colors focus-ring"
              >
                Scripts
              </Link>
              <a
                href={DISCORD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-md text-muted hover:text-ink hover:bg-surface transition-colors focus-ring"
              >
                Discord
              </a>
              <a
                href={YOUTUBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-md text-muted hover:text-ink hover:bg-surface transition-colors focus-ring"
              >
                YouTube
              </a>
              <Link
                href="/admin"
                className="ml-2 px-3 py-1.5 rounded-md border border-line text-muted hover:text-ink hover:border-violet/50 transition-colors focus-ring"
              >
                Admin
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-line/70 py-8 text-sm text-muted">
          <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} BoneHub. Built for the community.</p>
            <div className="flex items-center gap-4">
              <a
                href={DISCORD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-violet transition-colors focus-ring"
              >
                Join Discord
              </a>
              <a
                href={YOUTUBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-violet transition-colors focus-ring"
              >
                YouTube channel
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
