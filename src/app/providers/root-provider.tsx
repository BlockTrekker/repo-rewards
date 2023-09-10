"use client";

import Web3Providers from "./web3-provider";

import { SessionProvider } from "next-auth/react";

interface RootProviderProps {
  children: React.ReactNode;
}

export default function RootProviders({ children }: RootProviderProps) {
  return (
    <Web3Providers>
      <SessionProvider>{children}</SessionProvider>
    </Web3Providers>
  );
}
