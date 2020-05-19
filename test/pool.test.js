const { accounts, contract, provider } = require('@openzeppelin/test-environment');
const { constants, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const ethers = require('ethers');
const addresses = require('../addresses.json');

const abi = {
  /* eslint-disable global-require */
  dai: require('../abi/dai.json'),
  basePool: require('../abi/basePool.json'),
  /* eslint-enable global-require */
};

// Define constants and helpers
const MAX_UINT256 = constants.MAX_UINT256.toString();
const { parseEther } = ethers.utils;
const daiHolder = process.env.DAI_HOLDER;

// Get contract instances of external contracts
const ethersProvider = new ethers.providers.Web3Provider(provider);
const signer = ethersProvider.getSigner();
const dai = new ethers.Contract(addresses.Dai, abi.dai, ethersProvider.getSigner(daiHolder));
const basePool = new ethers.Contract(addresses.BasePool, abi.basePool, signer);

// Get our contracts
const UserPool = contract.fromArtifact('UserPool');

describe('UserPool', () => {
  const [factory, user] = accounts;
  let userPool;

  beforeEach(async () => {
    // Deploy new instance of user's pool contract
    userPool = await UserPool.new({ from: factory });
    await userPool.initializePool(user, { from: factory });
  });

  // Deployment and Initialization =================================================================
  it('should see the deployed UserPool contract', async () => {
    expect(userPool.address.startsWith('0x')).to.be.true;
    expect(userPool.address.length).to.equal(42);
  });

  it('sets the user as the owner', async () => {
    expect(await userPool.owner()).to.equal(user);
  });

  it('only lets the initialize function be called once', async () => {
    await expectRevert(
      userPool.initializePool(user, { from: user }),
      'Contract instance has already been initialized',
    );
  });

  it('should approve the PoolTogether contract to spend its Dai', async () => {
    const allowance = await dai.allowance(userPool.address, basePool.address);
    expect(allowance.toString()).to.equal(MAX_UINT256);
  });

  // Main functionality ============================================================================
  it('lets users enter and exit the pool', async () => {
    // Transfer dai to the user's proxy
    const depositAmount = parseEther('10');
    await dai.transfer(userPool.address, depositAmount);
    // Enter the pool and confirm it succeeded
    expectEvent(await userPool.deposit(), 'Deposited', { amount: depositAmount.toString() });
    const poolBalance = await basePool.totalBalanceOf(userPool.address);
    expect(poolBalance.toString()).to.equal(depositAmount.toString());
    // Withdraw a portion and confirm it works
    const withdrawAmount = parseEther('3');
    expectEvent(await userPool.withdraw(withdrawAmount, user, { from: user }), 'Withdrawn', {
      amount: withdrawAmount.toString(),
      recipient: user,
    });
    const newPoolBalance = await basePool.totalBalanceOf(userPool.address);
    expect(newPoolBalance.toString()).to.equal(depositAmount.sub(withdrawAmount).toString());
    const userBalance = await dai.balanceOf(user);
    expect(userBalance.toString()).to.equal(withdrawAmount.toString());
  });
});
