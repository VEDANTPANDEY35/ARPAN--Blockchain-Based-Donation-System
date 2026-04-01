import React from 'react';

const LoadingSkeleton = () => {
    return (
        <div className="bg-white rounded-2xl border border-brand-border overflow-hidden w-full h-[400px] relative shadow-sm">
            <div className="h-24 bg-gray-200 relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
            </div>
            <div className="p-6">
                <div className="w-12 h-12 rounded-full bg-gray-200 -mt-12 mb-4 border-4 border-white relative overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4 relative overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2 relative overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-5/6 mb-6 relative overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded-full w-full mb-4 relative overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
                </div>
                <div className="flex justify-between mb-8">
                    <div className="h-4 bg-gray-200 rounded w-1/4 relative overflow-hidden">
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-1/4 relative overflow-hidden">
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
                    </div>
                </div>
                <div className="h-10 bg-gray-200 rounded-xl relative overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
                </div>
            </div>
        </div>
    );
};

export default LoadingSkeleton;
