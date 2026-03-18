'use client';

import React from 'react';
import { EChartsChart } from './EChartsChart';

interface DataPoint {
  mes: string;
  val?: number;
  hrs?: number;
}

interface BarChartProps {
  data: DataPoint[];
  dataKey: string;
  color?: string;
  name?: string;
  height?: number;
}

const baseOptions = {
  grid: {
    left: 40,
    right: 20,
    top: 20,
    bottom: 30,
  },
  tooltip: {
    backgroundColor: '#0d1627',
    borderColor: '#1e3a5f',
    borderRadius: 6,
    textStyle: {
      color: '#e2e8f0',
      fontSize: 12,
    },
  },
  xAxis: {
    axisLine: { lineStyle: { color: '#1e3a5f' } },
    axisTick: { show: false },
    axisLabel: { color: '#475569', fontSize: 11 },
    splitLine: { show: false },
  },
  yAxis: {
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: '#475569', fontSize: 11 },
    splitLine: { lineStyle: { color: '#1e3a5f', type: 'dashed' as const } },
  },
};

export function EChartsBar({
  data,
  dataKey,
  color = '#ef4444',
  name,
  height = 200,
}: BarChartProps) {
  const options = {
    ...baseOptions,
    xAxis: {
      ...baseOptions.xAxis,
      type: 'category' as const,
      data: data.map((d) => d.mes),
    },
    yAxis: {
      ...baseOptions.yAxis,
      type: 'value' as const,
    },
    series: [
      {
        type: 'bar' as const,
        data: data.map((d) => d[dataKey as keyof DataPoint]),
        name: name,
        barWidth: '50%',
        itemStyle: {
          color,
          borderRadius: [4, 4, 0, 0],
        },
      },
    ],
  };

  return <EChartsChart options={options} height={height} />;
}
