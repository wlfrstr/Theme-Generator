/**
 * Fetches a URL, collects all CSS, parses it, and extracts theme-relevant values.
 */

import css from 'css';
import {
  baseThemeLight,
  baseThemeDark,
  inquiryThemeLight,
  inquiryThemeDark,
} from './defaultThemes.js';

const HEX = /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;
const RGB = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*[\d.]+)?\s*\)$/;
const PX = /^(\d+(?:\.\d+)?)px$/;
const REM = /^(\d+(?:\.\d+)?)rem$/;

const NAMED_COLORS = {
  white: '#FFFFFF',
  black: '#000000',
  transparent: null,
};

/** Allowed font families for theme output. Only these may appear in generated JSON. */
const ALLOWED_FONTS = [
  'Arial',
  'Avant Garde',
  'Bookman',
  'Courier',
  'Courier New',
  'Garamond',
  'Helvetica',
  'Palatino',
  'system-ui',
  'Times',
  'Times New Roman',
  'Anton',
  'Archivo',
  'Domine',
  'Dosis',
  'Droid Sans',
  'IBM Plex Sans',
  'Inter',
  'Jost',
  'Lato',
  'Lora',
  'Manrope',
  'Montserrat',
  'Noto Sans JP',
  'Noto Sans TC',
  'Nunito',
  'Nunito Sans',
  'Open Sans',
  'Oswald',
  'Outfit',
  'PT Sans',
  'Playfair Display',
  'Poppins',
  'Public Sans',
  'Reddit Sans',
  'Roboto',
  'Rubik',
  'Source Sans Pro',
  'Source Serif Pro',
  'Space Grotesk',
  'Ubuntu',
  'Work Sans',
  'ABC Monument Grotesk',
];

const ALLOWED_FONTS_LOWER = new Set(ALLOWED_FONTS.map((f) => f.toLowerCase()));

/** Map common CSS font names / variants to an allowed font. */
const FONT_ALIASES = {
  'helvetica neue': 'Helvetica',
  'noto sans japanese': 'Noto Sans JP',
  'noto sans jp': 'Noto Sans JP',
  'noto sans traditional chinese': 'Noto Sans TC',
  'ibm plex sans': 'IBM Plex Sans',
  'source sans 3': 'Source Sans Pro',
  'droid sans': 'Droid Sans',
  'reddit sans': 'Reddit Sans',
  'space grotesk': 'Space Grotesk',
  'playfair display': 'Playfair Display',
  'source serif 4': 'Source Serif Pro',
  'pt sans': 'PT Sans',
  'nunito sans': 'Nunito Sans',
};

