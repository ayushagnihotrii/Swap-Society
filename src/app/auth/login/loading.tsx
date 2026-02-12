export default function Loading() {
    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <div style={{ textAlign: 'center' }}>
                <div
                    className="skeleton"
                    style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        margin: '0 auto 1rem',
                    }}
                />
                <div className="skeleton" style={{ width: 200, height: 14, margin: '0 auto' }} />
            </div>
        </div>
    );
}
