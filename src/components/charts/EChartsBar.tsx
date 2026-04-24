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
    left: 46,
    right: 20,
    top: 16,
    bottom: 40,
    containLabel: true,
  },
  tooltip: {
    backgroundColor: '#ffffff',
    borderColor: '#dde3ea',
    borderRadius: 8,
    extraCssText: 'box-shadow: 0 8px 24px rgba(15,23,42,0.12);',
    textStyle: {
      color: '#111827',
      fontSize: 12,
    },
  },
  xAxis: {
    axisLine: { lineStyle: { color: '#dde3ea' } },
    axisTick: { show: false },
    axisLabel: { color: '#667085', fontSize: 11 },
    splitLine: { show: false },
  },
  yAxis: {
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: '#667085', fontSize: 11 },
    splitLine: { lineStyle: { color: '#dde3ea', type: 'dashed' as const } },
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
