export function setWallet(state, wallet) {
  state.magic = wallet.magic;
  state.signer = wallet.signer;
  state.provider = wallet.provider;
  state.ethersProvider = wallet.ethersProvider;
  state.userAddress = wallet.userAddress;
}

export function setPrizeData(state, prizeData) {
  state.pt.totalEarningInterest = prizeData.totalEarningInterest;
  state.pt.eligibleTickets = prizeData.eligibleTickets;
  state.pt.openTickets = prizeData.openTickets;
  state.pt.sponsored = prizeData.sponsored;
  state.pt.estimatedPrize = prizeData.estimatedPrize;
  state.pt.prizeDrawingDate = prizeData.prizeDrawingDate;
}
