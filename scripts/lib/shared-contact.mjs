/** Reuse the homepage contact section on pages without a contact form. */
export function ensureSharedContact(html, homeHtml) {
  if (/<form\b[^>]*class=["'][^"']*\belementor-form\b/i.test(html)) return html;
  const anchor = homeHtml.indexOf('id="formular_contact_bottom"');
  const start = homeHtml.lastIndexOf('<div', anchor);
  if (anchor < 0 || start < 0) throw new Error('Homepage contact section missing');
  const tags = /<\/?div\b[^>]*>/gi;
  tags.lastIndex = start;
  let depth = 0, end = -1, match;
  while ((match = tags.exec(homeHtml))) {
    depth += /^<\/div/i.test(match[0]) ? -1 : 1;
    if (depth === 0) { end = tags.lastIndex; break; }
  }
  if (end < 0) throw new Error('Unbalanced homepage contact section');
  const section = homeHtml.slice(start, end).replace(/[\t ]+$/gm, '');
  const footer = html.search(/<footer\b/i);
  if (footer < 0) throw new Error('Footer missing for shared contact section');
  html = html.slice(0, footer) + '<div class="elementor elementor-3381 ect-shared-contact">\n' + section + '\n</div>\n' + html.slice(footer);
  for (const id of ['elementor-post-3381-css', 'widget-form-css', 'e-shapes-css']) {
    if (html.includes('id="'+id+'"')) continue;
    const tag = [...homeHtml.matchAll(/<link\b[^>]*>/gi)].find(m=>m[0].includes('id="'+id+'"'))?.[0];
    if (!tag) throw new Error('Homepage contact stylesheet missing: '+id);
    html = html.replace('</head>', tag.replace(/href="(?:\.\.\/)*(wp-content\/)/, 'href="/$1')+'\n</head>');
  }
  return html;
}
