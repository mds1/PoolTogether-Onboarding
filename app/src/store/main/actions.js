import { ethers } from 'ethers';
import { date } from 'quasar';

// Helpers for PoolTogether prize calculation ======================================================
const pt = require('pooltogetherjs');
const poolTogetherDrawDates = require('src/utils/poolTogetherDrawDates');
const addresses = require('../../../../addresses.json');

const abi = {
  /* eslint-disable global-require */
  dai: require('../../../../abi/dai.json'),
  basePool: require('../../../../abi/basePool.json'),
  multicall: require('../../../../abi/multicall.json'),
  cdai: require('../../../../abi/cdai.json'),
  /* eslint-enable global-require */
};

const { getDateDiff } = date;
const { utils } = ethers;

/**
 * @notice Drawings are every Friday at noon PST. Returns the next drawing date
 */
const getPoolTogetherDaiDrawDate = () => {
  const now = Date.now();
  for (let i = 0; i < poolTogetherDrawDates.length; i += 1) {
    const drawDate = new Date(poolTogetherDrawDates[i]);
    const diff = getDateDiff(drawDate, now);
    if (diff > 0) {
      return poolTogetherDrawDates[i];
    }
  }
  return undefined;
};

/**
 * @notice Get estimated PoolTogether prize for the next drawing
 * source: https://github.com/pooltogether/pooltogetherjs
 */
const getPoolTogetherDaiPrize = (balance, accountedBalance, draw, supplyRatePerBlock) => {
  // First calculate the value of the prize that has accrued so far
  const prize = pt.utils.calculatePrize(
    balance,
    accountedBalance,
    draw.feeFraction,
  );

  const prizeSupplyRate = pt.utils.calculatePrizeSupplyRate(
    supplyRatePerBlock,
    draw.feeFraction,
  );

  // Use the next prize award date as the string.
  // For daily pools every day at noon PST, for weekly every Friday at noon PST.
  const awardAtMs = Date.parse(getPoolTogetherDaiDrawDate());
  const remainingTimeS = (awardAtMs - (new Date()).getTime()) / 1000;
  const remainingBlocks = remainingTimeS / 15; // about 15 second block periods
  const blocksFixedPoint18 = utils.parseEther(String(remainingBlocks));
  const prizeEstimate = pt.utils.calculatePrizeEstimate(
    balance,
    prize,
    blocksFixedPoint18,
    prizeSupplyRate,
  );
  return utils.formatEther(prizeEstimate.toString());
};

// Actions start here ==============================================================================
export async function setDefaultEthereumData({ commit }, ethersProvider) {
  // Use default provider info if not logged in
  const magic = undefined;
  const provider = undefined;
  const signer = undefined;
  const userAddress = undefined;
  commit('setWallet', {
    magic, provider, ethersProvider, signer, userAddress,
  });
}

export async function setEthereumData({ commit }, magic) {
  // Get user's wallet info from provider
  const provider = magic.rpcProvider;
  const ethersProvider = new ethers.providers.Web3Provider(provider);
  const signer = ethersProvider.getSigner();
  const metadata = await magic.user.getMetadata();
  const userAddress = metadata.publicAddress;
  commit('setWallet', {
    magic, provider, ethersProvider, signer, userAddress,
  });
}

export async function setPrizeData({ commit, state }) {
  /* eslint-disable max-len */
  // Setup --------------------------------------------------
  const multicall = new ethers.Contract(addresses.Multicall, abi.multicall, state.ethersProvider);
  const basePool = new ethers.Contract(addresses.BasePool, abi.basePool, state.ethersProvider);
  const cdai = new ethers.Contract(addresses.Cdai, abi.cdai, state.ethersProvider);

  // Read data ----------------------------------------------
  const [, response] = await multicall.callStatic.aggregate([
    [addresses.BasePool, basePool.interface.encodeFunctionData('currentCommittedDrawId')], // draw ID
    [addresses.BasePool, basePool.interface.encodeFunctionData('balance')], // all deposits + accrued interest
    [addresses.BasePool, basePool.interface.encodeFunctionData('accountedBalance')], // funds allocated to winners, etc.
    [addresses.BasePool, basePool.interface.encodeFunctionData('committedSupply')], // eligible tickets
    [addresses.BasePool, basePool.interface.encodeFunctionData('openSupply')], // open tickets
    [addresses.Cdai, cdai.interface.encodeFunctionData('supplyRatePerBlock')],
  ]);

  // Decode data --------------------------------------------
  const basePoolCurrentDraw = basePool.interface.decodeFunctionResult('currentCommittedDrawId', response[0])[0];

  // total value of all deposits + interest (helper for Compounds balanceOfUnderlying)
  const basePoolBalance = basePool.interface.decodeFunctionResult('balance', response[1])[0];

  // total funds that have been accounted for, i.e. allocated to winners and sponsors
  // "new" money is defined as balance minus accountBalance
  const basePoolAccountedBalance = basePool.interface.decodeFunctionResult('accountedBalance', response[2])[0];
  const basePoolEligibleTickets = basePool.interface.decodeFunctionResult('committedSupply', response[3])[0];
  const basePoolOpenTickets = basePool.interface.decodeFunctionResult('openSupply', response[4])[0];
  const cDaiSupplyRate = cdai.interface.decodeFunctionResult('supplyRatePerBlock', response[5])[0];

  // Get prize data ----------------------------------------
  const basePoolDraw = await basePool.getDraw(basePoolCurrentDraw);
  const prizeData = {
    totalEarningInterest: utils.formatEther(basePoolAccountedBalance),
    eligibleTickets: utils.formatEther(basePoolEligibleTickets),
    openTickets: utils.formatEther(basePoolOpenTickets),
    sponsored: utils.formatEther(basePoolAccountedBalance.sub(basePoolEligibleTickets).sub(basePoolOpenTickets)),
    estimatedPrize: getPoolTogetherDaiPrize(basePoolBalance, basePoolAccountedBalance, basePoolDraw, cDaiSupplyRate),
    prizeDrawingDate: getPoolTogetherDaiDrawDate(),
  };

  commit('setPrizeData', prizeData);
}
