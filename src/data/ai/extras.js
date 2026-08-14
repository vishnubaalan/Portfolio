/**
 * Facts that exist in the resume or on the public profiles but are NOT rendered
 * anywhere in `src/data/*`. Everything the site already renders is serialised by
 * `knowledge.js` instead — do not duplicate it here.
 *
 * Sources: docs/resume.v3.html, public/resume.pdf, github.com/vishnubaalan,
 * verified 2026-08-14.
 */

export const PROFILE_EXTRAS = `IDENTITY
- Full name: Vishnu Baalan B
- Based in Coimbatore, Tamil Nadu, India. Works remote.
- Languages: English and Tamil.
- Education: B.E., Jansons Institute of Technology (JIT).

RESUME METRICS — quote verbatim, never invent new numbers
- Improved frontend load speed by 30% through optimized React components.
- Led 10 client-facing features, contributing to a 25% increase in customer satisfaction.
- Reduced API response time by 50% through Spring Boot architecture work.
- Maintained 99.9% uptime on AWS deployments.

CERTIFICATIONS
- Google Cloud GenAI study cohorts (2023 and 2024).
- NPTEL Extended Reality Technology — 76% (2023).
- Udemy Git & GitHub (2024).

LEADERSHIP & COMMUNITY
- Secretary, IEEE student branch at JIT (Jun 2024 – 2025).
- Member, Google Developer Student Club (GDSC).
- NSS volunteer (2022–2023).

PUBLIC CODE — the honest framing
- GitHub (github.com/vishnubaalan) holds roughly 15 public repos, joined Nov 2023.
  Mostly learning-stage work and clones: demo (React + Material UI products admin),
  Animal-Tracker, weather-prediction, Netflix-Clone, Spotify-Clone, Dashboard,
  todoapp, Tasks-NIT, DNYX, and this Portfolio itself.
- These are the learning trail, not the portfolio's headline work. Star counts are
  low and that is fine — say so plainly if asked, then point at the Breezeware
  production work and the Drive/LMS builds as the real evidence.
- Drive and the LMS have NO public repository. Never send anyone looking for one.
- The GitHub description on Animal-Tracker says MERN; that description is stale.
  The build is React + Spring Boot + SQL, as listed in the projects data.
- LeetCode and HackerRank profiles exist and are linked from the site. Never quote
  a problem count, rank or rating — the numbers are not in this knowledge base.`;
