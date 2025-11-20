import { ref, shallowRef, onUnmounted } from 'vue';
import { debounce, throttle } from 'lodash-es';

/**
 *
 * @param {*} service 执行函数，返回 Promise
 *
 * @param {*} options 配置项
 * @param {boolean} [options.manual=false] 是否手动触发执行，默认自动执行
 * @param {Array} [options.defaultParams=[]] 首次默认执行时，传递给 service 的参数
 * @param {number} [options.loadingDelay=0] 加载延迟时间（毫秒），默认立即加载
 * @param {number} [options.pollingInterval=0] 轮询间隔时间（毫秒），默认不轮询
 * @param {number} [options.pollingErrorRetryCount=0] 轮询错误重试次数，默认不重试
 * @param {number} [options.debounceWait=0] 防抖等待时间（毫秒），默认不防抖
 * @param {number} [options.throttleWait=0] 节流等待时间（毫秒），默认不节流
 * @param {function} [options.onBefore] service 执行前触发
 * @param {function} [options.onSuccess] service resolve 时触发
 * @param {function} [options.onError] service reject 时触发
 * @param {function} [options.onFinally] service 执行完成后触发，无论成功或失败
 *
 * @returns {Object} 包含 data, error, loading, run, refresh, cancel 等属性
 */
export function useRequest(service, options = {}) {
  const {
    manual = false,
    defaultParams = [],

    loadingDelay = 0,

    pollingInterval,
    pollingErrorRetryCount = 0,

    debounceWait,
    throttleWait,

    onBefore,
    onSuccess,
    onError,
    onFinally,
  } = options;

  const loading = ref(false);
  const data = shallowRef(null);
  const error = shallowRef(null);
  const paramsRef = shallowRef(defaultParams);

  let pollingTimer = null;
  let loadingDelayTimer = null;
  let pollingRetryCount = 0;
  let abortFlag = false;

  const beginLoading = () => {
    if (loading.value) return; // 已经 loading
    if (loadingDelay > 0) {
      loadingDelayTimer = setTimeout(() => {
        loading.value = true;
      }, loadingDelay);
    } else {
      loading.value = true;
    }
  };

  const stopLoading = () => {
    clearTimeout(loadingDelayTimer);
    loading.value = false;
  };

  /** 核心执行函数 */
  const _exec = async (...params) => {
    if (abortFlag) return; // 已取消，忽略响应

    onBefore && onBefore(params);

    error.value = null;
    paramsRef.value = params.length ? params : defaultParams;

    beginLoading();
    try {
      const res = await service(...paramsRef.value);

      data.value = res;
      onSuccess && onSuccess(res, paramsRef.value);

      return res;
    } catch (err) {
      error.value = err;
      onError && onError(err, paramsRef.value);

      throw err;
    } finally {
      stopLoading();
      onFinally && onFinally(paramsRef.value, data.value, error.value);
    }
  };

  let runCore = _exec;

  if (debounceWait) {
    runCore = debounce(_exec, debounceWait);
  } else if (throttleWait) {
    runCore = throttle(_exec, throttleWait);
  }

  const startPolling = async () => {
    try {
      await _exec(...paramsRef.value);
      pollingRetryCount = 0; // 成功后重置重试计数
    } catch (err) {
      console.error(`轮询发生错误：`, err);
      pollingRetryCount++;
      if (pollingRetryCount >= pollingErrorRetryCount) {
        console.warn(`轮询达到最大错误重试次数，已停止`);
        return cancel();
      }
    }

    // 等待间隔再下一次轮询
    pollingTimer = setTimeout(startPolling, pollingInterval);
  };

  const run = (...params) => {
    cancel(); // 清理旧轮询
    abortFlag = false; // 重置取消标志

    // 启动轮询，包括首次执行
    if (pollingInterval > 0) {
      startPolling();
    } else {
      // 如果没有轮询，直接执行一次
      runCore(...params);
    }
  };

  /** cancel：停止轮询 + 忽略响应 */
  const cancel = () => {
    pollingTimer && clearTimeout(pollingTimer);
    loadingDelayTimer && clearTimeout(loadingDelayTimer);

    abortFlag = true;
  };

  const refresh = () => run(...paramsRef.value);

  onUnmounted(cancel);

  if (!manual) {
    run(...defaultParams);
  }

  return {
    data,
    loading,
    error,
    params: paramsRef,
    refresh,
    run,
    cancel,
  };
}
