import useIndexedDB from "@/hooks/useIndexedDb";
import React, { ReactNode, useContext, useEffect, useState } from "react";
import { encodeFunctionData, Hex } from "viem";
import {
    useAccount,
    useWaitForTransactionReceipt,
    useWalletClient,
} from "wagmi";
import { P256Credential, signWithCredential } from "webauthn-p256";
import { clickAbi, clickAddress } from "@/click";
import { useSendCalls } from "wagmi/experimental";

interface SessionKeyContextType {
    permissionsContext?: Hex;
    credential?: P256Credential<"cryptokey">;
    submitted: boolean;
    callsId: string | undefined;
    setSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
    setCallsId: React.Dispatch<React.SetStateAction<string | undefined>>;
    setPermissionsContext: React.Dispatch<
        React.SetStateAction<`0x${string}` | undefined>
    >;
    setCredential: React.Dispatch<React.SetStateAction<any | undefined>>;
    click: () => Promise<void>;
}

const SessionKeysContext = React.createContext<SessionKeyContextType | null>(
    null
);

interface SessionKeysProviderProps {
    children: ReactNode;
}

export const SessionKeysProvider: React.FC<SessionKeysProviderProps> = ({
    children,
}) => {
    const account = useAccount();
    const { data: walletClient } = useWalletClient();
    const [permissionsContext, setPermissionsContext] = useState<
        Hex | undefined
    >();
    const [credential, setCredential] = useState<
        undefined | P256Credential<"cryptokey">
    >();
    const [submitted, setSubmitted] = useState(false);
    const [callsId, setCallsId] = useState<string>();
    const { sendCallsAsync } = useSendCalls();

    const click = async () => {
        console.log(
            account.address,
            permissionsContext,
            credential,
            walletClient
        );
        if (
            account.address &&
            permissionsContext &&
            credential &&
            walletClient
        ) {
            setSubmitted(true);
            setCallsId(undefined);
            console.log("Click");
            try {
                const callsId = await sendCallsAsync({
                    calls: [
                        {
                            to: clickAddress,
                            value: BigInt(0),
                            data: encodeFunctionData({
                                abi: clickAbi,
                                functionName: "click",
                                args: [],
                            }),
                        },
                    ],
                    capabilities: {
                        permissions: {
                            context: permissionsContext,
                        },
                        paymasterService: {
                            url: "https://api.developer.coinbase.com/rpc/v1/base-sepolia/xbCpBPNZlgaflnfPY81NM6E2M9ApALr4",
                        },
                    },
                    signatureOverride: signWithCredential(credential),
                });
                console.log("Calls Id:", callsId);
                setCallsId(callsId);
            } catch (e: unknown) {
                console.error(e);
            }
            setSubmitted(false);
        }
    };
    // const { openDatabase, getData, addData } = useIndexedDB();

    // useEffect(() => {
    //     async function init() {
    //         const data = await getData("sessions", Number(address));
    //         if (data) {
    //             setPermissionsContext(data.context as Hex);
    //             setCredential(
    //                 data.credential as unknown as P256Credential<"cryptokey">
    //             );
    //         }
    //     }

    //     init();
    // }, []);

    return (
        <SessionKeysContext.Provider
            value={{
                permissionsContext,
                credential,
                submitted,
                callsId,
                setCallsId,
                setSubmitted,
                setPermissionsContext,
                setCredential,
                click,
            }}
        >
            {children}
        </SessionKeysContext.Provider>
    );
};

// Create a custom hook to use the context
export const useSessionKeys = () => {
    const context = useContext(SessionKeysContext);
    if (context === null) {
        throw new Error("useMyContext must be used within a MyProvider");
    }
    return context;
};
