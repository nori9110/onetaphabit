'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface RegionMapProps {
  data: {
    region: string;
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
  bar: {
    radius: [4, 4, 0, 0],
  },
};

export function RegionMap({ data }: RegionMapProps) {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>地域別売上</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <XAxis 
                dataKey="region"
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
              <Bar
                dataKey="amount"
                fill="hsl(var(--chart-2))"
                {...chartConfig.bar}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}