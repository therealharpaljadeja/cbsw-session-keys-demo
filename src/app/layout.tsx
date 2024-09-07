"use client";

import "./globals.css";
import { Inter } from "next/font/google";
import { type ReactNode } from "react";

import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout(props: { children: ReactNode }) {
    return (
        <html lang="en" className="w-full h-full">
            <body
                className={`${inter.className} w-full h-full flex flex-col justify-center items-center`}
            >
                <Providers>{props.children}</Providers>
            </body>
        </html>
    );
}
