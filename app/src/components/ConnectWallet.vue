<template>
  <div>
    <!-- Connect Wallet -->
    <div style="max-width: 450px; ">
      <q-form
        class="row justify-center items-center"
        @submit="connectWallet"
      >
        <base-input
          v-model="email"
          :dense="true"
          class="col-auto"
          label="Email Address"
          style="min-width:250px"
        />
        <base-button
          class="col-auto q-ml-md"
          :full-width="fullWidth"
          :label="label"
          :loading="isLoading"
          :rounded="false"
          size="md"
          style="margin-top:-1rem;"
          @click="connectWallet"
        />
      </q-form>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { Magic } from 'magic-sdk';
import helpers from 'src/mixins/helpers';

const magic = new Magic(process.env.MAGIC_API_KEY, { network: 'kovan' });
magic.preload();

export default {
  name: 'ConnectWallet',

  mixins: [helpers],

  props: {
    fullWidth: {
      type: Boolean,
      required: false,
      default: false,
    },

    label: {
      type: String,
      required: false,
      default: 'Log in',
    },
  },

  data() {
    return {
      isLoading: false,
      email: undefined,
    };
  },

  computed: {
    ...mapState({
      signer: (state) => state.main.signer,
      userAddress: (state) => state.main.userAddress,
    }),
  },

  async mounted() {
    const isLoggedIn = await magic.user.isLoggedIn();
    if (isLoggedIn) await this.$store.dispatch('main/setEthereumData', magic);
  },

  methods: {
    async connectWallet() {
      try {
        this.isLoading = true;
        await magic.auth.loginWithMagicLink({ email: this.email });
        await this.$store.dispatch('main/setEthereumData', magic);
        this.$router.push({ name: 'dashboard' });
      } catch (err) {
        this.showError(err, 'Unable to log in. Please try again.');
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>