/** Return an allowed font from a CSS font-family value, or default. */
function normalizeFontFamily(raw) {
  const defaultFont = 'ABC Monument Grotesk';
  if (!raw || typeof raw !== 'string') return defaultFont;
  const parts = raw.split(',').map((s) => s.trim().replace(/^["']|["']$/g, ''));
  for (const part of parts) {
    if (!part) continue;
    const lower = part.toLowerCase();
    if (ALLOWED_FONTS_LOWER.has(lower)) {
      return ALLOWED_FONTS.find((f) => f.toLowerCase() === lower);
    }
    const alias = FONT_ALIASES[lower];
    if (alias) return alias;
  }
  return defaultFont;
}

/** Normalize any hex string to exactly 6 digits (#RRGGBB). Returns null if not a valid color. */
function hexTo6(hex) {
  if (!hex || typeof hex !== 'string') return null;
  const s = hex.trim().replace(/^#/, '');
  if (s.length === 6 && /^[0-9A-Fa-f]{6}$/.test(s)) return '#' + s;
  if (s.length === 3 && /^[0-9A-Fa-f]{3}$/.test(s)) {
    return '#' + s.split('').map((c) => c + c).join('');
  }
  if (s.length === 8 && /^[0-9A-Fa-f]{8}$/.test(s)) return '#' + s.slice(0, 6);
  return null;
}

function normalizeColor(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const s = raw.trim();
  let m = HEX.exec(s);
  if (m) return hexTo6('#' + m[1]);
  m = RGB.exec(s);
  if (m) {
    const r = parseInt(m[1], 10);
    const g = parseInt(m[2], 10);
    const b = parseInt(m[3], 10);
    const hex = '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
    return hexTo6(hex) || hex;
  }
  const lower = s.toLowerCase();
  if (NAMED_COLORS.hasOwnProperty(lower)) return NAMED_COLORS[lower];
  return null;
}

function parsePx(value) {
  if (!value || typeof value !== 'string') return null;
  const s = value.trim();
  const m = PX.exec(s);
  if (m) return Math.round(parseFloat(m[1]));
  const remMatch = REM.exec(s);
  if (remMatch) return Math.round(parseFloat(remMatch[1]) * 16);
  return null;
}

function resolveUrl(base, relative) {
  try {
    return new URL(relative, base).href;
  } catch {
    return null;
  }
}

async function fetchText(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (compatible; ThemeGenerator/1.0)',
      ...options.headers,
    },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.text();
}

function collectCssFromAst(ast, baseUrl) {
  const colors = [];
  const fonts = { family: [], size: [], weight: [], lineHeight: [] };
  const radii = [];
  const borders = [];

  function visitDeclarations(declarations) {
    if (!declarations) return;
    for (const d of declarations) {
      if (d.type !== 'declaration') continue;
      const prop = (d.property || '').toLowerCase();
      const value = (d.value || '').trim();

      const color = normalizeColor(value);
      if (color) {
        colors.push({ prop, value: color });
      }

      if (prop === 'font-family') fonts.family.push(value);
      if (prop === 'font-size') {
        const px = parsePx(value);
        if (px != null) fonts.size.push(px);
      }
      if (prop === 'font-weight') fonts.weight.push(value);
      if (prop === 'line-height') {
        const px = parsePx(value);
        if (px != null) fonts.lineHeight.push(px);
      }
      if (prop === 'border-radius') {
        const px = parsePx(value);
        if (px != null) radii.push(px);
      }
      if (prop === 'border-width' || prop === 'border-top-width') {
        const px = parsePx(value);
        if (px != null) borders.push(px);
      }
    }
  }

  function walk(rules) {
    if (!rules) return;
    for (const rule of rules) {
      if (rule.type === 'rule') {
        visitDeclarations(rule.declarations);
      }
      if (rule.type === 'media') {
        walk(rule.rules);
      }
    }
  }

  if (ast.stylesheet && ast.stylesheet.rules) {
    walk(ast.stylesheet.rules);
  }

  return { colors, fonts, radii, borders };
}

function isDark(hex) {
  const s = hex.replace(/^#/, '');
  const r = parseInt(s.slice(0, 2), 16);
  const g = parseInt(s.slice(2, 4), 16);
  const b = parseInt(s.slice(4, 6), 16);
  const luma = 0.299 * r + 0.587 * g + 0.114 * b;
  return luma < 128;
}

function mostCommon(arr, fallback) {
  if (!arr || arr.length === 0) return fallback;
  const counts = {};
  for (const v of arr) {
    const k = String(v);
    counts[k] = (counts[k] || 0) + 1;
  }
  let best = fallback;
  let max = 0;
  for (const [k, c] of Object.entries(counts)) {
    if (c > max) {
      max = c;
      best = k;
    }
  }
  return best;
}

function median(arr) {
  if (!arr || arr.length === 0) return null;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function extractThemes(collected) {
  const { colors, fonts, radii, borders } = collected;

  const colorByProp = {};
  for (const { prop, value } of colors) {
    if (!colorByProp[prop]) colorByProp[prop] = [];
    colorByProp[prop].push(value);
  }

  const backgroundColors = [
    ...(colorByProp['background-color'] || []),
    ...(colorByProp['background'] || []).map((v) => normalizeColor(v)).filter(Boolean),
  ];
  const textColors = colorByProp['color'] || [];
  const primaryCandidates = [
    ...(colorByProp['--primary'] || []),
    ...(colorByProp['--color-primary'] || []),
    ...(colorByProp['background-color'] || []).filter((c) => !isDark(c) && c.length === 7),
  ];

  const primaryColor = mostCommon(primaryCandidates, '#7379FD');
  const backgroundColorLight = mostCommon(
    backgroundColors.filter((c) => !isDark(c)),
    '#FFFFFF'
  );
  const backgroundColorDark = mostCommon(
    backgroundColors.filter((c) => isDark(c)),
    '#313131'
  );
  const bodyColorLight = mostCommon(
    textColors.filter((c) => isDark(c)),
    '#313131'
  );
  const bodyColorDark = mostCommon(
    textColors.filter((c) => !isDark(c)),
    '#E2E2E3'
  );
  const fontFamily = normalizeFontFamily(mostCommon(fonts.family, 'ABC Monument Grotesk'));
  const fontSizeBody = median(fonts.size) || 18;
  const fontSizeSmall = fonts.size.length ? Math.min(...fonts.size) : 12;
  const fontSizeHeading = fonts.size.length ? Math.max(...fonts.size) : 28;
  const lineHeightBody = median(fonts.lineHeight) || 22;
  const lineHeightSmall = fonts.lineHeight.length ? Math.min(...fonts.lineHeight) : 12;
  const lineHeightHeading = fonts.lineHeight.length ? Math.max(...fonts.lineHeight) : 32;
  const borderRadius = median(radii) || 30;
  const inputBorderRadius = radii.length ? Math.min(...radii.filter((r) => r <= 8)) || 4 : 4;

  const v = (hex) => {
    const n = hexTo6(hex);
    return n == null ? null : { value: n, unit: 'hex' };
  };
  const p = (n) => ({ value: n, unit: 'px' });
  const pc = (n) => ({ value: n, unit: '%' });

  const baseLight = {
    ...baseThemeLight,
    color_primary: v(primaryColor),
    background_color: v(backgroundColorLight),
    font_color_body: v(bodyColorLight),
    font_color_heading: v(bodyColorLight),
    font_family_body: fontFamily,
    font_family_small: fontFamily,
    font_family_heading: fontFamily,
    font_size_body: p(fontSizeBody),
    font_size_small: p(fontSizeSmall),
    font_size_heading: p(fontSizeHeading),
    font_line_height_body: p(lineHeightBody),
    font_line_height_small: p(lineHeightSmall),
    font_line_height_heading: p(lineHeightHeading),
    button_border_radius: p(borderRadius),
    input_border_radius: p(inputBorderRadius),
    button_primary_background_color: v(primaryColor),
    button_primary_border_color: v(primaryColor),
    link_font_color: v(primaryColor),
    icon_color_primary: v(primaryColor),
  };

  const baseDark = {
    ...baseThemeDark,
    color_primary: v(primaryColor),
    background_color: v(backgroundColorDark),
    font_color_body: v(bodyColorDark),
    font_color_heading: v('#FFFFFF'),
    font_family_body: fontFamily,
    font_family_small: fontFamily,
    font_family_heading: fontFamily,
    font_size_body: p(fontSizeBody),
    font_size_small: p(fontSizeSmall),
    font_size_heading: p(fontSizeHeading),
    font_line_height_body: p(lineHeightBody),
    font_line_height_small: p(lineHeightSmall),
    font_line_height_heading: p(lineHeightHeading),
    button_border_radius: p(borderRadius),
    input_border_radius: p(inputBorderRadius),
    button_primary_background_color: v(bodyColorDark),
    button_primary_border_color: v(bodyColorDark),
    link_font_color: v(primaryColor),
    icon_color_primary: v(primaryColor),
    input_background_color: v(backgroundColorDark),
    input_border_color: v(bodyColorDark),
    icon_color_background: v(bodyColorDark),
  };

  const inquiryLight = {
    ...inquiryThemeLight,
    navbar_icon_color: v(bodyColorLight),
    modal_border_radius: p(borderRadius),
  };

  const inquiryDark = {
    ...inquiryThemeDark,
    navbar_icon_color: v('#FFFFFF'),
    modal_border_radius: p(borderRadius),
  };

  return {
    baseThemeLight: baseLight,
    baseThemeDark: baseDark,
    inquiryThemeLight: inquiryLight,
    inquiryThemeDark: inquiryDark,
  };
}

export async function analyzeUrl(urlString) {
  const url = new URL(urlString);
  const html = await fetchText(urlString);
  const baseUrl = url.origin + url.pathname.replace(/\/[^/]*$/, '/');
  const rootUrl = url.origin + '/';

  const allCss = [];

  const linkRe = /<link[^>]+rel\s*=\s*["']stylesheet["'][^>]*href\s*=\s*["']([^"']+)["'][^>]*>/gi;
  let m;
  while ((m = linkRe.exec(html)) !== null) {
    const href = m[1].trim();
    const full = resolveUrl(href.startsWith('//') ? url.protocol + href : href.startsWith('/') ? rootUrl : baseUrl, href);
    if (full) {
      try {
        const cssText = await fetchText(full);
        allCss.push(cssText);
      } catch (e) {
        // skip failed stylesheets
      }
    }
  }

  const styleRe = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  while ((m = styleRe.exec(html)) !== null) {
    allCss.push(m[1]);
  }

  const inlineRe = /style\s*=\s*["']([^"']+)["']/gi;
  while ((m = inlineRe.exec(html)) !== null) {
    allCss.push(`* { ${m[1]} }`);
  }

  let collected = { colors: [], fonts: { family: [], size: [], weight: [], lineHeight: [] }, radii: [], borders: [] };

  for (const cssText of allCss) {
    try {
      const ast = css.parse(cssText);
      const c = collectCssFromAst(ast);
      collected.colors.push(...c.colors);
      collected.fonts.family.push(...c.fonts.family);
      collected.fonts.size.push(...c.fonts.size);
      collected.fonts.weight.push(...c.fonts.weight);
      collected.fonts.lineHeight.push(...c.fonts.lineHeight);
      collected.radii.push(...c.radii);
      collected.borders.push(...c.borders);
    } catch (e) {
      // skip parse errors
    }
  }

  return extractThemes(collected);
}
