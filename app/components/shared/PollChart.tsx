import React from "react";

export interface PollChartProps {
  options: { id: string; text: string; votes: number }[];
  totalVotes: number;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e42", "#ef4444", "#6366f1", "#f472b6", "#22d3ee", "#a3e635"];

export default function PollChart({ options, totalVotes }: PollChartProps) {
  return (
    <div className="space-y-4">
      {options.map((option, idx) => {
        const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
        return (
          <div key={option.id} className="space-y-2">
            <div className="flex justify-between items-center">
              <span>{option.text}</span>
              <span>{`${option.votes} vote(s)`}</span>
              <span className="text-xs text-gray-500">{percentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
              <div
                className="h-4 rounded-full"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: COLORS[idx % COLORS.length],
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
