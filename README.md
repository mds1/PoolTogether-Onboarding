# PoolTogether Easy Onboarding

The easiest way to start using PoolTogether

## Overview

- [Live site](https://pool-together.web.app/) (deployed on Kovan)
- Video demo (coming soon)

This tool enables an easy fiat on/off ramp for entering/exiting the PoolTogether pool. Features:

- Uses [Magic](https://magic.link/) for passwordless login, so all a user needs is an email address to login with web3
- Gas Station Network (GSN v1) support so the user does not need Ether for gas
- [Transak](https://transak.com/) is used for the fiat on-ramp which supports a wide range of countries and currencies

## Workflow

This section will describe the workflow from a user's perspective along with relevant implementation details.

### Initial Setup

This process occurs the first time a user uses this website:

1. Login
   1. User enters their email address
   2. User receives an email with a link for them to click to login. After clicking, they are logged ino the app and have a web3-enabled wallet generated for them behind the scenes.
2. User visits their dashboard and clicks "Buy tickets"
3. The first time they click this, a minimal proxy contract will be deployed for them
   1. This proxy contract acts as their wallet which is required for meta-transaction support (so users do not need ETH for gas)
   2. Deployment is done by calling `UserPoolFactory.createContract(target)` where `target` is the address of a deployed and initialized version of `UserPool.sol`. This deploys a [minimal proxy](https://blog.openzeppelin.com/deep-dive-into-the-minimal-proxy-contract/) for the user that delegates all calls to the deployed and initialized version of `UserPool.sol`.
   3. This call to `createContract(target)` is done by the user via a provider configured using OpenZeppelin's [GSN Provider](https://github.com/OpenZeppelin/openzeppelin-gsn-provider). This is what enables GSN support.
4. Once deployment is complete, they continue to the Transak widget which prompts them to purchase Dai
   1. **Do not currently use the widget as the app is on Kovan**
   2. Potential upgrade: Use CREATE2 to generate a deterministic proxy address and provide a better UX

### Enter Pool

This process occurs whenever a user wants to enter into the pool:

1. Login
2. Buy tickets through the Transak widget
   1. The widget will be configured purchase Dai and send it to the user's proxy wallet
3. User completes purchase in the widget and is redirected back to the website
4. Frontend updates once Dai is received by their proxy contract
5. Upon receiving Dai, the "Enter Pool" button will be enabled. Clicking this triggers the deposit of all Dai in the proxy contract into the PoolTogether pool.
   1. The specific function the user calls is `UserPoolFactory.deposit()`. Why do we call this on the factory contract instead of their proxy? The reason is because the GSN requires to you to fund the `RelayHub` with ETH for each contract you want to pay gas for. Those funds are then used to pay gas. It would be inefficient and inconvenient to fund `RelayHub` for another contract every time a new proxy contract is deployed. Instead, we enable users to interact with their proxy through the Factory contract, and the factory contract will look up the caller's proxy address. It's worth nothing that if a user does have ETH for gas, they can choose to interact with their proxy directly.
6. Once the transaction is complete, the user has successfully entered the pool.
   1. The dashboard will show whether their tickets are in the open or committed state.
   2. Once minted, the `plDai` will be sent to the user's proxy contract. This is good, and we do not want to send the tokens to their actual wallet because we assume the user has no ETH for gas and therefore tokens would be stuck in their wallet.
   3. If `plDai` in v3 adds `permit` support, we could remove the need for these proxy contracts

### Exiting the Pool

1. If user's proxy contract has tokens that can be redeemed, the "Exit Pool" button will be enabled. Clicking this currently withdraws all tokens (whether open or committed) to their proxy wallet.
   1. This works calling `UserPoolFactory.withdraw(amount, recipient)`, where `amount` is the number of tokens to redeem and `recipient` is the destination address. Again, we make this call using the GSN provider
   2. The `recipient` currently defaults to the user's proxy address. In a real flow, there are a few main ways to handle this. Either:
      1. Let users enter an arbitrary address to withdraw to, and assume they will know (or learn how) to offramp with an exchange, or
      2. Use Wyre or another provider that supports off-ramps via liquidation addresses. For example, once a user links a bank account with Wyre they will have a special address, and all funds sent to that address are automatically liquidated to their bank account.

## Development Setup

Create a file at the project root called .env with the following contents:

```bash
INFURA_ID=yourInfuraId
DAI_HOLDER=0x425249Cf0F2f91f488E24cF7B1AA3186748f7516
MNEMONIC="your mnemonic here"
```

Here, `DAI_HOLDER` is simply an account with a lot of Dai used to
acquire Dai for testing on Kovan.

Next, run `cd app` and create a file called `.env.dev` with the following contents:

```bash
MAGIC_API_KEY=magicApiKey
TRANSAK_API_KEY=transakApiKey
```

For production deployment, create a file similar to the above but called and `.env.prod` with the
same contents but different API keys

Now, from the project root install dependencies as follows:

```bash
npm install
cd app
npm install
```

### Run App

```bash
cd app
npm run dev
```

### Run Tests

From the project root run"

```bash
npm run test
```

### Deployment

1. Compile the contracts with `npx oz compile`
2. Make sure your `MNEMONIC` is set in `.env`
3. Run `npx oz accounts` to confirm the right address would be used for deployment
4. Run `npx oz deploy` and follow the prompts to deploy `UserPoolFactory.sol`
5. Run `npx oz deploy` and follow the prompts to deploy `UserPool.sol`.
6. Run `npx oz send-tx` and call the `initializePool()` function on the `UserPool` contract you just deployed. This contract is our logic template for proxy contracts, so you can pass in any address to this function. Using the deployer's address is suitable.
7. Now that the contract is deployed, we must fund it with Ether to pay for user's transaction costs. We can do this by visiting https://www.opengsn.org/recipients, entering the address of the `UserPoolFactory` contract, the adding Ether.

Done! There will now be a file called `.openzeppelin/<network>.json` which contains deployment info for the contracts. Be sure not to delete that file. This file should be committed to the repository.

For `UserPool.sol`, the `initializePool()` function is used in place of the constructor in order to call it when deployed as a proxy. Because the proxies simply delegatecall to the logic address, as opposed to a traditional deployment, we must simulate the constructor with this approach.
