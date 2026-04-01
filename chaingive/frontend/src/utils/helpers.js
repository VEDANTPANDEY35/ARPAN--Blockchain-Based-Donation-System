import { ethers } from 'ethers';

export const formatETH = (weiValue) => {
    if (weiValue === undefined || weiValue === null) return "0 ETH";
    return `${ethers.formatEther(weiValue)} ETH`;
};

export const formatAddress = (address) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

export const formatDate = (unixTimestamp) => {
    if (!unixTimestamp) return "";
    const date = new Date(Number(unixTimestamp) * 1000);
    return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
};

export const isDeadlinePassed = (unixTimestamp) => {
    if (!unixTimestamp) return true;
    return Number(unixTimestamp) < Date.now() / 1000;
};

export const calculateProgress = (raised, goal) => {
    if (!goal || goal === 0n || goal === "0") return 0;
    try {
        const r = BigInt(raised);
        const g = BigInt(goal);
        if (g === 0n) return 0;
        const progress = Number((r * 100n) / g);
        return progress > 100 ? 100 : progress;
    } catch (err) {
        return 0;
    }
};

export const getEtherscanLink = (address, type = 'address') => {
    return `https://sepolia.etherscan.io/${type}/${address}`;
};
