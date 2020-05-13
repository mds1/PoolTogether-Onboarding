import { ethers } from 'ethers';

export async function setEthereumData({ commit }, magic) {
  // Get user's wallet info from provider
  const provider = magic.rpcProvider;
  const ethersProvider = new ethers.providers.Web3Provider(provider);
  const signer = ethersProvider.getSigner();
  const metadata = await magic.user.getMetadata();
  const userAddress = metadata.publicAddress;
  commit('setWallet', {
    magic, provider, ethersProvider, signer, userAddress,
  });
}
