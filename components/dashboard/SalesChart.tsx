'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface SalesChartProps {
  data: {
    month: string;
    amount: number;
  }[];
}

const chartConfig = {
  xAxis: {
    fontSize: 12,
    tickLine: false,
    axisLine: false,
    stroke: "#888888",
    padding: { left: 10, right: 10 },
  },
  yAxis: {
    fontSize: 12,
    tickLine: false,
    axisLine: false,
    stroke: "#888888",
    width: 80,
  },
  tooltip: {
    contentStyle: {
      backgroundColor: 'white',
      border: '1px solid #ccc',
      borderRadius: '4px',
      padding: '8px',
    },
  },
  line: {
    strokeWidth: 2,
    dot: false,
    activeDot: { r: 4, strokeWidth: 1 },
  },
};

export function SalesChart({ data }: SalesChartProps) {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>月別売上推移</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
            >
              <XAxis
                dataKey="month"
                {...chartConfig.xAxis}
              />
              <YAxis
                {...chartConfig.yAxis}
                tickFormatter={(value) => `¥${value.toLocaleString()}`}
              />
              <Tooltip
                formatter={(value: number) => [`¥${value.toLocaleString()}`, "売上"]}
                contentStyle={chartConfig.tooltip.contentStyle}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="hsl(var(--chart-1))"
                {...chartConfig.line}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}