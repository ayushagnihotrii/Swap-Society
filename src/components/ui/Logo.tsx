export default function Logo({ size = 28 }: { size?: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="SwapSociety logo"
        >
            <defs>
                <linearGradient id="ss-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#E94560" />
                    <stop offset="100%" stopColor="#7B2FF7" />
                </linearGradient>
            </defs>
            {/* Top arrow — curving right */}
            <path
                d="M30 8C30 8 38 8 38 16C38 24 30 24 24 24"
                stroke="url(#ss-grad)"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
            />
            <path
                d="M32 4L38 8L32 12"
                stroke="url(#ss-grad)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
            {/* Bottom arrow — curving left */}
            <path
                d="M18 40C18 40 10 40 10 32C10 24 18 24 24 24"
                stroke="url(#ss-grad)"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
            />
            <path
                d="M16 44L10 40L16 36"
                stroke="url(#ss-grad)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
        </svg>
    );
}
