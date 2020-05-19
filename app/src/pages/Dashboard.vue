<template>
  <q-page padding>
    <h3 class="text-center page-title q-mb-xl">
      Dashboard
    </h3>

    <div class="row justify-evenly q-mb-xl">
      <div class="col-auto">
        <div class="balance-header">
          Wallet Balance
          <q-icon name="fas fa-info-circle">
            <q-tooltip content-class="info-tooltip">
              This amount is available to enter the pool. Use the
              "Enter Pool" button in step 2 to convert these dollars into tickets!
            </q-tooltip>
          </q-icon>
        </div>
        <div class="text-center balance-amount">
          {{ formatCurrency(balances.daiInProxy) }}
        </div>
      </div>
      <div class="col-auto">
        <div class="balance-header">
          Open Tickets
          <q-icon name="fas fa-info-circle">
            <q-tooltip content-class="info-tooltip">
              These tickets are not yet eligible to win, but will become
              eligible right after the next draw.
            </q-tooltip>
          </q-icon>
        </div>
        <div class="text-center balance-amount">
          {{ balances.openBalance }}
        </div>
      </div>
      <div class="col-auto">
        <div class="balance-header">
          Committed Tickets
          <q-icon name="fas fa-info-circle">
            <q-tooltip content-class="info-tooltip">
              These tickets are eligible to win the prize!
            </q-tooltip>
          </q-icon>
        </div>
        <div class="text-center balance-amount">
          {{ balances.committedBalance }}
        </div>
      </div>
    </div>

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
import helpers from 'src/mixins/helpers';
import { ethers } from 'ethers';

export default {
  name: 'Dashboard',

  components: {
    ConnectWallet,
    DashboardFiatDeposit,
    DashboardEnterPool,
    DashboardExitPool,
  },

  mixins: [auth, helpers],

  computed: {
    ...mapState({
      userAddress: (state) => state.main.userAddress,
      balances: (state) => state.main.balances,
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

<style lang="sass" scoped>
.balance-header
  text-align: center

.balance-amount
  // text-align: center
  // margin: 0 auto
</style>
