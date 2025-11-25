import { useMemo } from 'react';

const RainBackground = () => {
    // Generate 100 drops for mobile, 200 for desktop to save performance
    const dropCount = window.innerWidth < 768 ? 100 : 200;

    const drops = useMemo(() => {
        return Array.from({ length: dropCount }).map((_, i) => {
            const delay = Math.random() * 2;
            const duration = 0.5 + Math.random() * 0.5;
            const left = Math.random() * 100;

            return (
                <div
                    key={i}
                    className="drop"
                    style={{
                        left: `${left}%`,
                        animationDelay: `${delay}s`,
                        animationDuration: `${duration}s`
                    }}
                />
            );
        });
    }, [dropCount]);

    return (
        <div className="rain-wrapper">
            {drops}
        </div>
    );
};

export default RainBackground;
