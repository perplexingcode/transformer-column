<template>
  <div>
    <slot></slot>
  </div>
</template>
<script setup>
const state = reactive({});
const events = reactive({});
const config = reactive({});
const data = reactive({});

const app = {
  log: [],
  noti: [],
};

provide('app', app);
provide('state', state);
provide('events', events);
provide('config', config);
provide('data', data);
</script>
<style></style>
