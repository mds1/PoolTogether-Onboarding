<template>
  <div>
    <q-card class="bg-primary card-border">
      <q-card-section class="q-mb-lg">
        <div class="text-h6 secondary">
          01. Deposit Funds
        </div>
        <div class="text-subtitle2">
          Use your credit or debit card to buy tickets
        </div>
      </q-card-section>

      <q-separator dark />

      <q-card-actions class="row justify-center">
        <base-button
          class="q-my-lg"
          label="Buy tickets"
        />
      </q-card-actions>
    </q-card>
  </div>
</template>

<script>
export default {
  name: 'DashboardFiatDeposit',
  data() {
    return {};
  },
};
</script>
