/* QOff Super Admin — line icon set. Stroke 1.75, 24x24 viewBox. → window.Icon */
(function () {
  const S = (paths, vb) => function Ic(props) {
    const { size = 18, sw = 1.75, ...rest } = props || {};
    return React.createElement('svg', {
      width: size, height: size, viewBox: vb || '0 0 24 24', fill: 'none',
      stroke: 'currentColor', strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round',
      ...rest
    }, paths.map((d, i) => React.createElement('path', { key: i, d })));
  };
  const SR = (els, vb) => function Ic(props) {
    const { size = 18, sw = 1.75, ...rest } = props || {};
    return React.createElement('svg', {
      width: size, height: size, viewBox: vb || '0 0 24 24', fill: 'none',
      stroke: 'currentColor', strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round', ...rest
    }, els);
  };
  const c = (cx, cy, r, k) => React.createElement('circle', { key: k || 'c', cx, cy, r });
  const rect = (x, y, w, h, rx, k) => React.createElement('rect', { key: k || 'r', x, y, width: w, height: h, rx });
  const p = (d, k) => React.createElement('path', { key: k, d });
  const line = (x1, y1, x2, y2, k) => React.createElement('line', { key: k, x1, y1, x2, y2 });

  const Icon = {
    dashboard: SR([rect(3, 3, 7, 9, 1.5, 'a'), rect(14, 3, 7, 5, 1.5, 'b'), rect(14, 12, 7, 9, 1.5, 'c'), rect(3, 16, 7, 5, 1.5, 'd')]),
    health: S(['M3 12h3l2 5 4-12 2 7h7']),
    audit: SR([rect(5, 4, 14, 17, 2, 'a'), p('M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1', 'b'), line(9, 10, 15, 10, 'c'), line(9, 14, 13, 14, 'd')]),
    bars: S(['M3 9l1.5-5h15L21 9', 'M4 9h16v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9z', 'M4 9a2.5 2.5 0 0 0 4 0 2.5 2.5 0 0 0 4 0 2.5 2.5 0 0 0 4 0 2.5 2.5 0 0 0 4 0']),
    patrons: SR([c(9, 8, 3.2, 'a'), p('M3.5 19a5.5 5.5 0 0 1 11 0', 'b'), p('M16 5.2a3 3 0 0 1 0 5.6', 'c'), p('M17.5 19a5.2 5.2 0 0 0-3-4.7', 'd')]),
    countries: SR([c(12, 12, 9, 'a'), p('M3 12h18', 'b'), p('M12 3c2.5 2.5 3.8 5.6 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.6-3.8-9S9.5 5.5 12 3z', 'c')]),
    client: SR([c(12, 8, 3.6, 'a'), p('M5 20a7 7 0 0 1 14 0', 'b')]),
    transactions: SR([rect(2.5, 5, 19, 14, 2.5, 'a'), line(2.5, 9.5, 21.5, 9.5, 'b'), line(6, 14.5, 10, 14.5, 'c')]),
    commissions: SR([c(12, 12, 8.5, 'a'), p('M12 7v10M9.5 9.2A2.2 2.2 0 0 1 12 8c1.4 0 2.3.8 2.3 1.8 0 2.4-4.6 1.3-4.6 3.6 0 1 1 1.8 2.3 1.8a2.3 2.3 0 0 0 2.4-1.2', 'b')]),
    categories: S(['M12 2.5 21 7v10l-9 4.5L3 17V7z', 'M3 7l9 4.5L21 7', 'M12 11.5V21.5']),
    flags: S(['M5 21V4', 'M5 4h11l-2 3.5L16 11H5']),
    settings: SR([line(4, 7, 20, 7, 'a'), line(4, 17, 20, 17, 'b'), c(9, 7, 2.2, 'c'), c(15, 17, 2.2, 'd')]),
    admins: S(['M12 2.5 5 5.5v5c0 4.3 3 7.5 7 9 4-1.5 7-4.7 7-9v-5z', 'M9.3 12l1.9 1.9 3.6-3.8']),
    logout: S(['M14 7V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2', 'M10 12h11', 'M18 9l3 3-3 3']),
    search: SR([c(11, 11, 7, 'a'), line(20, 20, 16, 16, 'b')]),
    plus: S(['M12 5v14', 'M5 12h14']),
    kebab: SR([c(12, 5, 1.4, 'a'), c(12, 12, 1.4, 'b'), c(12, 19, 1.4, 'c')]),
    chevDown: S(['M6 9l6 6 6-6']),
    chevRight: S(['M9 6l6 6-6 6']),
    chevLeft: S(['M15 6l-6 6 6 6']),
    eye: SR([p('M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z', 'a'), c(12, 12, 3, 'b')]),
    edit: S(['M4 20h4L19 9a2 2 0 0 0-3-3L5 16v4z', 'M14 7l3 3']),
    check: S(['M5 12.5l4.5 4.5L19 7']),
    x: S(['M6 6l12 12', 'M18 6L6 18']),
    ban: SR([c(12, 12, 9, 'a'), line(5.6, 5.6, 18.4, 18.4, 'b')]),
    refresh: S(['M21 12a9 9 0 1 1-2.6-6.3', 'M21 4v4h-4']),
    trash: S(['M4 7h16', 'M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2', 'M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13']),
    wrench: S(['M14.5 6a3.5 3.5 0 0 0-4.6 4.2L4 16.1V20h3.9l5.9-5.9A3.5 3.5 0 0 0 18 9.5l-2.3 2.3-1.5-1.5L16.5 8z']),
    transfer: S(['M7 8h13', 'M16 4l4 4-4 4', 'M17 16H4', 'M8 12l-4 4 4 4']),
    filter: S(['M3 5h18l-7 8v6l-4 2v-8z']),
    download: S(['M12 3v12', 'M7 11l5 5 5-5', 'M4 21h16']),
    info: SR([c(12, 12, 9, 'a'), line(12, 11, 12, 16, 'b'), line(12, 8, 12, 8, 'c')]),
    alert: S(['M12 3l9 16H3z', 'M12 10v4', 'M12 17v.5']),
    bell: S(['M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6', 'M10 20a2 2 0 0 0 4 0']),
    external: S(['M14 4h6v6', 'M20 4l-9 9', 'M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4']),
    lock: SR([rect(5, 11, 14, 9, 2, 'a'), p('M8 11V8a4 4 0 0 1 8 0v3', 'b')]),
    key: SR([c(8, 15, 4, 'a'), p('M11 12l9-9', 'b'), p('M17 3l2 2', 'c'), p('M14 6l2 2', 'd')]),
    phone: S(['M5 4h3l2 5-2.5 1.5a11 11 0 0 0 5 5L19 13l2 5v3a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z']),
    mail: SR([rect(3, 5, 18, 14, 2.5, 'a'), p('M3.5 7l8.5 6 8.5-6', 'b')]),
    clock: SR([c(12, 12, 9, 'a'), p('M12 7v5l3.5 2', 'b')]),
    calendar: SR([rect(4, 5, 16, 16, 2.5, 'a'), line(4, 9.5, 20, 9.5, 'b'), line(8, 3, 8, 6, 'c'), line(16, 3, 16, 6, 'd')]),
    store: S(['M4 9h16v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z', 'M3 9l2-5h14l2 5', 'M4 9a2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0']),
    trendUp: S(['M3 17l6-6 4 4 8-8', 'M16 7h5v5']),
    trendDown: S(['M3 7l6 6 4-4 8 8', 'M16 17h5v-5']),
    arrowRight: S(['M5 12h14', 'M13 6l6 6-6 6']),
    pulse: S(['M3 12h4l2 6 4-14 3 9 1.5-1H21']),
    wallet: SR([p('M3 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2', 'a'), rect(3, 7, 18, 12, 2.5, 'b'), p('M16 12.5h2', 'c'), c(16.5, 12.5, .6, 'd')]),
    server: SR([rect(3, 4, 18, 7, 2, 'a'), rect(3, 13, 18, 7, 2, 'b'), line(7, 7.5, 7, 7.5, 'c'), line(7, 16.5, 7, 16.5, 'd')]),
    globe2: SR([c(12, 12, 9, 'a'), line(3, 12, 21, 12, 'b'), p('M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z', 'c')]),
    sparkAdmin: S(['M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z']),
    spark: S(['M13 3L4 14h6l-1 7 9-11h-6z']),
    user: SR([c(12, 8, 3.6, 'a'), p('M5 20a7 7 0 0 1 14 0', 'b')]),
    doc: S(['M6 3h7l5 5v13a0 0 0 0 1 0 0H6a0 0 0 0 1 0 0z', 'M13 3v5h5']),
    list: S(['M8 6h13', 'M8 12h13', 'M8 18h13', 'M3.5 6h.01', 'M3.5 12h.01', 'M3.5 18h.01']),
    shield: S(['M12 2.5 5 5.5v5c0 4.3 3 7.5 7 9 4-1.5 7-4.7 7-9v-5z']),
    copy: SR([rect(8, 8, 12, 12, 2.5, 'a'), p('M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2', 'b')]),
    menu: S(['M4 7h16', 'M4 12h16', 'M4 17h16']),
    grid: SR([rect(4, 4, 7, 7, 1.5, 'a'), rect(13, 4, 7, 7, 1.5, 'b'), rect(4, 13, 7, 7, 1.5, 'c'), rect(13, 13, 7, 7, 1.5, 'd')]),
    box: S(['M12 2.5 21 7v10l-9 4.5L3 17V7z', 'M3 7l9 4.5L21 7', 'M12 11.5V21.5']),
    grip: SR([c(9, 6, 1.3, 'a'), c(15, 6, 1.3, 'b'), c(9, 12, 1.3, 'c'), c(15, 12, 1.3, 'd'), c(9, 18, 1.3, 'e'), c(15, 18, 1.3, 'f')]),
    team: SR([c(9, 8, 3, 'a'), p('M3.5 19a5.5 5.5 0 0 1 11 0', 'b'), p('M16 5.2a3 3 0 0 1 0 5.6', 'c'), p('M17.5 19a5.2 5.2 0 0 0-3-4.7', 'd')]),
    tag: SR([p('M3 11.5V5a2 2 0 0 1 2-2h6.5L21 12.5 12.5 21z', 'a'), c(7.5, 7.5, 1.2, 'b')]),
    coffee: S(['M5 8h11v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z', 'M16 9h2.5a2.5 2.5 0 0 1 0 5H16', 'M8 3v2', 'M11 3v2']),
  };
  window.Icon = Icon;
})();
