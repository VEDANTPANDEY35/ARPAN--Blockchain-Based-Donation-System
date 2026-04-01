import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatETH, formatAddress, calculateProgress, isDeadlinePassed } from '../utils/helpers';
import { motion } from 'framer-motion';

const CampaignCard = ({ campaign }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Delay slightly for intersection observer effect or mount animation
        const timer = setTimeout(() => {
            setProgress(calculateProgress(campaign.raised, campaign.goal));
        }, 300);
        return () => clearTimeout(timer);
    }, [campaign.raised, campaign.goal]);

    const bgGradient = "from-brand-primary to-brand-success";

    const creatorInitials = campaign.creator ? campaign.creator.substring(2, 4).toUpperCase() : "0X";
    const deadlinePassed = isDeadlinePassed(campaign.deadline.toString());
    const minGoalReached = campaign.raised >= campaign.goal;

    let statusText = "Active";
    let statusColor = "bg-brand-secondary/20 text-brand-secondary border-brand-secondary/30";

    if (deadlinePassed) {
        if (minGoalReached) {
            statusText = "Funded";
            statusColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
        } else {
            statusText = "Expired";
            statusColor = "bg-rose-500/10 text-rose-400 border-rose-500/20";
        }
    }

    const daysLeft = deadlinePassed ? 0 : Math.ceil((Number(campaign.deadline.toString()) * 1000 - Date.now()) / (1000 * 60 * 60 * 24));

    return (
        <div className="card-hover cursor-pointer flex flex-col relative overflow-hidden bg-white/5 backdrop-blur-md h-full group border border-white/10">
            {/* Top Banner - Subtle now */}
            <div className={`h-1.5 w-full bg-gradient-to-r ${bgGradient}`}></div>

            <div className="p-8 flex flex-col flex-grow gap-5">
                {/* Status Badge */}
                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase self-start transition-colors border backdrop-blur-md ${statusColor}`}>
                    {statusText}
                </span>

                {/* Avatar & Content */}
                <div className="flex-grow flex flex-col relative">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-brand-secondary/20 transition-colors">
                            <span className="text-sm font-black text-brand-secondary">{creatorInitials}</span>
                        </div>
                        <span className="text-brand-muted font-mono text-xs font-medium tracking-tight">
                            {formatAddress(campaign.creator)}
                        </span>
                    </div>

                    <h3 className="text-2xl font-inter font-bold mb-3 text-white line-clamp-2 leading-tight group-hover:text-brand-secondary transition-colors">{campaign.title}</h3>
                    <p className="text-gray-400 text-[15px] mb-8 line-clamp-3 flex-grow leading-relaxed font-light">{campaign.description}</p>

                    {/* Progress Section */}
                    <div className="mb-8">
                        <div className="flex justify-between text-sm font-bold mb-3">
                            <span className="text-brand-secondary">{formatETH(campaign.raised)} ETH raised</span>
                            <span className="text-gray-400 font-medium">Goal: {formatETH(campaign.goal)} ETH</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden p-0.5 border border-white/5">
                            <motion.div
                                className="h-full rounded-full bg-brand-secondary shadow-[0_0_15px_rgba(208,227,197,0.4)]"
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, progress)}%` }}
                                transition={{ duration: 1.5, type: "spring", bounce: 0.2 }}
                            />
                        </div>
                        <div className="flex justify-between text-xs text-gray-400 mt-3 font-semibold uppercase tracking-wider">
                            <span>{progress.toFixed(0)}%</span>
                            <span>{daysLeft > 0 ? `${daysLeft} days left` : "Ended"}</span>
                        </div>
                    </div>

                    <div className="mt-auto pt-2">
                        <Link to={`/campaign/${campaign.id}`} className="block w-full">
                            <button className="w-full bg-white/10 text-brand-secondary hover:bg-brand-secondary hover:text-brand-primary border border-white/10 hover:border-brand-secondary transition-all duration-300 py-3.5 text-sm font-bold rounded-full group-hover:shadow-md">
                                View Profile
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CampaignCard;
