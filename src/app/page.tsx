"use client";

import { useAccount, useConnect } from "wagmi";
import { Hex, parseEther, toFunctionSelector } from "viem";
import { useGrantPermissions } from "wagmi/experimental";
import { createCredential } from "webauthn-p256";
import { clickAddress } from "@/click";
import CoinbaseButton, { buttonStyles } from "@/components/CoinbaseButton";
import CurrencySwipeGame from "./CurrencyGame";
import { useSessionKeys } from "@/context/SessionKeysContext";
import { CoinbaseWalletLogo } from "@/components/CoinbaseWalletLogo";
// import useIndexedDB from "@/hooks/useIndexedDb";

function App() {
    const account = useAccount();
    const { connectors } = useConnect();
    const {
        setPermissionsContext,
        setCredential,
        permissionsContext,
        credential,
    } = useSessionKeys();
    const { grantPermissionsAsync } = useGrantPermissions();
    // const { addData } = useIndexedDB();

    const grantPermissions = async () => {
        if (account.address) {
            const newCredential = await createCredential({ type: "cryptoKey" });
            const response = await grantPermissionsAsync({
                permissions: [
                    {
                        address: account.address,
                        chainId: 84532,
                        expiry: 17218875770,
                        signer: {
                            type: "key",
                            data: {
                                type: "secp256r1",
                                publicKey: newCredential.publicKey,
                            },
                        },
                        permissions: [
                            {
                                type: "native-token-recurring-allowance",
                                data: {
                                    allowance: parseEther("0.1"),
                                    start: Math.floor(Date.now() / 1000),
                                    period: 86400,
                                },
                            },
                            {
                                type: "allowed-contract-selector",
                                data: {
                                    contract: clickAddress,
                                    selector: toFunctionSelector(
                                        "permissionedCall(bytes calldata call)"
                                    ),
                                },
                            },
                        ],
                    },
                ],
            });

            const context = response[0].context as Hex;
            setPermissionsContext(context);
            setCredential(newCredential);
        }
    };

    return (
        <>
            <div className="flex flex-col items-center">
                {account.isConnected ? (
                    permissionsContext && credential ? (
                        <CurrencySwipeGame />
                    ) : (
                        <div className="flex flex-col justify-center items-center space-y-4">
                            <h2 className="text-2xl font-bold">Make It Rain</h2>
                            <span>{account.address}</span>
                            <button
                                onClick={grantPermissions}
                                style={buttonStyles}
                            >
                                <CoinbaseWalletLogo />

                                <span
                                    style={{
                                        marginLeft: "10px",
                                        color: "white",
                                    }}
                                >
                                    Grant Permissions
                                </span>
                            </button>
                        </div>
                    )
                ) : (
                    <div className="flex flex-col justify-center items-center space-y-4">
                        <h2 className="text-2xl font-bold">Make It Rain</h2>

                        {connectors
                            .filter(
                                (connector) =>
                                    connector.id === "coinbaseWalletSDK"
                            )
                            .map((connector) => (
                                <CoinbaseButton key={connector.id} />
                            ))}
                    </div>
                )}
            </div>
        </>
    );
}

export default App;
