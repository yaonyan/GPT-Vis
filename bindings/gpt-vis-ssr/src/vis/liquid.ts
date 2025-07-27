import { createChart } from '@yaonyan/g2-ssr';
import { THEME_MAP } from '../theme';
import { FontFamily } from '../types';
import { getTitle } from '../util';
import { CommonOptions } from './types';

type LiquidStyle = {
  texture?: 'rough' | 'default';
};

export type LiquidOptions = CommonOptions & {
  /**
   * Title of the liquid chart.
   */
  title?: string;
  /**
   * The percentage value to display in the liquid chart.
   * This should be a number between 0 and 1, where 1 represents 100%.
   * For example, 0.75 represents 75%.
   */
  percent: number;
  /**
   * Shape of the liquid chart.
   * Options are 'rect', 'circle', 'pin', or 'triangle'.
   */
  shape?: 'rect' | 'circle' | 'pin' | 'triangle';
  /**
   * The custom style for the liquid chart.
   */
  style?: LiquidStyle;
};

export async function Liquid(options: LiquidOptions) {
  const {
    percent,
    title,
    width = 600,
    height = 400,
    theme = 'default',
    shape = 'circle',
    renderPlugins,
    style = {},
  } = options;
  const { texture = 'default' } = style;

  const inferFontSize = Math.min(width, height) / 10;
  const fontSize = Math.min(Math.max(inferFontSize, 24), 64); // Ensure font size is between 16 and 64

  return await createChart({
    devicePixelRatio: 3,
    type: 'liquid',
    theme: THEME_MAP[theme],
    title: getTitle(title, texture),
    width,
    height,
    data: percent,
    style: {
      shape,
      contentFontSize: fontSize,
      contentFill: '#000',
      contentStroke: '#fff',
      contentLineWidth: 2,
      outlineBorder: 4,
      outlineDistance: 4,
      waveLength: 128,
      ...(texture === 'rough' ? { lineWidth: 1, contentFontFamily: FontFamily.ROUGH } : {}),
    },
    animate: false,
    renderPlugins,
  });
}
