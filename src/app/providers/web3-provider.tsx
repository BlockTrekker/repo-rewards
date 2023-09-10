"use client";

import { ReactNode } from "react";

import { configureChains, createConfig, WagmiConfig } from "wagmi";
import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from "@web3modal/ethereum";
import { mainnet, optimism, arbitrum, base, goerli } from "wagmi/chains";
import { Web3Modal } from "@web3modal/react";

interface Web3ProviderProps {
  children: ReactNode;
}

const projectId = process.env.NEXT_PUBLIC_W3WCC_ID as string;
const chains = [mainnet, optimism, arbitrum, base, goerli];

const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient,
});

const ethereumClient = new EthereumClient(wagmiConfig, chains);

function Web3Provider({ children }: Web3ProviderProps) {
  return (
    <>
      <WagmiConfig config={wagmiConfig}>{children}</WagmiConfig>
      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    </>
  );
}

export default Web3Provider;
