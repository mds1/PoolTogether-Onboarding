<template>
  <q-page padding>
    <h3 class="text-center page-title q-mb-xl">
      Dashboard
    </h3>

    <div v-if="isAuthCheckLoading">
      <loading-spinner />
    </div>

    <div v-else-if="!userAddress">
      <div class="column content-center text-center">
        Please login to see your dashboard!
        <connect-wallet />
      </div>
    </div>

    <div v-else>
      <div class="row justify-evenly items-stretch">
        <div class="col-xs-3">
          <dashboard-fiat-deposit />
        </div>
        <div class="col-xs-3">
          <dashboard-enter-pool />
        </div>
        <div class="col-xs-3">
          <dashboard-exit-pool />
        </div>
      </div>
    </div>

    <div class="q-mt-xl">
      <q-btn
        v-if="!isAuthCheckLoading && userAddress"
        color="secondary"
        class="q-mt-xl"
        :flat="true"
        label="Logout"
        @click="logout"
      />
    </div>
  </q-page>
</template>

<script>
import { mapState } from 'vuex';
import ConnectWallet from 'components/ConnectWallet';
import DashboardFiatDeposit from 'components/DashboardFiatDeposit';
import DashboardEnterPool from 'components/DashboardEnterPool';
import DashboardExitPool from 'components/DashboardExitPool';
import auth from 'src/mixins/auth';
import { ethers } from 'ethers';

export default {
  name: 'Dashboard',

  components: {
    ConnectWallet,
    DashboardFiatDeposit,
    DashboardEnterPool,
    DashboardExitPool,
  },

  mixins: [auth],

  computed: {
    ...mapState({
      userAddress: (state) => state.main.userAddress,
    }),
  },

  methods: {
    async logout() {
      await this.magic.user.logout();
      const ethersProvider = ethers.getDefaultProvider('kovan');
      await this.$store.dispatch('main/setDefaultEthereumData', ethersProvider);
      this.$router.push({ name: 'home' });
    },
  },
};
</script>
