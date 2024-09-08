import React from "react";

const RingsLogo = () => {
    const outerRadius = 23;  
    const innerRadius = 10;  
    const ballCount = 12;
    const ballRadius = 4;   

    const generateBalls = (radius, count) => {
        return Array.from({ length: count }, (_, i) => {
            const angle = (i / count) * 2 * Math.PI;
            const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      return <circle key={i} cx={x} cy={y} r={ballRadius} fill="#E5E7EB" />;
    });
  };

  return (
    <svg viewBox="-110 -110 220 220" width="200" height="200">
      <g transform="translate(0, 0)">
        {generateBalls(outerRadius, ballCount)}
        {generateBalls(innerRadius, ballCount / 2)}
      </g>
    </svg>
  );
};

export default RingsLogo;
