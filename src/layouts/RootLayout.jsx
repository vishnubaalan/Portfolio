import { useThemeSync } from '../hooks/useThemeSync';
import { useLenis } from '../hooks/useLenis';
import { useActiveSection } from '../hooks/useActiveSection';
import { useSessionReplay } from '../hooks/useSessionReplay';
import { ScrollProgress } from '../components/common/ScrollProgress';
import { NavBar } from '../components/common/NavBar';
import { Footer } from '../components/common/Footer';
import { BackToTop } from '../components/common/BackToTop';
import { CommandPalette } from '../components/palette/CommandPalette';
import { ResumePreviewModal } from '../components/common/ResumePreviewModal';
import { AIChatPanel } from '../components/ai/AIChatPanel';
import { AIChatLauncher } from '../components/ai/AIChatLauncher';
import { ConsentBanner } from '../components/common/ConsentBanner';

export function RootLayout({ children }) {
  useThemeSync();
  useLenis();
  useActiveSection();
  useSessionReplay();

  return (
    <div className="relative min-h-screen bg-bg text-text">
      <ScrollProgress />
      <NavBar />
      <CommandPalette />
      <ResumePreviewModal />
      <main>{children}</main>
      <Footer />
      <AIChatPanel />
      <AIChatLauncher />
      <BackToTop />
      <ConsentBanner />
    </div>
  );
}
