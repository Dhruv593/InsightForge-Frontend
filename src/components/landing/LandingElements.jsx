import { Link } from 'react-router-dom';
import { paletteFor } from './landingStyles';

export function Arrow() {
  return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
}

export function ContentLink({ link, className, children, onClick }) {
  return link.href.startsWith('#')
    ? <a className={className} href={link.href} onClick={onClick}>{children}</a>
    : <Link className={className} to={link.href} onClick={onClick}>{children}</Link>;
}

export function CapabilityIcon({ index }) {
  const paths = [
    <><path d="M5 6h14M5 12h9M5 18h6" /><path d="m16 15 3 3-3 3" /></>,
    <><path d="M4 19V9M10 19V5M16 19v-7M22 19V3" /><path d="M2 19h20" /></>,
    <><path d="m4 13 4 4L20 5" /><path d="M20 12v7H4V5h11" /></>,
    <><path d="M6 2h9l5 5v15H6z" /><path d="M14 2v6h6M9 13h8M9 17h6" /></>,
  ];
  return <svg className="h-8 w-8 text-slate-600 transition group-hover:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[index]}</svg>;
}

export function HeroProcessGraphic({ content }) {
  const icons = [<><path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5" /><path d="M5 15v4h14v-4" /></>, <><path d="M4 5h16v11H9l-5 4z" /><path d="M8 9h8M8 12h5" /></>, <><path d="M5 19V9m5 10V5m5 14v-7m5 7V3" /><path d="M3 19h19" /></>];
  const items = content.process_items.map((item, index) => ({ ...item, icon: icons[index] }));
  const animated = content.motion_enabled !== false;
  const palette = paletteFor(content.theme);
  return <div className={`mt-7 w-full max-w-2xl rounded-2xl border px-4 py-4 shadow-[0_22px_55px_-38px_rgba(15,23,42,0.5)] sm:mt-9 sm:px-7 sm:py-6 ${palette.surface}`} role="img" aria-label="Tatparya process: upload a business file, ask a question, and decide using clear evidence">
    <div className="relative"><span className={`absolute left-[16.67%] right-[16.67%] top-6 h-px ${content.theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`} aria-hidden="true" /><span className={`${animated ? 'hero-flow-beam' : ''} absolute left-[16.67%] top-6 h-px w-[66.66%] origin-left bg-blue-500`} aria-hidden="true" />{animated && <span className="hero-flow-dot absolute top-[21px] h-[7px] w-[7px] rounded-full bg-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.12)]" aria-hidden="true" />}<div className="relative grid grid-cols-3 gap-2">{items.map((item, index) => <div className="flex min-w-0 flex-col items-center text-center" key={item.label}><span className={`${animated ? `hero-flow-node hero-flow-delay-${index}` : ''} grid h-12 w-12 place-items-center rounded-xl border shadow-sm ${palette.card} ${palette.body}`}><svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{item.icon}</svg></span><span className={`mt-3 text-xs font-bold sm:text-sm ${palette.heading}`}>{item.label}</span><span className={`mt-1 block w-full min-w-0 whitespace-normal px-0.5 text-[10px] leading-4 sm:text-xs ${palette.muted}`}>{item.detail}</span></div>)}</div></div>
    <div className={`mt-5 border-t pt-3 text-center text-xs font-medium ${palette.border} ${palette.muted}`}>{content.process_footer}</div>
  </div>;
}
