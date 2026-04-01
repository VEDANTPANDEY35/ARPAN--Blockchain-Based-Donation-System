import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Web3Context } from '../context/Web3Context';
import { useDonation } from '../hooks/useDonation';
import { useToast } from '../context/ToastContext';

const CreateCampaign = () => {
    const { isConnected, connectWallet, account } = useContext(Web3Context);
    const { createCampaign } = useDonation();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ title: '', description: '', goal: '', deadline: '' });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    // Default min date for deadline picker (tomorrow)
    const [minDate, setMinDate] = useState('');
    useEffect(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setMinDate(tomorrow.toISOString().split('T')[0]);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    useEffect(() => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = "Title is required";
        else if (formData.title.length > 100) newErrors.title = "Title max 100 characters";

        if (!formData.description.trim()) newErrors.description = "Description is required";
        else if (formData.description.length > 500) newErrors.description = "Description max 500 characters";

        if (!formData.goal || Number(formData.goal) <= 0) newErrors.goal = "Goal must be > 0 ETH";

        if (!formData.deadline) newErrors.deadline = "Deadline is required";
        else {
            const selectedDate = new Date(formData.deadline).getTime();
            const now = Date.now();
            if (selectedDate <= now) newErrors.deadline = "Deadline must be in the future";
        }

        setErrors(newErrors);
    }, [formData]);

    const validate = () => {
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);
        try {
            showToast("Confirm transaction in MetaMask...", "pending");
            // Convert date string to unix timestamp (seconds)
            const deadlineTimestamp = Math.floor(new Date(formData.deadline).getTime() / 1000);

            await createCampaign(formData.title, formData.description, formData.goal, deadlineTimestamp);
            showToast("Campaign launched successfully! 🚀", "success");

            // Wait sequence then navigate home
            setTimeout(() => navigate('/'), 2000);
        } catch (err) {
            showToast(err.reason || "Failed to launch campaign", "error");
            setSubmitting(false);
        }
    };

    const isFormInvalid = Object.keys(errors).length > 0;

    return (
        <div className="bg-transparent min-h-screen pt-24 pb-12 font-inter text-white">
            <div className="max-w-5xl mx-auto px-6">

                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-poppins font-black mb-4 text-white">Register Your NGO</h1>
                    <p className="text-lg text-gray-300">Join the ARPAN directory and get funded transparently on the blockchain.</p>
                </div>

                {/* Dummy Progress Bar */}
                <div className="w-full max-w-3xl mx-auto mb-12">
                    <div className="flex justify-between mb-4">
                        <span className="text-sm font-bold text-brand-secondary">Step 1: NGO Identity</span>
                        <span className="text-sm font-bold text-gray-500">Step 2: Funding & Legal</span>
                        <span className="text-sm font-bold text-gray-500">Step 3: Verification</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-3 border border-white/5 p-1 flex items-center">
                        <div className="bg-brand-secondary h-1 rounded-full w-[33%] shadow-[0_0_10px_rgba(208,227,197,0.5)]"></div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-10 items-start">

                    {/* Main Form Area */}
                    <div className="flex-1 w-full space-y-8">
                        <form onSubmit={handleSubmit} className="space-y-8">

                            {/* Step 1 Block */}
                            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10">
                                <h2 className="text-3xl font-poppins font-black mb-8 flex items-center gap-4 text-white uppercase tracking-tighter">
                                    <span className="w-10 h-10 rounded-xl bg-brand-secondary/20 text-brand-secondary flex items-center justify-center text-xl">1</span>
                                    NGO Identity
                                </h2>

                                <div className="space-y-8">
                                    <div>
                                        <label className="block text-sm font-bold text-brand-secondary mb-3 uppercase tracking-widest opacity-80">NGO Name / Title</label>
                                        <input
                                            type="text" name="title" value={formData.title} onChange={handleChange}
                                            className={`w-full bg-white/5 border ${errors.title ? 'border-rose-500/50 focus:border-rose-500' : 'border-white/10 focus:border-brand-secondary/50'} rounded-2xl p-5 text-white text-lg outline-none transition-all placeholder:text-gray-600`}
                                            placeholder="E.g., Global Education Foundation"
                                        />
                                        <div className="flex justify-between mt-1.5">
                                            <span className="text-xs font-medium text-rose-500">{errors.title}</span>
                                            <span className="text-xs text-gray-300">{formData.title.length}/100</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-brand-secondary mb-3 uppercase tracking-widest opacity-80">Mission & Description</label>
                                        <textarea
                                            name="description" value={formData.description} onChange={handleChange} rows="6"
                                            className={`w-full bg-white/5 border ${errors.description ? 'border-rose-500/50 focus:border-rose-500' : 'border-white/10 focus:border-brand-secondary/50'} rounded-2xl p-5 text-white text-lg outline-none transition-all resize-none placeholder:text-gray-600`}
                                            placeholder="Describe your NGO's mission, ongoing projects, and how the funds will be utilized."
                                        />
                                        <div className="flex justify-between mt-1.5">
                                            <span className="text-xs font-medium text-rose-500">{errors.description}</span>
                                            <span className="text-xs text-gray-300">{formData.description.length}/500</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Step 2 Block */}
                            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10">
                                <h2 className="text-3xl font-poppins font-black mb-8 flex items-center gap-4 text-white uppercase tracking-tighter">
                                    <span className="w-10 h-10 rounded-xl bg-brand-secondary/20 text-brand-secondary flex items-center justify-center text-xl">2</span>
                                    Funding Strategy
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label className="block text-sm font-bold text-brand-secondary mb-3 uppercase tracking-widest opacity-80">Funding Target</label>
                                        <div className="relative">
                                            <input
                                                type="number" name="goal" value={formData.goal} onChange={handleChange} min="0.001" step="0.01"
                                                className={`w-full bg-white/5 border ${errors.goal ? 'border-rose-500/50 focus:border-rose-500' : 'border-white/10 focus:border-brand-secondary/50'} rounded-2xl p-5 pr-20 text-white text-lg outline-none transition-all`}
                                                placeholder="10.5"
                                            />
                                            <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-brand-secondary">ETH</span>
                                        </div>
                                        <span className="text-xs font-bold text-rose-500 block mt-2 ml-1">{errors.goal}</span>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-brand-secondary mb-3 uppercase tracking-widest opacity-80">Campaign Deadline</label>
                                        <input
                                            type="date" name="deadline" value={formData.deadline} onChange={handleChange} min={minDate}
                                            className={`w-full bg-white/5 border ${errors.deadline ? 'border-rose-500/50 focus:border-rose-500' : 'border-white/10 focus:border-brand-secondary/50'} rounded-2xl p-5 text-white text-lg outline-none transition-all`}
                                            style={{ colorScheme: 'dark' }}
                                        />
                                        <span className="text-xs font-bold text-rose-500 block mt-2 ml-1">{errors.deadline}</span>
                                    </div>
                                </div>
                                <div className="mt-10 p-6 bg-brand-secondary/10 border border-brand-secondary/20 rounded-2xl text-gray-300 text-sm leading-relaxed">
                                    <span className="font-black text-brand-secondary uppercase tracking-widest mr-2 underline decoration-brand-secondary/30">Legal Note:</span> By submitting this form, you verify that you have legal permission to raise funds under 80G / FCRA or equivalent regulations in your jurisdiction.
                                </div>
                            </div>

                            <div className="pt-4 pb-12">
                                {!isConnected ? (
                                    <button type="button" onClick={connectWallet} className="w-full btn-secondary py-5 rounded-xl shadow-sm text-lg font-bold">
                                        Connect Wallet to Submit
                                    </button>
                                ) : (
                                    <button
                                        type="submit" disabled={submitting || isFormInvalid}
                                        className={`w-full btn-primary py-5 rounded-xl flex justify-center items-center text-lg ${submitting && 'opacity-70 cursor-wait'}`}
                                    >
                                        {submitting ? (
                                            <span className="flex items-center space-x-3">
                                                <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                <span>Deploying Contract...</span>
                                            </span>
                                        ) : 'Submit Registration 🚀'}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Preview Panel (Desktop Sticky) */}
                    <div className="w-full lg:w-[450px] sticky top-28">
                        <h3 className="font-poppins font-black mb-6 text-white text-xl uppercase tracking-tighter border-b border-white/10 pb-4">Live Identity Preview</h3>
                        <div className="card-hover bg-[#0B0F19]/60 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10">
                            <div className="h-40 bg-gradient-to-br from-brand-secondary/20 to-brand-primary/40 relative">
                                <div className="absolute top-6 right-6 px-4 py-2 rounded-full text-xs font-black border bg-white/5 text-brand-secondary border-brand-secondary/30 backdrop-blur-md">
                                    🟢 VERIFIED IDENTITY
                                </div>
                            </div>
                            <div className="p-8 pt-0 flex flex-col relative">
                                <div className="w-24 h-24 rounded-2xl border-2 border-white/10 bg-[#161F31] flex items-center justify-center -mt-12 mb-6 z-10 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                                    <span className="text-3xl font-black font-poppins text-brand-secondary">{account ? account.substring(2, 4).toUpperCase() : '0X'}</span>
                                </div>
                                <h3 className="text-3xl font-black mb-4 text-white line-clamp-2 leading-tight uppercase tracking-tighter">{formData.title || "NGO Name Appears Here"}</h3>
                                <p className="text-gray-400 text-lg mb-8 line-clamp-4 font-light leading-relaxed">{formData.description || "Your mission statement and description will be previewed here. Make it impactful to attract supporters."}</p>

                                <div className="mb-10 bg-white/5 p-6 rounded-3xl border border-white/5">
                                    <div className="flex justify-between text-sm font-black mb-3 text-brand-secondary uppercase tracking-widest">
                                        <span>0 ETH CONNECTED</span>
                                        <span className="text-gray-500">Goal: {formData.goal || "0"} ETH</span>
                                    </div>
                                    <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden p-0.5">
                                        <div className="bg-brand-secondary h-2 rounded-full w-[5%] shadow-[0_0_10px_rgba(208,227,197,0.4)]"></div>
                                    </div>
                                </div>
                                <div className="w-full bg-white/10 py-5 text-center text-sm font-black uppercase tracking-widest rounded-2xl cursor-default opacity-50 border border-white/10">View Detailed Profile</div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CreateCampaign;
