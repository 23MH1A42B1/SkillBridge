import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <span>⚡</span>
          <span>SkillBridge</span>
        </div>
        <p className="footer-text">AI-Based Smart Placement Portal — Skills over CGPA</p>
        <p className="footer-copy">&copy; {new Date().getFullYear()} SkillBridge. Built with React.</p>
      </div>
    </footer>
  );
}
