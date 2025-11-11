import { useDark, useToggle } from '@vueuse/core';
import { defineStore } from 'pinia';

const isDark = useDark();
const toggleDark = useToggle(isDark);

const useSettingsStore = defineStore('settings', {
  state: () => ({
    title: '',
    theme: '#409EFF',
    isDark: isDark.value,
  }),
  actions: {
    // 切换暗黑模式
    toggleTheme() {
      this.isDark = !this.isDark;
      toggleDark();
    },
  },
});

export default useSettingsStore;
