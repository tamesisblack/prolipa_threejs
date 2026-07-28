<script setup lang="ts">
/** Layout principal del campus virtual */
import AppHeader from '@/components/layout/AppHeader.vue'
import AIAssistant from '@/components/AIAssistant.vue'
</script>

<template>
  <div class="app-layout relative flex h-full w-full flex-col overflow-hidden">
    <AppHeader />
    <main class="min-h-0 flex-1 overflow-hidden">
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" class="h-full" />
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
