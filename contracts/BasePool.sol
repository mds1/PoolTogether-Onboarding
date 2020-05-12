pragma solidity ^0.6.0;


interface BasePool {
  function depositPool(uint256 _amount) external;

  function withdraw(uint256 amount) external;
}
