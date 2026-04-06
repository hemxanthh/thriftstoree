import React from 'react';
import { Leaf, Sparkles, Gem } from 'lucide-react';

const About = () => {
  return (
    <div className="pt-16 bg-neutral-950 text-white">
      <section className="relative overflow-hidden py-24 sm:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.14),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(148,163,184,0.18),transparent_30%),linear-gradient(135deg,#050507_0%,#111827_60%,#0b1120_100%)]" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl rounded-3xl border border-white/15 bg-white/10 backdrop-blur-2xl shadow-[0_20px_80px_rgba(0,0,0,0.45)] px-7 py-12 sm:px-12 sm:py-14 text-center">
            <p className="text-[11px] tracking-[0.26em] uppercase text-neutral-300 mb-6">Maison Story</p>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-light tracking-tight leading-[1.05] mb-7">
              About Thrift Store
            </h1>
            <p className="text-lg sm:text-2xl text-neutral-200/90 leading-relaxed max-w-3xl mx-auto">
              A considered house of pre-loved fashion where rarity, quality, and timeless silhouettes come first.
            </p>
          </div>
        </div>
      </section>

      <section className="relative py-20 sm:py-24 bg-[linear-gradient(180deg,#0b1020_0%,#0a0f1a_100%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-stretch">
            <div className="rounded-3xl border border-white/15 bg-white/10 backdrop-blur-2xl p-8 sm:p-11 shadow-[0_10px_60px_rgba(0,0,0,0.35)]">
              <h2 className="text-3xl sm:text-4xl font-light tracking-tight mb-7">How We Built This</h2>
              <div className="space-y-5 text-neutral-200/90 leading-relaxed text-[15px] sm:text-base">
                <p>
                  What began as weekend thrift runs evolved into a full-time discipline: make exceptional vintage easier to discover,
                  easier to trust, and easier to wear.
                </p>
                <p>
                  Every garment passes a strict curation filter for condition, craftsmanship, fabric integrity, and relevance.
                  We keep each release focused, so every piece feels deliberate.
                </p>
                <p>
                  You get history in every stitch, without the uncertainty.
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-white/15 bg-white/10 backdrop-blur-2xl shadow-[0_10px_60px_rgba(0,0,0,0.35)] min-h-[380px] sm:min-h-[440px]">
              <img
                src="https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=900&h=1100&fit=crop"
                alt="Curated vintage styling"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-20 sm:py-24 bg-neutral-950 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-14">
            <p className="text-[11px] tracking-[0.24em] uppercase text-neutral-400 mb-4">Core Philosophy</p>
            <h2 className="text-4xl sm:text-5xl font-light tracking-tight">Built On Three Principles</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <article className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-7 shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
              <div className="w-11 h-11 rounded-full border border-white/25 flex items-center justify-center mb-6 bg-white/10">
                <Leaf className="w-5 h-5 text-neutral-100" />
              </div>
              <h3 className="text-2xl font-medium mb-3">Sustainable</h3>
              <p className="text-neutral-300 leading-relaxed">
                Extending the life of exceptional garments while reducing fashion waste through curated recirculation.
              </p>
            </article>

            <article className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-7 shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
              <div className="w-11 h-11 rounded-full border border-white/25 flex items-center justify-center mb-6 bg-white/10">
                <Sparkles className="w-5 h-5 text-neutral-100" />
              </div>
              <h3 className="text-2xl font-medium mb-3">Curated</h3>
              <p className="text-neutral-300 leading-relaxed">
                Hand-selected pieces chosen for fit, fabric, and lasting relevance rather than short-lived trends.
              </p>
            </article>

            <article className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-7 shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
              <div className="w-11 h-11 rounded-full border border-white/25 flex items-center justify-center mb-6 bg-white/10">
                <Gem className="w-5 h-5 text-neutral-100" />
              </div>
              <h3 className="text-2xl font-medium mb-3">Distinctive</h3>
              <p className="text-neutral-300 leading-relaxed">
                Rare one-off finds with character and depth, made for personal style that feels unmistakably yours.
              </p>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;