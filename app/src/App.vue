<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
import { ethers } from 'ethers';

export default {
  name: 'App',

  async mounted() {
    const ethersProvider = ethers.getDefaultProvider('kovan');
    await this.$store.dispatch('main/setDefaultEthereumData', ethersProvider);
    await this.$store.dispatch('main/setPrizeData');
  },
};
</script>
