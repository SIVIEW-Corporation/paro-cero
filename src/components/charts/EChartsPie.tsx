'use client';

import React from 'react';
import { EChartsChart } from './EChartsChart';

interface PieDataPoint {
  name: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieDataPoint[];
  height?: number;
  showLegend?: boolean;
}

export function EChartsPie({
  data,
  height = 200,
  showLegend = true,
}: PieChartProps) {
  const options = {
    tooltip: {
      trigger: 'item' as const,
      backgroundColor: '#0d1627',
      borderColor: '#1e3a5f',
      borderRadius: 6,
      textStyle: {
        color: '#e2e8f0',
        fontSize: 12,
      },
    },
    legend: showLegend
      ? {
          orient: 'horizontal' as const,
          bottom: 0,
          textStyle: { color: '#94a3b8', fontSize: 12 },
          icon: 'circle' as const,
          itemWidth: 8,
          itemHeight: 8,
        }
      : { show: false },
    series: [
      {
        type: 'pie' as const,
        data: data.map((d) => ({
          name: d.name,
          value: d.value,
          itemStyle: { color: d.color },
        })),
        radius: ['40%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: true,
        label: {
          show: true,
          position: 'inside' as const,
          formatter: '{d}%',
          fontSize: 12,
          fontWeight: 'bold' as const,
          color: '#fff',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 13,
            fontWeight: 'bold' as const,
            color: '#fff',
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
        labelLine: {
          show: false,
        },
      },
    ],
  };

  return <EChartsChart options={options} height={height} />;
}
