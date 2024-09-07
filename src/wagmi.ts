import { http, cookieStorage, createConfig, createStorage } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { coinbaseWallet } from "wagmi/connectors";

export function getConfig() {
    return createConfig({
        chains: [baseSepolia],
        connectors: [
            coinbaseWallet({
                appName: "CBSW Session Keys Demo",
                preference: "smartWalletOnly",
            }),
        ],
        storage: createStorage({
            storage: cookieStorage,
        }),
        ssr: true,
        transports: {
            [baseSepolia.id]: http(
                "https://api.developer.coinbase.com/rpc/v1/base-sepolia/xbCpBPNZlgaflnfPY81NM6E2M9ApALr4"
            ),
        },
    });
}

declare module "wagmi" {
    interface Register {
        config: ReturnType<typeof getConfig>;
    }
}
