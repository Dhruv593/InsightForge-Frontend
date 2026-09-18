import { Link } from 'react-router-dom';
import { BrandLogo } from '../components/common/BrandLogo';
import { Seo } from '../components/common/Seo';

const effectiveDate = '18 September 2026';

const privacySections = [
  ['Information we collect', ['Account information such as your name, email address, verification status, and securely hashed password.', 'Datasets you upload, dataset profiles, questions, analysis results, reports, and conversation history.', 'Technical and security information such as request identifiers, timestamps, error details, and sign-in sessions.']],
  ['How we use information', ['Provide authentication, dataset analysis, visualizations, reports, and account support.', 'Protect the service, investigate failures, prevent abuse, and improve reliability.', 'Send verification, password-reset, and service-related messages when email delivery is configured.']],
  ['Service providers', ['Tatparya may use hosting, database, file-storage, email, observability, Google sign-in, and language-model providers selected by the service operator. Dataset content or questions are sent to an LLM provider only when required to perform the analysis you request.', 'Agent tracing is designed to use metadata-only mode unless the operator explicitly changes that configuration.']],
  ['Storage and retention', ['Account and analysis data are retained while your account is active or as needed to operate and secure the service.', 'You can delete your account from Account settings. This removes application records associated with the account, subject to provider backups and legal retention obligations.']],
  ['Security', ['Tatparya uses access controls, encrypted HTTPS transport, limited request sizes, rate limits, and protected server-side secrets. No internet service can guarantee absolute security.']],
  ['Your choices', ['You may review and update your profile, revoke sessions, change your password, or delete your account from Account settings.', 'For privacy requests that cannot be completed in the product, contact the organization or administrator who provided your Tatparya access.']],
  ['Children', ['Tatparya is intended for business users and is not directed to children under 13.']],
  ['Changes to this policy', ['Material changes will be reflected by updating the effective date on this page.']],
];

const termsSections = [
  ['Using Tatparya', ['You must provide accurate account information, protect your credentials, and use the service only for lawful business purposes.', 'You are responsible for ensuring that you have the right to upload and analyze the data you submit.']],
  ['Acceptable use', ['Do not upload malicious files, attempt unauthorized access, interfere with the service, evade usage limits, or use Tatparya to violate another person’s rights.', 'Do not treat the service as a substitute for professional legal, medical, financial, or regulatory advice.']],
  ['Analysis results', ['Tatparya uses automated calculations and language models. Results can contain mistakes and should be reviewed before making material business decisions.', 'Recommendations are informational. You remain responsible for decisions made using the service.']],
  ['Your content', ['You retain ownership of the datasets and content you submit. You authorize Tatparya and its configured service providers to process that content only as needed to provide and secure the service.']],
  ['Availability and changes', ['Features may change, be suspended, or become unavailable. The operator may apply reasonable limits to protect service reliability and other users.']],
  ['Account suspension and termination', ['Access may be limited or terminated for misuse, security risk, legal requirements, or material violation of these terms. You may delete your account through Account settings.']],
  ['Disclaimers and liability', ['The service is provided on an “as available” basis. To the extent permitted by law, the operator does not guarantee uninterrupted operation or that every analysis will be complete or error-free.', 'Liability is limited to the extent permitted by applicable law. Consumer rights that cannot legally be excluded remain unaffected.']],
  ['Changes to these terms', ['Continued use after updated terms take effect means you accept the revised terms. Material changes will be reflected by updating the effective date.']],
];

export function LegalPage({ type }) {
  const privacy = type === 'privacy';
  const title = privacy ? 'Privacy Policy' : 'Terms and Conditions';
  const description = privacy ? 'How Tatparya collects, uses, stores, and protects information.' : 'The rules and responsibilities that apply when using Tatparya.';
  const sections = privacy ? privacySections : termsSections;
  return <div className="min-h-screen bg-[#F7F8FA] text-[#1D1D1F]">
    <Seo title={`${title} — Tatparya`} description={description} path={privacy ? '/privacy' : '/terms'} />
    <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 sm:px-8"><Link to="/" aria-label="Tatparya home"><BrandLogo className="h-9 w-auto max-w-[160px]" /></Link><Link className="text-sm font-semibold text-slate-600 hover:text-slate-950" to="/">Back to home</Link></div></header>
    <main className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <h1 className="m-0 text-4xl font-bold tracking-[-0.04em] sm:text-5xl">{title}</h1><p className="mb-0 mt-4 text-sm text-slate-500">Effective {effectiveDate}</p><p className="mb-0 mt-8 text-base leading-8 text-slate-700">{description} {privacy ? 'This policy applies' : 'These terms apply'} to the Tatparya web application and its related services.</p>
      <div className="mt-12 grid gap-10">{sections.map(([heading, paragraphs]) => <section key={heading}><h2 className="m-0 text-xl font-semibold tracking-[-0.02em]">{heading}</h2><div className="mt-4 grid gap-3">{paragraphs.map((paragraph) => <p className="m-0 text-sm leading-7 text-slate-600" key={paragraph}>{paragraph}</p>)}</div></section>)}</div>
    </main>
    <footer className="border-t border-slate-200 bg-white"><div className="mx-auto flex max-w-5xl flex-wrap gap-5 px-5 py-8 text-sm text-slate-500 sm:px-8"><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link><Link to="/login">Log in</Link><span className="sm:ml-auto">© {new Date().getFullYear()} Tatparya</span></div></footer>
  </div>;
}
