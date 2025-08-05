export default function SimpleTest() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-green-600 mb-4">
          SafraReport
        </h1>
        <p className="text-gray-600">
          Vite React App Successfully Running!
        </p>
        <div className="mt-4">
          <p className="text-sm text-gray-500">
            Backend API: <span className="font-mono">localhost:4000</span>
          </p>
          <p className="text-sm text-gray-500">
            Frontend: <span className="font-mono">localhost:5173</span>
          </p>
        </div>
      </div>
    </div>
  );
}