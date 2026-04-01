import React, { createContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

export const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
    const [account, setAccount] = useState(null);
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(true);
    const [networkId, setNetworkId] = useState(null);
    const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

    const checkMetaMask = () => {
        if (typeof window.ethereum === 'undefined') {
            setIsMetaMaskInstalled(false);
            return false;
        }
        setIsMetaMaskInstalled(true);
        return true;
    };

    const checkNetwork = async (currentProvider) => {
        if (!currentProvider) return;
        try {
            const network = await currentProvider.getNetwork();
            const chainId = network.chainId.toString();
            setNetworkId(chainId);

            if (chainId === '31337' || chainId === '11155111') {
                setIsCorrectNetwork(true);
            } else {
                setIsCorrectNetwork(false);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const connectWallet = async () => {
        if (!checkMetaMask()) return;
        try {
            const browserProvider = new ethers.BrowserProvider(window.ethereum);
            setProvider(browserProvider);

            const accounts = await browserProvider.send("eth_requestAccounts", []);
            if (accounts.length > 0) {
                setAccount(accounts[0]);
                setIsConnected(true);
                const currentSigner = await browserProvider.getSigner();
                setSigner(currentSigner);
                await checkNetwork(browserProvider);
            }
        } catch (err) {
            console.error("User rejected connection or error occurred:", err);
        }
    };

    const disconnectWallet = () => {
        setAccount(null);
        setSigner(null);
        setIsConnected(false);
    };

    const switchNetwork = async () => {
        if (!window.ethereum) return;
        const targetNetworkId = import.meta.env.VITE_NETWORK_ID || '31337';
        const hexChainId = `0x${Number(targetNetworkId).toString(16)}`;
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: hexChainId }],
            });
        } catch (error) {
            console.error("Failed to switch network:", error);
        }
    };

    useEffect(() => {
        checkMetaMask();

        if (window.ethereum) {
            const browserProvider = new ethers.BrowserProvider(window.ethereum);
            setProvider(browserProvider);

            const checkAndSetup = async () => {
                const _accounts = await browserProvider.send("eth_accounts", []);
                if (_accounts.length > 0) {
                    setAccount(_accounts[0]);
                    setIsConnected(true);
                    const currentSigner = await browserProvider.getSigner();
                    setSigner(currentSigner);
                    await checkNetwork(browserProvider);
                }
            };

            checkAndSetup();

            const handleAccountsChanged = async (accounts) => {
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                    setIsConnected(true);
                    const currentSigner = await browserProvider.getSigner();
                    setSigner(currentSigner);
                    await checkNetwork(browserProvider);
                } else {
                    disconnectWallet();
                }
            };

            const handleChainChanged = () => {
                window.location.reload();
            };

            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('chainChanged', handleChainChanged);

            return () => {
                if (window.ethereum) {
                    window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
                    window.ethereum.removeListener('chainChanged', handleChainChanged);
                }
            };
        }
    }, []);

    return (
        <Web3Context.Provider value={{
            account, provider, signer, isConnected, isMetaMaskInstalled, networkId, isCorrectNetwork, connectWallet, disconnectWallet, switchNetwork
        }}>
            {children}
        </Web3Context.Provider>
    );
};
