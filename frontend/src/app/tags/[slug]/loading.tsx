export default function Loading() {
    return (
        <div className="space-y-8 animate-pulse">
            {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-6">
                    <div className="w-full h-56 bg-gray-200 rounded-md mb-4" />
                    <div className="h-4 w-20 bg-gray-200 rounded-full mb-3" />
                    <div className="h-6 w-3/4 bg-gray-200 rounded mb-2" />
                    <div className="h-4 w-full bg-gray-200 rounded mb-1" />
                    <div className="h-4 w-2/3 bg-gray-200 rounded" />
                </div>
            ))}
        </div>
    );
}