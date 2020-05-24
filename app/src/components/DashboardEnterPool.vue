<template>
  <div>
    <q-card class="bg-primary card-border">
      <q-card-section class="q-mb-lg">
        <div class="text-h6 secondary">
          02. Enter the Pool
        </div>
        <div class="text-subtitle2">
          Join the pool for a chance to win!
        </div>
      </q-card-section>

      <q-separator dark />

      <q-card-section>
        <div class="dashboard-card-subtext">
          You currently have ${{ availableBalance }} which will get
          you {{ availableBalance }} tickets
        </div>
      </q-card-section>

      <q-card-actions class="row justify-center">
        <base-button
          class="q-my-lg"
          :disabled="availableBalance < 1"
          label="Enter Pool"
          :loading="isLoading"
          @click="enterPool"
        />
      </q-card-actions>
    </q-card>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import helpers from 'src/mixins/helpers';

export default {
  name: 'DashboardEnterPool',

  mixins: [helpers],

  data() {
    return {
      isLoading: undefined,
    };
  },

  computed: {
    ...mapState({
      magic: (state) => state.main.magic,
      availableBalance: (state) => Math.floor(parseInt(state.main.balances.daiInProxy, 10)),
      userAddress: (state) => state.main.userAddress,
      factoryInstance: (state) => state.main.factoryInstance,
    }),
  },

  methods: {
    async enterPool() {
      this.isLoading = true;
      await this.factoryInstance.methods.deposit().send({ from: this.userAddress });
      await this.$store.dispatch('main/setEthereumData', this.magic); // update user balances
      this.isLoading = false;
      this.notifyUser('positive', 'You have successfully entered the pool. Win that money!');
    },
  },
};
</script>
