export default function Loading() {
    return (
        <div className="space-y-8 animate-pulse">
            {[1, 2, 3].map((i) => (
                <div key={i} className="card p-6">
                    <div className="w-full h-64 bg-brand-100 rounded-xl2 mb-4" />
                    <div className="h-5 w-24 bg-brand-100 rounded-full mb-4" />
                    <div className="h-7 w-3/4 bg-brand-100 rounded mb-3" />
                    <div className="h-4 w-full bg-gray-100 rounded mb-1.5" />
                    <div className="h-4 w-2/3 bg-gray-100 rounded" />
                </div>
            ))}
        </div>
    );
}