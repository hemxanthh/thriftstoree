const SizeGuide = () => {
  return (
    <div className="pt-16 bg-neutral-950 text-white min-h-screen">
      <section className="relative overflow-hidden py-24 sm:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.14),transparent_35%),radial-gradient(circle_at_85%_0%,rgba(148,163,184,0.16),transparent_30%),linear-gradient(145deg,#050507_0%,#0f172a_65%,#0a1120_100%)]" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/15 bg-white/10 backdrop-blur-2xl shadow-[0_20px_80px_rgba(0,0,0,0.45)] px-7 py-12 sm:px-12 sm:py-14">
            <p className="text-[11px] tracking-[0.26em] uppercase text-neutral-300 mb-6">Fit & Measurements</p>
            <h1 className="text-4xl sm:text-6xl font-light tracking-tight mb-7">Size Guide</h1>
            <p className="text-lg sm:text-xl text-neutral-200/90 leading-relaxed max-w-3xl">
              Because vintage sizing varies, we provide measured-fit guidance for each piece.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24 bg-[linear-gradient(180deg,#0b1020_0%,#0a0f1a_100%)] border-t border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <article className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-7">
              <h2 className="text-xl font-medium mb-3">Chest / Bust</h2>
              <p className="text-neutral-300">Measure around the fullest part while keeping tape level and relaxed.</p>
            </article>
            <article className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-7">
              <h2 className="text-xl font-medium mb-3">Waist</h2>
              <p className="text-neutral-300">Measure at your natural waistline, not where low-rise garments sit.</p>
            </article>
            <article className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-7">
              <h2 className="text-xl font-medium mb-3">Inseam</h2>
              <p className="text-neutral-300">Measure from crotch seam to ankle along inner leg for pant length.</p>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SizeGuide;
