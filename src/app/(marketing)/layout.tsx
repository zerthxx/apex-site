import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ToastProvider } from "@/components/providers/ToastProvider";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <Header />
      <main className="flex flex-col flex-1">{children}</main>
      <Footer />
    </ToastProvider>
  );
}
