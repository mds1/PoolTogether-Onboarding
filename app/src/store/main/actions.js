import { ethers } from 'ethers';
import { date } from 'quasar';

const Web3 = require('web3'); // required for Open Zeppelin GSN provider
const { GSNProvider } = require('@openzeppelin/gsn-provider');

// Helpers for PoolTogether prize calculation ======================================================
const pt = require('pooltogetherjs');
const poolTogetherDrawDates = require('src/utils/poolTogetherDrawDates');
const contracts = require('../../../../.openzeppelin/kovan.json');
const addresses = require('../../../../addresses.json');

addresses.UserPool = contracts.proxies['pooltogether-onboarding/UserPool'][0].address;
addresses.UserPoolFactory = contracts.proxies['pooltogether-onboarding/UserPoolFactory'][0].address;


const abi = {
  /* eslint-disable global-require */
  dai: require('../../../../abi/dai.json'),
  basePool: require('../../../../abi/basePool.json'),
  multicall: require('../../../../abi/multicall.json'),
  cdai: require('../../../../abi/cdai.json'),
  userPoolFactory: require('../../../../build/contracts/UserPoolFactory.json').abi,
  userPool: require('../../../../build/contracts/UserPool.json').abi,
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
  // Set to default provider info if not logged in
  commit('setWallet', {
    magic: undefined,
    provider: undefined,
    ethersProvider,
    signer: undefined,
    userAddress: undefined,
    email: undefined,
    proxyLogic: addresses.UserPool,
    proxy: undefined,
    proxyInstance: undefined,
    factoryInstance: new ethers.Contract(
      addresses.UserPoolFactory, abi.userPoolFactory, ethersProvider,
    ),
  });
}

export async function setEthereumData({ commit }, magic) {
  // Get user's wallet info from provider
  const provider = magic.rpcProvider;
  const ethersProvider = new ethers.providers.Web3Provider(provider);
  const signer = ethersProvider.getSigner();
  const metadata = await magic.user.getMetadata();
  const { email, publicAddress } = metadata;

  // Lookup proxy info
  const factory = new ethers.Contract(
    addresses.UserPoolFactory, abi.userPoolFactory, signer,
  );
  const proxy = await factory.getContract(publicAddress);

  // Create GSN factory instance and regular proxy instance
  const web3gsn = new Web3(new GSNProvider(provider));
  const proxyInstance = new web3gsn.eth.Contract(abi.userPool, proxy);
  const factoryInstance = new web3gsn.eth.Contract(abi.userPoolFactory, addresses.UserPoolFactory);


  commit('setWallet', {
    magic,
    provider,
    ethersProvider,
    signer,
    userAddress: publicAddress,
    email,
    proxyLogic: addresses.UserPool,
    proxy,
    proxyInstance,
    factoryInstance,
  });
}

export async function getProxy({ commit }, userAddress) {
  // Get regular contract instances with ethers to check user's proxy address
  const provider = ethers.getDefaultProvider('kovan');
  const factory = new ethers.Contract(
    addresses.UserPoolFactory, abi.userPoolFactory, provider,
  );
  const userProxy = await factory.getContract(userAddress);
  commit('setProxyAddress', userProxy);
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
