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

        <!-- ADDRESS AND SETTINGS -->
        <div class="col-auto q-mr-lg">
          <div class="row justify-end items-center q-mt-xs">
            <div
              v-if="email"
              class="cursor-pointer"
              @click="showAccountDetails=true"
            >
              <div style="font-size: 0.75rem">
                Logged in as
              </div>
              <div>
                {{ email }}
              </div>
            </div>
            <div v-else>
              <!--  -->
            </div>
          </div>
        </div>
      </div>
    </q-header>

    <!-- MAIN CONTENT -->
    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- ACCOUNT DETAILS -->
    <q-dialog v-model="showAccountDetails">
      <q-card class="bg-primary">
        <q-card-section class="q-mt-lg q-px-xl">
          <div class="text-h5 text-bold secondary">
            Account Info
          </div>
        </q-card-section>

        <q-card-section class="column text-left q-px-xl">
          <div class="q-mt-md">
            <div class="text-caption text-grey">
              Email
            </div>
            {{ email }}
          </div>
          <div class="q-mt-md">
            <div class="text-caption text-grey">
              Wallet Address
            </div>
            {{ userAddress }}
          </div>
          <div class="q-mt-md">
            <div class="text-caption text-grey">
              Proxy Wallet Address
            </div>
            {{ proxyAddress }}
          </div>
        </q-card-section>

        <q-card-actions
          align="right"
          class="q-ma-lg"
        >
          <q-btn
            v-close-popup
            flat
            label="Close"
            color="secondary"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'BaseLayout',

  data() {
    return {
      showAccountDetails: false,
    };
  },

  computed: {
    ...mapState({
      email: (state) => state.main.email,
      userAddress: (state) => state.main.userAddress,
      proxyAddress: (state) => state.main.proxy,
    }),
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
