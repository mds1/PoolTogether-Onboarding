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
          @click="enterPool"
        />
      </q-card-actions>
    </q-card>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'DashboardEnterPool',

  data() {
    return {};
  },

  computed: {
    ...mapState({
      availableBalance: (state) => Math.floor(parseInt(state.main.balances.daiInProxy, 10)),
    }),
  },

  methods: {
    enterPool() {
      // TODO
      // Create factory contract instance
      // Send transaction
    },
  },
};
</script>
