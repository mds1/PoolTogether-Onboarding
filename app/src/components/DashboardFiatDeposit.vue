<template>
  <div>
    <!-- MAIN CARD -->
    <q-card class="bg-primary card-border">
      <q-card-section class="q-mb-lg">
        <div class="text-h6 secondary">
          01. Deposit Funds
        </div>
        <div class="text-subtitle2">
          Use your debit card to buy tickets
        </div>
      </q-card-section>

      <q-separator dark />

      <q-card-section>
        <div class="dashboard-card-subtext">
          &nbsp;
        </div>
      </q-card-section>

      <q-card-actions class="row justify-center">
        <base-button
          class="q-my-lg"
          label="Buy tickets"
          @click="startDeposit"
        />
      </q-card-actions>
    </q-card>

    <!-- PROXY DEPLOYMENT DIALOG -->
    <q-dialog
      v-model="isDeployingProxy"
      persistent
    >
      <q-card class="bg-primary text-center q-pa-lg">
        <q-card-section>
          <h4 class="row justify-center items-center">
            <q-icon
              left
              name="fas fa-cogs"
              class="setup-icon vertical-middle"
            />
            <span v-if="isDeployed">You're All Set!</span>
            <span v-else>Account Setup</span>
          </h4>
        </q-card-section>

        <q-card-section>
          <div
            v-if="isDeployed"
            class="text-center"
          >
            Click the button below to buy some tickets!
            <div class="text-caption text-center">
              You must buy a mininum of at least $1.
            </div>
          </div>
          <div
            v-else
            class="text-center"
          >
            Since this is your first visit, we just need to finish setting up your account.
            <p class="text-caption text-italic text-center q-mt-md">
              This should only take a minute or two, as we deploy your smart contract...
            </p>
          </div>
          <p class="q-my-lg row justify-center">
            <img
              v-if="isDeployed"
              src="statics/graphics/undraw_confirmation_2uy0.png"
              style="width:30vw;max-width:175px;"
            >
            <img
              v-else
              src="statics/graphics/undraw_Firmware_jw6u.png"
              style="width:30vw;max-width:175px;"
            >
          </p>
          <div v-if="!isDeployed">
            <div class="row justify-center">
              <q-spinner
                color="secondary"
                size="2rem"
              />
              <div class="col-xs-12 text-center text-italic q-mt-md">
                Please wait...
              </div>
            </div>
          </div>
          <div v-else />
        </q-card-section>

        <q-card-actions align="right">
          <div :class="{'is-deploying': !isDeployed}">
            <base-button
              label="Continue to Purchase"
              :disabled="!isDeployed"
              @click="redirectToFiatProcessor"
            />
          </div>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { ethers } from 'ethers';
import transakSDK from '@transak/transak-sdk';
import helpers from 'src/mixins/helpers';

const { constants } = ethers;

export default {
  name: 'DashboardFiatDeposit',

  mixins: [helpers],

  data() {
    return {
      isDeployingProxy: undefined,
      isDeployed: false,
    };
  },

  computed: {
    ...mapState({
      proxy: (state) => state.main.proxy,
      proxyLogic: (state) => state.main.proxyLogic,
      userAddress: (state) => state.main.userAddress,
      factoryInstance: (state) => state.main.factoryInstance,
    }),
  },

  methods: {
    redirectToFiatProcessor() {
      try {
        // Define where to redirect to once hosted Widget flow is completed
        this.isDeployingProxy = false;
        const redirectUrl = `${window.location.origin}/?isWaitingForPurchase=true`;

        const transak = new transakSDK({ // eslint-disable-line new-cap
          apiKey: process.env.TRANSAK_API_KEY,
          cryptoCurrencyCode: 'DAI',
          defaultCryptoCurrency: 'DAI',
          disableWalletAddressForm: true,
          email: '', // Your customer's email address
          environment: 'STAGING', // STAGING or PRODUCTION
          fiatCurrency: '', // INR/GBP
          hostURL: window.location.origin,
          redirectURL: redirectUrl,
          themeColor: '5029AB', // App theme color
          walletAddress: this.proxy, // User's wallet address
          widgetHeight: '550px',
          widgetWidth: '450px',
        });

        transak.init();

        // To get all the events
        transak.on(transak.ALL_EVENTS, (data) => {
          console.log(data); // eslint-disable-line no-console
        });

        // This will trigger when the user marks payment is made.
        transak.on(transak.EVENTS.TRANSAK_ORDER_SUCCESSFUL, (orderData) => {
          console.log(orderData); // eslint-disable-line no-console
          transak.close();
        });

        // // Check if we are in dev or prod
        // let wyreUrlPrefix = 'sendwyre';
        // if (process.env.WYRE_ENV === 'dev') {
        //   wyreUrlPrefix = 'testwyre';
        // }


        // // Define and temporarily save off options used to load the widget
        // const widgetOptions = {
        //   dest: `ethereum:${this.proxy}`,
        //   destCurrency: 'DAI',
        //   // sourceAmount: undefined,
        //   paymentMethod: 'debit-card',
        //   redirectUrl,
        //   accountId: process.env.WYRE_ACCOUNT_ID,
        // };
        // this.$q.localStorage.set('widgetDepositOptions', widgetOptions);

        // // Load the new page and exit this function
        // const widgetUrl = `https://pay.${wyreUrlPrefix}.com/purchase?dest=${widgetOptions.dest}&destCurrency=${widgetOptions.destCurrency}&sourceAmount=${widgetOptions.sourceAmount}&paymentMethod=${widgetOptions.paymentMethod}&redirectUrl=${widgetOptions.redirectUrl}&accountId=${widgetOptions.accountId}`; // eslint-disable-line
        // window.location.href = widgetUrl;
      } catch (err) {
        this.showError(err);
      } finally {
        this.isDepositLoading = false;
      }
    },

    async startDeposit() {
      /* eslint-disable no-console */
      if (constants.AddressZero === this.proxy) {
        // First time, so deploy their proxy contract
        console.log('Deployment of proxy starting...');
        this.isDeployingProxy = true;
        try {
          this.factoryInstance.methods.createContract(this.proxyLogic)
            .send({ from: this.userAddress, gas: '1000000' })
            .on('transactionHash', async (txHash) => {
              console.log('txHash: ', txHash);
            })
            .once('receipt', async (receipt) => {
              console.log('Transaction receipt: ', receipt);
              await this.$store.dispatch('main/getProxy', this.userAddress);
              this.isDeployed = true;
              // this.isDeployingProxy = false;
            })
            .catch((err) => {
              this.showError(err);
              this.isDeployingProxy = false;
            });
        } catch (err) {
          this.showError(err);
          this.hasDeploymentStarted = false;
        }
      } else {
        this.redirectToFiatProcessor();
      }
    },
  },
};
</script>

<style lang="sass" scoped>
.is-deploying
  opacity: 0.6
</style>
