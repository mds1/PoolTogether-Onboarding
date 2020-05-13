<template>
  <q-page padding>
    <h3 class="text-center page-title q-mb-xl">
      Dashboard
    </h3>

    <div v-if="!userAddress">
      <div class="column content-center text-center">
        Please login to see your dashboard!
        <connect-wallet />
      </div>
    </div>

    <div v-else>
      <div class="row justify-center">
        Here is your dashboard
      </div>
    </div>

    <div class="q-mt-xl">
      <base-button
        label="Logout"
        @click="logout"
      />
    </div>
  </q-page>
</template>

<script>
import { mapState } from 'vuex';
import ConnectWallet from 'components/ConnectWallet';
import auth from 'src/mixins/auth';

export default {
  name: 'Dashboard',

  components: {
    ConnectWallet,
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
      this.$router.push({ name: 'home' });
    },
  },
};
</script>
