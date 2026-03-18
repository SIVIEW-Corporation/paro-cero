'use client';

import React from 'react';
import { EChartsChart } from './EChartsChart';

interface DataPoint {
  mes: string;
  val?: number;
  hrs?: number;
}

interface AreaChartProps {
  data: DataPoint[];
  dataKey: string;
  color?: string;
  name?: string;
  height?: number;
  yDomain?: [number, number];
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

export function EChartsArea({
  data,
  dataKey,
  color = '#3b82f6',
  name,
  height = 200,
  yDomain,
}: AreaChartProps) {
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
      ...(yDomain && { min: yDomain[0], max: yDomain[1] }),
    },
    series: [
      {
        type: 'line' as const,
        data: data.map((d) => d[dataKey as keyof DataPoint]),
        name: name,
        smooth: true,
        symbol: 'circle' as const,
        symbolSize: 6,
        lineStyle: { color, width: 2.5 },
        itemStyle: { color },
        areaStyle: {
          color: {
            type: 'linear' as const,
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: color + '50' },
              { offset: 1, color: color + '00' },
            ],
          },
        },
      },
    ],
  };

  return <EChartsChart options={options} height={height} />;
}
