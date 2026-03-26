import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow pt-16">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center lg:pt-32 lg:pb-36 z-10 relative">
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-8">
              Unlock Your Potential with <br className="hidden md:block"/>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-indigo-600">AI-Powered Job Matching</span>
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-gray-500 mb-10">
              Upload your resume and let our intelligent engine score your ATS readiness, extract your top skills, and match you with live jobs instantly.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/upload" className="btn-primary text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                Upload Resume Now
              </Link>
              <Link to="/login" className="btn-secondary text-lg px-8 py-4 rounded-xl">
                Explore Features
              </Link>
            </div>
          </div>
          
          {/* Decorative background blobs */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-brand-100/50 blur-3xl mix-blend-multiply"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-indigo-100/50 blur-3xl mix-blend-multiply"></div>
        </section>

        {/* STATS SECTION */}
        <section className="py-12 bg-brand-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-brand-800">
              <div className="flex flex-col">
                <span className="text-4xl font-bold">10k+</span>
                <span className="text-brand-300 mt-2 text-sm uppercase tracking-wider">Active Users</span>
              </div>
              <div className="flex flex-col">
                <span className="text-4xl font-bold">50k+</span>
                <span className="text-brand-300 mt-2 text-sm uppercase tracking-wider">Live Jobs</span>
              </div>
              <div className="flex flex-col">
                <span className="text-4xl font-bold">85%</span>
                <span className="text-brand-300 mt-2 text-sm uppercase tracking-wider">Match Accuracy</span>
              </div>
              <div className="flex flex-col">
                <span className="text-4xl font-bold">2.4M</span>
                <span className="text-brand-300 mt-2 text-sm uppercase tracking-wider">Skills Analyzed</span>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-16">How SkillBridge Works</h2>
            <div className="grid md:grid-cols-3 gap-12">
              <div className="glass-card p-8 relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
                <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold group-hover:bg-brand-600 group-hover:text-white transition-colors">1</div>
                <h3 className="text-xl font-bold mb-4">Upload Resume</h3>
                <p className="text-gray-500">Simply upload your resume. Our AI instantly extracts your professional timeline and core skills.</p>
              </div>
              <div className="glass-card p-8 relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
                <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold group-hover:bg-brand-600 group-hover:text-white transition-colors">2</div>
                <h3 className="text-xl font-bold mb-4">Get AI Analysis</h3>
                <p className="text-gray-500">Receive a detailed ATS score and skill gap analysis tailored specifically to your desired role.</p>
              </div>
              <div className="glass-card p-8 relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
                <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold group-hover:bg-brand-600 group-hover:text-white transition-colors">3</div>
                <h3 className="text-xl font-bold mb-4">Match & Apply</h3>
                <p className="text-gray-500">Explore real-time job listings matched perfectly to your profile, and receive email alerts.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-16">Everything You Need to Succeed</h2>
            <div className="grid md:grid-cols-2 gap-12">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center text-xl">✓</div>
                <div>
                  <h4 className="text-lg font-bold">Smart Skill Extraction</h4>
                  <p className="mt-2 text-gray-500">We intelligently parse your documents to build a profound matrix of your technical and soft skills.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-xl">⚡</div>
                <div>
                  <h4 className="text-lg font-bold">Live Job Scraping</h4>
                  <p className="mt-2 text-gray-500">Integration with SERP API continually hunts down fresh roles across major job portals like LinkedIn.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-xl">📊</div>
                <div>
                  <h4 className="text-lg font-bold">ATS Scoring</h4>
                  <p className="mt-2 text-gray-500">Know your score before you apply. We calculate readability, keyword match, and formatting.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center text-xl">✉️</div>
                <div>
                  <h4 className="text-lg font-bold">Automated Email Alerts</h4>
                  <p className="mt-2 text-gray-500">Never miss an opportunity with our Power Automate backed high-match email alerts delivered daily.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-brand-600"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative text-center">
            <h2 className="text-3xl font-extrabold text-white mb-6">Ready to find your perfect job?</h2>
            <p className="text-brand-100 text-xl mb-8 max-w-2xl mx-auto">Join thousands of job seekers optimizing their careers with SkillBridge.</p>
            <Link to="/upload" className="inline-block bg-white text-brand-600 text-lg font-bold px-8 py-4 rounded-xl shadow-lg hover:bg-gray-50 transition-colors">
              Get Started for Free
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
