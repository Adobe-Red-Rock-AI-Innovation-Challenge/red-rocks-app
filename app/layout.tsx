import type { Metadata } from "next";
import { Barlow_Condensed, Poppins } from "next/font/google";
import Link from "next/link";
import { DemoProvider } from "@/components/demo-provider";
import { SiteHeader } from "@/components/site-header";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Red Rocks Fan Hub",
  description: "A demo of how AI grows fan engagement and sponsorship revenue for Red Rocks.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${barlowCondensed.variable} h-full antialiased`}
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
            Student competition prototype. Athletes, sponsors and figures are fictional. Not
            affiliated with or endorsed by the University of Utah.
          </footer>
          <Toaster theme="light" position="top-center" />
        </DemoProvider>
      </body>
    </html>
  );
}
