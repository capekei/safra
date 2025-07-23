import { useEffect } from "react";
import { useLocation } from "wouter";

export default function AdminTest() {
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    // Redirect to the main admin login page
    setLocation('/safra-admin');
  }, [setLocation]);
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <p className="text-gray-600">Redirecting to admin login...</p>
      </div>
    </div>
  );
}