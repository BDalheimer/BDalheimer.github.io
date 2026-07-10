/* BibTeX parser and publications renderer for bernharddalheimer.com */

(function () {

  /* ── LaTeX → Unicode ────────────────────────────────────── */
  const latexMap = {
    '{\\"u}': 'ü', '{\\"a}': 'ä', '{\\"o}': 'ö',
    '{\\"U}': 'Ü', '{\\"A}': 'Ä', '{\\"O}': 'Ö',
    "{\\'{e}}": 'é', "{\\'e}": 'é', "{\\'{a}}": 'á', "{\\'a}": 'á',
    "{\\`{e}}": 'è', "{\\`e}": 'è',
    "{\\'c}": 'ć', "{\\'{c}}": 'ć',
    '{\\ss}': 'ß',
    "{\\'o}": 'ó', "{\\'{o}}": 'ó',
    "{\\'i}": 'í',
    '{\\~n}': 'ñ',
    "{\\'u}": 'ú',
    '{\\c{c}}': 'ç',
    "{\\'n}": 'ń',
  };

  function decodeLatex(str) {
    let out = str;
    for (const [k, v] of Object.entries(latexMap)) {
      out = out.split(k).join(v);
    }
    // Remove remaining bare braces
    out = out.replace(/[{}]/g, '');
    return out;
  }

  /* ── BibTeX parser ──────────────────────────────────────── */
  function parseBibtex(text) {
    const entries = [];
    let i = 0;

    while (i < text.length) {
      const at = text.indexOf('@', i);
      if (at === -1) break;

      // Entry type
      const brace = text.indexOf('{', at);
      if (brace === -1) break;
      const type = text.slice(at + 1, brace).trim().toLowerCase();

      // Find matching closing brace
      let depth = 1, j = brace + 1;
      while (j < text.length && depth > 0) {
        if (text[j] === '{') depth++;
        else if (text[j] === '}') depth--;
        j++;
      }

      const inner = text.slice(brace + 1, j - 1);
      const comma = inner.indexOf(',');
      if (comma === -1) { i = j; continue; }

      const key  = inner.slice(0, comma).trim();
      const rest = inner.slice(comma + 1);

      // Parse fields: field = {value} or field = "value" or field = number
      const fields = { type, key };
      let k2 = 0;
      while (k2 < rest.length) {
        // Skip whitespace and commas
        while (k2 < rest.length && /[\s,]/.test(rest[k2])) k2++;
        if (k2 >= rest.length) break;

        // Read field name
        const eqIdx = rest.indexOf('=', k2);
        if (eqIdx === -1) break;
        const fieldName = rest.slice(k2, eqIdx).trim().toLowerCase();
        k2 = eqIdx + 1;

        // Skip whitespace
        while (k2 < rest.length && rest[k2] === ' ') k2++;

        let value = '';
        if (rest[k2] === '{') {
          // Brace-delimited value — handle nesting
          let d = 1; k2++;
          const start = k2;
          while (k2 < rest.length && d > 0) {
            if (rest[k2] === '{') d++;
            else if (rest[k2] === '}') d--;
            k2++;
          }
          value = rest.slice(start, k2 - 1).trim();
        } else if (rest[k2] === '"') {
          k2++;
          const start = k2;
          while (k2 < rest.length && rest[k2] !== '"') k2++;
          value = rest.slice(start, k2).trim();
          k2++; // skip closing "
        } else {
          // Bare value (number or unquoted string)
          const start = k2;
          while (k2 < rest.length && rest[k2] !== ',' && rest[k2] !== '\n') k2++;
          value = rest.slice(start, k2).trim();
        }

        if (fieldName) fields[fieldName] = decodeLatex(value);
      }

      entries.push(fields);
      i = j;
    }

    return entries;
  }

  /* ── Author formatting ──────────────────────────────────── */
  function formatAuthors(authorStr) {
    if (!authorStr) return '';
    const authors = authorStr.split(/\s+and\s+/i).map(a => a.trim());
    const formatted = authors.map(a => {
      if (a.includes(',')) {
        // "Last, First" → "F. Last" abbreviated, or full
        const parts = a.split(',').map(s => s.trim());
        return parts.reverse().join(' ');
      }
      return a;
    });
    // Bold "Dalheimer, Bernhard" or "Bernhard Dalheimer"
    return formatted.map(a => {
      if (/dalheimer/i.test(a)) return `<strong>${a}</strong>`;
      return a;
    }).join(', ');
  }

  /* ── Render a single publication ────────────────────────── */
  function renderPub(entry, num) {
    const title   = entry.title   || 'Untitled';
    const authors = formatAuthors(entry.author || '');
    const journal      = entry.journal || '';
    const forthcoming  = entry.note && entry.note.toLowerCase().includes('forthcoming');
    const year         = forthcoming ? 'Forthcoming' : (entry.year || '');
    const volume       = (!forthcoming && entry.volume) ? `, ${entry.volume}` : '';
    const pages        = (!forthcoming && entry.pages)  ? `, ${entry.pages.replace('--', '–')}` : '';

    // Links
    const links = [];
    if (entry.doi) {
      const doiHref = entry.doi.startsWith('http') ? entry.doi : `https://doi.org/${entry.doi}`;
      links.push(`<a href="${doiHref}" target="_blank" rel="noopener" class="badge">DOI</a>`);
    }
    if (entry.file) {
      links.push(`<a href="/papers/${entry.file}" target="_blank" class="badge">PDF</a>`);
    }
    if (entry.slides) {
      links.push(`<a href="/slides/${entry.slides}" target="_blank" class="badge">Slides</a>`);
    }
    if (entry.video) {
      links.push(`<a href="${entry.video}" target="_blank" rel="noopener" class="badge">Video</a>`);
    }
    if (entry.url && !entry.doi) {
      links.push(`<a href="${entry.url}" target="_blank" rel="noopener" class="badge">Link</a>`);
    }

    const titleLink = entry.doi
      ? `<a href="${entry.doi.startsWith('http') ? entry.doi : 'https://doi.org/' + entry.doi}" target="_blank" rel="noopener">${title}</a>`
      : (entry.url ? `<a href="${entry.url}" target="_blank" rel="noopener">${title}</a>` : title);

    return `
<div class="pub-item">
  <span class="pub-num">${num}.</span>
  <div class="pub-content">
    <p class="pub-title">${titleLink}</p>
    <p class="pub-authors">${authors}</p>
    <p class="pub-venue"><em>${journal}</em>${volume}${pages}${year ? `, ${year}` : ''}</p>
    ${links.length ? `<div class="pub-links">${links.join('')}</div>` : ''}
  </div>
</div>`;
  }

  /* ── Main render function ───────────────────────────────── */
  function renderPublications(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    fetch('/assets/ref.bib')
      .then(r => r.text())
      .then(function (text) {
        const entries = parseBibtex(text)
          .filter(e => e.type === 'article')
          .sort((a, b) => {
            const aForth = a.note && a.note.toLowerCase().includes('forthcoming');
            const bForth = b.note && b.note.toLowerCase().includes('forthcoming');
            if (aForth && !bForth) return -1;
            if (!aForth && bForth) return 1;
            return (parseInt(b.year) || 0) - (parseInt(a.year) || 0);
          });

        let html = '<div class="pub-list">';
        let counter = entries.length;
        entries.forEach(function (e) {
          html += renderPub(e, counter--);
        });
        html += '</div>';
        container.innerHTML = html;
      })
      .catch(function () {
        container.innerHTML = '<p style="color:var(--muted)">Could not load publications. Please try refreshing.</p>';
      });
  }

  /* Export */
  window.BD = window.BD || {};
  window.BD.renderPublications = renderPublications;
  window.BD.parseBibtex = parseBibtex;

})();
