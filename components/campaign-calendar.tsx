import type { CampaignPlan } from "@/lib/types";

const groupStyles: Record<CampaignPlan["rows"][number]["group"], { label: string; item: string }> = {
  Athletes: { label: "bg-[#8e6aa8] text-white", item: "bg-[#a888c0] text-white" },
  Fans: { label: "bg-[#f0d672]", item: "bg-[#f6e49c]" },
  "In person": { label: "bg-[#9db8ef]", item: "bg-[#c9dafa]" },
  PR: { label: "bg-[#c9ecb9]", item: "bg-[#e3f6d8]" },
};

const phaseColors = ["bg-[#f2a3a3]", "bg-[#f0b0a0]", "bg-[#ee9f9f]"];

// Laid out like an IMC calendar: one column per month, blocks spanning the months they run.
export function CampaignCalendar({ plan }: { plan: CampaignPlan }) {
  const columns = `minmax(8rem,10rem) repeat(${plan.months.length}, minmax(7.5rem, 1fr))`;
  const span = (start: number, end: number) => ({
    gridColumn: `${Math.max(0, start) + 2} / ${Math.min(plan.months.length - 1, Math.max(start, end)) + 3}`,
  });
  const cell = "rounded-md px-2 py-1.5 text-center text-xs font-medium leading-snug";
  const label = "flex items-center justify-center rounded-md bg-[#d9b6b6] px-2 py-1.5 text-center text-xs font-bold";

  return (
    <div className="overflow-x-auto rounded-2xl bg-[#f8eeec] p-3">
      <div className="grid min-w-max gap-1.5" style={{ gridTemplateColumns: columns }}>
        <div className={label}>Big Idea</div>
        <div
          className={`${cell} bg-[linear-gradient(90deg,#fdf3b8,#f6c6d8,#e9b3f2)] text-sm font-bold`}
          style={span(0, plan.months.length - 1)}
        >
          {plan.bigIdea}
        </div>

        <div className={label}>Month</div>
        {plan.months.map((month) => (
          <div key={month} className={`${cell} bg-[#f3cfe0] font-bold`}>
            {month}
          </div>
        ))}

        <div className={label}>Phasing</div>
        {plan.phases.map((phase, index) => (
          <div key={phase.name} className={`${cell} ${phaseColors[index % 3]} font-bold text-white`} style={span(phase.start, phase.end)}>
            {phase.name}
          </div>
        ))}

        <div className={label}>Key Hook</div>
        {plan.phases.map((phase) => (
          <div key={`${phase.name}-hook`} className={`${cell} bg-[#ead6d6]`} style={span(phase.start, phase.end)}>
            {phase.keyHook}
          </div>
        ))}

        {plan.rows.map((row) => (
          <div key={row.channel} className="contents">
            <div className={`${cell} ${groupStyles[row.group].label} flex items-center justify-center font-semibold`} style={{ gridColumn: 1 }}>
              {row.channel}
            </div>
            {row.items.map((item, index) => (
              <div
                key={`${row.channel}-${index}`}
                className={`${cell} ${groupStyles[row.group].item}`}
                style={span(item.start, item.end)}
              >
                {item.text}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
