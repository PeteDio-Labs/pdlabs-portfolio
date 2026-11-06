// Privacy and terms text. Every statement here describes what the site does. A test in
// site.test.ts fails the build if a page sets a cookie or uses web storage, because the
// privacy page says it does not.
export const legalUpdated = '2026-11-03';

export type LegalPage = { slug: 'privacy' | 'terms'; title: string; description: string; sections: { heading: string; paragraphs: string[] }[] };

export const legalPages = (analytics: boolean): LegalPage[] => [
  {
    slug: 'privacy',
    title: 'Privacy',
    description: 'What data pdlab.dev collects, what it does not, and who processes it.',
    sections: [
      {
        heading: 'Short version',
        paragraphs: [
          'This site sets no cookies, has no accounts and runs no advertising. It stores one setting in your browser, and only if you use the motion switch.',
          analytics
            ? 'It uses one privacy-friendly analytics service that counts page views without cookies or browser storage.'
            : 'It runs no analytics.',
        ],
      },
      {
        heading: 'Cookies and browser storage',
        paragraphs: [
          'The site sets no cookies and uses no session storage or IndexedDB. When you press the motion switch in the header, the site saves your choice, on or off, in local storage under the key pd-motion, so the next page remembers it. That value stays on your device, is never sent anywhere and holds no personal data. Because it is a setting you asked for, the site shows no cookie banner. If that changes, the site will ask for consent first and this page will say what changed.',
        ],
      },
      {
        heading: 'Analytics',
        paragraphs: analytics
          ? [
              'The site uses Cloudflare Web Analytics to count visits, which pages get read, which case studies get opened, the referring site, country, browser and device type. Cloudflare Web Analytics sets no cookies and stores nothing in your browser. Cloudflare says it does not track individual visitors across its customers\' sites.',
              'Cloudflare processes this data under its own privacy policy. Cloudflare does not document support for the Do Not Track setting, so do not rely on it. To avoid being counted, use a content blocker.',
            ]
          : ['The site collects no analytics. Hosting logs may exist at the provider, as described next.'],
      },
      {
        heading: 'Hosting and server logs',
        paragraphs: [
          'The site is static files on Amazon Web Services (S3 and CloudFront). AWS processes your IP address and request details to deliver pages and protect against abuse. The site owner does not read or keep those logs.',
          'Fonts load from Google Fonts, so Google receives your IP address and browser details when a page loads.',
        ],
      },
      {
        heading: 'Contact and your rights',
        paragraphs: [
          'The site has no forms and collects no personal data from you directly. To ask about your data, open an issue or message the owner on [GitHub](https://github.com/petedillo). Where the law gives you rights over data, such as access or deletion, the processors above handle the data they hold.',
        ],
      },
    ],
  },
  {
    slug: 'terms',
    title: 'Terms',
    description: 'Terms for using pdlab.dev: content, code, links and liability.',
    sections: [
      {
        heading: 'Using the site',
        paragraphs: [
          'pdlab.dev is the personal portfolio of Pedro Delgadillo. By using it, you agree to these terms. If you do not agree, do not use the site.',
        ],
      },
      {
        heading: 'Content',
        paragraphs: [
          'The case studies describe a personal homelab and are written in good faith from the author\'s own records. They are provided for information. Figures are as of the date given and may change.',
          'You may quote short excerpts with a link back to the page. Do not republish whole pages or present the work as yours.',
        ],
      },
      {
        heading: 'Code and open-source parts',
        paragraphs: ['Code in linked repositories carries the license in each repository. Where a repository has no license, all rights are reserved.'],
      },
      {
        heading: 'Links and third parties',
        paragraphs: ['The site links to other sites and loads fonts from Google. The author does not control them and is not responsible for their content or practices.'],
      },
      {
        heading: 'No warranty and liability',
        paragraphs: [
          'The site is provided as is, with no warranty of any kind. To the extent the law allows, the author is not liable for any loss from using the site or relying on its content.',
        ],
      },
      {
        heading: 'Changes',
        paragraphs: ['The author may change these terms. The date at the top of this page shows the last update. Continued use means you accept the change.'],
      },
    ],
  },
];
