export default function Loading() {
    return (
        <div className="container" style={{ padding: '2rem 0 4rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
                <div className="skeleton" style={{ width: '100%', aspectRatio: '1', borderRadius: '1.5rem' }} />
                <div>
                    <div className="skeleton" style={{ width: 100, height: 14, marginBottom: '1rem' }} />
                    <div className="skeleton" style={{ width: '80%', height: 28, marginBottom: '0.5rem' }} />
                    <div className="skeleton" style={{ width: '60%', height: 28, marginBottom: '1.5rem' }} />
                    <div className="skeleton" style={{ width: '100%', height: 80, borderRadius: '1rem', marginBottom: '1rem' }} />
                    <div className="skeleton" style={{ width: '100%', height: 48, borderRadius: '1rem' }} />
                </div>
            </div>
        </div>
    );
}
