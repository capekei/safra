export default function TestSimple() {
  console.log('🧪 TestSimple component loaded');
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        SafraReport - Test Page
      </h1>
      <p className="text-lg text-gray-700">
        ✅ React is working correctly!
      </p>
      <div className="mt-8 p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">System Status:</h2>
        <ul className="space-y-2">
          <li>✅ Vite dev server running</li>
          <li>✅ React components loading</li>
          <li>✅ TypeScript compilation working</li>
          <li>✅ Tailwind CSS working</li>
        </ul>
      </div>
    </div>
  );
}