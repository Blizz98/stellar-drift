<script setup>
import { useViewport } from '@/composables/useViewport'
import StarMap from '@/components/StarMap.vue'
import VoyageMapMobile from '@/components/VoyageMapMobile.vue'

const { isMobile } = useViewport()
</script>

<template>
  <VoyageMapMobile v-if="isMobile" />
  <StarMap v-else />
</template>
