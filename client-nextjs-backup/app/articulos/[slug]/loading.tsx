export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center space-x-2 mb-8">
        <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
        <span>/</span>
        <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
        <span>/</span>
        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
      </div>

      {/* Title skeleton */}
      <div className="mb-8">
        <div className="h-8 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-6 animate-pulse"></div>
        
        {/* Meta info skeleton */}
        <div className="flex flex-wrap items-center space-x-6 mb-6">
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
        </div>
        
        {/* Stats skeleton */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-14 animate-pulse"></div>
        </div>
      </div>

      {/* Featured image skeleton */}
      <div className="mb-8">
        <div className="aspect-video w-full bg-gray-200 rounded-lg animate-pulse"></div>
      </div>

      {/* Content skeleton */}
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
        
        <div className="py-4">
          <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-full animate-pulse mt-4"></div>
          <div className="h-4 bg-gray-200 rounded w-4/5 animate-pulse mt-4"></div>
        </div>
        
        <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
      </div>

      {/* Share buttons skeleton */}
      <div className="border-t border-gray-200 pt-8 mt-12">
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="flex space-x-4">
            <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-20 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-28 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Back link skeleton */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="h-6 bg-gray-200 rounded w-36 animate-pulse"></div>
      </div>
    </div>
  );
}