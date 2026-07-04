import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "dohoon-kim.kr",
  description: "dohoon-kim.kr blog frontend",
};

const navigationItems = [
  { href: "/posts", label: "Post" },
  { href: "/resume", label: "Resume" },
  { href: "https://github.com/dhkim92-dev", label: "Github" },
  {
    href: "https://www.linkedin.com/in/%EB%8F%84%ED%9B%88-%EA%B9%80-1a9a1322b/",
    label: "LinkedIn",
  },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body
        suppressHydrationWarning
        className="min-h-full bg-black font-sans text-white"
      >
        <div className="flex min-h-screen flex-col">
          <header className="border-b border-white/10">
            <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-4 px-6 py-6 md:flex-row md:justify-between">
              <div className="flex w-full flex-col items-center justify-center gap-4 md:w-auto md:flex-row md:justify-start md:gap-6">
                <Link
                  href="/"
                  title="dohoon-kim.kr"
                  className="cursor-pointer text-[25px] font-bold text-white"
                >
                  dohoon-kim.kr
                </Link>
                <nav
                  aria-label="Primary"
                  className="hide-scrollbar flex w-full max-w-xs snap-x snap-mandatory overflow-x-auto md:w-auto md:max-w-none md:snap-none md:gap-5 md:overflow-visible"
                >
                  {navigationItems.map(({ href, label }) => {
                    const isExternal = href.startsWith("http");

                    const className =
                      "w-full shrink-0 snap-center px-4 text-center text-[20px] text-zinc-400 transition-colors hover:text-white md:w-auto md:px-0";

                    return isExternal ? (
                      <a
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className={className}
                      >
                        {label}
                      </a>
                    ) : (
                      <Link key={label} href={href} className={className}>
                        {label}
                      </Link>
                    );
                  })}
                </nav>
              </div>
              <div className="w-full text-center md:w-auto md:text-right">
                <Link
                  href="/login"
                  className="cursor-pointer text-[21px] text-white transition-colors hover:text-zinc-300"
                >
                  Login
                </Link>
              </div>
            </div>
          </header>
          <main className="flex flex-1 flex-col">{children}</main>
          <footer className="border-t border-white/10">
            <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-2 px-6 py-8 text-center text-[19px] text-zinc-400">
              <p>All right reserved to dohoon-kim.kr</p>
              <p>terms of policy</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
