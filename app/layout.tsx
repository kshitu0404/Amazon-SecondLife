import type { Metadata } from "next";
import { Outfit, Geist_Mono, Caveat } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import SubNavbar from "@/components/SubNavbar";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Amazon SecondLife | AI-Powered Circular Commerce Hub",
  description: "Give returned, unused, and outgrown products a second life. Amazon's circular marketplace features AI condition verification, smart routing diagnostics, and digital product passports.",
  keywords: ["Amazon SecondLife", "Circular Commerce", "Pre-owned", "Sustainability", "Eco-friendly", "AI Condition Verification", "Product Health Passport"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${geistMono.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#eaeded] text-slate-900 font-sans">
        <Navbar />
        <SubNavbar />
        <Sidebar />
        <main className="flex-grow flex flex-col w-full">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

