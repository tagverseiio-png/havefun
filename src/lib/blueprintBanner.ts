/**
 * Architectural Blueprint Banner
 * Designed & Developed by Strucureo
 * Official Website: https://strucureo.com
 */

export function printBlueprintBanner() {
  if (typeof window === 'undefined') return;

  const headerBadge = [
    'background: #020817',
    'color: #00f2fe',
    'padding: 8px 16px',
    'font-size: 12px',
    'font-weight: 900',
    'font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    'border: 1px solid #00f2fe',
    'border-radius: 6px',
    'text-shadow: 0 0 10px rgba(0, 242, 254, 0.7)',
    'box-shadow: 0 0 15px rgba(0, 242, 254, 0.3)'
  ].join(';');

  const asciiStyle = [
    'color: #38bdf8',
    'font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    'font-size: 10px',
    'font-weight: bold',
    'line-height: 1.15'
  ].join(';');

  const labelStyle = [
    'color: #94a3b8',
    'font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    'font-size: 11px',
    'font-weight: bold'
  ].join(';');

  const valueHighlight = [
    'color: #22d3ee',
    'font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    'font-size: 11px',
    'font-weight: 800'
  ].join(';');

  const linkStyle = [
    'color: #4ade80',
    'font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    'font-size: 11px',
    'font-weight: 900',
    'text-decoration: underline'
  ].join(';');

  console.log(
    '%c📐 ARCHITECTURAL BLUEPRINT // DEVELOPED BY STRUCUREO',
    headerBadge
  );

  console.log(
    `%c
   ███████╗████████╗██████╗ ██╗   ██╗ ██████╗██╗   ██╗██████╗ ███████╗ ██████╗ 
   ██╔════╝╚══██╔══╝██╔══██╗██║   ██║██╔════╝██║   ██║██╔══██╗██╔════╝██╔═══██╗
   ███████╗   ██║   ██████╔╝██║   ██║██║     ██║   ██║██████╔╝█████╗  ██║   ██║
   ╚════██║   ██║   ██╔══██╗██║   ██║██║     ██║   ██║██╔══██╗██╔══╝  ██║   ██║
   ███████║   ██║   ██║  ██║╚██████╔╝╚██████╗╚██████╔╝██║  ██║███████╗╚██████╔╝
   ╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝ ╚═════╝ 
`,
    asciiStyle
  );

  console.log(
    `%c  ⚡ Project Architecture  : %cHavFun Trampoline Park\n` +
    `%c  🛠️  Engineering Team     : %cStrucureo\n` +
    `%c  🌐 Official Blueprint    : %chttps://strucureo.com\n` +
    `%c  📦 Production Status     : %cVerified & Operational // High Performance`,
    labelStyle, valueHighlight,
    labelStyle, valueHighlight,
    labelStyle, linkStyle,
    labelStyle, valueHighlight
  );
}
