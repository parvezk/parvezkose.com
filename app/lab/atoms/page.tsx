import type { Metadata } from "next";
import {
  Button,
  Caret,
  Divider,
  Eyebrow,
  Footer,
  HeroFrame,
  LinkRow,
  NavCapsLink,
  Pill,
  Surface,
  TopBar,
} from "../../components/ds";

export const metadata: Metadata = {
  title: "Atoms · Lab",
  description: "Read-only preview of the parvezkose.com design-system atoms.",
  robots: { index: false, follow: false },
};

/* ============================================================
   Local helpers — lab-only, not part of the DS surface
   ============================================================ */

function SectionHeader({
  index,
  name,
  file,
  description,
}: {
  index: string;
  name: string;
  file: string;
  description: string;
}) {
  return (
    <header className="mb-4 flex flex-col gap-1">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-mono text-11 font-medium uppercase tracking-widest text-[color:var(--accent-terracotta)]">
          [{index}]
        </span>
        <h2 className="font-mono text-16 font-medium tracking-snug text-[color:var(--surface-fg)]">
          {name}
        </h2>
        <code className="font-mono text-11 text-[color:var(--surface-fg-faint)]">
          {file}
        </code>
      </div>
      <p className="font-sans text-13 leading-snug text-[color:var(--surface-fg-muted)]">
        {description}
      </p>
    </header>
  );
}

function Specimen({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-dashed border-[color:var(--surface-border)] bg-[color:var(--surface-bg-elev)] p-5">
      {children}
    </div>
  );
}

/* ============================================================
   Page
   ============================================================ */

