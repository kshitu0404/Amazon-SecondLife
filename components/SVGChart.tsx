'use client';

import React, { useState } from 'react';

interface DataPoint {
  label: string;
  value: number;
  secondaryLabel?: string;
}

interface SVGChartProps {
  type: 'line' | 'bar' | 'donut';
  data: DataPoint[];
  color?: string; // Tailwind tint e.g. 'emerald', 'amber', 'sky'
  title?: string;
  valueSuffix?: string;
}

export default function SVGChart({
  type,
  data,
  color = 'emerald',
  title,
  valueSuffix = '',
}: SVGChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Theme settings
  const colorMap = {
    emerald: {
      stroke: '#10b981',
      fill: 'url(#gradient-emerald)',
      bg: 'bg-emerald-500',
      text: 'text-emerald-500',
      rawFill: '#10b981',
    },
    amber: {
      stroke: '#f59e0b',
      fill: 'url(#gradient-amber)',
      bg: 'bg-amber-500',
      text: 'text-amber-500',
      rawFill: '#f59e0b',
    },
    sky: {
      stroke: '#0ea5e9',
      fill: 'url(#gradient-sky)',
      bg: 'bg-sky-500',
      text: 'text-sky-500',
      rawFill: '#0ea5e9',
    },
    indigo: {
      stroke: '#6366f1',
      fill: 'url(#gradient-indigo)',
      bg: 'bg-indigo-500',
      text: 'text-indigo-500',
      rawFill: '#6366f1',
    },
  };

  const activeColor = colorMap[color as keyof typeof colorMap] || colorMap.emerald;

  // Chart measurements for Line/Bar
  const width = 600;
  const height = 250;
  const paddingLeft = 50;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const values = data.map((d) => d.value);
  const maxValue = Math.max(...values, 1) * 1.1; // 10% padding on top
  const minValue = 0;

  // Helper: map data coordinate to SVG coordinate
  const getX = (index: number) => {
    return paddingLeft + (index / (data.length - 1 || 1)) * chartWidth;
  };
  const getY = (val: number) => {
    return paddingTop + chartHeight - ((val - minValue) / (maxValue - minValue)) * chartHeight;
  };

  // Render Line/Area Chart
  const renderLineChart = () => {
    if (data.length === 0) return null;

    // Generate Path points
    const points = data.map((d, i) => `${getX(i)},${getY(d.value)}`);
    const pathD = `M ${points.join(' L ')}`;

    // Area path closed to bottom
    const areaD = `${pathD} L ${getX(data.length - 1)},${paddingTop + chartHeight} L ${getX(0)},${paddingTop + chartHeight} Z`;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full select-none overflow-visible">
        <defs>
          <linearGradient id="gradient-emerald" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="gradient-amber" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="gradient-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="gradient-indigo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const val = maxValue * ratio;
          const y = getY(val);
          return (
            <g key={i} className="opacity-25">
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="#94a3b8"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <text
                x={paddingLeft - 8}
                y={y + 4}
                className="text-[10px] fill-slate-400 font-medium text-right"
                textAnchor="end"
              >
                {Math.round(val).toLocaleString()}
              </text>
            </g>
          );
        })}

        {/* Area Fill */}
        <path d={areaD} fill={activeColor.fill} className="transition-all duration-700 ease-out" />

        {/* Line Stroke */}
        <path
          d={pathD}
          fill="none"
          stroke={activeColor.stroke}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-700 ease-out"
        />

        {/* Interaction zones / Points */}
        {data.map((d, i) => {
          const cx = getX(i);
          const cy = getY(d.value);
          const isHovered = hoveredIndex === i;

          return (
            <g
              key={i}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="cursor-pointer"
            >
              {/* Invisible touch target */}
              <circle cx={cx} cy={cy} r={20} fill="transparent" />

              {/* Visible dot */}
              <circle
                cx={cx}
                cy={cy}
                r={isHovered ? 6 : 4}
                fill={isHovered ? activeColor.stroke : '#ffffff'}
                stroke={activeColor.stroke}
                strokeWidth={isHovered ? 3 : 2}
                className="transition-all duration-150"
              />

              {/* X Axis labels */}
              {i % Math.ceil(data.length / 6) === 0 && (
                <text
                  x={cx}
                  y={height - 15}
                  className="text-[10px] fill-slate-400 font-medium"
                  textAnchor="middle"
                >
                  {d.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  // Render Bar Chart
  const renderBarChart = () => {
    const barWidth = Math.min(45, (chartWidth / data.length) * 0.6);
    const spacing = (chartWidth - barWidth * data.length) / (data.length - 1 || 1);

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full select-none overflow-visible">
        {/* Gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const val = maxValue * ratio;
          const y = getY(val);
          return (
            <g key={i} className="opacity-25">
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="#94a3b8"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <text
                x={paddingLeft - 8}
                y={y + 4}
                className="text-[10px] fill-slate-400 font-medium text-right"
                textAnchor="end"
              >
                {Math.round(val).toLocaleString()}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const x = paddingLeft + i * (barWidth + spacing);
          const y = getY(d.value);
          const barHeight = chartHeight + paddingTop - y;
          const isHovered = hoveredIndex === i;

          return (
            <g
              key={i}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="cursor-pointer"
            >
              {/* Bar Rect with rounded top */}
              <path
                d={`
                  M ${x},${y + 4}
                  Q ${x},${y} ${x + 4},${y}
                  L ${x + barWidth - 4},${y}
                  Q ${x + barWidth},${y} ${x + barWidth},${y + 4}
                  L ${x + barWidth},${paddingTop + chartHeight}
                  L ${x},${paddingTop + chartHeight}
                  Z
                `}
                fill={isHovered ? activeColor.stroke : `${activeColor.rawFill}cc`}
                className="transition-all duration-200"
              />

              {/* Label */}
              <text
                x={x + barWidth / 2}
                y={height - 15}
                className="text-[10px] fill-slate-400 font-medium"
                textAnchor="middle"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  // Render Donut Chart
  const renderDonutChart = () => {
    let total = data.reduce((acc, curr) => acc + curr.value, 0);
    if (total === 0) total = 1;

    let accumulatedAngle = 0;
    const donutRadius = 60;
    const strokeWidth = 24;
    const center = 100;
    const circumference = 2 * Math.PI * donutRadius;

    // A list of colors for the segments
    const segmentColors = [
      '#10b981', // emerald
      '#f59e0b', // amber
      '#3b82f6', // blue
      '#6366f1', // indigo
      '#ec4899', // pink
      '#8b5cf6', // purple
    ];

    return (
      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
        <div className="relative w-44 h-44">
          <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
            {data.map((d, i) => {
              const percentage = d.value / total;
              const strokeLength = percentage * circumference;
              const strokeOffset = circumference - accumulatedAngle;
              accumulatedAngle += strokeLength;

              const isHovered = hoveredIndex === i;

              return (
                <circle
                  key={i}
                  cx={center}
                  cy={center}
                  r={donutRadius}
                  fill="transparent"
                  stroke={segmentColors[i % segmentColors.length]}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={`${strokeLength} ${circumference}`}
                  strokeDashoffset={strokeOffset}
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              );
            })}
            {/* Center label */}
            <g className="rotate-90 origin-center text-center">
              <text
                x={center}
                y={center - 4}
                className="text-xs fill-slate-400 font-semibold text-center"
                textAnchor="middle"
              >
                {hoveredIndex !== null ? data[hoveredIndex].label : 'Total'}
              </text>
              <text
                x={center}
                y={center + 16}
                className="text-lg font-bold fill-slate-800 font-sans"
                textAnchor="middle"
              >
                {hoveredIndex !== null
                  ? `${Math.round((data[hoveredIndex].value / total) * 100)}%`
                  : `${Math.round(total)}${valueSuffix}`}
              </text>
            </g>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2">
          {data.map((d, i) => {
            const isHovered = hoveredIndex === i;
            return (
              <div
                key={i}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md transition duration-150 cursor-pointer ${
                  isHovered ? 'bg-slate-100 scale-105' : 'hover:bg-slate-50'
                }`}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div
                  className="w-3.5 h-3.5 rounded-full"
                  style={{ backgroundColor: segmentColors[i % segmentColors.length] }}
                />
                <div className="flex flex-col text-left leading-none">
                  <span className="text-xs font-semibold text-slate-700">{d.label}</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    {d.value} {valueSuffix} ({Math.round((d.value / total) * 100)}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition duration-200 flex flex-col h-full relative">
      {title && <h3 className="text-slate-800 text-sm font-bold mb-4">{title}</h3>}

      <div className="relative flex-grow min-h-[180px] flex items-center justify-center">
        {type === 'line' && renderLineChart()}
        {type === 'bar' && renderBarChart()}
        {type === 'donut' && renderDonutChart()}

        {/* Tooltip for Line/Bar Chart */}
        {type !== 'donut' && hoveredIndex !== null && data[hoveredIndex] && (
          <div
            className="absolute bg-slate-900/90 text-white rounded-lg p-2.5 text-xs shadow-lg border border-slate-800 backdrop-blur-sm pointer-events-none transition duration-150 flex flex-col gap-0.5"
            style={{
              left: `${Math.min(
                width - 120,
                Math.max(50, getX(hoveredIndex) * (width / 600) - 50)
              )}px`,
              top: `${Math.max(10, getY(data[hoveredIndex].value) * (height / 250) - 60)}px`,
            }}
          >
            <span className="text-slate-400 font-medium">{data[hoveredIndex].label}</span>
            <span className="font-bold text-white">
              {data[hoveredIndex].value.toLocaleString()} {valueSuffix}
            </span>
            {data[hoveredIndex].secondaryLabel && (
              <span className="text-[10px] text-amber-400 mt-0.5">
                {data[hoveredIndex].secondaryLabel}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
