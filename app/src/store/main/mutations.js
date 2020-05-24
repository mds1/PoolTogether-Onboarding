export function setWallet(state, wallet) {
  // Account info
  state.magic = wallet.magic;
  state.signer = wallet.signer;
  state.provider = wallet.provider;
  state.ethersProvider = wallet.ethersProvider;
  state.userAddress = wallet.userAddress;
  state.email = wallet.email;
  // Balances
  if (wallet.balances) {
    state.balances.daiInProxy = wallet.balances.daiInProxy;
    state.balances.committedBalance = wallet.balances.committedBalance;
    state.balances.openBalance = wallet.balances.openBalance;
  }
  // Contracts
  state.proxyLogic = wallet.proxyLogic;
  state.proxy = wallet.proxy;
  state.proxyInstance = wallet.proxyInstance;
  state.factoryInstance = wallet.factoryInstance;
  state.basePoolInstance = wallet.basePoolInstance;
}

export function setProxyAddress(state, address) {
  state.proxy = address;
}

export function setPrizeData(state, prizeData) {
  state.pt.totalEarningInterest = prizeData.totalEarningInterest;
  state.pt.eligibleTickets = prizeData.eligibleTickets;
  state.pt.openTickets = prizeData.openTickets;
  state.pt.sponsored = prizeData.sponsored;
  state.pt.estimatedPrize = prizeData.estimatedPrize;
  state.pt.prizeDrawingDate = prizeData.prizeDrawingDate;
}
