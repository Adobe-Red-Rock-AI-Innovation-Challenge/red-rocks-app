import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import Link from "next/link";
import { DemoProvider } from "@/components/demo-provider";
import { SiteHeader } from "@/components/site-header";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// The brand uses Manrope in two weights: ExtraBold for section titles, SemiBold for everything else.
const manrope = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["600", "800"],
});

export const metadata: Metadata = {
  title: "Red Rocks Fan Hub",
  description: "A demo of how AI grows fan engagement and sponsorship revenue for Red Rocks.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <DemoProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <footer className="border-t px-4 py-4 text-center text-xs text-muted-foreground">
            <nav aria-label="Footer" className="mb-2 flex justify-center gap-4">
              <Link href="/how-it-works">How it works</Link>
              <Link href="/feasibility">Business plan</Link>
              <Link href="/privacy">Privacy</Link>
            </nav>
            Student competition prototype. Athlete names, photos and career highs come from the
            official Utah roster; deals, prices, quests, sponsors and messages are examples. Not
            affiliated with or endorsed by the University of Utah.
          </footer>
          <Toaster theme="light" position="top-center" />
        </DemoProvider>
      </body>
    </html>
  );
}
