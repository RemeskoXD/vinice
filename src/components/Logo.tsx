import React from 'react';

interface LogoProps {
  className?: string;
  isScrolled?: boolean;
  isHome?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className, isScrolled, isHome }) => {
  const primaryColor = isScrolled || !isHome ? '#78350f' : '#ffffff'; // amber-900 or white
  
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className || "w-12 h-12"} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Stylized Vineyard Rows */}
      <path 
        d="M20 70C20 70 35 65 50 65C65 65 80 70 80 70" 
        stroke={primaryColor} 
        strokeWidth="1.5" 
        strokeLinecap="round"
        opacity="0.6"
      />
      <path 
        d="M25 78C25 78 38 74 50 74C62 74 75 78 75 78" 
        stroke={primaryColor} 
        strokeWidth="1.5" 
        strokeLinecap="round"
        opacity="0.4"
      />
      
      {/* The letter V - strong and elegant */}
      <path 
        d="M30 25L50 82L70 25" 
        stroke={primaryColor} 
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      
      {/* Grapes Cluster integrated into/near the V */}
      <g transform="translate(62, 55) scale(0.6)">
        <circle cx="10" cy="10" r="5" fill={primaryColor} />
        <circle cx="20" cy="10" r="5" fill={primaryColor} />
        <circle cx="15" cy="18" r="5" fill={primaryColor} />
        <circle cx="25" cy="18" r="5" fill={primaryColor} />
        <circle cx="20" cy="26" r="5" fill={primaryColor} />
        {/* Leaf */}
        <path d="M15 5C15 5 12 0 18 -2" stroke={primaryColor} strokeWidth="1.5" strokeLinecap="round" />
      </g>
    </svg>
  );
};

export default Logo;
