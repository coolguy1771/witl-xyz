export default function Loading() {
    return (
      <div className="min-h-screen bg-background text-foreground pt-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="h-12 w-32 bg-gray-800 rounded-lg animate-pulse mb-8" />
          <div className="space-y-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <div className="space-y-3">
                  <div className="h-8 w-3/4 bg-gray-800 rounded-lg animate-pulse" />
                  <div className="flex gap-4">
                    <div className="h-4 w-24 bg-gray-800 rounded-sm animate-pulse" />
                    <div className="h-4 w-24 bg-gray-800 rounded-sm animate-pulse" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-800 rounded-sm animate-pulse" />
                  <div className="h-4 w-5/6 bg-gray-800 rounded-sm animate-pulse" />
                </div>
                <div className="h-4 w-24 bg-gray-800 rounded-sm animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }