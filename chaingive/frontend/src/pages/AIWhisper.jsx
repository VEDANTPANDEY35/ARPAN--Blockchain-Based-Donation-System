import React from 'react';
import { motion } from 'framer-motion';

const AIWhisper = () => {
    return (
        <div className="min-h-screen bg-transparent pt-32 pb-20 px-6 flex flex-col items-center justify-center text-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/10 backdrop-blur-2xl border border-white/20 p-12 rounded-[3rem] shadow-2xl max-w-2xl w-full"
            >
                <div className="text-7xl mb-8">🎙️</div>
                <h1 className="text-5xl font-inter font-black text-white mb-6 tracking-tighter uppercase">AI Whisper</h1>
                <p className="text-gray-400 text-xl mb-12 font-light leading-relaxed">
                    Personalized impact storytelling powered by AI. We're currently training the models to give your donations a voice.
                </p>
                <div className="flex gap-4 justify-center">
                    <div className="h-1.5 w-12 bg-brand-primary rounded-full animate-pulse"></div>
                    <div className="h-1.5 w-12 bg-brand-secondary rounded-full animate-pulse delay-75"></div>
                    <div className="h-1.5 w-12 bg-brand-primary rounded-full animate-pulse delay-150"></div>
                </div>
            </motion.div>
        </div>
    );
};

export default AIWhisper;
