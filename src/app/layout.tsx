import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
/* Display serif — a assinatura tipográfica do AgnoHub (h1/h2). Self-hosted
   via @fontsource (como o geist): sem fetch ao Google Fonts — offline-safe.
   O family "Fraunces Variable" é mapeado em --font-fraunces no globals.css. */
import "@fontsource-variable/fraunces";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryProvider } from "@/lib/api/query-provider";

export const metadata: Metadata = {
  title: "AgnoHub — Plataforma de Agentes de IA",
  description:
    "Construa, publique e opere agentes de IA conversacionais com memória persistente. Omnichannel, pronto para produção, sem lock-in.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <QueryProvider>
            {/* skipDelayDuration: depois do 1º tooltip, os seguintes abrem sem
                delay — a sidebar colapsada depende de tooltip a cada hover (Emil §4). */}
            <TooltipProvider delayDuration={200} skipDelayDuration={300}>{children}</TooltipProvider>
          </QueryProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
