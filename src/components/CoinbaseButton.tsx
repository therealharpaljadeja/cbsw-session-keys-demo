import React, { ButtonHTMLAttributes, DetailedHTMLProps } from "react";
import { CoinbaseWalletLogo } from "./CoinbaseWalletLogo";
import { useAccount, useConnect, useDisconnect } from "wagmi";

export const buttonStyles = {
    background: "transparent",
    border: "1px solid transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontFamily: "Arial, sans-serif",
    fontSize: 16,
    backgroundColor: "#0052FF",
    padding: "8px 20px 8px 14px",
    borderRadius: 10,
};

export default function CoinbaseButton({
    onClick,
    ...rest
}: DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
>) {
    const { connect, connectors } = useConnect();
    const { isConnected } = useAccount();
    const { disconnect } = useDisconnect();

    function connectToSmartWallet() {
        const coinbaseWalletConnector = connectors.find(
            (connector) => connector.id === "coinbaseWalletSDK"
        );

        if (coinbaseWalletConnector) {
            connect({ connector: coinbaseWalletConnector });
        }
    }

    if (isConnected)
        return (
            <button style={buttonStyles} onClick={() => disconnect()}>
                <CoinbaseWalletLogo />
                <span style={{ marginLeft: "10px", color: "white" }}>
                    Disconnect
                </span>
            </button>
        );

    return (
        <button
            style={buttonStyles}
            onClick={onClick ? onClick : connectToSmartWallet}
        >
            <CoinbaseWalletLogo />
            <span style={{ marginLeft: "10px", color: "white" }}>
                Connect Wallet
            </span>
        </button>
    );
}
