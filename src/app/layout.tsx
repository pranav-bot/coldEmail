import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";

import {
  ClerkProvider,
} from '@clerk/nextjs'
import { ThemeProvider } from "@/components/them.provider";
import KBar from "@/components/kbar";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "PitchSnag",
  description: "Find Your Next Opportunity – with One Smart Email",
  icons: [{ rel: "icon", url: "/email-envelope-outline-shape-with-rounded-corners_icon-icons.com_56530(1).ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${geist.variable}`} suppressHydrationWarning>
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <TRPCReactProvider>
              
                {children}
                <Toaster />
              
            </TRPCReactProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