export default function AtomsLabPage() {
  return (
    <Surface
      mode="immersive"
      as="main"
      className="min-h-screen bg-[color:var(--surface-bg)] text-[color:var(--surface-fg)]"
    >
      {/* ── Page lede ───────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-6 pt-16 pb-10 sm:pt-20">
        <Eyebrow className="mb-3">DS · Atoms · /lab</Eyebrow>
        <h1 className="font-serif text-36 font-medium tracking-tight text-[color:var(--surface-fg)] sm:text-48">
          Building blocks
          <Caret className="ml-2 align-baseline" inheritColor />
        </h1>
        <p className="mt-4 max-w-prose font-sans text-16 leading-snug text-[color:var(--surface-fg-muted)]">
          Server-renderable primitives extracted from{" "}
          <code className="font-mono text-13 text-[color:var(--surface-fg)]">
            app/components/home-page.tsx
          </code>{" "}
          and{" "}
          <code className="font-mono text-13 text-[color:var(--surface-fg)]">
            app/components/immersive-hero-client.tsx
          </code>
          . Tokens flow through{" "}
          <code className="font-mono text-13 text-[color:var(--surface-fg)]">
            app/global.css
          </code>{" "}
          and{" "}
          <code className="font-mono text-13 text-[color:var(--surface-fg)]">
            design-system/tokens.json
          </code>
          . Live mounts deferred — <span className="text-[color:var(--accent-terracotta)]">/</span>{" "}
          and <span className="text-[color:var(--accent-terracotta)]">/classic</span> stay untouched
          until parity is verified here.
        </p>

        <ul className="mt-6 flex flex-wrap items-center gap-2">
          <Pill tone="terra">noindex</Pill>
          <Pill tone="latte">11 atoms</Pill>
          <Pill tone="framed">read-only</Pill>
        </ul>
      </section>

      <Divider inset={24} />

      {/* ── 01 · Eyebrow ────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-6 py-10">
        <SectionHeader
          index="01"
          name="Eyebrow"
          file="app/components/ds/eyebrow.tsx"
          description="Mono caps micro label. Resolves to --surface-fg-muted; surface-aware."
        />
        <Specimen>
          <Eyebrow>Section · 2026</Eyebrow>
        </Specimen>
      </section>

      {/* ── 02 · Caret ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-6 py-10">
        <SectionHeader
          index="02"
          name="Caret"
          file="app/components/ds/caret.tsx"
          description="Step-blink underscore (1.08s). Honors prefers-reduced-motion via the global rule."
        />
        <Specimen>
          <p className="font-mono text-16 text-[color:var(--surface-fg)]">
            agentic system <Caret />
          </p>
        </Specimen>
      </section>

      {/* ── 03 · NavCapsLink ────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-6 py-10">
        <SectionHeader
          index="03"
          name="NavCapsLink"
          file="app/components/ds/nav-caps-link.tsx"
          description="Mono caps link with letter-spacing-on-hover. The signature nav primitive. Accepts external for new-tab + rel."
        />
        <Specimen>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <NavCapsLink href="/">Internal</NavCapsLink>
            <NavCapsLink href="https://github.com/parvezk" external>
              External →
            </NavCapsLink>
          </div>
        </Specimen>
      </section>

      {/* ── 04 · Divider ────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-6 py-10">
        <SectionHeader
          index="04"
          name="Divider"
          file="app/components/ds/divider.tsx"
          description="1px hairline with a 24px inset (overrideable). Color resolves to --surface-border."
        />
        <Specimen>
          <Divider inset={0} />
          <p className="my-4 font-sans text-13 text-[color:var(--surface-fg-muted)]">
            inset = 0 above · inset = 24 (default) below
          </p>
          <Divider />
        </Specimen>
      </section>

      {/* ── 05 · Pill ───────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-6 py-10">
        <SectionHeader
          index="05"
          name="Pill"
          file="app/components/ds/pill.tsx"
          description="Five tones: terra, gold, latte, wine, framed. Tonal fill at 12% so pills never compete with primary copy."
        />
        <Specimen>
          <div className="flex flex-wrap items-center gap-3">
            <Pill tone="terra">terracotta</Pill>
            <Pill tone="gold">golden</Pill>
            <Pill tone="latte">latte</Pill>
            <Pill tone="wine">wine</Pill>
            <Pill tone="framed">framed</Pill>
          </div>
        </Specimen>
      </section>

      {/* ── 06 · Button ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-6 py-10">
        <SectionHeader
          index="06"
          name="Button"
          file="app/components/ds/button.tsx"
          description="Three variants: ghost (text-only), framed (hairline), terminal ([+] label). None default to a heavy fill."
        />
        <Specimen>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <Button variant="ghost">Ghost action</Button>
            <Button variant="framed">Framed action</Button>
            <Button variant="terminal">[+] Terminal disclosure</Button>
          </div>
        </Specimen>
      </section>

      {/* ── 07 · LinkRow ────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-6 py-10">
        <SectionHeader
          index="07"
          name="LinkRow"
          file="app/components/ds/link-row.tsx"
          description="Horizontal inline link list with a faint separator glyph (default ·). Decorative separators are aria-hidden."
        />
        <Specimen>
          <LinkRow>
            <NavCapsLink href="https://github.com/parvezk" external>
              GitHub
            </NavCapsLink>
            <NavCapsLink href="https://linkedin.com/in/parvezkose" external>
              LinkedIn
            </NavCapsLink>
            <NavCapsLink href="https://designlogic.substack.com" external>
              Substack
            </NavCapsLink>
            <NavCapsLink href="https://medium.com/@parvezkose" external>
              Medium
            </NavCapsLink>
          </LinkRow>
        </Specimen>
      </section>

      {/* ── 08 · TopBar ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-6 py-10">
        <SectionHeader
          index="08"
          name="TopBar"
          file="app/components/ds/top-bar.tsx"
          description="48px sticky header with a hairline bottom border. Left/right slots accept any node — typically a wordmark and a LinkRow."
        />
        <Specimen>
          <TopBar
            left="parvez kose"
            right={
              <LinkRow>
                <NavCapsLink href="/">Home</NavCapsLink>
                <NavCapsLink href="/about">About</NavCapsLink>
                <NavCapsLink href="/writing">Writing</NavCapsLink>
              </LinkRow>
            }
          />
        </Specimen>
      </section>

      {/* ── 09 · Footer ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-6 py-10">
        <SectionHeader
          index="09"
          name="Footer"
          file="app/components/ds/footer.tsx"
          description="Hairline-topped strip with mono caps. Pairs with TopBar."
        />
        <Specimen>
          <Footer left="© 2026 · Parvez Kose" right="Boston, MA" />
        </Specimen>
      </section>

      {/* ── 10 · HeroFrame ──────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-6 py-10">
        <SectionHeader
          index="10"
          name="HeroFrame"
          file="app/components/ds/hero-frame.tsx"
          description="Four 12px L-marks at each corner. A frame for hero copy that signals 'you are on the system' without enclosing the content in a box."
        />
        <Specimen>
          <HeroFrame
            className="flex items-center justify-center px-10 py-12"
            bracketColor="var(--accent-terracotta)"
          >
            <div className="text-center">
              <Eyebrow className="mb-2">Hero · framed</Eyebrow>
              <p className="font-mono text-20 tracking-snug text-[color:var(--surface-fg)]">
                Designing interfaces for intelligence
              </p>
            </div>
          </HeroFrame>
        </Specimen>
      </section>

      {/* ── 11 · Surface (wrapper) ──────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-6 py-10">
        <SectionHeader
          index="11"
          name="Surface"
          file="app/components/ds/surface.tsx"
          description="Sets [data-surface] so the --surface-* vars flip for the subtree. Wrap any composition to lock its mode."
        />
        <Specimen>
          <div className="grid gap-4 sm:grid-cols-2">
            <Surface
              mode="immersive"
              className="rounded-md border border-[color:var(--surface-border)] bg-[color:var(--surface-bg)] p-5"
            >
              <Eyebrow className="mb-2">Surface · immersive</Eyebrow>
              <p className="font-sans text-14 text-[color:var(--surface-fg)]">
                Warm white on near-black. Border is{" "}
                <code className="font-mono text-12">--im-border</code>.
              </p>
            </Surface>
            <Surface
              mode="classic"
              className="rounded-md border border-[color:var(--surface-border)] bg-[color:var(--surface-bg)] p-5"
            >
              <Eyebrow className="mb-2">Surface · classic</Eyebrow>
              <p className="font-sans text-14 text-[color:var(--surface-fg)]">
                Ink on warm-gray. Border is{" "}
                <code className="font-mono text-12">--classic-border</code>.
              </p>
            </Surface>
          </div>
        </Specimen>
      </section>

      <Divider inset={24} />

      {/* ── Compositions ────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-6 py-12">
        <Eyebrow className="mb-3">Compositions · atoms in concert</Eyebrow>
        <h2 className="font-mono text-20 font-medium tracking-snug text-[color:var(--surface-fg)]">
          Two surfaces, eleven atoms.
        </h2>
        <p className="mt-3 max-w-prose font-sans text-14 leading-snug text-[color:var(--surface-fg-muted)]">
          Below: a mock immersive hero strip and a mock classic card strip,
          composed entirely from the atoms above. No WebGL, no DotGrid, no
          philosophy disclosure — those are the next layer.
        </p>

        {/* Immersive composition */}
        <div className="mt-8">
          <Eyebrow className="mb-2">Composition · immersive</Eyebrow>
          <Surface
            mode="immersive"
            className="overflow-hidden rounded-md border border-[color:var(--surface-border)] bg-[color:var(--surface-bg)]"
          >
            <TopBar
              left="parvez kose"
              right={
                <LinkRow>
                  <NavCapsLink href="/" external>
                    GitHub
                  </NavCapsLink>
                  <NavCapsLink href="/" external>
                    LinkedIn
                  </NavCapsLink>
                  <NavCapsLink href="/" external>
                    Substack
                  </NavCapsLink>
                </LinkRow>
              }
            />
            <div className="px-6 py-16">
              <HeroFrame className="mx-auto max-w-md p-8">
                <div className="text-center">
                  <Eyebrow className="mb-3">Immersive · v0.1</Eyebrow>
                  <p className="font-mono text-28 font-light tracking-snug text-[color:var(--surface-fg)] sm:text-36">
                    parvez kose
                  </p>
                  <p className="mt-3 font-mono text-13 text-[color:var(--surface-fg-muted)]">
                    designing interfaces for intelligence <Caret />
                  </p>
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                    <Button variant="terminal">[+] Design Philosophy</Button>
                    <Button variant="terminal">[+] Menu</Button>
                  </div>
                </div>
              </HeroFrame>
            </div>
            <Footer left="© 2026 · Parvez Kose" right="agentic terrain" />
          </Surface>
        </div>

        {/* Classic composition */}
        <div className="mt-12">
          <Eyebrow className="mb-2">Composition · classic</Eyebrow>
          <Surface
            mode="classic"
            className="overflow-hidden rounded-md border border-[color:var(--surface-border)] bg-[color:var(--surface-bg)]"
          >
            <TopBar
              left="parvez kose"
              right={
                <LinkRow>
                  <NavCapsLink href="/">Home</NavCapsLink>
                  <NavCapsLink href="/about">About</NavCapsLink>
                  <NavCapsLink href="/writing">Writing</NavCapsLink>
                </LinkRow>
              }
            />
            <div className="px-6 py-12 text-[color:var(--surface-fg)]">
              <Eyebrow className="mb-3">Card · v0.1</Eyebrow>
              <h3 className="font-serif text-28 font-medium tracking-tight">
                Parvez Kose
              </h3>
              <p className="mt-3 max-w-prose font-sans text-14 leading-snug text-[color:var(--surface-fg-muted)]">
                Designer working at the seam between AI systems and the people
                who use them. Boston, MA.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Pill tone="terra">AI interfaces</Pill>
                <Pill tone="latte">agentic systems</Pill>
                <Pill tone="framed">visual interpretability</Pill>
              </div>
              <div className="mt-6">
                <LinkRow>
                  <NavCapsLink href="/" external>
                    GitHub
                  </NavCapsLink>
                  <NavCapsLink href="/" external>
                    LinkedIn
                  </NavCapsLink>
                  <NavCapsLink href="/" external>
                    Substack
                  </NavCapsLink>
                </LinkRow>
              </div>
            </div>
            <Footer left="© 2026 · Parvez Kose" right="Boston, MA" />
          </Surface>
        </div>
      </section>

      {/* ── Footer note ─────────────────────────────────────────── */}
      <Divider inset={24} />
      <section className="mx-auto max-w-3xl px-6 py-10">
        <p className="font-mono text-11 uppercase tracking-widest text-[color:var(--surface-fg-faint)]">
          /lab/atoms · noindex · do not link from public surfaces
        </p>
      </section>
    </Surface>
  );
}
