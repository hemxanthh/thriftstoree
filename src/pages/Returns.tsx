const Returns = () => {
  return (
    <div className="pt-16 bg-neutral-950 text-white min-h-screen">
      <section className="relative overflow-hidden py-24 sm:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.14),transparent_35%),radial-gradient(circle_at_85%_0%,rgba(148,163,184,0.16),transparent_30%),linear-gradient(145deg,#050507_0%,#0f172a_65%,#0a1120_100%)]" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/15 bg-white/10 backdrop-blur-2xl shadow-[0_20px_80px_rgba(0,0,0,0.45)] px-7 py-12 sm:px-12 sm:py-14">
            <p className="text-[11px] tracking-[0.26em] uppercase text-neutral-300 mb-6">Customer Care</p>
            <h1 className="text-4xl sm:text-6xl font-light tracking-tight mb-7">Returns Policy</h1>
            <p className="text-lg sm:text-xl text-neutral-200/90 leading-relaxed max-w-3xl">
              We keep returns simple and transparent, with support at every step.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24 bg-[linear-gradient(180deg,#0b1020_0%,#0a0f1a_100%)] border-t border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-7 sm:p-9 space-y-5">
            <p className="text-neutral-300 leading-relaxed">Returns are accepted within 30 days of delivery for items in original condition.</p>
            <p className="text-neutral-300 leading-relaxed">To initiate a return, contact support with your order ID and reason for return.</p>
            <p className="text-neutral-300 leading-relaxed">Refunds are processed to the original payment method after inspection, usually within 5-7 business days.</p>
            <p className="text-neutral-300 leading-relaxed">Final sale or heavily discounted items may not be eligible unless defective.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Returns;
