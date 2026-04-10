<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into parvezkose.com. Client-side tracking was initialized via `instrumentation-client.ts` (the recommended approach for Next.js 15.3+), with a reverse proxy configured in `next.config.ts` to improve reliability against ad blockers. Seven event types were instrumented across six files, covering social link engagement, blog reading behavior, homepage layout preferences, and design philosophy interaction. Server-side event capture was added to the blog post page using `posthog-node`. Exception capture is enabled globally via `capture_exceptions: true`.

| Event | Description | File |
|---|---|---|
| `social_link_clicked` | Social link click from the immersive hero nav (GitHub, LinkedIn, Substack, Medium) with `platform` and `location` properties | `app/components/immersive-hero-client.tsx` |
| `design_philosophy_toggled` | User opens or closes the Design Philosophy panel; captures `action: "opened"/"closed"` | `app/components/immersive-hero-client.tsx` |
| `layout_switched` | User switches between immersive and classic homepage; captures `to` and `from` properties | `app/components/immersive-hero-client.tsx`, `app/components/home-page.tsx` |
| `blog_post_clicked` | User clicks a post from the blog listing; captures `slug`, `title`, `published_at` | `app/components/blog-post-link.tsx` |
| `blog_post_viewed` | Server-side confirmation that a blog post page was rendered; captures `slug`, `title`, `published_at` | `app/blog/[slug]/page.tsx` |
| `footer_social_link_clicked` | Social link click from the classic layout footer; captures `platform` | `app/components/footer.tsx` |
| `classic_homepage_social_link_clicked` | Social link click from the classic homepage links section; captures `platform` | `app/components/home-page.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics**: https://us.posthog.com/project/369583/dashboard/1453812
- **Social link clicks by platform**: https://us.posthog.com/project/369583/insights/vgoIulu2
- **Blog posts clicked (by title)**: https://us.posthog.com/project/369583/insights/ckbJ2pbd
- **Blog reading funnel**: https://us.posthog.com/project/369583/insights/AqMwzlM2
- **Design Philosophy engagement**: https://us.posthog.com/project/369583/insights/Ifh2Dv6t
- **Layout preference (classic vs. immersive)**: https://us.posthog.com/project/369583/insights/3VXpxuo3

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
