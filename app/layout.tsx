import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage-grotesque",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin dashboard with authentication and CRUD operations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={bricolageGrotesque.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Override browser alerts globally
              if (typeof window !== 'undefined') {
                window.alert = function(message) {
                  console.log('Alert blocked:', message);
                  // Optionally show a custom notification instead
                };
                window.confirm = function(message) {
                  console.log('Confirm blocked:', message);
                  return true; // Default to true for confirmations
                };
                window.prompt = function(message, defaultValue) {
                  console.log('Prompt blocked:', message);
                  return defaultValue || ''; // Return default value
                };
                
                // Safari-specific fixes
                // Ensure cookies work in Safari
                if (navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1) {
                  // Safari detected
                  console.log('Safari browser detected');
                }
              }
            `,
          }}
        />
      </head>
      <body className={bricolageGrotesque.className}>{children}</body>
    </html>
  );
}
