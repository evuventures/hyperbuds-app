import { ReactNode } from "react";
import "./globals.css";
import { ThemeProvider } from "../providers/ThemeProvider";
import { SidebarProvider } from "../context/SidebarContext";
import { QueryProvider } from "../providers/QueryProvider";
import { Toaster } from "react-hot-toast";
import { SocketProvider } from "../providers/SocketProvider";
import { ReduxProvider } from "../providers/ReduxProvider";
import { AuthBootstrap } from "../providers/AuthBootstrap";
import { BookingArchiveProvider } from "../context/BookingArchiveContext";

export const metadata = {
  title: "Hyperbuds – Collaborative AI Platform for Seamless Teamwork",
  description:
    "Hyperbuds brings collaborators together with AI, providing the tools and connections needed to enhance productivity and foster creativity in every project.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const savedTheme = localStorage.getItem('hyperbuds-theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const shouldBeDark = savedTheme ? savedTheme === 'dark' : prefersDark;
                
                if (shouldBeDark) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {
                // Fallback to system preference if localStorage is not available
                if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                  document.documentElement.classList.add('dark');
                }
              }
            `,
          }}
        />
      </head>
      <body className="antialiased bg-white dark:bg-gray-900 font-sans">
        <ReduxProvider>
          <QueryProvider>
            <ThemeProvider>
              <SidebarProvider>
                <AuthBootstrap>
                  <SocketProvider>
                    <BookingArchiveProvider>
                      {children}
                    </BookingArchiveProvider>
                  </SocketProvider>
                </AuthBootstrap>
                <Toaster position="top-right" />
              </SidebarProvider>
            </ThemeProvider>
          </QueryProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
