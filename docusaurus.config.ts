import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Project Continuum',
  tagline: 'Open-source visual workflow platform. Build crash-proof data pipelines in your browser.',
  favicon: 'favicon.svg',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://docs.projectcontinuum.org',
  // Set the /<baseUrl>/ pathname under which your site is served
  baseUrl: '/',

  // GitHub pages deployment config.
  organizationName: 'projectcontinuum-org',
  projectName: 'continuum-docs',

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/projectcontinuum-org/continuum-docs/tree/main/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/Logo.png',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Continuum Docs',
      logo: {
        alt: 'Continuum logo',
        src: 'img/Logo.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          href: 'https://projectcontinuum.org',
          label: 'Website',
          position: 'right',
        },
        {
          href: 'https://github.com/projectcontinuum-org',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {label: 'Introduction', to: '/docs/intro'},
            {label: 'Getting Started', to: '/docs/getting-started/local-setup'},
            {label: 'Architecture', to: '/docs/architecture/overview'},
          ],
        },
        {
          title: 'Ecosystem',
          items: [
            {label: 'Website', href: 'https://projectcontinuum.org'},
            {label: 'Workbench', href: 'https://github.com/projectcontinuum-org/continuum-workbench'},
            {label: 'Platform Core', href: 'https://github.com/projectcontinuum-org/continuum-platform-core'},
          ],
        },
        {
          title: 'More',
          items: [
            {label: 'GitHub Org', href: 'https://github.com/projectcontinuum-org'},
            {label: 'Feature Template', href: 'https://github.com/projectcontinuum-org/continuum-feature-template'},
            {label: 'Issues', href: 'https://github.com/projectcontinuum-org/continuum-platform-core/issues'},
          ],
        },
      ],
      copyright: `Apache 2.0 License · © ${new Date().getFullYear()} Project Continuum contributors.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
