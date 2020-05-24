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
          You currently have {{ availableBalance }} tickets available to withdraw
        </div>
      </q-card-section>

      <q-card-actions class="row justify-center">
        <base-button
          class="q-my-lg"
          :disabled="availableBalance < 1"
          label="Exit Pool"
          @click="exitPool"
        />
      </q-card-actions>
    </q-card>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'DashboardExitPool',

  data() {
    return {};
  },

  computed: {
    ...mapState({
      availableBalance: (state) => Math.floor(parseInt(state.main.balances.committedBalance, 10)),
    }),
  },

  methods: {
    exitPool() {
      // TODO
      // Create factory contract instance
      // Send transaction
    },
  },
};
</script>
