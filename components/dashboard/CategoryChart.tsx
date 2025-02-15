'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface CategoryChartProps {
  data: {
    category: string;
    amount: number;
  }[];
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))'
];

const chartConfig = {
  pie: {
    cx: "50%",
    cy: "50%",
    innerRadius: 60,
    outerRadius: 80,
    paddingAngle: 5,
  },
  tooltip: {
    contentStyle: {
      backgroundColor: 'white',
      border: '1px solid #ccc',
      borderRadius: '4px',
      padding: '8px',
    },
  },
};

export function CategoryChart({ data }: CategoryChartProps) {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>カテゴリー別売上</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="amount"
                nameKey="category"
                {...chartConfig.pie}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${entry.category}`}
                    fill={COLORS[index % COLORS.length]}
                    strokeWidth={1}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`¥${value.toLocaleString()}`, "売上"]}
                contentStyle={chartConfig.tooltip.contentStyle}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}