export default function () {
  return {
    // Wallet
    magic: undefined,
    signer: undefined,
    provider: undefined,
    ethersProvider: undefined,
    userAddress: undefined,
    email: undefined,
    // Balances
    balances: {
      daiInProxy: undefined,
      committedBalance: undefined,
      openBalance: undefined,
    },
    // Contracts
    proxyLogic: undefined, // proxy logic address
    proxy: undefined, // user proxy address
    proxyInstance: undefined, // user's proxy contract instance
    factoryInstance: undefined, // factory instance
    basePoolInstance: undefined,
    // Prize info
    pt: {
      totalEarningInterest: undefined,
      eligibleTickets: undefined,
      openTickets: undefined,
      sponsored: undefined,
      estimatedPrize: undefined,
      prizeDrawingDate: undefined,
    },
  };
}
