export const landingHeading = 'm-0 text-4xl font-extrabold leading-[1.08] tracking-[-0.045em] sm:text-5xl';

const palettes = {
  light: {
    section: 'bg-white text-slate-950', heading: 'text-slate-950', accent: 'text-slate-500', body: 'text-slate-600', muted: 'text-slate-500', border: 'border-slate-200', surface: 'border-slate-200 bg-[#F7F9FC]', card: 'border-slate-200 bg-white', button: 'bg-slate-950 text-white hover:bg-slate-800', secondaryButton: 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50',
  },
  dark: {
    section: 'bg-[#0E1726] text-white', heading: 'text-white', accent: 'text-slate-400', body: 'text-slate-300', muted: 'text-slate-400', border: 'border-slate-700/80', surface: 'border-slate-700/80 bg-[#121E31]', card: 'border-slate-700/80 bg-[#121E31]', button: 'bg-white text-slate-950 hover:bg-slate-100', secondaryButton: 'border-slate-600 bg-white/5 text-white hover:bg-white/10',
  },
};

export const paletteFor = (theme) => palettes[theme === 'dark' ? 'dark' : 'light'];
