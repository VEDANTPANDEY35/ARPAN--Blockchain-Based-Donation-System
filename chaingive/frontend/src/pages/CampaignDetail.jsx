import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ethers } from 'ethers';
import { useDonation } from '../hooks/useDonation';
import { Web3Context } from '../context/Web3Context';
import { useToast } from '../context/ToastContext';
import { formatETH, formatAddress, formatDate, isDeadlinePassed, calculateProgress, getEtherscanLink } from '../utils/helpers';
import DonationABI from '../utils/DonationABI.json';

const CampaignDetail = () => {
    const { id } = useParams();
    const { provider, account, isConnected, connectWallet } = useContext(Web3Context);
    const { getCampaign, donate, withdrawFunds, claimRefund, getUserDonation, hasUserClaimedRefund } = useDonation();
    const { showToast } = useToast();

    const [campaign, setCampaign] = useState(null);
    const [loadingConfig, setLoadingConfig] = useState({ fetch: true, action: false });
    const [donationAmount, setDonationAmount] = useState("");
    const [progress, setProgress] = useState(0);
    const [donorFeed, setDonorFeed] = useState([]);
    const [userDonation, setUserDonation] = useState("0");
    const [hasClaimedRefund, setHasClaimedRefund] = useState(false);
    const [activeTab, setActiveTab] = useState("Overview");

    useEffect(() => {
        const fetchEventData = async () => {
            // Event filtering simulation or live querying
            if (!provider || !DonationABI.address) return;
            try {
                const contract = new ethers.Contract(DonationABI.address, DonationABI.abi, provider);
                const filter = contract.filters.DonationReceived(Number(id), null, null);
                const events = await contract.queryFilter(filter);
                const latestDonors = events.map(event => ({
                    donor: event.args[1],
                    amount: event.args[2],
                    txHash: event.transactionHash
                })).reverse();
                setDonorFeed(latestDonors);
            } catch (err) {
                console.error("Error fetching events:", err);
            }
        };

        const loadData = async () => {
            setLoadingConfig(prev => ({ ...prev, fetch: true }));
            const data = await getCampaign(id);

            if (data && Number(data.id) > 0) {
                setCampaign(data);
                setTimeout(() => {
                    setProgress(calculateProgress(data.raised, data.goal));
                }, 200);

                if (account) {
                    const uDonation = await getUserDonation(id, account);
                    setUserDonation(uDonation);

                    const refundStat = await hasUserClaimedRefund(id, account);
                    setHasClaimedRefund(refundStat);
                }
            }
            await fetchEventData();
            setLoadingConfig(prev => ({ ...prev, fetch: false }));
        };

        loadData();
        // Setting up polling for latest events/state could be added
        const interval = setInterval(loadData, 10000);
        return () => clearInterval(interval);
    }, [id, provider, account]);

    if (loadingConfig.fetch) {
        return <div className="min-h-[70vh] flex items-center justify-center"><div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>;
    }

    if (!campaign) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-center">
                <h1 className="text-4xl font-bold mb-4">Campaign Not Found</h1>
                <Link to="/" className="btn-primary mt-4">Back to Home</Link>
            </div>
        );
    }

    const deadlinePassed = isDeadlinePassed(campaign.deadline.toString());
    const minGoalReached = campaign.raised >= campaign.goal;
    const isCreator = account?.toLowerCase() === campaign.creator.toLowerCase();

    let badgeText = "🟢 Active";
    let badgeColor = "text-emerald-400 border-emerald-400/30 bg-emerald-400/10";
    if (deadlinePassed) {
        if (minGoalReached) {
            badgeText = campaign.withdrawn ? "✅ Funds Withdrawn" : "✅ Funded";
            badgeColor = "text-teal-400 border-teal-400/30 bg-teal-400/10";
        } else {
            badgeText = "⏰ Expired";
            badgeColor = "text-rose-400 border-rose-400/30 bg-rose-400/10";
        }
    }

    const handleDonate = async () => {
        if (!donationAmount || Number(donationAmount) <= 0) {
            showToast("Please enter a valid ETH amount", "error");
            return;
        }
        setLoadingConfig(prev => ({ ...prev, action: true }));
        try {
            showToast("Confirm in MetaMask...", "pending");
            await donate(campaign.id, donationAmount);
            showToast("Transaction confirmed! ✅", "success");
            setDonationAmount("");
        } catch (err) {
            showToast(err.message || "Transaction failed.", "error");
        }
        setLoadingConfig(prev => ({ ...prev, action: false }));
    };

    const handleAction = async (actionType) => {
        setLoadingConfig(prev => ({ ...prev, action: true }));
        try {
            showToast("Confirm in MetaMask...", "pending");
            if (actionType === 'withdraw') await withdrawFunds(campaign.id);
            else if (actionType === 'refund') await claimRefund(campaign.id);
            showToast("Transaction confirmed! ✅", "success");
        } catch (err) {
            showToast(err.message || "Transaction failed.", "error");
        }
        setLoadingConfig(prev => ({ ...prev, action: false }));
    };
    return (
        <div className="bg-transparent min-h-screen pt-20 pb-24 font-inter">
            {/* Header Banner */}
            <div className="w-full h-64 bg-gradient-to-r from-brand-primary to-[#0891b2] relative"></div>

            <div className="max-w-7xl mx-auto px-6 -mt-24 relative z-10">

                {/* Breadcrumbs */}
                <nav className="flex text-sm text-white/80 font-medium mb-6 backdrop-blur-sm bg-black/10 w-fit px-4 py-1.5 rounded-full" aria-label="Breadcrumb">
                    <ol className="inline-flex items-center space-x-1 md:space-x-3">
                        <li className="inline-flex items-center">
                            <Link to="/" className="hover:text-white transition">Home</Link>
                        </li>
                        <li>
                            <div className="flex items-center">
                                <svg className="w-4 h-4 mx-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                <Link to="/" className="hover:text-white transition">Directory</Link>
                            </div>
                        </li>
                        <li aria-current="page">
                            <div className="flex items-center">
                                <svg className="w-4 h-4 mx-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                <span className="text-white">NGO Profile</span>
                            </div>
                        </li>
                    </ol>
                </nav>

                {/* Profile Header Card */}
                <div className="bg-[#0B0F19]/60 backdrop-blur-3xl border border-white/10 rounded-3xl p-10 mb-10 flex flex-col md:flex-row gap-10 items-start md:items-end shadow-2xl">
                    <div className="w-40 h-40 rounded-3xl border-2 border-white/10 bg-[#161F31] flex items-center justify-center -mt-24 mb-4 z-10 shadow-2xl transform -rotate-3 hover:rotate-0 transition-transform duration-500 overflow-hidden shrink-0">
                        <span className="text-5xl font-black font-poppins text-brand-secondary">
                            {campaign?.creator ? campaign.creator.substring(2, 4).toUpperCase() : "AR"}
                        </span>
                    </div>

                    <div className="flex-grow">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl md:text-4xl font-poppins font-bold text-white">{campaign.title}</h1>
                            {minGoalReached && <span className="verified-badge bg-gradient-to-r from-brand-success to-emerald-600">✅ Verified</span>}
                        </div>
                        <p className="text-gray-400 text-lg mb-4">Supporting marginalized communities across the region.</p>
                        <div className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-widest font-black">
                            <span className={`px-4 py-1.5 rounded-full border backdrop-blur-md ${badgeColor}`}>
                                {badgeText}
                            </span>
                            <span className="text-gray-400 flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full border border-white/5">📍 NGO HQ</span>
                            <span className="text-gray-400 flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full border border-white/5">📄 80G COMPLIANT</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3 w-full md:w-auto mt-6 md:mt-0">
                        <a href={getEtherscanLink(campaign.creator)} target="_blank" rel="noreferrer" className="btn-secondary px-6 py-3 whitespace-nowrap">
                            Verify Smart Contract ↗
                        </a>
                        <button className="btn-secondary px-4 py-3 bg-white/5 border-white/10 text-white hover:bg-gray-100 font-normal">
                            Share
                        </button>
                    </div>
                </div>

                {/* Sticky Tab Navigation (Dummy Visual) */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 text-white px-6 py-4 mb-8 sticky top-20 z-20 overflow-x-auto whitespace-nowrap">
                    <div className="flex gap-8 font-medium">
                        {["Overview", "Programs", "Financials", "Contact", "Reviews"].map(tab => (
                            <span
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`${activeTab === tab ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-400 hover:text-white'} pb-1 cursor-pointer transition-all duration-300`}
                            >
                                {tab}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* LEFT COLUMN */}
                    <div className="flex-1 flex flex-col gap-8">
                        {activeTab === "Overview" && (
                            <>
                                {/* About Section */}
                                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-10 rounded-[2.5rem]">
                                    <h2 className="text-2xl font-poppins font-black mb-6 text-white flex items-center gap-3 uppercase tracking-tighter">
                                        <span className="w-2 h-8 bg-brand-secondary rounded-full"></span>
                                        Mission Strategy
                                    </h2>
                                    <blockquote className="pl-6 border-l-4 border-brand-secondary italic text-brand-secondary text-2xl mb-10 font-light leading-relaxed">
                                        "Empowering the underserved through transparent blockchain-based funding."
                                    </blockquote>
                                    <h3 className="text-lg font-bold mb-4 text-white uppercase tracking-widest opacity-60">About Our NGO</h3>
                                    <div className="text-gray-300 leading-relaxed whitespace-pre-wrap text-lg font-light">
                                        {campaign.description}
                                    </div>
                                </div>

                                {/* Impact Stats */}
                                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-10 rounded-[2.5rem]">
                                    <h2 className="text-2xl font-poppins font-black mb-10 text-white flex items-center gap-3 uppercase tracking-tighter">
                                        <span className="w-2 h-8 bg-brand-secondary rounded-full"></span>
                                        On-Chain Impact
                                    </h2>

                                    <div className="flex flex-col mb-10">
                                        <div className="flex items-baseline mb-4 justify-between">
                                            <div className="flex items-baseline">
                                                <span className="text-5xl md:text-7xl font-black text-brand-secondary mr-3 tracking-tighter">{formatETH(campaign.raised)}</span>
                                                <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">raised of {formatETH(campaign.goal)} target</span>
                                            </div>
                                            <span className="text-3xl font-black text-white">{progress.toFixed(0)}%</span>
                                        </div>
                                        <div className="w-full bg-white/5 rounded-full h-4 overflow-hidden border border-white/5 p-1 shadow-inner">
                                            <div className="bg-brand-secondary h-2 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(208,227,197,0.6)]" style={{ width: `${progress}%` }}></div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                        <div className="bg-white/5 p-6 rounded-3xl border border-white/5 hover:bg-white/10 transition-all text-center group">
                                            <p className="text-4xl font-black text-brand-secondary mb-2 group-hover:scale-110 transition-transform">{donorFeed.length}</p>
                                            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">Verified Donors</p>
                                        </div>
                                        <div className="bg-white/5 p-6 rounded-3xl border border-white/5 hover:bg-white/10 transition-all text-center group">
                                            <p className="text-4xl font-black text-brand-secondary mb-2 group-hover:scale-110 transition-transform">{deadlinePassed ? "0" : Math.ceil((Number(campaign.deadline) * 1000 - Date.now()) / 86400000)}</p>
                                            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">{deadlinePassed ? "Ended" : "Days Remaining"}</p>
                                        </div>
                                        <div className="bg-white/5 p-6 rounded-3xl border border-white/5 hover:bg-white/10 transition-all text-center group">
                                            <p className="text-4xl font-black text-brand-secondary mb-2 group-hover:scale-110 transition-transform">{progress.toFixed(0)}%</p>
                                            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">Goal Status</p>
                                        </div>
                                        <div className="bg-white/5 p-6 rounded-3xl border border-white/5 hover:bg-white/10 transition-all text-center group">
                                            <p className="text-4xl font-black text-brand-secondary mb-2 group-hover:scale-110 transition-transform truncate">
                                                {(parseFloat(ethers.formatEther(campaign?.raised || 0n)) * 12.5).toFixed(0)}
                                            </p>
                                            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">Lives Empowered</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Donors / Activity Feed */}
                                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-10 rounded-[2.5rem] mb-12 shadow-2xl">
                                    <h2 className="text-2xl font-poppins font-black mb-8 text-white flex items-center gap-3 uppercase tracking-tighter">
                                        <span className="w-2 h-8 bg-[#eab308] rounded-full"></span>
                                        Supporter Network
                                    </h2>
                                    {donorFeed.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {donorFeed.map((event, idx) => (
                                                <div key={idx} className="p-5 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-all group">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="w-12 h-12 rounded-xl bg-brand-secondary/20 border border-brand-secondary/20 flex items-center justify-center shadow-inner overflow-hidden">
                                                            <span className="text-xs font-black text-brand-secondary">
                                                                {event.donor ? event.donor.substring(2, 4).toUpperCase() : "??"}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="font-mono text-sm font-bold text-white tracking-tighter">{formatAddress(event.donor)}</p>
                                                            <p className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-widest font-black">Supported <span className="text-brand-secondary">{formatETH(event.amount)}</span></p>
                                                        </div>
                                                    </div>
                                                    <div className="text-xl opacity-40 group-hover:opacity-100 transition-opacity">❤️</div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-12 text-center text-gray-500 italic bg-white/5 rounded-3xl border border-white/5 uppercase tracking-widest text-xs font-black">
                                            No active transactions detected. Be the first.
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {activeTab !== "Overview" && (
                            <div className="bg-white rounded-2xl p-16 shadow-sm border border-brand-border text-center">
                                <span className="text-5xl mb-6 block">🚧</span>
                                <h3 className="text-xl font-poppins font-bold text-white mb-2">{activeTab} Section</h3>
                                <p className="text-gray-400">This section is currently being updated by the NGO. Please check back soon.</p>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="w-full lg:w-96 flex flex-col gap-6">

                        {/* Quick Info Card */}
                        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-2xl">
                            <h3 className="font-poppins font-black text-xl mb-6 text-white uppercase tracking-tighter border-b border-white/10 pb-4">Digital HQ</h3>
                            <ul className="space-y-6 text-sm">
                                <li className="flex gap-4 items-center group"><span className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-brand-secondary group-hover:scale-110 transition-transform">📍</span> <div><p className="text-gray-500 uppercase tracking-widest text-[10px] font-black">Location</p><p className="text-white font-bold">New Delhi, India</p></div></li>
                                <li className="flex gap-4 items-center group"><span className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-brand-secondary group-hover:scale-110 transition-transform">📞</span> <div><p className="text-gray-500 uppercase tracking-widest text-[10px] font-black">Direct Line</p><p className="text-white font-bold">+91 98765 43210</p></div></li>
                                <li className="flex gap-4 items-center group"><span className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-brand-secondary group-hover:scale-110 transition-transform">📧</span> <div><p className="text-gray-500 uppercase tracking-widest text-[10px] font-black">Official Email</p><p className="text-white font-bold uppercase tracking-tight">contact@{campaign?.creator ? campaign.creator.substring(2, 6).toLowerCase() : "info"}ngo.org</p></div></li>
                                <li className="flex gap-4 items-center group"><span className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-brand-secondary group-hover:scale-110 transition-transform">📄</span> <div><p className="text-gray-500 uppercase tracking-widest text-[10px] font-black">Compliance</p><p className="text-brand-secondary font-black">80G / FCRA REGISTERED</p></div></li>
                            </ul>
                        </div>

                        {/* Custom Donation Box */}
                        <div className="bg-[#0B0F19]/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                            <div className="h-2 w-full bg-gradient-to-r from-brand-secondary to-[#fb923c] shadow-[0_0_15px_rgba(208,227,197,0.4)]"></div>
                            <div className="p-10">
                                <h3 className="text-3xl font-poppins font-black mb-2 text-white uppercase tracking-tighter">Support Cause</h3>
                                <p className="text-gray-500 text-xs font-black uppercase tracking-[0.2em] mb-10 pb-8 border-b border-white/10">Immutable Web3 Settlement</p>

                                {(!deadlinePassed && !minGoalReached) || (!deadlinePassed && minGoalReached) ? (
                                    <div>
                                        <div className="mb-6 relative">
                                            <input
                                                type="number" min="0.001" step="0.01" placeholder="0.00"
                                                value={donationAmount}
                                                onChange={(e) => setDonationAmount(e.target.value)}
                                                disabled={loadingConfig.action}
                                                className="w-full bg-white/5 border border-white/10 focus:border-brand-secondary/50 rounded-2xl p-6 pr-20 text-3xl text-white font-black outline-none transition-all disabled:opacity-50 placeholder:text-gray-700"
                                            />
                                            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-brand-secondary font-black text-xl">ETH</span>
                                        </div>

                                        <div className="grid grid-cols-4 gap-3 mb-10">
                                            {["0.01", "0.05", "0.1", "0.5"].map(amt => (
                                                <button
                                                    key={amt}
                                                    onClick={() => setDonationAmount(amt)}
                                                    disabled={loadingConfig.action}
                                                    className="bg-white/5 hover:bg-brand-secondary hover:text-brand-primary text-white text-xs font-black py-4 rounded-xl border border-white/5 transition-all disabled:opacity-50"
                                                >
                                                    {amt}
                                                </button>
                                            ))}
                                        </div>

                                        {!isConnected ? (
                                            <button onClick={connectWallet} className="w-full bg-white text-brand-primary font-black py-6 rounded-2xl shadow-2xl hover:bg-brand-secondary transition-all uppercase tracking-widest text-sm">
                                                Link Wallet to Access
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleDonate}
                                                disabled={loadingConfig.action || !donationAmount}
                                                className="w-full bg-gradient-to-br from-brand-secondary to-brand-primary text-white font-black py-6 rounded-2xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
                                            >
                                                {loadingConfig.action ? (
                                                    <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                ) : (
                                                    <span>Authorize Donation</span>
                                                )}
                                            </button>
                                        )}

                                        {account && Number(userDonation) > 0 && (
                                            <div className="mt-8 text-center bg-brand-secondary/10 py-4 rounded-2xl border border-brand-secondary/20">
                                                <p className="text-xs font-black text-brand-secondary uppercase tracking-widest">Personal Support: {userDonation} ETH</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="bg-white/5 p-8 rounded-3xl border border-white/10 text-center mb-6">
                                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Campaign Settlement Window Closed</p>
                                    </div>
                                )}

                                {/* Post-Deadline Actions */}
                                {isConnected && deadlinePassed && (
                                    <div className="mt-6 pt-6 border-t border-brand-border space-y-4">
                                        {isCreator && minGoalReached && !campaign.withdrawn && (
                                            <button
                                                onClick={() => handleAction('withdraw')}
                                                disabled={loadingConfig.action}
                                                className="w-full bg-brand-success hover:bg-emerald-400 text-white font-bold py-3 rounded-xl shadow shadow-emerald-500/20 transition duration-300 disabled:opacity-50"
                                            >
                                                {loadingConfig.action ? 'Processing...' : 'Withdraw Funds ✅'}
                                            </button>
                                        )}
                                        {!minGoalReached && (
                                            hasClaimedRefund ? (
                                                <div className="text-center font-bold text-brand-success py-3 bg-emerald-50 rounded-xl border border-emerald-200">
                                                    Refund already claimed ✅
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleAction('refund')}
                                                    disabled={loadingConfig.action}
                                                    className="w-full bg-rose-500 hover:bg-rose-400 text-white font-bold py-3 rounded-xl shadow shadow-rose-500/20 transition duration-300 disabled:opacity-50"
                                                >
                                                    {loadingConfig.action ? 'Processing...' : 'Claim Refund ↩️'}
                                                </button>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default CampaignDetail;
