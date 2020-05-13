export function setWallet(state, wallet) {
  state.magic = wallet.magic;
  state.signer = wallet.signer;
  state.provider = wallet.provider;
  state.ethersProvider = wallet.ethersProvider;
  state.userAddress = wallet.userAddress;
}
