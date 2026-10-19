import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Public_Sans, JetBrains_Mono, Vazirmatn } from "next/font/google";
import "./globals.css";
import { ClientLayoutWrapper } from "@/components/ClientLayoutWrapper";
import { NextAuthProvider } from "@/components/NextAuthProvider";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700", "800"],
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600", "700"],
});

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazirmatn",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Sadozai Motors Platform | Cloud Fleet & Dealership Console",
  description:
    "Enterprise automotive dealership and customs ERP platform in Herat, Afghanistan. Real-time fleet inventory, Islam Qala customs clearance, and Sarrafi treasury management.",
  keywords: [
    "Car Showroom Herat",
    "Sadozai Motors",
    "Land Cruiser Herat",
    "Lexus Afghanistan",
    "Islam Qala Customs Car Import",
    "Afghanistan Car Sales",
    "Toyota Herat",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${publicSans.variable} ${jetbrainsMono.variable} ${vazirmatn.variable}`}
    >
      <body className="antialiased font-sans">
        <NextAuthProvider>
          <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
        </NextAuthProvider>
      </body>
    </html>
  );
}
