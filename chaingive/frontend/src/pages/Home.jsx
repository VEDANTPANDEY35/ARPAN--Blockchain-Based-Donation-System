import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDonation } from '../hooks/useDonation';
import CampaignCard from '../components/CampaignCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { isDeadlinePassed, formatETH } from '../utils/helpers';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

const Home = () => {
    const { getAllCampaigns, loading } = useDonation();
    const [campaigns, setCampaigns] = useState([]);
    const [filter, setFilter] = useState('All');
    const [stats, setStats] = useState({ totalCampaigns: 0, totalRaised: 0n, totalDonors: 0 });
    const [fetching, setFetching] = useState(true);

    // Parallax scrolling
    const { scrollYProgress } = useScroll();
    const yHeroText = useTransform(scrollYProgress, [0, 1], [0, 300]);
    const opacHero = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

    useEffect(() => {
        const fetchCampaigns = async () => {
            setFetching(true);
            const data = await getAllCampaigns();
            if (data) {
                const validCampaigns = data.filter(c => Number(c.id) > 0);
                setCampaigns(validCampaigns);

                let raised = 0n;
                validCampaigns.forEach(c => {
                    raised += BigInt(c.raised);
                });

                setStats({
                    totalCampaigns: validCampaigns.length,
                    totalRaised: raised,
                    totalDonors: validCampaigns.filter(c => BigInt(c.raised) > 0).length * 5
                });
            }
            setFetching(false);
        };
        fetchCampaigns();
    }, []);

    const filteredCampaigns = campaigns.filter(c => {
        if (filter === 'All') return true;
        const deadlinePassed = isDeadlinePassed(c.deadline.toString());
        const goalMet = c.raised >= c.goal;

        if (filter === 'Active') return !deadlinePassed;
        if (filter === 'Funded') return deadlinePassed && goalMet;
        if (filter === 'Expired') return deadlinePassed && !goalMet;
        return true;
    });

    return (
        <div className="pt-0 bg-transparent font-inter text-white overflow-x-hidden">
            {/* HERO SECTION */}
            <motion.section
                className="hero-gradient min-h-screen flex items-center justify-center relative overflow-hidden pt-20"
                style={{ opacity: opacHero, background: 'transparent' }}
            >
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

                <motion.div
                    className="max-w-7xl mx-auto px-6 relative z-10 text-center flex flex-col items-center justify-center h-full"
                    style={{ y: yHeroText }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <h1 className="text-[12vw] md:text-9xl lg:text-10xl font-inter font-black text-white leading-[0.85] tracking-tighter uppercase mb-6 drop-shadow-2xl">
                            YOUR HOME<br />
                            <span className="text-brand-secondary block mt-2 drop-shadow-lg">FOR IMPACT</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto font-light tracking-wide">
                            Discover verified NGOs. Transparent giving on the blockchain.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
                        className="group w-full max-w-2xl relative mb-16"
                    >
                        <div className="bg-white/10 backdrop-blur-xl rounded-full p-2 flex items-center shadow-2xl relative z-20 border border-white/10">
                            <div className="pl-6 text-brand-secondary shrink-0">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            </div>
                            <input type="text" placeholder="Search causes or NGOs..." className="flex-1 bg-transparent border-none outline-none px-6 text-white text-xl font-medium tracking-tight h-14" />
                            <button className="btn-primary rounded-full px-10 py-4 shrink-0 text-white font-bold hidden sm:block shadow-lg">
                                Search
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            </motion.section>

            {/* FEATURED NGOs SECTION with Dark Zone Transition */}
            <section id="campaigns" className="bg-transparent text-white pt-32 pb-24 relative z-10">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        className="flex flex-col md:flex-row justify-between items-end mb-16"
                    >
                        <div>
                            <div className="w-16 h-1.5 bg-brand-secondary mb-6 rounded-full"></div>
                            <h2 className="section-title text-white">Trust In Action</h2>
                            <p className="text-gray-300 text-lg mt-2 font-light">Direct contributions without intermediaries.</p>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-8 md:mt-0 bg-white/10 p-2 rounded-full backdrop-blur-md border border-white/5">
                            {['All', 'Active', 'Funded', 'Expired'].map(f => (
                                <button
                                     key={f}
                                     onClick={() => setFilter(f)}
                                     className={`px-6 py-2.5 rounded-full text-[10px] font-black tracking-widest uppercase transition-all duration-500 ${filter === f ? 'bg-brand-secondary text-brand-primary shadow-[0_0_20px_rgba(208,227,197,0.3)] scale-105' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                 >
                                     {f}
                                 </button>
                            ))}
                        </div>
                    </motion.div>

                    {fetching ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3, 4, 5, 6].map(i => <LoadingSkeleton key={i} />)}
                        </div>
                    ) : filteredCampaigns.length > 0 ? (
                        <motion.div
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true, margin: "-50px" }}
                            variants={{
                                hidden: { opacity: 0 },
                                show: { opacity: 1, transition: { staggerChildren: 0.15 } }
                            }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
                        >
                            {filteredCampaigns.map(campaign => (
                                <motion.div key={campaign.id.toString()} variants={{
                                    hidden: { opacity: 0, y: 40 },
                                    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
                                }}>
                                    {/* Wrapping CampaignCard to apply motion */}
                                    <div className="text-brand-dark h-full">
                                        <CampaignCard campaign={campaign} />
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-16 flex flex-col items-center justify-center text-center backdrop-blur-sm">
                            <div className="text-6xl mb-6 opacity-80">🌱</div>
                            <h3 className="text-3xl font-inter font-bold mb-3 text-white">No NGOs Found</h3>
                            <p className="text-brand-muted mb-8 max-w-md text-lg">Change the filter or check back later for new opportunities to impact.</p>
                            <Link to="/create" className="btn-primary">Register NGO</Link>
                        </div>
                    )}
                </div>
            </section>

            {/* BROWSE BY CAUSE with TOGGLING HOVER */}
            <section className="bg-transparent py-24 border-y border-white/5 mt-10">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="section-title text-center text-white mb-16">Explore By Cause</h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: '🎓', name: 'Education', count: '124 NGOs' },
                            { icon: '🏥', name: 'Healthcare', count: '89 NGOs' },
                            { icon: '🌱', name: 'Environment', count: '56 NGOs' },
                            { icon: '👧', name: 'Children', count: '201 NGOs' },
                            { icon: '👩', name: 'Women', count: '94 NGOs' },
                            { icon: '🐾', name: 'Animals', count: '45 NGOs' },
                            { icon: '🆘', name: 'Disaster Relief', count: '32 NGOs' },
                            { icon: '🏘️', name: 'Poverty', count: '167 NGOs' }
                        ].map(cause => (
                            <div key={cause.name} className="card-hover p-8 text-center cursor-pointer group relative overflow-hidden bg-white/5 backdrop-blur-md border border-white/10">
                                <div className="relative z-10 transition-all duration-500 group-hover:-translate-y-12 group-hover:opacity-0 flex flex-col items-center">
                                    <div className="text-5xl mb-4">{cause.icon}</div>
                                    <h3 className="font-poppins font-bold text-lg mb-1 text-white">{cause.name}</h3>
                                    <p className="text-brand-secondary text-sm font-semibold">{cause.count}</p>
                                </div>
                                {/* Toggling Element */}
                                <div className="absolute inset-0 rounded-[1.5rem] bg-brand-primary flex flex-col items-center justify-center opacity-0 translate-y-full group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-in-out z-20">
                                    <div className="text-4xl mb-2 opacity-50">{cause.icon}</div>
                                    <span className="text-white font-bold text-xl flex items-center gap-2">Explore <span className="text-xl inline-block transition-transform duration-300 group-hover:translate-x-1">➔</span></span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* TRUST BENCHMARKS SECTION - Filling the gap */}
            <section className="py-20 border-b border-white/5 bg-white/5 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-wrap justify-center md:justify-between items-center gap-12 opacity-80">
                        {/* Benchmarks */}
                        <div className="flex items-center gap-4">
                            <span className="text-4xl text-brand-secondary">🛡️</span>
                            <div>
                                <h4 className="text-white font-bold leading-none">Security</h4>
                                <p className="text-gray-400 text-sm mt-1">Smart Contract Audited</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-4xl text-brand-secondary">💎</span>
                            <div>
                                <h4 className="text-white font-bold leading-none">Integrity</h4>
                                <p className="text-gray-400 text-sm mt-1">100% Immutable Records</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-4xl text-brand-secondary">🌍</span>
                            <div>
                                <h4 className="text-white font-bold leading-none">Reach</h4>
                                <p className="text-gray-400 text-sm mt-1">Global Donor Network</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-4xl text-brand-secondary">⚡</span>
                            <div>
                                <h4 className="text-white font-bold leading-none">Speed</h4>
                                <p className="text-gray-400 text-sm mt-1">Real-time Settlement</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* HOW ARPAN WORKS */}
            <section className="bg-transparent py-32 relative">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-20"
                    >
                        <h2 className="section-title text-white text-6xl md:text-8xl tracking-tighter">THE NEW STANDARD</h2>
                        <h3 className="text-3xl md:text-5xl font-light text-white mt-2 tracking-tight">For Charitable Giving</h3>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20">
                        {[
                            { num: '01', title: 'Discover', desc: 'Find verified, active NGOs creating real change in specific causes.' },
                            { num: '02', title: 'Verify', desc: 'Review transparent campaign goals, raised amounts, and deadlines directly on the blockchain.' },
                            { num: '03', title: 'Impact', desc: 'Donate natively with Ethereum. No hidden fees, meaning 100% of your gift reaches the actual contract.' }
                        ].map((step, idx) => (
                            <motion.div
                                key={step.num}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.2, duration: 0.6 }}
                                className="group cursor-default"
                            >
                                <div className="text-brand-secondary text-8xl font-black opacity-40 group-hover:opacity-100 group-hover:-translate-y-4 transition-all duration-500 mb-4 select-none">
                                    {step.num}
                                </div>
                                <h3 className="text-3xl font-inter font-bold mb-4 text-white group-hover:text-brand-secondary transition-colors">{step.title}</h3>
                                <p className="text-gray-300 text-lg leading-relaxed">{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* COMMUNITY & CONTACT SECTION - Filling the empty space */}
            <section className="py-24 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20"
                    >
                        {/* Email Card */}
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 flex flex-col items-center text-center group hover:bg-white/10 transition-all duration-500">
                            <div className="w-20 h-20 bg-brand-secondary/20 rounded-3xl flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform shadow-inner">📧</div>
                            <h3 className="text-2xl font-black mb-3 text-white uppercase tracking-tight">Email Support</h3>
                            <p className="text-gray-400 mb-6 font-light">Direct line to our technical and integration team.</p>
                            <a href="mailto:support@arpan.org" className="px-6 py-2 bg-white/10 rounded-full text-brand-secondary font-bold hover:bg-brand-secondary hover:text-brand-primary transition-all">support@arpan.org</a>
                        </div>

                        {/* Call Card */}
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 flex flex-col items-center text-center group hover:bg-white/10 transition-all duration-500">
                            <div className="w-20 h-20 bg-brand-secondary/20 rounded-3xl flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform shadow-inner">📞</div>
                            <h3 className="text-2xl font-black mb-3 text-white uppercase tracking-tight">Hotline</h3>
                            <p className="text-gray-400 mb-6 font-light">Available Mon-Fri for urgent NGO onboardings.</p>
                            <a href="tel:+919876543210" className="px-6 py-2 bg-white/10 rounded-full text-brand-secondary font-bold hover:bg-brand-secondary hover:text-brand-primary transition-all">+91 98765 43210</a>
                        </div>

                        {/* Social Card */}
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 flex flex-col items-center text-center group hover:bg-white/10 transition-all duration-500">
                            <div className="w-20 h-20 bg-brand-secondary/20 rounded-3xl flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform shadow-inner">✨</div>
                            <h3 className="text-2xl font-black mb-3 text-white uppercase tracking-tight">Socials</h3>
                            <p className="text-gray-400 mb-6 font-light">Join the transparency movement on all platforms.</p>
                            <div className="flex gap-4">
                                <span className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-secondary hover:text-brand-primary transition cursor-pointer text-2xl">📱</span>
                                <span className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-secondary hover:text-brand-primary transition cursor-pointer text-2xl">📸</span>
                                <span className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-secondary hover:text-brand-primary transition cursor-pointer text-2xl">🐦</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* NEWSLETTER */}
            <section className="bg-brand-primary py-32 px-6 relative overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
                >
                    <div className="relative z-10">
                        <h2 className="text-5xl md:text-7xl font-inter font-black text-white mb-8 tracking-tighter uppercase drop-shadow-2xl">Stay Informed</h2>
                        <p className="text-brand-secondary text-2xl font-light mb-8 max-w-xl">Join 5000+ donors receiving weekly updates on high-impact NGO projects.</p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 mb-12">
                            <input type="email" placeholder="Your best email" className="px-8 py-5 rounded-full outline-none flex-1 bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder:text-gray-400 text-xl focus:bg-white/20 focus:border-white/40 transition-all font-light" />
                            <button className="bg-brand-secondary text-brand-primary font-bold px-10 py-5 rounded-full hover:bg-white transition-all shadow-xl text-xl hover:scale-105 active:scale-95">Subscribe</button>
                        </div>

                        <div className="flex items-center gap-6 opacity-60">
                            <span className="text-white text-sm font-semibold uppercase tracking-widest">Connect:</span>
                            <div className="flex gap-4">
                                <span className="hover:text-brand-secondary transition cursor-pointer">Twitter</span>
                                <span className="hover:text-brand-secondary transition cursor-pointer">Instagram</span>
                                <span className="hover:text-brand-secondary transition cursor-pointer">LinkedIn</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                        {/* Information Cards to fill the space */}
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl">
                            <h4 className="text-brand-secondary font-bold mb-2">Direct Support</h4>
                            <p className="text-gray-300 text-sm">support@arpan.org</p>
                            <p className="text-gray-300 text-sm mt-1">+91 22 4567 8900</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl">
                            <h4 className="text-brand-secondary font-bold mb-2">Office Hours</h4>
                            <p className="text-gray-300 text-sm">Mon - Fri: 9AM - 6PM</p>
                            <p className="text-gray-300 text-sm mt-1">Saturday: 10AM - 2PM</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl">
                            <h4 className="text-brand-secondary font-bold mb-2">Total Transparency</h4>
                            <p className="text-gray-300 text-sm">100% On-Chain Records</p>
                            <p className="text-gray-300 text-sm mt-1">Zero Platform Fees</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl">
                            <h4 className="text-brand-secondary font-bold mb-2">Global Impact</h4>
                            <p className="text-gray-300 text-sm">Active in 12+ Countries</p>
                            <p className="text-gray-300 text-sm mt-1">500+ Verified NGOs</p>
                        </div>
                    </div>
                </motion.div>
                
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 -translate-y-1/2 w-96 h-96 bg-brand-secondary/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-0 left-0 translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-[150px]"></div>
            </section>

        </div>
    );
};

export default Home;

