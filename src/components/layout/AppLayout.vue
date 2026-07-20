<script setup lang="ts">
/** Layout principal del campus virtual */
import AppHeader from '@/components/layout/AppHeader.vue'
import AIAssistant from '@/components/AIAssistant.vue'
</script>

<template>
  <div class="app-layout relative h-full w-full overflow-hidden">
    <AppHeader />
    <main class="h-full w-full">
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
    <AIAssistant />
  </div>
</template>

<style scoped>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
