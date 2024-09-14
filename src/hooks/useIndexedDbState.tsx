import { useEffect, useState } from "react";
import { openDB } from "idb";
import { checksumAddress, Hex } from "viem";
import { useAccount } from "wagmi";
import { P256Credential } from "webauthn-p256";

type Types = {
    credential: Omit<P256Credential<"cryptokey">, "sign">;
    context: Hex;
};

async function getDatabase(key: string) {
    return openDB("cbsw", 1, {
        upgrade(db: any) {
            if (!db.objectStoreNames.contains(key)) {
                const contextStore = db.createObjectStore("context", {
                    keyPath: "address",
                });
                const credentialStore = db.createObjectStore("credential", {
                    keyPath: "address",
                });
                contextStore.createIndex("address", "address", {
                    unique: true,
                });
                credentialStore.createIndex("address", "address", {
                    unique: true,
                });
            }
        },
    });
}

const useIndexedDBState = <T extends keyof Types>(
    key: T,
    initialValue: Types[T] | undefined
) => {
    const [state, setState] = useState<Types[T] | undefined>(initialValue);
    const { address } = useAccount();

    // Create or open the database
    useEffect(() => {
        const initDB = async () => {
            if (address) {
                const db = await getDatabase(key);

                const storedValue = await db.get(key, checksumAddress(address));
                if (storedValue !== undefined) {
                    if (key === "credential") {
                        const { credential } = storedValue as {
                            address: Hex;
                            credential: Types[T];
                        };
                        setState(credential);
                    } else {
                        const { context } = storedValue as {
                            address: Hex;
                            context: Types[T];
                        };
                        setState(context);
                    }
                }
            }
        };

        initDB();
    }, [key, address]);

    // Store value in IndexedDB on state change
    useEffect(() => {
        const saveToDB = async () => {
            if (address) {
                const db = await getDatabase(key);
                if (key === "credential") {
                    await db.put(key, {
                        address: checksumAddress(address),
                        credential: state,
                    });
                } else {
                    await db.put(key, {
                        address: checksumAddress(address),
                        context: state,
                    });
                }
            }
        };

        if (state !== undefined) {
            saveToDB();
        }
    }, [state, key]);

    return { state, setState };
};

export default useIndexedDBState;
