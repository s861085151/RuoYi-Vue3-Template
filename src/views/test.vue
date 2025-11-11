<template>
  <div class="app-container home">
    <h1 class="text-2xl font-bold text-gray-800">测试路由页面</h1>
    <span class="block text-red-500 mt-2">tailwindcss测试</span>

    <p class="text-gray-600 font-bold mt-4">grid</p>
    <div class="grid grid-cols-2 gap-4 mt-2">
      <div class="bg-gray-200 p-4 item">
        <p>这是一个网格项</p>
      </div>
      <div class="bg-gray-200 p-4">
        <p>这是另一个网格项</p>
      </div>
    </div>
    <p class="text-gray-600 font-bold mt-4">flex</p>
    <div class="flex items-center mt-2">
      <div class="text-gray-600 w-[200px] bg-amber-300 h-[50px]">这是 flex 项的内容</div>
      <div class="flex-1 bg-gray-200 h-[50px]">这是 flex 项的内容</div>
    </div>
  </div>
</template>

<script setup name="Test">
defineOptions({
  name: 'Test',
});
</script>

<style scoped lang="scss"></style>
