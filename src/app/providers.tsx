"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { Buffer } from "buffer";
import { type State, WagmiProvider } from "wagmi";

import { getConfig } from "@/wagmi";
import { SessionKeysProvider } from "@/context/SessionKeysContext";

globalThis.Buffer = Buffer;

export function Providers(props: { children: ReactNode }) {
    const [config] = useState(() => getConfig());
    const [queryClient] = useState(() => new QueryClient());

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <SessionKeysProvider>{props.children}</SessionKeysProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
