require("dotenv").config();

module.exports = {
  node: {
    fork: `https://mainnet.infura.io/v3/${process.env.INFURA_ID}`,
  },
};
