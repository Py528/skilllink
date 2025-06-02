import { ThemeProvider as NextThemeProvider } from "next-themes";
import { Providers } from "../providers/Providers";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="relative">
        <NextThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            {children}
          </Providers>
        </NextThemeProvider>
      </body>
    </html>
  );
}
