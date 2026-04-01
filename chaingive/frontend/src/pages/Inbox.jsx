import React from 'react';
import { motion } from 'framer-motion';

const Inbox = () => {
    return (
        <div className="min-h-screen bg-transparent pt-32 pb-20 px-6 flex flex-col items-center justify-center text-center">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/10 backdrop-blur-2xl border border-white/20 p-12 rounded-[3rem] shadow-2xl max-w-2xl w-full"
            >
                <div className="text-7xl mb-8">📬</div>
                <h1 className="text-5xl font-inter font-black text-white mb-6 tracking-tighter uppercase">Direct Messages</h1>
                <p className="text-gray-400 text-xl mb-12 font-light leading-relaxed">
                    Connect directly with the NGOs you support. Transparent communication, straight to your wallet-linked inbox.
                </p>
                <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden mb-6 p-1 border border-white/5">
                    <div className="h-full bg-brand-secondary rounded-full w-1/3 shadow-[0_0_15px_rgba(208,227,197,0.4)]"></div>
                </div>
                <p className="text-brand-secondary font-black text-xs tracking-[0.2em] uppercase opacity-80 animate-pulse">Encryption in progress</p>
            </motion.div>
        </div>
    );
};

export default Inbox;
