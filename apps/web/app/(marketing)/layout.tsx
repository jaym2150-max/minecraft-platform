import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div id="main-content" className="flex-1">
        {children}
      </div>
      <Footer />
    </div>
  );
}
