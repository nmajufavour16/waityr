'use client';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: 'text-base',
  md: 'text-xl',
  lg: 'text-2xl',
};

export default function Logo({ className = '', size = 'md' }: LogoProps) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,600;1,600&display=swap');
        .waityr-logo {
          font-family: 'Poppins', sans-serif;
          font-weight: 600;
          letter-spacing: -0.04em;
          line-height: 1;
        }
        .waityr-logo .italic-y {
          font-style: italic;
        }
      `}</style>
      <span className={`waityr-logo ${sizes[size]} ${className}`}>
        Wait<span className="italic-y">y</span>r
      </span>
    </>
  );
}
