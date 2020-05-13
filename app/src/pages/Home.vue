<template>
  <q-page padding>
    <div class="text-center">
      <h3 class="page-title">
        Win <span class="secondary">${{ prizeAmount }}</span> every week
      </h3>
      <h4>
        just by saving your money!
      </h4>
    </div>

    <connect-wallet />
  </q-page>
</template>

<script>
import { mapState } from 'vuex';
import ConnectWallet from 'components/ConnectWallet';

export default {
  name: 'Home',

  components: {
    ConnectWallet,
  },

  computed: {
    ...mapState({
      prizeData: (state) => state.main.pt,
    }),

    prizeAmount() {
      return Math.round(Number(this.prizeData.estimatedPrize));
    },
  },
};
</script>
