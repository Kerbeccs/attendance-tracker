import { Link, useLocation } from "wouter";

export default function Navigation() {
  const [location] = useLocation();

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-semibold text-slate-900">AttendanceTracker Pro</h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/">
              <button className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                location === "/" 
                  ? "text-primary bg-primary/10 hover:bg-primary/20"
                  : "text-slate-600 hover:text-slate-900"
              }`}>
                Employee Portal
              </button>
            </Link>
            <Link href="/hr">
              <button className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                location === "/hr"
                  ? "text-primary bg-primary/10 hover:bg-primary/20"
                  : "text-slate-600 hover:text-slate-900"
              }`}>
                HR Dashboard
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
