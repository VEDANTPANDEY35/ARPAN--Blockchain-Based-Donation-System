import React from 'react';
import { NavLink } from 'react-router-dom';

const BottomNav = () => {
    const navItems = [
        { path: '/', label: 'Home', icon: '🏠' },
        { path: '/whisper', label: 'Whisper', icon: '🎙️' },
        { path: '/recap', label: 'Recap', icon: '📊' },
        { path: '/inbox', label: 'Inbox', icon: '📬' },
    ];

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-6">
            <nav className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-full shadow-2xl px-8 py-4 flex items-center justify-between">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => 
                            `flex flex-col items-center gap-1 transition-all duration-300 ${
                                isActive ? 'text-brand-secondary scale-110 drop-shadow-md' : 'text-gray-400 hover:text-white'
                            }`
                        }
                    >
                        <span className="text-2xl">{item.icon}</span>
                        <span className="text-[10px] uppercase font-bold tracking-widest">{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </div>
    );
};

export default BottomNav;
