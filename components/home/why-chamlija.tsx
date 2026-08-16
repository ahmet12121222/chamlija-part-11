const FEATURES = [
  {
    number: "01",
    title: "Nature",
    description: "Lush green surroundings and shaded corners for a true escape outdoors.",
  },
  {
    number: "02",
    title: "Family Friendly",
    description: "Safe, relaxed spaces designed for guests of every age to enjoy together.",
  },
  {
    number: "03",
    title: "Space & Privacy",
    description: "Generous grounds and private corners, never crowded or rushed.",
  },
  {
    number: "04",
    title: "Events & Experiences",
    description: "Tents, open areas and activities ready to host your next celebration.",
  },
];

export function WhyChamlija() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-8 lg:px-10 lg:py-28">
      <div className="max-w-xl">
        <p className="text-[10px] font-medium uppercase tracking-[0.26em] text-[#7a8462] sm:text-xs">Why Chamlija</p>
        <h2 className="mt-4 text-3xl font-semibold leading-[1.08] tracking-[-0.04em] text-[#14251d] sm:text-4xl">
          Made for unforgettable days
        </h2>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 sm:gap-6">
        {FEATURES.map((feature) => (
          <div
            key={feature.number}
            className="group rounded-[1.5rem] border border-[#e8e8e1] bg-white p-6 shadow-[0_8px_22px_rgba(20,37,29,0.03)] transition hover:shadow-[0_12px_28px_rgba(20,37,29,0.06)] sm:p-7"
          >
            <div className="flex items-center gap-4">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#edf0ea] text-sm font-semibold text-[#14251d]">
                {feature.number}
              </span>
              <h3 className="text-xl font-semibold text-[#14251d] transition group-hover:text-[#7a8462]">
                {feature.title}
              </h3>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-7 text-[#49574f]">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
