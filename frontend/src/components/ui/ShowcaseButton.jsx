import React, { useRef } from 'react';
import gsap from 'gsap';

const ShowcaseButton = ({ children, onClick, variant = 'primary', className = '', ...props }) => {
    const btnRef = useRef(null);

    const handleMouseEnter = () => {
        gsap.to(btnRef.current, {
            scale: 1.05,
            duration: 0.3,
            ease: 'elastic.out(1, 0.5)',
            boxShadow: '0 0 20px rgba(0, 242, 234, 0.6)'
        });
    };

    const handleMouseLeave = () => {
        gsap.to(btnRef.current, {
            scale: 1,
            duration: 0.3,
            ease: 'power2.out',
            boxShadow: '0 0 0px rgba(0, 0, 0, 0)'
        });
    };

    const handleMouseDown = () => {
        gsap.to(btnRef.current, { scale: 0.95, duration: 0.1 });
    };

    const handleMouseUp = () => {
        gsap.to(btnRef.current, { scale: 1.05, duration: 0.1 });
    };

    // Variants
    const baseStyle = "relative px-6 py-3 rounded-xl font-bold uppercase tracking-wider transition-colors duration-200 flex items-center justify-center gap-2 overflow-hidden group";

    const variants = {
        primary: "bg-cyan-500 text-black hover:bg-cyan-400",
        secondary: "bg-transparent border border-cyan-500/30 text-cyan-400 hover:border-cyan-400 hover:text-cyan-300 backdrop-blur-sm",
        danger: "bg-rose-600 text-white hover:bg-rose-500",
        ghost: "bg-transparent text-gray-400 hover:text-white"
    };

    return (
        <button
            ref={btnRef}
            className={`${baseStyle} ${variants[variant] || variants.primary} ${className}`}
            onClick={onClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            {...props}
        >
            <span className="relative z-10">{children}</span>
            {/* Shine effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0" />
        </button>
    );
};

export default ShowcaseButton;
