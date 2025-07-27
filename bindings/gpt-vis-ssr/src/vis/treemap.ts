import { type TreemapProps } from '@antv/gpt-vis/dist/esm/Treemap';
import { createChart } from '@yaonyan/g2-ssr';
import { THEME_MAP } from '../theme';
import { FontFamily } from '../types';
import { CommonOptions } from './types';

type TreemapStyle = {
  texture?: 'rough' | 'default';
};

export type TreemapOptions = CommonOptions &
  TreemapProps & {
    style?: TreemapStyle;
  };

export async function Treemap(options: TreemapOptions) {
  const {
    data,
    title,
    width = 600,
    height = 400,
    theme = 'default',
    renderPlugins,
    style = {},
  } = options;
  const { texture = 'default' } = style;

  return await createChart({
    devicePixelRatio: 3,
    type: 'treemap',
    theme: THEME_MAP[theme],
    width,
    height,
    title,
    data: {
      type: 'inline',
      value: {
        name: 'root',
        children: data,
      },
    },
    layout: {
      tile: 'treemapBinary',
      paddingInner: 2,
    },
    encode: { value: 'value' },
    style: {
      fillOpacity: 0.8,
      labelFontSize: 10,
      ...(texture === 'rough' ? { labelFontFamily: FontFamily.ROUGH } : {}),
    },
    tooltip: false,
    legend: false,
    animate: false,
    renderPlugins,
  });
}
