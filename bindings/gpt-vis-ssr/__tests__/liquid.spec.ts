import { render } from '../src';
import './utils/matcher';

describe('SSR render', () => {
  it('liquid', async () => {
    const vis = await render({
      width: 600,
      height: 400,
      type: 'liquid',
      percent: 0.725,
      title: 'Liquid Chart Example',
    });

    expect(vis.toBuffer()).toImageEqual('__tests__/snapshot', 'liquid');
  });

  it('liquid-rough', async () => {
    const vis = await render({
      width: 600,
      height: 400,
      type: 'liquid',
      percent: 0.725,
      title: 'Liquid Chart Example',
      texture: 'rough',
    });

    expect(vis.toBuffer()).toImageEqual('__tests__/snapshot', 'liquid-rough');
  });

  it('liquid academy', async () => {
    const vis = await render({
      width: 600,
      height: 400,
      type: 'liquid',
      percent: 0.725,
      theme: 'academy',
      title: 'Liquid Chart Example',
    });

    expect(vis.toBuffer()).toImageEqual('__tests__/snapshot', 'liquid academy');
  });
});
