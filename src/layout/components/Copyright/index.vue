<template>
  <footer v-if="visible" class="copyright">
    <span>{{ content }}</span>
  </footer>
</template>

<script setup>
import { ref } from 'vue';

const visible = ref(true);
const content = ref('底部版权');
</script>

<style scoped>
.copyright {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 36px;
  padding: 10px 20px;
  text-align: right;
  background-color: #f8f8f8;
  color: #666;
  font-size: 14px;
  border-top: 1px solid #e7e7e7;
  z-index: 999;
}
</style>
