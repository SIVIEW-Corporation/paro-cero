'use client';

import React from 'react';
import ReactECharts from 'echarts-for-react';

interface EChartsProps {
  options: echarts.EChartsOption;
  height?: number | string;
}

export function EChartsChart({ options, height = 200 }: EChartsProps) {
  return (
    <ReactECharts
      option={options}
      style={{
        height: typeof height === 'number' ? `${height}px` : height,
        width: '100%',
      }}
    />
  );
}
