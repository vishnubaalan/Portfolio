import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Star,
  GitFork,
  ExternalLink,
  Github as GithubIcon,
  AlertCircle,
  ArrowRight,
  Globe,
} from 'lucide-react';
import { SectionHeader } from '../../components/common/SectionHeader';
import { GITHUB_USERNAME, FEATURED_REPOS } from '../../constants';
import { fetchGithubProfile } from '../../utils/github';

export function GitHub() {
  const [status, setStatus] = useState('loading');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchGithubProfile(GITHUB_USERNAME, FEATURED_REPOS)
      .then((d) => {
        if (cancelled) return;
        setData(d);
        setStatus(d.pinned.length === 0 ? 'empty' : 'success');
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e.message);
        setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="github" className="relative py-24 sm:py-32">
      <div className="section-container">
        <SectionHeader
          eyebrow="On GitHub"
          title="Featured Repositories"
          description={`A curated slice of what I've built and pushed to @${GITHUB_USERNAME}. Live pull from the GitHub API, cached for an hour.`}
        />

        {status === 'loading' && <SkeletonGrid />}
        {status === 'error' && <ErrorState message={error} />}
        {status === 'empty' && <EmptyState />}
        {status === 'success' && data && <SuccessGrid data={data} />}
      </div>
    </section>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-40 animate-pulse rounded-2xl border border-border bg-surface"
        />
      ))}
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-danger/30 bg-danger/5 p-8 text-center">
      <AlertCircle className="h-6 w-6 text-danger" />
      <p className="text-sm text-text-muted">Couldn't reach GitHub — {message}</p>
      <a
        href={`https://github.com/${GITHUB_USERNAME}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-primary hover:underline"
      >
        Open GitHub profile
      </a>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-8 text-center">
      <GithubIcon className="h-6 w-6 text-text-muted" />
      <p className="text-sm text-text-muted">No public repos yet.</p>
      <a
        href={`https://github.com/${GITHUB_USERNAME}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-primary hover:underline"
      >
        Visit my GitHub
      </a>
    </div>
  );
}

function SuccessGrid({ data }) {
  const totalShown = data.pinned.length;
  const hasMore = data.totalPublic > totalShown;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Public Repos" value={data.profile.public_repos} />
        <Stat label="Followers" value={data.profile.followers} />
        <Stat label="Following" value={data.profile.following} />
        <Stat label="Languages" value={data.languages.length} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.pinned.map((repo, i) => (
          <motion.a
            key={repo.name}
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4, delay: 0.04 * i }}
            className="group flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-card transition-colors hover:border-primary/40"
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <GithubIcon className="h-3.5 w-3.5 text-text-subtle" />
                <h3 className="text-sm font-semibold text-text">{repo.name}</h3>
              </div>
              <ExternalLink className="h-3.5 w-3.5 shrink-0 text-text-subtle transition-colors group-hover:text-primary" />
            </div>

            <p className="mb-3 line-clamp-2 min-h-[2.5em] text-xs text-text-muted">
              {repo.description || 'No description provided.'}
            </p>

            {repo.topics && repo.topics.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1">
                {repo.topics.slice(0, 3).map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-border bg-bg/40 px-2 py-0.5 text-[10px] text-text-subtle"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-auto flex items-center justify-between text-xs text-text-subtle">
              <div className="flex items-center gap-3">
                {repo.language && (
                  <span className="flex items-center gap-1">
                    <span
                      aria-hidden="true"
                      className="inline-block h-2 w-2 rounded-full bg-primary"
                    />
                    {repo.language}
                  </span>
                )}
                {repo.stargazers_count > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {repo.stargazers_count}
                  </span>
                )}
                {repo.forks_count > 0 && (
                  <span className="flex items-center gap-1">
                    <GitFork className="h-3 w-3" />
                    {repo.forks_count}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-text-subtle">{relativeTime(repo.pushed_at)}</span>
            </div>

            {repo.homepage && (
              <div className="mt-3 flex items-center gap-1 border-t border-border pt-3 text-[11px] text-primary">
                <Globe className="h-3 w-3" /> Live
              </div>
            )}
          </motion.a>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <a
            href={`https://github.com/${GITHUB_USERNAME}?tab=repositories`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/50 px-4 py-2 text-sm text-text-muted transition-colors hover:border-primary hover:text-text"
          >
            View all {data.totalPublic} repositories on GitHub
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      )}

      {data.languages.length > 0 && (
        <div className="rounded-2xl border border-border bg-surface p-5">
          <h3 className="mb-3 font-mono text-xs uppercase tracking-wider text-text-muted">
            Top Languages
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {data.languages.map(([lang, count]) => (
              <span
                key={lang}
                className="rounded-full border border-border bg-bg/40 px-2.5 py-1 text-xs text-text-muted"
              >
                {lang} <span className="text-text-subtle">· {count}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 text-center">
      <div className="text-2xl font-semibold text-text">{value}</div>
      <div className="text-xs text-text-muted">{label}</div>
    </div>
  );
}

function relativeTime(iso) {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const day = 24 * 60 * 60 * 1000;
  if (diff < day) return 'today';
  if (diff < 7 * day) return `${Math.floor(diff / day)}d ago`;
  if (diff < 30 * day) return `${Math.floor(diff / (7 * day))}w ago`;
  if (diff < 365 * day) return `${Math.floor(diff / (30 * day))}mo ago`;
  return `${Math.floor(diff / (365 * day))}y ago`;
}
