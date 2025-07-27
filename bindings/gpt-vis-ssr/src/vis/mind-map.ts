import { type MindMapProps } from '@antv/gpt-vis/dist/esm/MindMap';
import type { CanvasRenderingContext2D } from '@napi-rs/canvas';
import { createCanvas } from '@napi-rs/canvas';
import { createGraph, G6 } from '@yaonyan/g6-ssr';
import { G6THEME_MAP } from '../theme';
import { FontFamily } from '../types';
import { MindmapNode } from '../util';
import { CommonOptions } from './types';

const { register, idOf, positionOf, ExtensionCategory, treeToGraphData: treeToGraphDataG6 } = G6;
register(ExtensionCategory.NODE, 'mindmap', MindmapNode);
// max width of node to display 10 words with font size 12
const MAX_WIDTH = 160;

type MindMapStyle = {
  texture?: 'rough' | 'default';
};

export type MindMapOptions = CommonOptions &
  MindMapProps & {
    style?: MindMapStyle;
  };

let canvas: ReturnType<typeof createCanvas> | null = null;
let ctx: CanvasRenderingContext2D | null = null;

type TextStyle = {
  text: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
};

const measureText = (style: TextStyle): number => {
  if (!canvas) {
    // @ts-expect-error -
    canvas = createCanvas(0, 0);
    ctx = canvas?.getContext('2d')!;
  }

  const font = [
    style.fontStyle || 'normal',
    style.fontWeight || 'normal',
    `${style.fontSize || 12}px`,
    style.fontFamily || 'sans-serif',
  ].join(' ');

  ctx!.font = font;
  const width = ctx!.measureText(style.text).width;
  return width > MAX_WIDTH ? MAX_WIDTH : width;
};

const RootNodeStyle = {
  fill: '#EFF0F0',
  labelFill: '#262626',
  labelFontSize: 24,
  labelFontWeight: 600,
  labelOffsetY: 8,
  labelPlacement: 'center',
  ports: [{ placement: 'right' }, { placement: 'left' }],
  radius: 8,
};

const NodeStyle = {
  fill: 'transparent',
  labelPlacement: 'center',
  labelFontSize: 16,
  ports: [{ placement: 'right-bottom' }, { placement: 'left-bottom' }],
};

const getNodeWidth = (nodeId: any, isRoot: boolean) => {
  const padding = isRoot ? 40 : 30;
  const nodeStyle = isRoot ? RootNodeStyle : NodeStyle;
  return (
    measureText({ text: nodeId, fontSize: nodeStyle.labelFontSize, fontFamily: 'Gill Sans' }) +
    padding
  );
};

const getNodeSize = (nodeId: string, isRoot: boolean) => {
  const width = getNodeWidth(nodeId, isRoot);
  const height = isRoot ? 36 : 32;
  return [width, height] as const;
};

const getNodeSide = (nodeData: any, parentData: any) => {
  if (!parentData) return 'center';

  const nodePositionX = positionOf(nodeData)[0];
  const parentPositionX = positionOf(parentData)[0];
  return parentPositionX > nodePositionX ? 'left' : 'right';
};

/**
 * Converts a tree structure to a graph data format suitable for G6 visualization.
 * The function transforms each node in the tree to a graph node and each parent-child relationship to a graph edge.
 * @param data
 * @returns
 */
export function treeToGraphData(data: any) {
  return treeToGraphDataG6(data, {
    getNodeData: (datum: any, depth: any) => {
      datum.id = datum.name;
      datum.depth = depth;
      if (!datum.children) return datum;
      const { children, ...restDatum } = datum;
      return {
        ...restDatum,
        children: children.map((child: any) => child.name),
      };
    },
    getEdgeData: (source, target) => ({
      source: source.name,
      target: target.name,
    }),
  });
}

export async function MindMap(options: MindMapOptions) {
  const { data, width = 600, height = 400, theme = 'default', renderPlugins, style = {} } = options;
  const { texture = 'default' } = style;

  const dataParse = treeToGraphData(data);
  const rootId = data.name;

  return await createGraph({
    waitForRender: 300,
    width,
    height,
    data: dataParse,
    devicePixelRatio: 3,
    padding: 24,
    autoFit: {
      type: 'view',
    },
    node: {
      type: 'mindmap',
      // @ts-ignore
      style: function (d) {
        const direction = getNodeSide(d, this.getParentData(idOf(d), 'tree'));
        const isRoot = idOf(d) === rootId;
        const depth = d.depth;

        return {
          direction,
          labelText: idOf(d),
          size: getNodeSize(idOf(d), isRoot),
          labelFontFamily: 'Gill Sans',
          lineWidth: texture === 'rough' ? 0.5 : 2,
          radius: 8,
          stroke: depth === 0 ? '#f1f4f5' : d.style?.color,
          labelBackground: true,
          labelBackgroundFill: 'transparent',
          labelPadding: direction === 'left' ? [2, 0, 10, 40] : [2, 40, 10, 0],
          ...(isRoot ? RootNodeStyle : NodeStyle),
          fill: depth === 0 ? '#f1f4f5' : depth === 1 ? d.style?.color : 'transparent',
          labelFill:
            texture === 'rough'
              ? '#262626'
              : depth === 0
                ? '#262626'
                : depth === 1
                  ? '#FFF'
                  : d.style?.color,
          ports: [{ placement: 'left' }, { placement: 'right' }],
          labelMaxWidth: MAX_WIDTH + 20,
          labelTextOverflow: 'ellipsis',
          labelWordWrap: true,
          labelMaxLines: 1,
          ...(texture === 'rough' ? { labelFontFamily: FontFamily.ROUGH } : {}),
        };
      },
    },
    edge: {
      type: 'cubic-horizontal',
      style: {
        lineWidth: 1.5,
        // @ts-ignore
        stroke: function (data: any) {
          // @ts-ignore
          return this.getNodeData(data.target).depth > 1
            ? // @ts-ignore
              this.getNodeData(data.target).style.color
            : '#99ADD1';
        },
        ...(texture === 'rough' ? { labelFontFamily: FontFamily.ROUGH } : {}),
      },
    },
    layout: {
      type: 'mindmap',
      direction: 'H',
      getHeight: () => 30,
      getWidth: (node: any) => getNodeWidth(node.id, node.id === rootId),
      getVGap: () => 14,
      getHGap: () => 64,
      animation: false,
    },
    transforms: [G6THEME_MAP[theme]],
    animation: false,
    renderPlugins,
  });
}
