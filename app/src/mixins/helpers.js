/**
 * @notice This mixin contains generic helper functions
 */
import { Notify } from 'quasar';


export default {
  data() {
    return {};
  },

  methods: {
    /**
     * Present notification alert to the user
     * @param {string} color alert color, choose positive, negative, warning, info, or others
     * @param {string} message message to display on notification
     */
    notifyUser(color, message) {
      Notify.create({
        color,
        message,
        // If positive, timeout after 5 seconds. Otherwise, show until dismissed by user
        timeout: color.toLowerCase() === 'positive' ? 5000 : 0,
        position: 'top',
        actions: [{ label: 'Dismiss', color: 'white' }],
      });
    },

    /**
     * Show error message to user
     * @param {Any} err Error object thrown
     * @param {Any} msg Optional, fallback error message if one is not provided by the err object
     */
    showError(err, msg = 'An unknown error occurred') {
      console.error(err); // eslint-disable-line no-console
      if (!err) this.notifyUser('negative', msg);
      else if (err.isAxiosError && err.response.data.error) {
        this.notifyUser('negative', err.response.data.error);
      } else if (err.message) this.notifyUser('negative', err.message);
      else if (err.msg) this.notifyUser('negative', err.msg);
      else if (typeof err === 'string') this.notifyUser('negative', err);
      else this.notifyUser('negative', msg);
    },

    /**
     * @notice Takes in a number and returns a string version formatted as USD
     * @param {number, string} value the number to be formatted
     * @param {number} minDigits minimum number of decimal places to show
     * @param {number} maxDigits minimum number of decimal places to show
     * @returns {string} the value formatted as USD
     */
    formatCurrency(value, minDigits = 2, maxDigits = 4) {
      // Convert to a number if given a string
      let numberValue = typeof value === 'string' ? Number(value) : value;
      // Fix floating point error for numbers near zero
      numberValue = numberValue < 0 && numberValue > -1e-6 ? 0 : numberValue;
      const isNegative = numberValue < 0;
      // Format number
      if (numberValue === undefined || numberValue === null || Number.isNaN(numberValue)) {
        return '$-';
      }
      const dollarAmount = numberValue.toLocaleString(undefined, {
        minimumFractionDigits: minDigits,
        maximumFractionDigits: maxDigits,
      });
      if (isNegative) {
        return `-$${Math.abs(dollarAmount)}`;
      }
      return `$${dollarAmount}`;
    },
  },
};
