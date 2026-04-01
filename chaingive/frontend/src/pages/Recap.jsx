import React from 'react';
import { motion } from 'framer-motion';

const Recap = () => {
    return (
        <div className="min-h-screen bg-transparent pt-32 pb-20 px-6 flex flex-col items-center justify-center text-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-2xl border border-white/20 p-12 rounded-[3rem] shadow-2xl max-w-2xl w-full"
            >
                <div className="text-7xl mb-8">📊</div>
                <h1 className="text-5xl font-inter font-black text-white mb-6 tracking-tighter uppercase">Impact Recap</h1>
                <p className="text-gray-400 text-xl mb-12 font-light leading-relaxed">
                    A visual journey through your charitable footprint. See how your contributions transformed lives this year.
                </p>
                <button className="px-10 py-5 bg-brand-secondary text-brand-primary font-black uppercase tracking-widest text-sm rounded-2xl hover:bg-white transition-all shadow-2xl">Coming Soon</button>
            </motion.div>
        </div>
    );
};

export default Recap;
