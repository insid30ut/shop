import type { Metadata } from "next";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@insforge/nextjs";
import { InsforgeProvider } from "./providers";
import { Cart } from "@/components/Cart";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | Mycology Supply Store",
    default: "Mycology Supply Store - Premium Genetics",
  },
  description: "Premium spore prints, swabs, and cultivation supplies.",
  openGraph: {
    title: "Mycology Supply Store - Premium Genetics",
    description: "Premium spore prints, swabs, and cultivation supplies.",
    url: "https://mycelialfunguy.com",
    siteName: "Mycology Supply Store",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col">
        <InsforgeProvider>
          {/* <title> name="description" og: */}
          <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
              <div className="flex gap-6 md:gap-10">
                <Link href="/" className="flex items-center space-x-2">
                  <span className="inline-block font-bold text-xl tracking-tight">
                    MycoStore
                  </span>
                </Link>
                <nav className="hidden gap-6 md:flex">
                  <span className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                    <Cart />
                  </span>
                </nav>
              </div>

              <div className="flex items-center gap-4">
                <SignedOut>
                  <SignInButton className="text-sm font-medium hover:underline" />
                  <SignUpButton className="bg-white text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors" />
                </SignedOut>

                <SignedIn>
                  <Link href="/dashboard" className="text-sm font-medium hover:underline mr-4">Dashboard</Link>
                  <UserButton />
                </SignedIn>
              </div>
            </div>
          </header>
          
          <main className="flex-1 container mx-auto px-4 py-8">
            {children}
          </main>
          
          <footer className="border-t border-white/10 py-6 md:py-0">
            <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4">
              <p className="text-center text-sm leading-loose text-gray-400 md:text-left">
                Built with Next.js, InsForge, and Stripe.
              </p>
            </div>
          </footer>
        </InsforgeProvider>
      </body>
    </html>
  );
}
