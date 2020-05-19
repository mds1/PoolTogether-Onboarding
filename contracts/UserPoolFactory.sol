pragma solidity ^0.6.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/GSN/GSNRecipient.sol";
import "./UserPool.sol";

contract UserPoolFactory is Ownable, GSNRecipient {
  /**
   * @notice Store list of all users (for convenience)
   */
  address[] public users;

  /**
   * @notice Maps user => their contract
   */
  mapping(address => address) public getContract;

  /**
   * @notice Emitted when a new proxy is created
   * @param proxy Address of the new proxy
   */
  event ProxyCreated(address proxy);

  // ===============================================================================================
  //                                        MAIN FUNCTIONALITY
  // ===============================================================================================
  /**
   * @notice Called to deploy a clone of _target for _user
   * @param _target address of the underlying logic contract to delegate to
   */
  function createContract(address _target) external {
    // Contract user is the user who sent the meta-transaction
    address _user = _msgSender();

    // Define function call to initialize the new ProvideLiquidity contract
    bytes memory _payload = abi.encodeWithSignature("initializePool(address)", _user);

    // Deploy proxy
    address _contract = deployMinimal(_target, _payload);

    // Update state
    users.push(_user);
    getContract[_user] = _contract;
  }

  /**
   * @notice Returns list of all user addresses
   */
  function getUsers() external view returns (address[] memory) {
    return users;
  }

  /**
   * @notice Deploys EIP-1167 minimal proxy based
   * @dev Copied from OpenZeppelin's ProxyFactory.sol since there is not yet a packaged
   * version of this contract for Solidity 0.6, see original at
   * https://github.com/OpenZeppelin/openzeppelin-sdk/blob/release/2.8/packages/lib/contracts/upgradeability/ProxyFactory.sol
   * @param _logic Address of the contract to delegatecall too
   * @param _data Calldata contract should execute after deployment
   */
  function deployMinimal(address _logic, bytes memory _data) internal returns (address proxy) {
    // Adapted from https://github.com/optionality/clone-factory/blob/32782f82dfc5a00d103a7e61a17a5dedbd1e8e9d/contracts/CloneFactory.sol
    bytes20 targetBytes = bytes20(_logic);
    assembly {
      let clone := mload(0x40)
      mstore(clone, 0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000)
      mstore(add(clone, 0x14), targetBytes)
      mstore(add(clone, 0x28), 0x5af43d82803e903d91602b57fd5bf30000000000000000000000000000000000)
      proxy := create(0, clone, 0x37)
    }

    emit ProxyCreated(address(proxy));

    if (_data.length > 0) {
      (bool success, ) = proxy.call(_data);
      require(success);
    }
  }

  // ===============================================================================================
  //                                     PROXY INTERACTIONS
  // ===============================================================================================

  /**
   * @dev The GSN requires you to fund your contract so gas costs and relayers
   * can be paid. Since we use a factory pattern, it would be inconvenient to
   * have to fund each deployed proxy in order for users to use their proxy.
   * Instead, we fund this factory contract, and enable users to interact with
   * this proxy via the factory contract. So if a user has ETH for gas, they
   * can call their proxy contract directly. If they do not have ETH for gas,
   * they can interact with their proxy through this factory contract to have
   * gas funds paid for them. For simplicity, we currently do not expose the
   * escape hatches here.
   */

  /**
   * @notice Deposits all Dai held by this contract into the pool
   * @dev The only purpose of this contract is to enter/exit the pools, so we assume
   * there is no reason not to deposit all Dai held by this contract. Additionally,
   * we intentionally do not mark this onlyOwner so anyone can call this function
   * on behalf of the user.
   */
  function deposit() external {
    // Get address of caller's proxy contract
    address _proxy = getContract[_msgSender()];
    require(
      _proxy != 0x0000000000000000000000000000000000000000,
      "UserPoolFactory: Caller does not have a proxy deployed"
    );

    // Deposit into pool
    UserPool userPool = UserPool(payable(_proxy));
    userPool.deposit();
  }

  /**
   * @notice Withdraw the specified amount of Dai to the provided address
   * @dev We include a destination address since we assume the user does not have
   * Ether for gas, so may want to withdraw to e.g. a Wyre liquidiation address
   * @param _amount Amount of Dai to withdraw
   * @param _recipient Address to send funds to
   */
  function withdraw(uint256 _amount, address _recipient) external {
    // Get address of caller's proxy contract
    address _proxy = getContract[_msgSender()];
    require(
      _proxy != 0x0000000000000000000000000000000000000000,
      "UserPoolFactory: Caller does not have a proxy deployed"
    );

    // Withdraw from pool
    UserPool userPool = UserPool(payable(_proxy));
    userPool.withdraw(_amount, _recipient);
  }

  // ===============================================================================================
  //                                      GSN FUNCTIONS
  // ===============================================================================================

  /**
   * @dev This section uses prettier-ignore because prettier removes the override keyword
   */

  /**
   * @dev Determine if we should receive a relayed call.
   * There are multiple ways to make this work, including:
   *   - having a whitelist of trusted users
   *   - only accepting calls to an onboarding function
   *   - charging users in tokens (possibly issued by you)
   *   - delegating the acceptance logic off-chain
   * All relayed call requests can be rejected at no cost to the recipient.
   *
   * In this function, we return a number indicating whether we:
   *   - Accept the call: 0, signalled by the call to `_approveRelayedCall()`
   *   - Reject the call: Any other number, signalled by the call to `_rejectRelayedCall(uint256)`
   *
   * We can also return some arbitrary data that will get passed along
   * to the pre and post functions as an execution context.
   *
   * Source: https://docs.openzeppelin.com/contracts/2.x/gsn#_acceptrelayedcall
   */
  // prettier-ignore
  function acceptRelayedCall(
    address relay,
    address from,
    bytes calldata encodedFunction,
    uint256 transactionFee,
    uint256 gasPrice,
    uint256 gasLimit,
    uint256 nonce,
    bytes calldata approvalData,
    uint256 maxPossibleCharge
  ) external view override returns (uint256, bytes memory) {
    // Approve all calls
    return _approveRelayedCall();
  }

  /**
   * @dev After call is accepted, but before it's executed, we can use
   * this function to charge the user for their call, perform some
   * bookeeping, etc.
   *
   * This function will inform us of the maximum cost the call may
   * have, and can be used to charge the user in advance. This is
   * useful if the user may spend their allowance as part of the call,
   * so we can lock some funds here.
   *
   * Source: https://docs.openzeppelin.com/contracts/2.x/gsn#_pre_and_postrelayedcall
   */
  // prettier-ignore
  function _preRelayedCall(bytes memory context) internal override returns (bytes32) {}

  /**
   * @dev After call is accepted and executed, we can use this function
   * to charge the user for their call, perform some bookeeping, etc.
   *
   * This function will give us an accurate estimate of the transaction
   * cost, making it a natural place to charge users. It will also let
   * us know if the relayed call reverted or not. This allows us, for
   * instance, to not charge users for reverted calls - but remember
   * that we will be charged by the relayer nonetheless.
   *
   * Source: https://docs.openzeppelin.com/contracts/2.x/gsn#_pre_and_postrelayedcall
   */
  // prettier-ignore
  function _postRelayedCall(bytes memory context, bool, uint256 actualCharge, bytes32) internal override {}

  function setRelayHubAddress() public {
    if (getHubAddr() == address(0)) {
      _upgradeRelayHub(0xD216153c06E857cD7f72665E0aF1d7D82172F494);
    }
  }

  function getRecipientBalance() public view returns (uint256) {
    return IRelayHub(getHubAddr()).balanceOf(address(this));
  }

  /**
   * @dev Withdraw funds from RelayHub
   * @param _amount Amount of Ether to withdraw
   * @param _recipient Address to send the Ether to
   */
  function withdrawRelayHubFunds(uint256 _amount, address payable _recipient) external onlyOwner {
    IRelayHub(getHubAddr()).withdraw(_amount, _recipient);
  }

  /**
   * @notice GSN function override
   * @dev https://github.com/OpenZeppelin/openzeppelin-contracts/releases/tag/v3.0.0-beta.0
   */
  // prettier-ignore
  function _msgSender() internal view override(Context, GSNRecipient) returns (address payable) {
    return GSNRecipient._msgSender();
  }

  /**
   * @notice GSN function override
   * @dev https://github.com/OpenZeppelin/openzeppelin-contracts/releases/tag/v3.0.0-beta.0
   */
  // prettier-ignore
  function _msgData() internal view override(Context, GSNRecipient) returns (bytes memory) {
    return GSNRecipient._msgData();
  }
}
