import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegistration from "@/components/service-worker-registration";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VenCode",
  description: "VenCode - AI Chat Assistant",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "VenCode",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-512.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#1E1E1E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="dark" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <script dangerouslySetInnerHTML={{ __html: `
          // Hide Next.js dev overlays
          const observer = new MutationObserver((mutations) => {
            for (const m of mutations) {
              for (const node of m.addedNodes) {
                if (node.nodeType === 1) {
                  const el = node;
                  if (
                    el.id && (el.id.startsWith('__next') || el.id.includes('nextjs') || el.id.includes('toast') || el.id.includes('overlay')) ||
                    el.dataset?.nextjsDialogOverlay !== undefined ||
                    el.dataset?.nextjsCodeframe !== undefined ||
                    (el.style && el.style.zIndex === '9999' && el.style.position === 'fixed' && el.tagName === 'DIV' && el.parentElement?.tagName === 'BODY')
                  ) {
                    el.remove();
                  }
                }
              }
            }
          });
          observer.observe(document.documentElement, { childList: true, subtree: true });
          // Remove existing on load
          window.addEventListener('load', () => {
            document.querySelectorAll('[id*="nextjs"], [data-nextjs-dialog-overlay], [data-nextjs-codeframe], [data-nextjs-toast]').forEach(el => el.remove());
          });
        ` }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ background: '#121212', color: '#E6E1E5' }}
      >
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
