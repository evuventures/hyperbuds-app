import { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../providers/AuthProvider";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Hyperbuds – Collaborative AI Platform for Seamless Teamwork",
  description:
    "Hyperbuds brings collaborators together with AI, providing the tools and connections needed to enhance productivity and foster creativity in every project.",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <AuthProvider>
          {children}
        <Toaster richColors position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
