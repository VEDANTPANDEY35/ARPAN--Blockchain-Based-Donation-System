import { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Web3Context } from './context/Web3Context';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CampaignDetail from './pages/CampaignDetail';
import CreateCampaign from './pages/CreateCampaign';
import AIWhisper from './pages/AIWhisper';
import Recap from './pages/Recap';
import Inbox from './pages/Inbox';
import Footer from './components/Footer';
import StarryBackground from './components/StarryBackground';
import BottomNav from './components/BottomNav';

function App() {
    const { isConnected, isCorrectNetwork, switchNetwork } = useContext(Web3Context);

    return (
        <Router>
            <StarryBackground />
            <Navbar />
            {isConnected && !isCorrectNetwork && (
                <div className="fixed top-[70px] left-0 right-0 z-40 bg-rose-500/90 backdrop-blur-sm text-white text-center py-2 text-sm font-medium">
                    ⚠️ Wrong network detected. Please switch to Sepolia testnet.
                    <button onClick={switchNetwork} className="ml-3 underline">Switch Now</button>
                </div>
            )}
            <main className="flex-grow pt-20">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/campaign/:id" element={<CampaignDetail />} />
                    <Route path="/create" element={<CreateCampaign />} />
                    <Route path="/whisper" element={<AIWhisper />} />
                    <Route path="/recap" element={<Recap />} />
                    <Route path="/inbox" element={<Inbox />} />
                    <Route path="*" element={<Home />} />
                </Routes>
            </main>
            <BottomNav />
            <Footer />

            <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="fixed bottom-6 right-6 z-50 bg-brand-primary text-white p-3 rounded-full shadow-xl hover:bg-[#0f766e] transition-transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-teal-500/30 w-12 h-12 flex items-center justify-center opacity-80 hover:opacity-100"
                aria-label="Back to Top"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7"></path></svg>
            </button>
        </Router>
    );
}

export default App;
