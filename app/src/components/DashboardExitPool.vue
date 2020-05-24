<template>
  <div>
    <q-card class="bg-primary card-border">
      <q-card-section class="q-mb-lg">
        <div class="text-h6 secondary">
          03. Exit the Pool
        </div>
        <div class="text-subtitle2">
          Cash out and withdraw your funds
        </div>
      </q-card-section>

      <q-separator dark />

      <q-card-section>
        <div class="dashboard-card-subtext">
          You currently have {{ balance }} tickets available to withdraw
        </div>
      </q-card-section>

      <q-card-actions class="row justify-center">
        <base-button
          class="q-my-lg"
          :disabled="balance < 1"
          label="Exit Pool"
          :loading="isLoading"
          @click="exitPool"
        />
      </q-card-actions>
    </q-card>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import helpers from 'src/mixins/helpers';

export default {
  name: 'DashboardExitPool',

  mixins: [helpers],

  data() {
    return {
      isLoading: undefined,
    };
  },

  computed: {
    ...mapState({
      magic: (state) => state.main.magic,
      proxyAddress: (state) => state.main.proxy,
      userAddress: (state) => state.main.userAddress,
      basePoolInstance: (state) => state.main.basePoolInstance,
      factoryInstance: (state) => state.main.factoryInstance,
      balances: (state) => state.main.balances,
    }),

    balance() {
      return Number(this.balances.committedBalance) + Number(this.balances.openBalance);
    },
  },

  methods: {
    async exitPool() {
      this.isLoading = true;
      const committedBalance = await this.basePoolInstance.committedBalanceOf(this.proxyAddress);
      const openBalance = await this.basePoolInstance.openBalanceOf(this.proxyAddress);
      const amount = committedBalance.add(openBalance).toString();
      const dest = this.proxyAddress;
      await this.factoryInstance.methods.withdraw(amount, dest).send({ from: this.userAddress });
      await this.$store.dispatch('main/setEthereumData', this.magic); // update user balances
      this.isLoading = false;
      this.notifyUser('positive', 'You have successfully withdrawn your funds from the pool!');
    },
  },
};
</script>
