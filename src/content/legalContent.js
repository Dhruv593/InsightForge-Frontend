export const defaultLegalContent = {
  privacy: {
    title: 'Privacy Policy',
    description: 'How Tatparya collects, uses, stores, and protects information.',
    effective_date: '18 September 2026',
    introduction: 'This policy applies to the Tatparya web application and its related services.',
    sections: [
      { heading: 'Information we collect', paragraphs: ['Account information such as your name, email address, verification status, and securely hashed password.', 'Datasets you upload, dataset profiles, questions, analysis results, reports, and conversation history.', 'Technical and security information such as request identifiers, timestamps, error details, and sign-in sessions.'] },
      { heading: 'How we use information', paragraphs: ['Provide authentication, dataset analysis, visualizations, reports, and account support.', 'Protect the service, investigate failures, prevent abuse, and improve reliability.', 'Send verification, password-reset, and service-related messages when email delivery is configured.'] },
      { heading: 'Service providers', paragraphs: ['Tatparya may use hosting, database, file-storage, email, observability, Google sign-in, and language-model providers selected by the service operator. Dataset content or questions are sent to an LLM provider only when required to perform the analysis you request.', 'Agent tracing is designed to use metadata-only mode unless the operator explicitly changes that configuration.'] },
      { heading: 'Storage and retention', paragraphs: ['Account and analysis data are retained while your account is active or as needed to operate and secure the service.', 'You can delete your account from Account settings. This removes application records associated with the account, subject to provider backups and legal retention obligations.'] },
      { heading: 'Security', paragraphs: ['Tatparya uses access controls, encrypted HTTPS transport, limited request sizes, rate limits, and protected server-side secrets. No internet service can guarantee absolute security.'] },
      { heading: 'Your choices', paragraphs: ['You may review and update your profile, revoke sessions, change your password, or delete your account from Account settings.', 'For privacy requests that cannot be completed in the product, contact the organization or administrator who provided your Tatparya access.'] },
      { heading: 'Children', paragraphs: ['Tatparya is intended for business users and is not directed to children under 13.'] },
      { heading: 'Changes to this policy', paragraphs: ['Material changes will be reflected by updating the effective date on this page.'] },
    ],
  },
  terms: {
    title: 'Terms and Conditions',
    description: 'The rules and responsibilities that apply when using Tatparya.',
    effective_date: '18 September 2026',
    introduction: 'These terms apply to the Tatparya web application and its related services.',
    sections: [
      { heading: 'Using Tatparya', paragraphs: ['You must provide accurate account information, protect your credentials, and use the service only for lawful business purposes.', 'You are responsible for ensuring that you have the right to upload and analyze the data you submit.'] },
      { heading: 'Acceptable use', paragraphs: ['Do not upload malicious files, attempt unauthorized access, interfere with the service, evade usage limits, or use Tatparya to violate another person’s rights.', 'Do not treat the service as a substitute for professional legal, medical, financial, or regulatory advice.'] },
      { heading: 'Analysis results', paragraphs: ['Tatparya uses automated calculations and language models. Results can contain mistakes and should be reviewed before making material business decisions.', 'Recommendations are informational. You remain responsible for decisions made using the service.'] },
      { heading: 'Your content', paragraphs: ['You retain ownership of the datasets and content you submit. You authorize Tatparya and its configured service providers to process that content only as needed to provide and secure the service.'] },
      { heading: 'Availability and changes', paragraphs: ['Features may change, be suspended, or become unavailable. The operator may apply reasonable limits to protect service reliability and other users.'] },
      { heading: 'Account suspension and termination', paragraphs: ['Access may be limited or terminated for misuse, security risk, legal requirements, or material violation of these terms. You may delete your account through Account settings.'] },
      { heading: 'Disclaimers and liability', paragraphs: ['The service is provided on an as available basis. To the extent permitted by law, the operator does not guarantee uninterrupted operation or that every analysis will be complete or error-free.', 'Liability is limited to the extent permitted by applicable law. Consumer rights that cannot legally be excluded remain unaffected.'] },
      { heading: 'Changes to these terms', paragraphs: ['Continued use after updated terms take effect means you accept the revised terms. Material changes will be reflected by updating the effective date.'] },
    ],
  },
};

export const normalizeLegalContent = (content) => content ? {
  privacy: { ...defaultLegalContent.privacy, ...content.privacy },
  terms: { ...defaultLegalContent.terms, ...content.terms },
} : defaultLegalContent;
