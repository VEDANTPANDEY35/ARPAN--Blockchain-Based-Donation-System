import { useContext, useState } from 'react';
import { ethers } from 'ethers';
import { Web3Context } from '../context/Web3Context';
import DonationABI from '../utils/DonationABI.json';

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

export const useDonation = () => {
    const { provider, signer } = useContext(Web3Context);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getContract = (readOnly = true) => {
        if (!contractAddress || !DonationABI.abi) {
            throw new Error("Contract environment missing");
        }
        if (readOnly && provider) {
            return new ethers.Contract(contractAddress, DonationABI.abi, provider);
        } else if (!readOnly && signer) {
            return new ethers.Contract(contractAddress, DonationABI.abi, signer);
        }
        throw new Error("Provider or Signer not initialized");
    };

    const getAllCampaigns = async () => {
        try {
            const contract = getContract(true);
            const data = await contract.getAllCampaigns();
            return data;
        } catch (err) {
            console.error("Error fetching all campaigns:", err);
            return [];
        }
    };

    const getCampaign = async (id) => {
        try {
            const contract = getContract(true);
            return await contract.getCampaign(id);
        } catch (err) {
            console.error("Error fetching campaign:", err);
            return null;
        }
    };

    const getUserDonation = async (campaignId, userAddress) => {
        try {
            const contract = getContract(true);
            const amount = await contract.getUserDonation(campaignId, userAddress);
            return ethers.formatEther(amount);
        } catch (err) {
            console.error("Error fetching user donation:", err);
            return "0";
        }
    };

    const hasUserClaimedRefund = async (campaignId, userAddress) => {
        try {
            const contract = getContract(true);
            return await contract.hasUserClaimedRefund(campaignId, userAddress);
        } catch (err) {
            console.error("Error fetching refund status:", err);
            return false;
        }
    };

    const handleError = (err) => {
        const errorMap = {
            'InvalidGoal': 'Goal must be greater than zero.',
            'DeadlinePassed': 'This campaign deadline has passed.',
            'DeadlineNotPassed': 'Campaign deadline has not passed yet.',
            'CampaignNotFound': 'Campaign does not exist.',
            'NotCreator': 'Only the campaign creator can do this.',
            'GoalNotReached': 'Funding goal was not reached.',
            'AlreadyWithdrawn': 'Funds have already been withdrawn.',
            'NoDonation': 'You have no donation to refund.',
            'RefundAlreadyClaimed': 'You have already claimed your refund.',
            'ZeroDonation': 'Donation amount must be greater than zero.',
        };

        // Ethers v6 buries custom errors deep inside the error object
        const errorString = err.reason ||
            err.info?.error?.message ||
            err.data?.message ||
            err.message ||
            JSON.stringify(err);

        const matched = Object.keys(errorMap).find(key =>
            errorString.includes(key)
        );

        const friendlyMessage = matched
            ? errorMap[matched]
            : (err.reason || 'Transaction failed. Please try again.');

        return new Error(friendlyMessage);
    };

    const createCampaign = async (title, description, goalETH, deadlineTimestamp) => {
        setLoading(true);
        setError(null);
        try {
            const contract = getContract(false);
            const goalWei = ethers.parseEther(goalETH.toString());
            const tx = await contract.createCampaign(title, description, goalWei, deadlineTimestamp);
            const receipt = await tx.wait();
            setLoading(false);
            return receipt;
        } catch (err) {
            console.error("Error creating campaign:", err);
            const customErr = handleError(err);
            setError(customErr.message);
            setLoading(false);
            throw customErr;
        }
    };

    const donate = async (campaignId, amountETH) => {
        setLoading(true);
        setError(null);
        try {
            const contract = getContract(false);
            const amountWei = ethers.parseEther(amountETH.toString());
            const tx = await contract.donate(campaignId, { value: amountWei });
            const receipt = await tx.wait();
            setLoading(false);
            return receipt;
        } catch (err) {
            console.error("Error donating:", err);
            const customErr = handleError(err);
            setError(customErr.message);
            setLoading(false);
            throw customErr;
        }
    };

    const withdrawFunds = async (campaignId) => {
        setLoading(true);
        setError(null);
        try {
            const contract = getContract(false);
            const tx = await contract.withdrawFunds(campaignId);
            const receipt = await tx.wait();
            setLoading(false);
            return receipt;
        } catch (err) {
            console.error("Error withdrawing funds:", err);
            const customErr = handleError(err);
            setError(customErr.message);
            setLoading(false);
            throw customErr;
        }
    };

    const claimRefund = async (campaignId) => {
        setLoading(true);
        setError(null);
        try {
            const contract = getContract(false);
            const tx = await contract.claimRefund(campaignId);
            const receipt = await tx.wait();
            setLoading(false);
            return receipt;
        } catch (err) {
            console.error("Error claiming refund:", err);
            const customErr = handleError(err);
            setError(customErr.message);
            setLoading(false);
            throw customErr;
        }
    };

    return { getAllCampaigns, getCampaign, createCampaign, donate, withdrawFunds, claimRefund, getUserDonation, hasUserClaimedRefund, loading, error };
};
