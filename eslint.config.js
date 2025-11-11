// eslint.config.js
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import pluginPrettier from 'eslint-plugin-prettier';
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting';
import autoImportGlobals from './.eslintrc-auto-import.json' with { type: 'json' };

export default defineConfig([
  // ✅ 指定校验范围
  {
    name: 'app/files-to-lint',
    files: ['src/**/*.{js,ts,vue}'],
  },

  // ✅ 忽略不需要检查的文件
  globalIgnores(['**/dist/**', '**/node_modules/**', '**/coverage/**']),

  // ✅ 语言环境
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,

        defineProps: 'readonly',
        defineEmits: 'readonly',
        defineExpose: 'readonly',
        withDefaults: 'readonly',
        ...autoImportGlobals.globals,
      },
    },
  },

  // ✅ JS 基础推荐规则
  js.configs.recommended,

  // ✅ Vue 官方推荐规则（essential/basic/strongly-recommended 可选）
  ...pluginVue.configs['flat/essential'],

  // ✅ 避免与 prettier 冲突
  skipFormatting,

  // ✅ Prettier 插件
  {
    files: ['src/**/*.{js,ts,vue}'],
    plugins: {
      prettier: pluginPrettier,
    },
    rules: {
      'prettier/prettier': 'error',
    },
  },

  // ✅ 自定义规则
  {
    rules: {
      /* 🚀 一般推荐规则 */
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

      /* 🚀 Vue 项目规则 */
      'vue/multi-word-component-names': 'off', // App.vue / index.vue 不再报错
      'vue/no-mutating-props': 'warn', // 修改 props 提示但不报错
      'vue/no-v-html': 'off', // 项目中使用 v-html 不报错
      'vue/require-default-prop': 'off', // props 没有 default 不报错
      'vue/require-explicit-emits': 'off', // emits 不强制显式声明
      'vue/attribute-hyphenation': ['error', 'never'], // template 属性统一 camelCase
      'vue/no-side-effects-in-computed-properties': 'warn', // computed 内有副作用只警告
      'vue/no-dupe-keys': 'warn', // 重复的 prop / data / setup key 只警告
      'vue/valid-define-emits': 'warn', // 验证 emits 声明是否正确
      'no-useless-escape': 'off', // 关闭无用转义报错
      // 'vue/html-indent': ['error', 2],
      // 'vue/script-indent': ['error', 2, { baseIndent: 1 }],
    },
  },
]);
