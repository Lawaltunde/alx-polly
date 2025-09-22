import React from "react";

export interface PollChartProps {
  options: { id: string; text: string; votes: number }[];
  totalVotes: number;
}

// Fallback HSL triples for when CSS vars aren't supported
const FALLBACK_HSL = [
  '217, 91%, 60%', // blue-500
  '160, 84%, 39%', // emerald-500
  '25, 95%, 53%',  // orange-500
  '0, 84%, 60%',   // red-500
  '242, 88%, 67%', // indigo-500
];

export default function PollChart({ options, totalVotes }: PollChartProps) {
  const [supportsOKLCH, setSupportsOKLCH] = React.useState(false);
  React.useEffect(() => {
    try {
      // Detect browser support for OKLCH to avoid black bars on unsupported engines
      if (typeof CSS !== 'undefined' && CSS.supports && CSS.supports('color', 'oklch(0.5 0.1 30)')) {
        setSupportsOKLCH(true);
      }
    } catch {}
  }, []);

  const barColor = (idx: number) => {
    const fallback = `hsl(${FALLBACK_HSL[idx % FALLBACK_HSL.length]})`;
    // If OKLCH is supported, prefer theme var (which may be OKLCH) with fallback
    if (supportsOKLCH) {
      return `var(--chart-${(idx % 5) + 1}, ${fallback})`;
    }
    // Otherwise force HSL fallback to avoid invalid color -> black
    return fallback;
  };
  return (
    <div className="space-y-4">
      {options.map((option, idx) => {
        const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
        return (
          <div key={option.id} className="space-y-2">
            <div className="flex justify-between items-center">
              <span>{option.text}</span>
              <span>{`${option.votes} vote(s)`}</span>
              <span className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-muted/40 rounded-full h-4">
              <div
                className="h-4 rounded-full"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: barColor(idx),
                  transition: "width 0.5s"
                }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
