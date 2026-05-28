import { Providers } from '../providers';
import './globals.css';

export const metadata = {
  title: 'LiteForge DCA - Automatize suas Compras',
  description: 'Dollar-Cost Averaging Descentralizado na LitVM LiteForge Testnet',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-50 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
