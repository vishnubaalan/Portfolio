import * as Dialog from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { AnimatePresence, motion } from 'framer-motion';
import { Download, X, ExternalLink } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { setResumePreviewOpen } from '../../store/slices/uiSlice';
import { RESUME_URL } from '../../constants';

const RESUME_FILENAME = 'Vishnu-Baalan-Resume.pdf';

export function ResumePreviewModal() {
  const open = useAppSelector((s) => s.ui.resumePreviewOpen);
  const dispatch = useAppDispatch();
  const close = () => dispatch(setResumePreviewOpen(false));

  return (
    <Dialog.Root open={open} onOpenChange={(v) => dispatch(setResumePreviewOpen(v))}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 bg-bg/80 backdrop-blur-sm"
              />
            </Dialog.Overlay>

            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
                className="fixed inset-0 z-50 flex flex-col bg-surface"
              >
                <VisuallyHidden>
                  <Dialog.Title>Resume Preview</Dialog.Title>
                  <Dialog.Description>
                    Preview of Vishnu Baalan's resume with options to download or open in a new tab.
                  </Dialog.Description>
                </VisuallyHidden>

                <div className="flex items-center justify-between gap-3 border-b border-border bg-surface/95 px-4 py-3 backdrop-blur-sm sm:px-6">
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-text-subtle">
                      Preview
                    </p>
                    <p className="truncate text-sm font-medium text-text">
                      Vishnu Baalan — Resume
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={RESUME_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hidden items-center gap-1.5 rounded-lg border border-border bg-bg/40 px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:border-primary hover:text-text sm:inline-flex"
                      title="Open in new tab"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Open
                    </a>
                    <a
                      href={RESUME_URL}
                      download={RESUME_FILENAME}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-text-inverse shadow-glow-primary transition-colors hover:bg-primary-hover"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </a>
                    <button
                      type="button"
                      onClick={close}
                      aria-label="Close preview"
                      className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-bg/40 text-text-muted transition-colors hover:border-primary hover:text-text"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="relative flex-1 overflow-auto bg-bg/60">
                  <div className="mx-auto flex h-full w-full max-w-[900px] px-2 py-4 sm:px-6 sm:py-6">
                    <iframe
                      src={`${RESUME_URL}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
                      title="Vishnu Baalan Resume Preview"
                      className="h-full w-full rounded-lg border border-border bg-white shadow-2xl"
                    />
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
