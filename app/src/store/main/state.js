export default function () {
  return {
    // Wallet
    signer: undefined,
    provider: undefined,
    ethersProvider: undefined,
    userAddress: undefined,
    email: undefined,
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
