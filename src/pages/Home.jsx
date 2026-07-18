import { Hero } from '../sections/hero/Hero';
import { About } from '../sections/about/About';
import { Skills } from '../sections/skills/Skills';
import { Projects } from '../sections/projects/Projects';
import { AIAssistant } from '../sections/ai-assistant/AIAssistant';
import { Work } from '../sections/work/Work';
import { Contact } from '../sections/contact/Contact';

export function Home() {
  return (
    <>
      <Hero />
      <About />
      <Skills />
      <Projects />
      <AIAssistant />
      <Work />
      <Contact />
    </>
  );
}
