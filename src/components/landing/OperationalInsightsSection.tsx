'use client';

import type { EChartsOption } from 'echarts';
import dynamic from 'next/dynamic';

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

interface InsightPanelProps {
  eyebrow: string;
  title: string;
  description: string;
  bullets: readonly string[];
  microdata: string;
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

function InsightPanel({
  eyebrow,
  title,
  description,
  bullets,
  microdata,
}: InsightPanelProps) {
  return (
    <article className='border-app-border-soft bg-app-surface-subtle flex h-full min-w-0 flex-col justify-between rounded-3xl border p-5 sm:p-6'>
      <div>
        <p className='text-app-text-muted text-xs font-semibold tracking-[0.18em] uppercase'>
          {eyebrow}
        </p>
        <h3 className='text-app-text-primary mt-3 text-2xl leading-tight font-semibold'>
          {title}
        </h3>
        <p className='text-app-text-secondary mt-4 text-sm leading-relaxed'>
          {description}
        </p>
        <ul className='mt-5 space-y-3'>
          {bullets.map((bullet) => (
            <li key={bullet} className='flex gap-3 text-sm text-app-text-primary'>
              <span className='bg-app-brand mt-2 size-1.5 shrink-0 rounded-full' />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>
      <p className='border-app-border-soft text-app-text-primary mt-6 rounded-2xl border bg-app-surface px-4 py-3 text-sm font-semibold'>
        {microdata}
      </p>
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
            Vista ejecutiva · Datos demo
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
                    Vista ejecutiva · Datos demo
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

              <div className='grid min-w-0 gap-4 p-4 lg:grid-cols-[1.2fr_0.95fr] lg:p-5'>
                <ChartCard
                  title='Cumplimiento PM últimos 6 meses'
                  metric='68%'
                  note='Meta operativa: 90% · tendencia mensual'
                  options={pmComplianceOptions}
                  chartHeight={265}
                />

                <InsightPanel
                  eyebrow='Cumplimiento PM'
                  title='Cumplimiento preventivo bajo control'
                  description='Visualiza si los planes de mantenimiento preventivo se están ejecutando a tiempo y detecta caídas de cumplimiento antes de que se conviertan en fallas recurrentes o paros no planeados.'
                  bullets={[
                    'Seguimiento mensual del cumplimiento PM',
                    'Detección de desviaciones por activo o área',
                    'Base para ajustar rutinas antes de la falla',
                  ]}
                  microdata='Meta operativa: 90%'
                />
              </div>

              <div className='grid min-w-0 gap-4 px-4 pb-4 lg:grid-cols-[0.95fr_1.2fr] lg:px-5 lg:pb-5'>
                <InsightPanel
                  eyebrow='Horas de paro'
                  title='Paros visibles antes de que se vuelvan costo oculto'
                  description='Convierte las horas de paro en una señal clara para dirección, supervisión y mantenimiento. PM0 ayuda a identificar periodos críticos, activos repetitivos y oportunidades para reducir indisponibilidad.'
                  bullets={[
                    'Horas de paro por mes',
                    'Priorización de activos críticos',
                    'Lectura rápida para decisiones operativas',
                  ]}
                  microdata='7h registradas en marzo'
                />

                <ChartCard
                  title='Horas de paro por mes'
                  metric='7h'
                  note='7h registradas en marzo'
                  options={downtimeOptions}
                  chartHeight={265}
                />
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
