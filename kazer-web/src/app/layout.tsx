import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import '@/styles/globals.css';
import { ThemeProvider } from '@/components/theme/theme-provider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://kazer.app'),
  title: {
    default: 'KAZER — Pergunte. O KAZER executa.',
    template: '%s · KAZER',
  },
  description:
    'KAZER é uma plataforma de inteligência artificial de pesquisa, execução e criação. Pesquise com fontes verificáveis, execute missões e receba artefatos prontos.',
  keywords: [
    'IA',
    'answer engine',
    'pesquisa com fontes',
    'agentes de IA',
    'KAZER',
    'automação com IA',
  ],
  authors: [{ name: 'KAZER' }],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://kazer.app',
    siteName: 'KAZER',
    title: 'KAZER — Pergunte. O KAZER executa.',
    description:
      'Inteligência artificial de pesquisa, execução e criação. Respostas com fontes verificáveis e artefatos prontos.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KAZER — Pergunte. O KAZER executa.',
    description:
      'Inteligência artificial de pesquisa, execução e criação. Respostas com fontes verificáveis e artefatos prontos.',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#0a0a10',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{
          fontFamily:
            'var(--font-geist-sans), Geist, "Inter", ui-sans-serif, system-ui, sans-serif',
        }}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
