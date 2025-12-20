
import React from 'react';

export const AiIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M10 16.5l-3 -3l3 -3l-3 -3l3 -3l3 3l3 -3l3 3l-3 3l3 3l-3 3l-3 -3z" />
    <path d="M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
    <path d="M13.5 10.5l7.5 -7.5" />
    <path d="M13.5 13.5l7.5 7.5" />
    <path d="M10.5 13.5l-7.5 7.5" />
    <path d="M10.5 10.5l-7.5 -7.5" />
  </svg>
);
