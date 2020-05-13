const { accounts, contract } = require('@openzeppelin/test-environment');
const { expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

const UserPoolFactory = contract.fromArtifact('UserPoolFactory');
const UserPool = contract.fromArtifact('UserPool');

describe('UserPoolFactory', () => {
  const [admin, user] = accounts;

  let userPoolFactory;
  let userPoolLogic;

  beforeEach(async () => {
    // Deploy factory
    userPoolFactory = await UserPoolFactory.new({ from: admin });

    // Deploy and initialize logic contract
    userPoolLogic = await UserPool.new({ from: admin });
    await userPoolLogic.initializePool(admin, { from: admin });
  });

  // Deployment and Initialization =================================================================
  it('should see the deployed UserPoolFactory contract', async () => {
    expect(userPoolFactory.address.startsWith('0x')).to.be.true;
    expect(userPoolFactory.address.length).to.equal(42);
  });

  it('should have proper owner', async () => {
    const owner = await userPoolFactory.owner();
    expect(owner).to.equal(admin);
  });

  it('properly initializes an empty list of users', async () => {
    const users = await userPoolFactory.getUsers();
    expect(users).to.be.an('array').that.is.empty;
  });

  // Main functionality ============================================================================
  it.skip('properly deploys and configures proxy contracts', async () => {
    /**
     * @dev Initialization of the deployed proxy contract fails when testing with the ganache-cli
     * `--fork` feature. See the linked issue for details:
     *     https://github.com/trufflesuite/ganache-core/issues/526
     * Note that this test does pass in production even though it fails here.
     */

    // Deploy contract directly instead of using GSN
    const receipt = await userPoolFactory.createContract(userPoolLogic.address, { from: user });

    // Get instance of the newly deployed proxy
    const proxyAddress = await userPoolFactory.getContract(user);
    const proxy = await UserPool.at(proxyAddress);
    expectEvent(receipt, 'ProxyCreated', {
      proxy: proxyAddress,
    });
    expect(await proxy.owner()).to.be.equal(user);
  });

  it.skip('enables users to interact with their proxy via the factory', async () => {
    /**
     * @dev This test is incomplete as it fails due to the same error as above. Similarly,
     * this test does pass in production
     */

    // Deploy contract directly instead of using GSN
    const receipt = await userPoolFactory.createContract(userPoolLogic.address, { from: user });
  });
});
