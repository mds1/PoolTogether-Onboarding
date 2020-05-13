<template>
  <q-page padding>
    <h4 class="text-center">
      TODO
    </h4>

    <connect-wallet />
  </q-page>
</template>

<script>
import ConnectWallet from 'components/ConnectWallet';

export default {
  name: 'Home',

  components: {
    ConnectWallet,
  },
};
</script>
