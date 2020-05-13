require('dotenv').config();

module.exports = {
  node: {
    fork: `https://kovan.infura.io/v3/${process.env.INFURA_ID}`,
    unlocked_accounts: [process.env.DAI_HOLDER],
  },
};
