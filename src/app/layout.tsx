import type { Metadata } from "next";
import "./globals.css";
import { Footer } from "@/components/modules/footer";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

export const metadata: Metadata = {
  title: "Central Connect",
  description: "Central Connect - Gestão de dispositivos",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Central Connect",
  },
  icons: {
    icon: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body
        suppressHydrationWarning
        className="app-shell antialiased flex flex-col h-dvh"
      >
        <ServiceWorkerRegistration />
        <main className="flex flex-col h-full overflow-hidden">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
