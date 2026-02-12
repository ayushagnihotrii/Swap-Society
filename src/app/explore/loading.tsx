import SkeletonCard from '@/components/ui/SkeletonCard';

export default function Loading() {
    return (
        <div className="container" style={{ padding: '2rem 0 4rem' }}>
            <div
                className="skeleton"
                style={{ width: 160, height: 32, marginBottom: '0.5rem' }}
            />
            <div className="skeleton" style={{ width: 100, height: 16, marginBottom: '2rem' }} />

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                    gap: '1.5rem',
                }}
            >
                {Array.from({ length: 8 }, (_, i) => (
                    <SkeletonCard key={i} />
                ))}
            </div>
        </div>
    );
}
