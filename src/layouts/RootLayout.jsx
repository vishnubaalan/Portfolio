import { useThemeSync } from '../hooks/useThemeSync';
import { useLenis } from '../hooks/useLenis';
import { useActiveSection } from '../hooks/useActiveSection';
import { ScrollProgress } from '../components/common/ScrollProgress';
import { NavBar } from '../components/common/NavBar';
import { Footer } from '../components/common/Footer';
import { BackToTop } from '../components/common/BackToTop';
import { CommandPalette } from '../components/palette/CommandPalette';
import { ResumePreviewModal } from '../components/common/ResumePreviewModal';

export function RootLayout({ children }) {
  useThemeSync();
  useLenis();
  useActiveSection();

  return (
    <div className="relative min-h-screen bg-bg text-text">
      <ScrollProgress />
      <NavBar />
      <CommandPalette />
      <ResumePreviewModal />
      <main>{children}</main>
      <Footer />
      <BackToTop />
    </div>
  );
}
