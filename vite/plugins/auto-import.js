import AutoImport from 'unplugin-auto-import/vite';

export default function createAutoImport() {
  return AutoImport({
    // 自动导入的库
    imports: [
      'vue', // ref, reactive, computed, watch, onMounted...
      'vue-router', // useRouter, useRoute
      'pinia', // defineStore, storeToRefs
    ],

    // 生成 TypeScript 类型声明文件（可选）
    // dts: 'src/auto-imports.d.ts',

    // 自动在模板中也可用（Vue 3.3+ 支持）
    vueTemplate: true,

    // 可以指定 eslint globals，让 ESLint 不报未定义
    eslintrc: {
      enabled: true,
      filepath: './.eslintrc-auto-import.json',
      globalsPropValue: 'readonly', // 对应你 eslint.config.js 的 readonly 风格
    },

    // 可选：自定义导入
    //例如：
    // imports: [
    //   { 'lodash': ['debounce'] }  // debounce 直接可用
    // ]
  });
}
