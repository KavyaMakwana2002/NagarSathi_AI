import "./globals.css";
import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import SettingsModal from "@/components/SettingsModal";
import { SettingsProvider } from "@/context/SettingsContext";

export const metadata = {
  title: "NagarSathi AI | Smart City Civic Problem Solver",
  description: "AI-Powered Civic Complaint & Ticketing Platform with Gujarati Support and Duplicate Detection",
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="gu" className="dark" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col antialiased selection:bg-cyan-500 selection:text-black transition-colors duration-200" suppressHydrationWarning>
        <SettingsProvider>
          {/* Top Navbar */}
          <Suspense fallback={null}>
            <Navbar />
          </Suspense>

          {/* Main Content Area */}
          <main className="flex-1 pb-20 md:pb-8">
            {children}
          </main>

          {/* Global Interactive Settings Modal */}
          <SettingsModal />

          {/* Mobile-Only Bottom Navigation */}
          <Suspense fallback={null}>
            <BottomNav />
          </Suspense>
        </SettingsProvider>
      </body>
    </html>
  );
}
