import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Clearpane - Minimal Task Manager",
    template: "%s | Clearpane",
  },
  description:
    "A calm, minimal task manager for deliberate productivity and task tracking.",
  openGraph: {
    title: "Clearpane - Minimal Task Manager",
    description:
      "A calm, minimal task manager for deliberate productivity and task tracking.",
    type: "website",
    siteName: "Clearpane",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased dark`}>
      <body className="min-h-full font-sans bg-[#060709] text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
        <div className="bg-glows" aria-hidden="true" />
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
