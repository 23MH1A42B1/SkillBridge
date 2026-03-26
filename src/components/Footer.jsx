import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-indigo-600">
              🌉 SkillBridge
            </span>
            <p className="text-gray-500 text-base">
              Bridging the gap between your true skills and your dream career with AI-powered matching.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Platform</h3>
                <ul className="mt-4 space-y-4">
                  <li><Link to="/login" className="text-base text-gray-500 hover:text-gray-900">Get Started</Link></li>
                  <li><Link to="/login" className="text-base text-gray-500 hover:text-gray-900">Sign In</Link></li>
                  <li><a href="#" className="text-base text-gray-500 hover:text-gray-900">Pricing</a></li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Support</h3>
                <ul className="mt-4 space-y-4">
                  <li><a href="#" className="text-base text-gray-500 hover:text-gray-900">Documentation</a></li>
                  <li><a href="#" className="text-base text-gray-500 hover:text-gray-900">Guides</a></li>
                  <li><a href="#" className="text-base text-gray-500 hover:text-gray-900">Contact</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-200 pt-8">
          <p className="text-base text-gray-400 xl:text-center">
            &copy; {new Date().getFullYear()} SkillBridge Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
