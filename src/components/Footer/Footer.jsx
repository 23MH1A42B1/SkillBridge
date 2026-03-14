export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-900 py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div className="text-sm font-bold text-white">SB SkillBridge</div>
          <nav className="flex flex-wrap items-center gap-4">
            <a href="#" className="text-xs text-slate-500 transition-all duration-200 hover:text-slate-300">About</a>
            <a href="#" className="text-xs text-slate-500 transition-all duration-200 hover:text-slate-300">Features</a>
            <a href="#" className="text-xs text-slate-500 transition-all duration-200 hover:text-slate-300">Docs</a>
            <a href="#" className="text-xs text-slate-500 transition-all duration-200 hover:text-slate-300">Contact</a>
          </nav>
          <p className="text-xs text-slate-600">Copyright {new Date().getFullYear()} SkillBridge. All rights reserved.</p>
        </div>
        <p className="text-xs text-slate-700">
          Built with Power Apps | Power Automate | SharePoint | Power BI | Claude AI
        </p>
      </div>
    </footer>
  );
}
