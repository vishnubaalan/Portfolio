import { Hero } from '../sections/hero/Hero';
import { About } from '../sections/about/About';
import { Skills } from '../sections/skills/Skills';
import { Projects } from '../sections/projects/Projects';
import { AIAssistant } from '../sections/ai-assistant/AIAssistant';
import { Work } from '../sections/work/Work';
import { Experience } from '../sections/experience/Experience';
import { GitHub } from '../sections/github/GitHub';
import { Learning } from '../sections/learning/Learning';
import { Philosophy } from '../sections/philosophy/Philosophy';
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
      <Experience />
      <GitHub />
      <Learning />
      <Philosophy />
      <Contact />
    </>
  );
}
