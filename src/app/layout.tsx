import type { Metadata } from "next";
import "./globals.css";
import { ClientLayoutWrapper } from "@/components/ClientLayoutWrapper";
import { NextAuthProvider } from "@/components/NextAuthProvider";

export const metadata: Metadata = {
  title: "Aria Motors Herat | Cloud Fleet & Dealership Console",
  description:
    "Enterprise automotive dealership and customs ERP platform in Herat, Afghanistan. Real-time fleet inventory, Islam Qala customs clearance, and Sarrafi treasury management.",
  keywords: [
    "Car Showroom Herat",
    "Aria Motors",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Public+Sans:wght@400;500;600;700&family=Vazirmatn:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased font-sans">
        <NextAuthProvider>
          <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
        </NextAuthProvider>
      </body>
    </html>
  );
}
