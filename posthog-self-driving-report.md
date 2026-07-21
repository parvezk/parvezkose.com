# PostHog Self-driving Setup Report

**Project:** parvezkose.com (PostHog project 369583)
**Date:** 2026-07-13
**Inbox:** https://us.posthog.com/project/369583/inbox

Findings will start appearing in your inbox within ~30 minutes as the first scout runs complete.

---

## What was done

### GitHub connected
- **Integration:** parvezk (id: 184686) — installed via one-click GitHub App flow.
- Grants Self-driving code access to `parvezk/parvezkose.com` for researching findings and opening fixes.

### Products enabled
- `products-enable` is not available in the current MCP version.
- **Session Replay:** `session_recording_opt_in` is currently `false` in project settings — **follow-up required** (see below). Recordings were found in the last 30 days, suggesting the SDK captures some sessions regardless.
- **Error Tracking:** `capture_exceptions: true` is set in `instrumentation-client.ts` — exceptions are being captured. No active issues at setup time.
- **Conversations (Support):** Not enabled — no channel connected. **Follow-up required.**
- The posthog-js init has no `disable_session_recording` or `capture_exceptions: false` overrides — the init is safe.

### Signal sources enabled (5 new rows)

| Source | Type | Status |
|---|---|---|
| `error_tracking` | `issue_created` | enabled |
| `error_tracking` | `issue_reopened` | enabled |
| `error_tracking` | `issue_spiking` | enabled |
| `session_replay` | `session_analysis_cluster` | enabled (sample_rate: 0.1) |
| `conversations` | `ticket` | enabled (dormant until channel connected) |

The **scout gate** (`signals_scout` / `cross_source_issue`) is on by default — no row needed.

### Issue-tracker integrations connected

| Tool | Status | Warehouse source |
|---|---|---|
| **GitHub Issues** | Connected by this setup | id: `019f5af1-9a39-0000-d694-cd35c1103fd5` — issues table syncing, first sync started |
| **Linear** | Connected by this setup (PK-HQ workspace, id: 184688) | id: `019f5afa-0ebe-0000-4226-489bf3d5f3cc` — issues table syncing, first sync started |

Both warehouse sources sync only the `issues` table. More tables can be enabled in [Data Management → Sources](https://us.posthog.com/project/369583/data-management/sources).

### Scout troop configured

**Enabled (5 total):**

| Scout | Reason |
|---|---|
| `general` | Always on — cross-product correlations and uncovered surfaces |
| `product-analytics` | Blog reading funnel, layout preference, social link engagement funnels are saved insights |
| `web-analytics` | Public-facing portfolio/blog site — session volume and landing-page health |
| `social-link-engagement` *(custom)* | Watches per-platform click drops across hero nav, footer, and classic homepage |
| `layout-preference-drift` *(custom)* | Watches sustained shifts in the immersive/classic layout switch ratio |

**Disabled (23):** all remaining canonical scouts.

Notable intentional disables:
- `error-tracking` — covered by native `error_tracking` source (not a re-enable candidate)
- `session-replay` — covered by native `session_replay` source (not a re-enable candidate)

### Custom scouts created

**`signals-scout-social-link-engagement`** (id: `019f5b06-1dac-7f90-bab2-7ad2ed099ee9`)
- **Gap covered:** Per-platform click volume drops (`social_link_clicked`, `footer_social_link_clicked`, `classic_homepage_social_link_clicked` by `platform`) — not covered by product-analytics (funnels only) or web-analytics (sessions/traffic).
- **Discriminator:** Single-platform drop ≥40% vs. 14-day rolling average while pageviews stay within 20% of baseline.
- **Noise escape:** If the scout turns noisy, set `emit: false` on its config in PostHog to switch to dry-run.

**`signals-scout-layout-preference-drift`** (id: `019f5b06-1d9a-7141-89a6-1eb8cd5ed2e8`)
- **Gap covered:** Distribution shifts in `layout_switched` to/from values (immersive vs. classic) — product-analytics watches conversion rates in funnels, not two-way preference distributions.
- **Discriminator:** Classic-switch ratio shifts ≥25 percentage points from 14-day baseline, sustained over 3+ days, with ≥5 events.
- **Noise escape:** If the scout turns noisy, set `emit: false` on its config in PostHog to switch to dry-run.

**Surfaces considered and ruled out:**
- Blog reading funnel (`blog_post_clicked → blog_post_viewed`) — **covered** by `signals-scout-product-analytics` (saved funnel insight `AqMwzlM2`).
- Design philosophy engagement (`design_philosophy_toggled`) — **not proposed** as standalone; volume too low for a standalone scout, corroborated as a signal inside the layout-preference scout.

---

## Follow-up actions

1. **Enable Session Replay in project settings.** `session_recording_opt_in` is currently `false`. Go to [Project Settings → Recordings](https://us.posthog.com/project/369583/settings/environment-replay) and turn on recording. The `session_replay` source is already wired — it will start populating the inbox once replay is on.

2. **Connect a Support inbound channel.** The Conversations product was armed but no channel (email / inbox / Slack) is connected. Go to [Integrations Settings](https://us.posthog.com/project/369583/settings/environment-integrations) to add one. The `conversations / ticket` source is already enabled and will pick up tickets automatically once a channel exists.

3. **Enable Error Tracking in project settings.** Go to [Error Tracking settings](https://us.posthog.com/project/369583/error_tracking) and confirm it is enabled. `capture_exceptions: true` in your init means exceptions are captured — the project-level toggle just controls the Error Tracking UI and source.

4. **GitHub Issues — additional repos.** The GitHub Issues warehouse source syncs only the `issues` table for `parvezk/parvezkose.com`. To add more repos or tables, use the [Data Management → Sources](https://us.posthog.com/project/369583/data-management/sources) page.

5. **Enable specialist scouts if products expand.** Re-enable from the scout list in PostHog:
   - `signals-scout-feature-flags` — if you add feature flags
   - `signals-scout-experiments` — if you run A/B tests
   - `signals-scout-surveys` — if you add PostHog surveys
   - `signals-scout-web-vitals` — already capturing `$web_vitals` (capture_performance_opt_in: true) — worth enabling when you want per-page Core Web Vitals monitoring
   - `signals-scout-anomaly-detection` — for dashboard/insight anomaly alerts

---

## No files modified

This setup made only server-side changes via the PostHog API. No source files in this repository were modified.
