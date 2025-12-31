import React from 'react';

interface LogoProps {
    variant?: 'navbar' | 'dashboard' | 'icon';
    className?: string;
}

export const Logo: React.FC<LogoProps> = ({
    variant = 'navbar',
    className = ''
}) => {
    const logoSrc = variant === 'dashboard'
        ? '/logo@Dashboard.png'
        : variant === 'icon'
            ? '/icon.png'
            : '/logo@Navabar.png';

    const defaultClassName = variant === 'icon'
        ? 'h-8 w-8'
        : variant === 'dashboard'
            ? 'h-8 w-auto'
            : 'h-10 w-auto';

    return (
        <img
            src={logoSrc}
            alt="MyGF AI"
            className={`${defaultClassName} ${className}`}
        />
    );
};
