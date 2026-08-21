import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-800/80 bg-[#050810] py-16 text-slate-400">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="inline-block">
              <img
                src="/gofully-wordmark-dark.png"
                alt="GoFully"
                className="h-8 w-auto object-contain"
              />
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
              The high-performance in-browser screenshot studio with local WebAssembly OCR, full-page scrolling capture, CleanShot visual annotations, and PDF exports.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-400">
              <span className="inline-block h-2 w-2 bg-emerald-500 animate-pulse" />
              100% On-Device Sandbox • Zero Cloud Telemetry
            </div>
          </div>

          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              Product & Security
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs font-mono uppercase">
              <li>
                <Link href="/#features" className="transition-colors hover:text-white">
                  Full Page Capture
                </Link>
              </li>
              <li>
                <Link href="/#features" className="transition-colors hover:text-white">
                  Local WebAssembly OCR
                </Link>
              </li>
              <li>
                <Link href="/#features" className="transition-colors hover:text-white">
                  CleanShot Annotations
                </Link>
              </li>
              <li>
                <Link href="/security" className="transition-colors hover:text-white">
                  Security Architecture
                </Link>
              </li>
              <li>
                <Link href="/faq" className="transition-colors hover:text-white">
                  Frequently Asked Questions
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              Support & Legal
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs font-mono uppercase">
              <li>
                <Link href="/support" className="transition-colors hover:text-white">
                  Help & Contact Desk
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="transition-colors hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="transition-colors hover:text-white">
                  Terms of Service
                </Link>
              </li>
              <li>
                <a
                  href="https://chromewebstore.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky-400 hover:text-sky-300"
                >
                  Chrome Web Store ↗
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between border-t border-slate-800/80 pt-8 text-xs font-mono uppercase text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} GoFully Inc. All rights reserved.</p>
          <p className="mt-4 sm:mt-0">Built for builders. Run by humans.</p>
        </div>
      </div>
    </footer>
  );
}
