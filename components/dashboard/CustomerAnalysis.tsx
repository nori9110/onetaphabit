'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface CustomerAnalysisProps {
  ageData: {
    ageGroup: string;
    count: number;
  }[];
  genderData: {
    gender: string;
    count: number;
  }[];
}

const GENDER_COLORS = {
  '男性': 'hsl(var(--chart-1))',
  '女性': 'hsl(var(--chart-2))',
};

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
  pie: {
    cx: "50%",
    cy: "50%",
    innerRadius: 60,
    outerRadius: 80,
    paddingAngle: 5,
  },
  bar: {
    radius: [4, 4, 0, 0],
  },
};

export function CustomerAnalysis({ ageData, genderData }: CustomerAnalysisProps) {
  return (
    <>
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>年齢層別顧客分布</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <XAxis
                  dataKey="ageGroup"
                  {...chartConfig.xAxis}
                />
                <YAxis
                  {...chartConfig.yAxis}
                  tickFormatter={(value) => value.toString()}
                />
                <Tooltip
                  formatter={(value: number) => [value, "顧客数"]}
                  contentStyle={chartConfig.tooltip.contentStyle}
                />
                <Bar
                  dataKey="count"
                  fill="hsl(var(--chart-1))"
                  {...chartConfig.bar}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>性別比率</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  dataKey="count"
                  nameKey="gender"
                  {...chartConfig.pie}
                >
                  {genderData.map((entry) => (
                    <Cell
                      key={entry.gender}
                      fill={GENDER_COLORS[entry.gender as keyof typeof GENDER_COLORS]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [value, "顧客数"]}
                  contentStyle={chartConfig.tooltip.contentStyle}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </>
  );
}