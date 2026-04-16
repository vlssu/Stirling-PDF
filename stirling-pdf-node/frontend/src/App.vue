<template>
  <el-config-provider>
    <AppLayout>
      <router-view />
    </AppLayout>
  </el-config-provider>
</template>

<script setup lang="ts">
import AppLayout from "@/components/layout/AppLayout.vue";
</script>
