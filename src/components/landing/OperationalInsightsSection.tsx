'use client';

import type { EChartsOption } from 'echarts';
import dynamic from 'next/dynamic';
import Link from 'next/link';

import ScrollReveal from '@/components/landing/ScrollReveal';

const ReactECharts = dynamic(() => import('echarts-for-react'), {
  ssr: false,
  loading: () => (
    <div className='bg-app-surface-subtle border-app-border-soft h-full min-h-48 w-full animate-pulse rounded-2xl border' />
  ),
});

const CHART_COLORS = {
  blue: '#2563EB',
  danger: '#DC2626',
  muted: '#667085',
  grid: '#DDE3EA',
} as const;

const months = ['Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar'] as const;

const pmComplianceValues = [82, 78, 85, 88, 75, 68] as const;
const downtimeValues = [34, 29, 7, 22, 28, 7] as const;

const miniKpis = [
  { label: 'Cumplimiento PM', value: '68%' },
  { label: 'Paros críticos', value: '0h' },
  { label: 'OT completadas', value: '33' },
  { label: 'Activos con alertas', value: '7' },
] as const;

const insightChips = [
  'Cumplimiento PM',
  'Paros críticos',
  'OT completadas',
  'Alertas por activo',
] as const;

const baseAxisOptions = {
  axisLine: { lineStyle: { color: CHART_COLORS.grid } },
  axisTick: { show: false },
  axisLabel: { color: CHART_COLORS.muted, fontSize: 11 },
  splitLine: { show: false },
} as const;

const baseValueAxisOptions = {
  axisLine: { show: false },
  axisTick: { show: false },
  axisLabel: { color: CHART_COLORS.muted, fontSize: 11 },
  splitLine: { lineStyle: { color: CHART_COLORS.grid, type: 'dashed' } },
} as const;

const baseTooltipOptions = {
  trigger: 'axis',
  backgroundColor: 'var(--app-surface)',
  borderColor: 'var(--app-border-soft)',
  borderWidth: 1,
  borderRadius: 10,
  extraCssText: 'box-shadow: 0 16px 40px var(--app-border-soft);',
  textStyle: {
    color: CHART_COLORS.muted,
    fontSize: 12,
  },
} as const;

const pmComplianceOptions: EChartsOption = {
  animation: true,
  animationDuration: 900,
  animationEasing: 'cubicOut',
  color: [CHART_COLORS.blue],
  grid: {
    left: 12,
    right: 18,
    top: 18,
    bottom: 12,
    containLabel: true,
  },
  tooltip: {
    ...baseTooltipOptions,
    valueFormatter: (value) => `${value}%`,
  },
  xAxis: {
    ...baseAxisOptions,
    type: 'category',
    boundaryGap: false,
    data: months,
  },
  yAxis: {
    ...baseValueAxisOptions,
    type: 'value',
    min: 0,
    max: 100,
  },
  series: [
    {
      name: 'Cumplimiento PM',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 7,
      data: pmComplianceValues,
      lineStyle: { color: CHART_COLORS.blue, width: 3 },
      itemStyle: { color: CHART_COLORS.blue },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: CHART_COLORS.blue },
            { offset: 1, color: CHART_COLORS.grid },
          ],
        },
      },
    },
  ],
};

const downtimeOptions: EChartsOption = {
  animation: true,
  animationDuration: 900,
  animationEasing: 'cubicOut',
  color: [CHART_COLORS.danger],
  grid: {
    left: 8,
    right: 10,
    top: 18,
    bottom: 8,
    containLabel: true,
  },
  tooltip: {
    ...baseTooltipOptions,
    valueFormatter: (value) => `${value}h`,
  },
  xAxis: {
    ...baseAxisOptions,
    type: 'category',
    data: months,
  },
  yAxis: {
    ...baseValueAxisOptions,
    type: 'value',
  },
  series: [
    {
      name: 'Horas de paro',
      type: 'bar',
      barWidth: '48%',
      data: downtimeValues,
      itemStyle: {
        color: CHART_COLORS.danger,
        borderRadius: [6, 6, 0, 0],
      },
    },
  ],
};

interface ChartCardProps {
  title: string;
  metric: string;
  note: string;
  options: EChartsOption;
  chartHeight: number;
}

function ChartCard({
  title,
  metric,
  note,
  options,
  chartHeight,
}: ChartCardProps) {
  return (
    <article className='border-app-border-soft bg-app-surface min-w-0 rounded-3xl border p-4 shadow-sm sm:p-5'>
      <div className='mb-3 flex items-start justify-between gap-4'>
        <div>
          <h3 className='text-app-text-primary text-sm font-semibold'>
            {title}
          </h3>
          <p className='text-app-text-secondary mt-1 text-xs'>{note}</p>
        </div>
        <span className='bg-app-brand-soft text-app-text-primary rounded-full px-3 py-1 text-sm font-semibold'>
          {metric}
        </span>
      </div>
      <ReactECharts
        option={options}
        notMerge
        lazyUpdate
        style={{ height: `${chartHeight}px`, width: '100%' }}
      />
    </article>
  );
}

