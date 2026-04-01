import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-brand-dark text-white/70 py-16 px-6">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                <div>
                    <div className="text-2xl font-bold font-poppins text-white flex items-center gap-2 mb-6">
                        🤝 ARPAN
                    </div>
                    <p className="text-sm">ARPAN is a discovery platform. All donations are made directly, leveraging blockchain for unmatched transparency.</p>
                </div>
                <div>
                    <h4 className="text-white font-poppins font-bold mb-6">Quick Links</h4>
                    <ul className="space-y-3 text-sm">
                        <li><Link to="/" className="hover:text-brand-accent transition">Home</Link></li>
                        <li><Link to="/" className="hover:text-brand-accent transition">Browse NGOs</Link></li>
                        <li><Link to="/create" className="hover:text-brand-accent transition">Register NGO</Link></li>
                        <li><span className="hover:text-brand-accent transition cursor-pointer">About Us</span></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-poppins font-bold mb-6">Categories</h4>
                    <ul className="space-y-3 text-sm">
                        <li><span className="hover:text-brand-accent transition cursor-pointer">Education</span></li>
                        <li><span className="hover:text-brand-accent transition cursor-pointer">Healthcare</span></li>
                        <li><span className="hover:text-brand-accent transition cursor-pointer">Environment</span></li>
                        <li><span className="hover:text-brand-accent transition cursor-pointer">Children</span></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-poppins font-bold mb-6">Contact</h4>
                    <ul className="space-y-4 text-sm">
                        <li className="flex items-center gap-3"><span className="text-brand-secondary">📧</span> support@arpan-directory.org</li>
                        <li className="flex items-center gap-3"><span className="text-brand-secondary">📞</span> +91 22 4567 8900</li>
                        <li className="flex items-center gap-3"><span className="text-brand-secondary">📍</span> Mumbai, India</li>
                        <li className="pt-4 flex gap-4">
                            <span className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-brand-secondary hover:text-brand-primary transition cursor-pointer text-xl shadow-lg">📱</span>
                            <span className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-brand-secondary hover:text-brand-primary transition cursor-pointer text-xl shadow-lg">📸</span>
                            <span className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-brand-secondary hover:text-brand-primary transition cursor-pointer text-xl shadow-lg">🐦</span>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="max-w-7xl mx-auto pt-8 border-t border-white/10 text-xs flex flex-col md:flex-row justify-between items-center gap-4">
                <p>© 2024 ARPAN | We don't process centralized donations.</p>
                <div className="flex gap-6">
                    <span className="hover:text-white transition cursor-pointer">Privacy Policy</span>
                    <span className="hover:text-white transition cursor-pointer">Terms of Service</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
