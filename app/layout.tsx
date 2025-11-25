import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./components/Providers";
import Navbar from "./components/Navbar";

export const metadata: Metadata = {
    title: "Tattva | Premium E-commerce",
    description: "Minimalistic e-commerce platform",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body>
                <Providers>
                    <div className="min-h-screen flex flex-col">
                        <Navbar />
                        <main className="flex-1">
                            {children}
                        </main>
                        <footer className="border-t border-[var(--border)] py-8 mt-12">
                            <div className="container text-center text-sm opacity-60">
                                © 2024 Tattva Inc. All rights reserved.
                            </div>
                        </footer>
                    </div>
                </Providers>
            </body>
        </html>
    );
}
