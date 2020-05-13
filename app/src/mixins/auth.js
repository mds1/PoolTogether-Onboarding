/**
 * @notice This mixin gets login data on page load
 */
import { mapState } from 'vuex';
import { Magic } from 'magic-sdk';

const magic = new Magic(process.env.MAGIC_API_KEY, { network: 'kovan' });
magic.preload();


export default {
  data() {
    return {
      magic: undefined,
    };
  },

  computed: {
    ...mapState({
      userAddress: (state) => state.main.userAddress,
      signer: (state) => state.main.signer,
    }),
  },

  async mounted() {
    const isLoggedIn = await magic.user.isLoggedIn();
    this.magic = magic;
    if (isLoggedIn) await this.$store.dispatch('main/setEthereumData', magic);
  },
};
