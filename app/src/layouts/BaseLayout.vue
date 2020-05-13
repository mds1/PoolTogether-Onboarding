<template>
  <q-layout
    view="lHh Lpr lFf"
    class="main-content"
  >
    <q-header class="transparent">
      <div class="row justify-between items-center no-wrap all-content-format">
        <div class="col-auto">
          <!-- LOGO AND TITLE -->
          <div
            class="row justify-start items-center q-pa-lg"
            style="cursor: pointer;"
            @click="$router.push({ name: 'home' })"
          >
            <img
              alt="PoolTogether logo"
              class="q-ml-md"
              src="statics/pooltogether/white-logo@2x.png"
              style="max-width: 100px;"
            >
          </div>
        </div>
        <!-- ADDRESS AND SETTINGS AND SETTINGS -->
        <div class="col-auto q-mr-md">
          <!-- TODO -->
          <div class="row justify-end items-center q-mt-xs">
            <!-- -->
          </div>
        </div>
      </div>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  name: 'BaseLayout',

  data() {
    return {
    };
  },
};
/* eslint-disable */
</script>

<style lang="sass" scoped>
.transparent
  opacity:

.main-content
  background-image: linear-gradient(to bottom right, $primarylight, $primary)
</style>
