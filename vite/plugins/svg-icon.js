import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';
import path from 'path';
import fs from 'fs';

const iconDirs = [path.resolve(process.cwd(), 'src/assets/icons/svg')];

export default function createSvgIcon(isBuild) {
  return createSvgIconsPlugin({
    iconDirs: iconDirs,
    symbolId: 'icon-[dir]-[name]',
    svgoOptions: isBuild,
  });
}

const output = 'public/svg-icons/index.html';

export function svgPreviewPlugin(viteEnv) {
  return {
    name: 'vite-plugin-svg-preview',
    enforce: 'post',

    async buildStart() {
      await generateHtml();
    },

    async handleHotUpdate(ctx) {
      if (ctx.file.endsWith('.svg') && iconDirs.some(dir => ctx.file.startsWith(dir))) {
        await generateHtml();
      }
    },
  };

  async function generateHtml() {
    const files = iconDirs.flatMap(dir =>
      fs.existsSync(dir)
        ? fs
            .readdirSync(dir)
            .filter(f => f.endsWith('.svg'))
            .map(f => ({ dir, file: f }))
        : [],
    );

    if (!files.length) return;

    // 生成 <symbol>
    let symbols = '';
    files.forEach(({ dir, file }) => {
      const name = file.replace('.svg', '');
      let content = fs.readFileSync(path.join(dir, file), 'utf-8');

      let viewBoxMatch = content.match(/viewBox="([^"]+)"/);
      let widthMatch = content.match(/width="([\d.]+)"/);
      let heightMatch = content.match(/height="([\d.]+)"/);
      let viewBox = viewBoxMatch
        ? viewBoxMatch[1]
        : widthMatch && heightMatch
          ? `0 0 ${widthMatch[1]} ${heightMatch[1]}`
          : '0 0 1024 1024';

      // 提取 <svg> 内部内容
      const inner = content.replace(/<svg[^>]*>/, '').replace(/<\/svg>/, '');

      symbols += `<symbol id="icon-${name}" viewBox="${viewBox}">${inner}</symbol>\n`;
    });

    // 生成 HTML
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>SVG Icon Preview</title>
<style>
body { font-family: sans-serif; padding: 20px; }
.icon { display: inline-flex; flex-direction: column; align-items: center; margin: 10px; width: 200px; }
svg { width: 48px; height: 48px; fill: currentColor; }
</style>
</head>
<body>
<h1>SVG Icons Preview</h1>

<!-- Sprite -->
<svg id="__svg__icons__dom__" xmlns="http://www.w3.org/2000/svg" xmlns:link="http://www.w3.org/1999/xlink" style="display:none">
${symbols}
</svg>

<!-- 预览 -->
<div style="display:flex; flex-wrap: wrap;">
${files
  .map(({ file }) => {
    const name = file.replace('.svg', '');
    return `<div class="icon">
      <svg><use xlink:href="#icon-${name}"></use></svg>
      <span>icon-${name}</span>
    </div>`;
  })
  .join('')}
</div>

</body>
</html>
`;

    // 写入文件
    const outDir = path.dirname(output);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(output, html, 'utf-8');
    console.log(`✅ SVG preview generated: ${output}`);
    console.log(`✅ SVG preview path: http://localhost:${viteEnv.VITE_PORT}/svg-icons/index.html`);
  }
}
