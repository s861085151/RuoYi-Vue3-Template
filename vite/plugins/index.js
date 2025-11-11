import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import tailwindcss from '@tailwindcss/vite';

import createAutoImport from './auto-import';
import createSvgIcon, { svgPreviewPlugin } from './svg-icon';
import createCompression from './compression';
import createSetupExtend from './setup-extend';

export default function createVitePlugins(viteEnv, isBuild = false) {
  const vitePlugins = [vue(), vueJsx(), tailwindcss()];
  vitePlugins.push(createAutoImport());
  vitePlugins.push(createSetupExtend());
  vitePlugins.push(createSvgIcon(isBuild));
  vitePlugins.push(svgPreviewPlugin(viteEnv));

  isBuild && vitePlugins.push(...createCompression(viteEnv));
  return vitePlugins;
}
