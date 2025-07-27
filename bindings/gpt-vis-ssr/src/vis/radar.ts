import { type RadarProps } from '@antv/gpt-vis/dist/esm/Radar';
import { createChart } from '@yaonyan/g2-ssr';
import { THEME_MAP } from '../theme';
import { FontFamily } from '../types';
import { getTitle, groupBy } from '../util';
import { CommonOptions } from './types';

type RadarStyle = {
  backgroundColor?: string;
  palette?: string[];
  texture?: 'rough' | 'default';
};

export type RadarOptions = CommonOptions &
  RadarProps & {
    style?: RadarStyle;
  };

/**
 * Transform data:
  [
    { group: 'London', name: 'Jan.', value: 18.9 },
    { group: 'London', name: 'Feb.', value: 28.8 },
    { group: 'London', name: 'Mar.', value: 39.3 },
    { group: 'London', name: 'Apr.', value: 81.4 },
    { group: 'London', name: 'May', value: 47 },
    { group: 'London', name: 'Jun.', value: 20.3 },
    { group: 'London', name: 'Jul.', value: 24 },
    { group: 'London', name: 'Aug.', value: 35.6 },
    { group: 'Berlin', name: 'Jan.', value: 12.4 },
    { group: 'Berlin', name: 'Feb.', value: 23.2 },
    { group: 'Berlin', name: 'Mar.', value: 34.5 },
    { group: 'Berlin', name: 'Apr.', value: 99.7 },
    { group: 'Berlin', name: 'May', value: 52.6 },
    { group: 'Berlin', name: 'Jun.', value: 35.5 },
    { group: 'Berlin', name: 'Jul.', value: 37.4 },
    { group: 'Berlin', name: 'Aug.', value: 42.4 },
  ];
 * to
  [
    { name: 'London', data: [ { name: 'Jan.', value: 18.9 }, ... ] },
    { name: 'Berlin', data: [ { name: 'Jan.', value: 12.4 }, ... ] },
  ]
 */
function transformRadartoParallel(data: any[]) {
  if (!data || data.length === 0) {
    return [];
  }

  const groups = groupBy(data, (d) => d.group || '');

  return Object.entries(groups).map(([group, values]) => {
    const paralleValues = ((values || []) as any[]).reduce((acc, { name, value }) => {
      acc[name] = value;
      return acc;
    }, {});
    return {
      ...paralleValues,
      group,
    };
  });
}

export async function Radar(options: RadarOptions) {
  const {
    data,
    title,
    width = 600,
    height = 400,
    theme = 'default',
    renderPlugins,
    style = {},
  } = options;

  const parallelData = transformRadartoParallel(data);
  const position = Object.keys(parallelData[0] || {}).filter((key) => key !== 'group');
  const { backgroundColor, palette, texture = 'default' } = style;

  return await createChart({
    devicePixelRatio: 3,
    title: getTitle(title, texture),
    theme: THEME_MAP[theme],
    width,
    height,
    inset: 18,
    type: 'line',
    data: parallelData,
    coordinate: { type: 'radar' },
    encode: {
      position,
      color: 'group',
    },
    style: {
      lineWidth: 2,
      lineCap: 'round',
      lineJoin: 'round',
      ...(texture === 'rough' ? { lineWidth: 0.5 } : {}),
    },
    ...(backgroundColor ? { viewStyle: { viewFill: backgroundColor } } : {}),
    legend: {
      color: parallelData.length > 1 ? { itemMarker: 'point' } : false,
      ...(texture === 'rough' ? { itemLabelFontFamily: FontFamily.ROUGH } : {}),
    },
    scale: {
      ...Object.fromEntries(
        Array.from({ length: position.length }, (_, i) => [
          `position${i === 0 ? '' : i}`,
          {
            domainMin: 0,
            nice: true,
          },
        ]),
      ),
      ...(palette?.[0]
        ? {
            color: {
              range: palette,
            },
          }
        : {}),
    },
    axis: Object.fromEntries(
      Array.from({ length: position.length }, (_, i) => {
        return [
          `position${i === 0 ? '' : i}`,
          {
            zIndex: 1,
            titleFontSize: 10,
            titleSpacing: 8,
            label: true,
            labelFill: '#000',
            labelOpacity: 0.45,
            labelFontSize: 10,
            line: true,
            lineFill: '#000',
            lineStrokeOpacity: 0.25,
            tickFilter: (_: string, idx: number) => {
              return !(i !== 0 && idx === 0);
            },
            tickCount: 4,
            gridStrokeOpacity: 0.45,
            gridStroke: '#000',
            gridLineWidth: 1,
            gridLineDash: [4, 4],
            ...(texture === 'rough'
              ? { titleFontFamily: FontFamily.ROUGH, labelFontFamily: FontFamily.ROUGH }
              : {}),
          },
        ];
      }),
    ),
    interaction: { tooltip: false },
    renderPlugins,
    // TODO: area and point area not supported in radar chart yet
    // children: [
    //   {
    //     type: 'area',
    //     style: { fillOpacity: 0.4 },
    //   },
    //   {
    //     type: 'line',
    //     style: { lineWidth: 2 },
    //   },
    //   {
    //     type: 'point',
    //     encode: { shape: 'point' },
    //     style: { fill: 'white', lineWidth: 1 },
    //   },
    // ],
  });
}
