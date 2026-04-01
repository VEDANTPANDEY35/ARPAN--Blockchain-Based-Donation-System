import { useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Web3Context } from '../context/Web3Context';
import { formatAddress } from '../utils/helpers';

const Navbar = () => {
    const { account, isConnected, isMetaMaskInstalled, connectWallet, disconnectWallet } = useContext(Web3Context);
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => setMobileMenuOpen(false), [location.pathname]);

    const renderWalletButton = (isMobile = false) => {
        if (!isMetaMaskInstalled) {
            return (
                <a href="https://metamask.io/download/" target="_blank" rel="noreferrer" className="btn-secondary text-sm px-4 py-2">
                    Install MetaMask
                </a>
            );
        }
        if (!isConnected) {
            return (
                <button className={`btn-secondary text-sm px-4 py-2 ${isMobile ? 'w-full' : ''}`} onClick={connectWallet}>
                    Connect Wallet
                </button>
            );
        }
        return (
            <div className={`flex items-center space-x-3 bg-white/5 px-4 py-2 rounded-full border border-white/10 ${isMobile ? 'justify-between w-full' : ''}`}>
                <span className="text-white text-sm font-mono max-w-[100px] truncate">{formatAddress(account)}</span>
                <button onClick={disconnectWallet} className="text-xs font-semibold text-rose-500 hover:text-rose-600 transition">
                    Disconnect
                </button>
            </div>
        );
    };

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/60 backdrop-blur-lg shadow-sm border-b border-white/5 py-2' : 'bg-transparent py-4'}`}>
            <div className="flex items-center justify-between px-6 max-w-7xl mx-auto">
                <Link to="/" className="flex flex-col">
                    <div className="text-2xl font-bold font-poppins text-white flex items-center gap-2">
                        🤝 ARPAN
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold hidden md:block w-full text-right">
                        Trusted NGO Directory
                    </span>
                </Link>

                <div className="hidden md:flex space-x-6 items-center flex-1 justify-center">
                    <Link to="/" className="text-gray-200 hover:text-brand-secondary font-medium transition cursor-pointer relative group">
                        Home
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-secondary transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                    <span className="text-gray-200 hover:text-brand-secondary font-medium transition cursor-pointer relative group">
                        Browse NGOs
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-secondary transition-all duration-300 group-hover:w-full"></span>
                    </span>
                    <span className="text-gray-200 hover:text-brand-secondary font-medium transition cursor-pointer relative group">
                        Categories
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-secondary transition-all duration-300 group-hover:w-full"></span>
                    </span>
                    <span className="text-gray-200 hover:text-brand-secondary font-medium transition cursor-pointer relative group">
                        About
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-secondary transition-all duration-300 group-hover:w-full"></span>
                    </span>
                </div>

                <div className="hidden md:flex space-x-4 items-center">
                    <svg className="w-5 h-5 text-gray-300 cursor-pointer hover:text-brand-secondary transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    <Link to="/create" className="btn-primary text-sm px-4 py-2">Register Your NGO</Link>
                    <div className="pl-4 border-l border-brand-border">
                        {renderWalletButton()}
                    </div>
                </div>

                <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path></svg>
                </button>
            </div>

            {mobileMenuOpen && (
                <div className="md:hidden bg-[#0B0F19]/95 backdrop-blur-xl px-6 py-4 border-b border-white/10 flex flex-col gap-4 absolute top-full left-0 right-0 shadow-lg">
                    <Link to="/" className="text-white font-medium py-2 border-b border-white/5">Home</Link>
                    <span className="text-white font-medium py-2 border-b border-white/5">Browse NGOs</span>
                    <span className="text-white font-medium py-2 border-b border-white/5">Categories</span>
                    <Link to="/create" className="text-brand-secondary font-bold py-2">Register Your NGO</Link>
                    <div className="pt-2">
                        {renderWalletButton(true)}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
