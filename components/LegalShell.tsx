import Link from "next/link";
import { Camera } from "lucide-react";

/** Shared chrome for the legal / support pages (privacy, terms, support). */
export function LegalShell({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-spotter-ink text-white">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-spotter-ink/70 border-b border-spotter-line">
        <div className="max-w-3xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-spotter-orange to-spotter-red grid place-items-center">
              <Camera className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-lg tracking-tight">CarSpotter</span>
          </Link>
          <nav className="flex items-center gap-5 text-sm text-zinc-300">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/support" className="hover:text-white transition-colors">Support</Link>
          </nav>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-5 py-14">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-zinc-400">Last updated: {updated}</p>
        <div className="legal-body mt-8 space-y-6 text-zinc-300 leading-relaxed">
          {children}
        </div>
        <footer className="mt-16 pt-8 border-t border-spotter-line text-sm text-zinc-500">
          <p>© 2026 CarSpotter. Questions? <a href="mailto:paul@nemapp.com" className="text-spotter-cyan hover:underline">paul@nemapp.com</a></p>
        </footer>
      </article>
    </main>
  );
}

/** A titled section block used inside legal pages. */
export function Section({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold text-white">{heading}</h2>
      {children}
    </section>
  );
}
