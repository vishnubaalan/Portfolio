const CACHE_KEY = 'gh-cache-v3';
const TTL_MS = 60 * 60 * 1000;
const MAX_REPOS = 9;

/**
 * Case-insensitive match: returns the index of the first featured keyword
 * that appears as a substring of the repo name, or -1 if none match.
 * Used both to filter and to preserve the display order of `featured`.
 */
function featuredMatchIndex(name, featured) {
  const lower = name.toLowerCase();
  return featured.findIndex((kw) => lower.includes(kw.toLowerCase()));
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } });
  if (!res.ok) throw new Error(`GitHub ${res.status}`);
  return res.json();
}

/**
 * Fetches basic profile + featured repos + language rollup for a user.
 * Cached for 1 hour in sessionStorage to preserve rate limit.
 * @param {string} username
 * @param {string[]} [featured]  Ordered keyword whitelist. If provided, only repos
 *   whose name contains one of these substrings are surfaced, sorted by the whitelist order.
 */
export async function fetchGithubProfile(username, featured = []) {
  const cacheKey = `${CACHE_KEY}:${username}:${featured.join(',')}`;
  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.ts < TTL_MS) return parsed.data;
    }
  } catch (_) { /* ignore */ }

  const [profile, repos] = await Promise.all([
    fetchJson(`https://api.github.com/users/${username}`),
    fetchJson(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`),
  ]);

  const allPublic = repos.filter((r) => !r.fork && !r.private);

  let publicRepos;
  if (featured.length > 0) {
    publicRepos = allPublic
      .map((r) => ({ repo: r, rank: featuredMatchIndex(r.name, featured) }))
      .filter((x) => x.rank !== -1)
      .sort((a, b) => a.rank - b.rank)
      .map((x) => x.repo);
  } else {
    publicRepos = allPublic.sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));
  }

  // Languages are computed from ALL public repos, not just featured, so the
  // language chip bar reflects your real breadth — not just the curated slice.
  const languages = {};
  allPublic.forEach((r) => {
    if (r.language) languages[r.language] = (languages[r.language] || 0) + 1;
  });

  const data = {
    profile: {
      login: profile.login,
      name: profile.name,
      bio: profile.bio,
      avatar_url: profile.avatar_url,
      html_url: profile.html_url,
      followers: profile.followers,
      following: profile.following,
      public_repos: profile.public_repos,
    },
    pinned: publicRepos.slice(0, MAX_REPOS).map((r) => ({
      name: r.name,
      description: r.description,
      html_url: r.html_url,
      homepage: r.homepage,
      stargazers_count: r.stargazers_count,
      forks_count: r.forks_count,
      language: r.language,
      topics: r.topics || [],
      pushed_at: r.pushed_at,
    })),
    totalPublic: allPublic.length,
    languages: Object.entries(languages).sort((a, b) => b[1] - a[1]).slice(0, 8),
  };

  try {
    sessionStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data }));
  } catch (_) { /* ignore */ }

  return data;
}
