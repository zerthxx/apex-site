import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { ScrollProgressBar } from "@/components/ui/ScrollProgressBar";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <ScrollProgressBar />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:bg-copper focus:text-ink-flip focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-semibold focus:outline-none"
      >
        Siirry pääsisältöön
      </a>
      <Header />
      <main id="main-content" className="flex flex-col flex-1">{children}</main>
      <Footer />
    </ToastProvider>
  );
}