export default function OperationalInsightsSection() {
  return (
    <section
      id='operational-insights'
      className='bg-app-section-clean scroll-mt-24'
    >
      <div className='container py-24'>
        <ScrollReveal className='mx-auto mb-12 max-w-3xl space-y-4 text-center'>
          <p className='bg-app-brand-soft text-app-text-primary inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-[0.2em] uppercase'>
            Dashboard ejecutivo · Datos demo
          </p>
          <h2 className='text-app-text-primary text-3xl leading-tight font-semibold md:text-4xl'>
            Salud operativa de planta
          </h2>
          <p className='text-app-text-secondary text-lg leading-relaxed'>
            PM0 convierte órdenes, preventivos, inspecciones y fallas en
            tableros operativos para supervisión, mantenimiento y dirección de
            planta.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={80}>
          <div className='border-app-border-soft bg-app-surface-subtle min-w-0 rounded-4xl border p-3 shadow-sm sm:p-4 lg:p-5'>
            <div className='border-app-border-soft bg-app-surface overflow-hidden rounded-3xl border shadow-sm'>
              <div className='border-app-border-soft flex flex-col gap-4 border-b p-5 lg:flex-row lg:items-center lg:justify-between'>
                <div>
                  <p className='text-app-text-muted text-xs font-semibold tracking-[0.18em] uppercase'>
                    Dashboard ejecutivo · Datos demo
                  </p>
                  <h3 className='text-app-text-primary mt-2 text-xl font-semibold'>
                    Salud operativa de planta
                  </h3>
                </div>
                <div className='grid w-full grid-cols-2 gap-2 sm:grid-cols-4 lg:w-auto'>
                  {miniKpis.map((kpi) => (
                    <div
                      key={kpi.label}
                      className='border-app-border-soft bg-app-surface-subtle min-w-0 rounded-2xl border px-3 py-2'
                    >
                      <p className='text-app-text-primary text-lg font-semibold'>
                        {kpi.value}
                      </p>
                      <p className='text-app-text-secondary text-xs'>
                        {kpi.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className='grid min-w-0 gap-4 p-4 lg:grid-cols-[1.35fr_0.9fr] lg:p-5'>
                <ChartCard
                  title='Cumplimiento PM últimos 6 meses'
                  metric='68%'
                  note='Meta operativa 90% · tendencia mensual'
                  options={pmComplianceOptions}
                  chartHeight={265}
                />

                <ChartCard
                  title='Horas de paro por mes'
                  metric='7h'
                  note='Paro registrado en marzo'
                  options={downtimeOptions}
                  chartHeight={265}
                />
              </div>

              <div className='px-4 pb-4 lg:px-5 lg:pb-5'>
                <article className='border-app-border-soft bg-app-brand-soft rounded-3xl border p-4 sm:p-5'>
                  <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
                    <div className='max-w-3xl'>
                      <h3 className='text-app-text-primary text-sm font-semibold'>
                        Lectura rápida para supervisión y dirección
                      </h3>
                      <p className='text-app-text-secondary mt-1 text-sm leading-relaxed'>
                        Identifica desviaciones de cumplimiento, paros
                        acumulados y activos con señales de riesgo sin esperar
                        reportes manuales.
                      </p>
                    </div>
                    <div className='flex flex-wrap gap-2'>
                      {insightChips.map((chip) => (
                        <span
                          key={chip}
                          className='border-app-border-soft bg-app-surface text-app-text-primary rounded-full border px-3 py-1 text-xs font-semibold'
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal
          delay={140}
          className='mt-10 flex flex-wrap justify-center gap-3'
        >
          <Link
            href='/recursos/como-funciona'
            className='border-app-border-soft bg-app-surface text-app-text-primary hover:border-app-border-soft hover:bg-app-surface-subtle inline-flex h-11 items-center justify-center rounded-lg border px-5 text-sm font-semibold transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out outline-none active:translate-y-px'
          >
            Ver cómo funciona PM0
          </Link>
          <Link
            href='/demo'
            className='bg-app-brand text-app-text-primary hover:bg-app-brand-soft inline-flex h-11 items-center justify-center rounded-lg px-5 text-sm font-semibold shadow-sm transition-[background-color,box-shadow,transform] duration-200 ease-out outline-none active:translate-y-px'
          >
            Solicitar demo
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
