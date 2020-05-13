<template>
  <q-page padding>
    <!-- Heading -->
    <div class="text-center">
      <h3 class="page-title">
        🎉 You could win <span class="secondary">${{ prizeAmount }}</span> every week 🎉
      </h3>
      <h4>
        Just by saving your money
      </h4>
    </div>

    <!-- Login -->
    <div class="column content-center text-center q-mt-xl">
      <div>Enter your email address to magically login without creating an account</div>
      <connect-wallet />
    </div>

    <!-- What is it -->
    <div class="row justify-center q-mt-xl">
      <div
        class="col"
        style="max-width: 750px;"
      >
        <q-video
          src="https://www.youtube.com/embed/oJtewzf4sf8"
          :ratio="16/9"
        />
      </div>
    </div>
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
