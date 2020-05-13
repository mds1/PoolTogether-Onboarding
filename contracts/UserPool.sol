pragma solidity ^0.6.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "./BasePool.sol";


contract UserPool is Ownable, Initializable {
  /**
   * @notice This variable is the address of the parent factory contract. This is used to
   * restrict function calls to being either directly from the user or from the factory contract
   */
  address public factory;

  /**
   * @notice Define contracts we need access to
   */
  BasePool constant pool = BasePool(0x29fe7D60DdF151E5b52e5FAB4f1325da6b2bD958);
  IERC20 constant dai = IERC20(0x6B175474E89094C44Da98b954EedeAC495271d0F);

  /**
   * @notice Emitted when user deposits into the pool
   * @param amount Number of Dai deposited
   */
  event Deposited(uint256 indexed amount);

  /**
   * @notice Emitted when user withdraws from the pool
   * @param amount Number of Dai withdrawn
   * @param recipient Address the withdrawn Dai was sent to
   */
  event Withdrawn(uint256 indexed amount, address indexed recipient);

  /**
   * @notice Emitted when a token is withdrawn
   * @param amount Number of tokens withdrawn
   * @param token Address of token withdrawn
   * @param recipient Address the withdrawn token was sent to
   */
  event TokensWithdrawn(uint256 indexed amount, address indexed token, address indexed recipient);

  /**
   * @notice Emitted when Ether is withdrawn
   * @param amount Number of Ether withdrawn
   * @param recipient Address the withdrawn Ether was sent to
   */
  event EtherWithdrawn(uint256 indexed amount, address indexed recipient);

  // ===============================================================================================
  //                                        MAIN FUNCTIONALITY
  // ===============================================================================================

  modifier onlyUser() {
    require(owner() == _msgSender() || factory == _msgSender(), "UserPool: Caller not authorized");
    _;
  }

  /**
   * @notice Replaces constructor since these are deployed as minimal proxies from a factory
   * @param _user The user who this contract is for
   */
  function initializePool(address _user) external initializer {
    dai.approve(address(pool), uint256(-1));
    transferOwnership(_user); // change ownership from factory to user
  }

  /**
   * @notice Deposits all Dai held by this contract into the pool
   * @dev The only purpose of this contract is to enter/exit the pools, so we assume
   * there is no reason not to deposit all Dai held by this contract. Additionally,
   * we intentionally do not mark this onlyOwner so anyone can call this function
   * on behalf of the user.
   */
  function deposit() external {
    uint256 _amount = dai.balanceOf(address(this));
    pool.depositPool(_amount);
    emit Deposited(_amount);
  }

  /**
   * @notice Withdraw the specified amount of Dai to the provided address
   * @dev We include a destination address since we assume the user does not have
   * Ether for gas, so may want to withdraw to e.g. a Wyre liquidiation address
   * @param _amount Amount of Dai to withdraw
   * @param _recipient Address to send funds to
   */
  function withdraw(uint256 _amount, address _recipient) external onlyUser {
    pool.withdraw(_amount);
    require(dai.transfer(_recipient, _amount), "UserPool: Withdrawal failed");
    emit Withdrawn(_amount, _recipient);
  }

  // ===============================================================================================
  //                                        ESCAPE HATCHES
  // ===============================================================================================

  /**
   * @notice Transfers all tokens of the input adress to the recipient. This is
   * useful if tokens were accidentally sent to this contract.
   * @param _tokenAddress address of token to send
   * @param _recipient address to send tokens to
   */
  function withdrawTokens(address _tokenAddress, address _recipient) external onlyUser {
    IERC20 _token = IERC20(_tokenAddress);
    uint256 _balance = _token.balanceOf(address(this));
    emit TokensWithdrawn(_balance, _tokenAddress, _recipient);
    _token.transfer(_recipient, _balance);
  }

  /**
   * @notice Transfers all Ether to the specified address. This is useful if Ether was
   * accidentally sent to this contract.
   * @param _recipient address to send tokens to
   */
  function withdrawEther(address _recipient) external onlyUser {
    uint256 _balance = address(this).balance;
    emit EtherWithdrawn(_balance, _recipient);
    payable(_recipient).transfer(_balance);
  }
}
