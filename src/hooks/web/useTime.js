import { ref, onMounted, onUnmounted } from 'vue';
import dayjs from 'dayjs';

/**
 * useTime - 显示当前时间
 * @param {String} format - dayjs 格式化字符串，默认 'HH:mm:ss'
 */
export function useTime(format = 'HH:mm:ss') {
  const currentTime = ref(dayjs().format(format));
  let timer = null;

  const update = () => {
    currentTime.value = dayjs().format(format);
  };

  onMounted(() => {
    update();
    timer = setInterval(update, 1000);
  });

  onUnmounted(() => {
    if (timer) clearInterval(timer);
  });

  return { currentTime };
}
