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
      backgroundColor: '#ffffff',
      borderColor: '#dde3ea',
      borderRadius: 8,
      extraCssText: 'box-shadow: 0 8px 24px rgba(15,23,42,0.12);',
      textStyle: {
        color: '#111827',
        fontSize: 12,
      },
    },
    legend: showLegend
      ? {
          orient: 'horizontal' as const,
          bottom: 0,
          textStyle: { color: '#667085', fontSize: 12 },
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
        radius: ['15%', '70%'],
        roseType: false as const,
        center: ['50%', '45%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#ffffff',
          borderWidth: 2,
        },
        label: {
          show: true,
          position: 'inside' as const,
          formatter: '{d}%',
          fontSize: 12,
          fontWeight: 'bold' as const,
          color: '#ffffff',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 13,
            fontWeight: 'bold' as const,
            color: '#ffffff',
          },
          itemStyle: {
            shadowBlur: 8,
            shadowOffsetX: 0,
            shadowColor: 'rgba(15, 23, 42, 0.16)',
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
