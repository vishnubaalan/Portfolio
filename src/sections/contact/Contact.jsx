import { forwardRef, useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as Label from '@radix-ui/react-label';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import emailjs from '@emailjs/browser';
import { Send, Check, AlertCircle, Loader2, Github, Linkedin, Mail } from 'lucide-react';
import { SectionHeader } from '../../components/common/SectionHeader';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { setStatus, setError, reset } from '../../store/slices/contactSlice';
import { EMAILJS } from '../../constants';
import { SOCIAL_LINKS } from '../../data/links';
import { cn } from '../../utils/cn';

const schema = z.object({
  name: z.string().min(2, 'At least 2 characters').max(80),
  email: z.string().email('Enter a valid email'),
  message: z.string().min(10, 'A little more, please').max(2000),
  website: z.string().max(0).optional(), // honeypot
});

const ICON_MAP = { Github, Linkedin, Mail };

export function Contact() {
  const dispatch = useAppDispatch();
  const status = useAppSelector((s) => s.contact.status);
  const err = useAppSelector((s) => s.contact.error);
  const [showFallback, setShowFallback] = useState(false);

  const {
    register,
    handleSubmit,
    reset: resetForm,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    if (values.website) return; // honeypot
    if (!EMAILJS.serviceId) {
      setShowFallback(true);
      dispatch(setError('EmailJS not configured — please email me directly.'));
      return;
    }
    dispatch(setStatus('sending'));
    try {
      await emailjs.send(
        EMAILJS.serviceId,
        EMAILJS.templateId,
        {
          name: values.name,
          email: values.email,
          message: values.message,
          time: new Date().toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
          }),
        },
        { publicKey: EMAILJS.publicKey },
      );
      dispatch(setStatus('success'));
      resetForm();
      setTimeout(() => dispatch(reset()), 4000);
    } catch (e) {
      dispatch(setError(e?.text || 'Something went wrong'));
    }
  };

  const busy = status === 'sending';

  return (
    <section id="contact" className="relative py-24 sm:py-32">
      <div className="section-container grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <SectionHeader
            eyebrow="Get In Touch"
            title="Let's build something"
            description="Open to opportunities, interesting projects, and thoughtful conversations."
            className="mb-8"
          />
          <div className="space-y-2">
            {SOCIAL_LINKS.map((link) => {
              const Icon = ICON_MAP[link.icon] || Mail;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-muted transition-colors hover:border-primary hover:text-text"
                >
                  <Icon className="h-4 w-4 text-primary" />
                  <span>{link.label}</span>
                </a>
              );
            })}
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-card"
          noValidate
        >
          <Input label="Name" error={errors.name} {...register('name')} placeholder="Your name" />
          <Input
            label="Email"
            type="email"
            error={errors.email}
            {...register('email')}
            placeholder="you@example.com"
          />
          <Textarea
            label="Message"
            error={errors.message}
            {...register('message')}
            placeholder="Tell me a bit about your idea, role, or question."
            rows={5}
          />
          <input type="text" tabIndex={-1} autoComplete="off" className="hidden" {...register('website')} />

          <div className="flex items-center justify-between gap-3">
            <AnimatePresence>
              {status === 'error' && (
                <motion.p
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5 text-xs text-danger"
                >
                  <AlertCircle className="h-3 w-3" /> {err}
                </motion.p>
              )}
              {status === 'success' && (
                <motion.p
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5 text-xs text-success"
                >
                  <Check className="h-3 w-3" /> Message sent. I'll reply soon.
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={busy}
              whileHover={{ scale: busy ? 1 : 1.02 }}
              whileTap={{ scale: busy ? 1 : 0.98 }}
              className={cn(
                'ml-auto inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-text-inverse shadow-glow-primary transition-colors',
                busy && 'opacity-70',
              )}
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {busy ? 'Sending...' : 'Send Message'}
            </motion.button>
          </div>

          {showFallback && (
            <p className="text-xs text-text-subtle">
              Or email me directly at{' '}
              <a href="mailto:vishnubaalan@example.com" className="text-primary underline">
                vishnubaalan@example.com
              </a>
            </p>
          )}
        </form>
      </div>
    </section>
  );
}

const inputBase =
  'w-full rounded-xl border border-border bg-bg/40 px-3 py-2.5 text-sm text-text placeholder:text-text-subtle transition-colors focus:border-primary focus:outline-none';

const Input = forwardRef(function Input({ label, error, ...rest }, ref) {
  const id = useId();
  return (
    <div className="space-y-1">
      <Label.Root htmlFor={id} className="text-xs font-medium text-text-muted">
        {label}
      </Label.Root>
      <input id={id} ref={ref} className={cn(inputBase, error && 'border-danger')} {...rest} />
      {error && <span className="text-[11px] text-danger">{error.message}</span>}
    </div>
  );
});

const Textarea = forwardRef(function Textarea({ label, error, ...rest }, ref) {
  const id = useId();
  return (
    <div className="space-y-1">
      <Label.Root htmlFor={id} className="text-xs font-medium text-text-muted">
        {label}
      </Label.Root>
      <textarea
        id={id}
        ref={ref}
        className={cn(inputBase, 'resize-none', error && 'border-danger')}
        {...rest}
      />
      {error && <span className="text-[11px] text-danger">{error.message}</span>}
    </div>
  );
});
