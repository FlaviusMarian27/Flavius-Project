// =========================================================
// Marian Flavius-Andrei - Portfolio (networking edition)
// =========================================================
const root = document.documentElement;
root.classList.add('js');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer  = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const rand = (a, b) => a + Math.random() * (b - a);

$('#year').textContent = new Date().getFullYear();

// =========================================================
// 1. BOOT SEQUENCE (o dată pe sesiune)
// =========================================================
async function boot() {
    const el = $('#boot');
    let seen = false;
    try { seen = sessionStorage.getItem('mfa-booted') === '1'; } catch (e) {}

    if (reduceMotion || seen) { el.remove(); return; }

    document.body.classList.add('booting');
    const log = $('#boot-log');
    const bar = $('#boot-bar');
    const lines = [
        ['[ 0.001] MFA-OS bootstrap', ''],
        ['[ 0.112] loading interfaces ...... ', 'OK'],
        ['[ 0.204] Gi0/0 link up 1000Mbps/full', ''],
        ['[ 0.318] VLAN 10,20,30,40 ......... ', 'OK'],
        ['[ 0.421] DHCP lease 192.168.10.11/24', ''],
        ['[ 0.533] default route via 192.168.10.1', ''],
        ['[ 0.640] welcome, visitor.', '']
    ];
    let skip = false;
    el.addEventListener('click', () => { skip = true; });

    for (let i = 0; i < lines.length && !skip; i++) {
        const [t, ok] = lines[i];
        log.insertAdjacentHTML('beforeend', `${t}${ok ? `<span class="ok">${ok}</span>` : ''}\n`);
        bar.style.width = `${((i + 1) / lines.length) * 100}%`;
        await sleep(i === lines.length - 1 ? 260 : 150);
    }
    try { sessionStorage.setItem('mfa-booted', '1'); } catch (e) {}
    el.classList.add('done');
    document.body.classList.remove('booting');
    setTimeout(() => el.remove(), 600);
}

boot().then(() => {
    requestAnimationFrame(() => root.classList.add('ready'));
    startRotator();
    startTerminal();
});

// =========================================================
// 2. FUNDAL - rețea animată pe canvas
// =========================================================
(function networkBackground() {
    const cvs = $('#net-bg');
    if (!cvs || reduceMotion) return;
    const ctx = cvs.getContext('2d');
    let w, h, dpr, nodes = [], pulses = [];
    const mouse = { x: -9999, y: -9999 };
    const LINK = 140;

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = cvs.width  = innerWidth  * dpr;
        h = cvs.height = innerHeight * dpr;
        const count = Math.min(80, Math.round((innerWidth * innerHeight) / 17000));
        nodes = Array.from({ length: count }, () => ({
            x: Math.random() * w, y: Math.random() * h,
            vx: rand(-.18, .18) * dpr, vy: rand(-.18, .18) * dpr,
            r: rand(1, 2.2) * dpr
        }));
    }
    resize();
    addEventListener('resize', resize);
    addEventListener('mousemove', e => { mouse.x = e.clientX * dpr; mouse.y = e.clientY * dpr; });
    addEventListener('mouseleave', () => { mouse.x = mouse.y = -9999; });

    function frame() {
        if (!document.hidden) {
            ctx.clearRect(0, 0, w, h);
            const L = LINK * dpr;

            for (const n of nodes) {
                n.x += n.vx; n.y += n.vy;
                if (n.x < 0 || n.x > w) n.vx *= -1;
                if (n.y < 0 || n.y > h) n.vy *= -1;
                // atracție ușoară spre mouse
                const dx = mouse.x - n.x, dy = mouse.y - n.y, d = Math.hypot(dx, dy);
                if (d < 200 * dpr) { n.x += dx * 0.002; n.y += dy * 0.002; }
            }

            for (let i = 0; i < nodes.length; i++) {
                const a = nodes[i];
                for (let j = i + 1; j < nodes.length; j++) {
                    const b = nodes[j];
                    const d = Math.hypot(a.x - b.x, a.y - b.y);
                    if (d < L) {
                        ctx.strokeStyle = `rgba(56,189,248,${(1 - d / L) * 0.22})`;
                        ctx.lineWidth = dpr * 0.8;
                        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
                        if (pulses.length < 6 && Math.random() < 0.0004) pulses.push({ a, b, t: 0 });
                    }
                }
                const md = Math.hypot(a.x - mouse.x, a.y - mouse.y);
                if (md < 180 * dpr) {
                    ctx.strokeStyle = `rgba(251,191,36,${(1 - md / (180 * dpr)) * 0.45})`;
                    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
                }
                ctx.fillStyle = 'rgba(148,163,184,.55)';
                ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
            }

            // pachete care circulă pe legături
            pulses = pulses.filter(p => (p.t += 0.012) < 1);
            for (const p of pulses) {
                const x = p.a.x + (p.b.x - p.a.x) * p.t, y = p.a.y + (p.b.y - p.a.y) * p.t;
                ctx.fillStyle = 'rgba(56,189,248,.95)';
                ctx.shadowColor = '#38bdf8'; ctx.shadowBlur = 10 * dpr;
                ctx.beginPath(); ctx.arc(x, y, 2.2 * dpr, 0, Math.PI * 2); ctx.fill();
                ctx.shadowBlur = 0;
            }
        }
        requestAnimationFrame(frame);
    }
    frame();
})();

// =========================================================
// 3. CURSOR GLOW + SCROLL PROGRESS + RX/TX
// =========================================================
const glow = $('#cursor-glow');
if (finePointer && !reduceMotion) {
    let gx = 0, gy = 0, tx = 0, ty = 0;
    addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; glow.classList.add('on'); });
    (function loop() {
        gx += (tx - gx) * 0.12; gy += (ty - gy) * 0.12;
        glow.style.transform = `translate(${gx}px, ${gy}px)`;
        requestAnimationFrame(loop);
    })();
}

const progress = $('#scroll-progress');
const rxEl = $('#rx'), txEl = $('#tx');
let txBytes = 0, rxBytes = 0, lastY = scrollY;
const fmt = b => b < 1024 ? `${b|0} B` : b < 1048576 ? `${(b/1024).toFixed(1)} KB` : `${(b/1048576).toFixed(2)} MB`;

function onScroll() {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    txBytes += Math.abs(scrollY - lastY) * 37;
    lastY = scrollY;
    txEl.textContent = fmt(txBytes);
    updateTimeline();
}
addEventListener('scroll', onScroll, { passive: true });
setInterval(() => { rxBytes += rand(200, 1600); rxEl.textContent = fmt(rxBytes); }, 700);

// =========================================================
// 4. NAVIGAȚIE
// =========================================================
const sidebar = $('#sidebar');
const toggle = $('#menu-toggle');
toggle.addEventListener('click', () => {
    const open = sidebar.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});
$$('.side-nav a').forEach(a => a.addEventListener('click', () => {
    sidebar.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
}));

const navLinks = $$('.side-nav ul a');
const navObserver = new IntersectionObserver(entries => {
    entries.forEach(en => {
        if (en.isIntersecting) navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${en.target.id}`));
    });
}, { rootMargin: '-45% 0px -50% 0px' });
$$('main section[id]').forEach(s => navObserver.observe(s));

// =========================================================
// 5. REVEAL + SCRAMBLE TITLURI
// =========================================================
const GLYPHS = '01<>/\\#$%&*+=?ABCDEF';
function scramble(el) {
    if (reduceMotion || el.dataset.done) return;
    el.dataset.done = '1';
    const final = el.textContent;
    const total = 22;
    let f = 0;
    (function step() {
        const revealN = Math.floor((f / total) * final.length);
        el.textContent = final.split('').map((ch, i) =>
            i < revealN || ch === ' ' ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0]
        ).join('');
        if (++f <= total) setTimeout(step, 32); else el.textContent = final;
    })();
}

const revealMap = [
    ['.sec-head', ''], ['.section-intro', ''], ['.thesis', 'zoom'], ['.osi-panel', 'from-left'],
    ['.calc-panel', ''], ['.sub-title', 'from-left'], ['.course', ''], ['.lab', ''],
    ['.portrait', 'zoom'], ['.about-text', ''], ['.spec', ''], ['.tl-item', ''],
    ['.panel:not(.osi-panel):not(.calc-panel)', ''], ['.filters', ''], ['.project', ''],
    ['.interest', ''], ['.contact-big', 'from-left'], ['.ping-box', ''], ['.contact-row', '']
];
const staggered = ['.course', '.lab', '.project', '.interest', '.contact-row', '.tl-item'];

const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(en => {
        if (!en.isIntersecting) return;
        en.target.classList.add('visible');
        const h2 = en.target.matches('.sec-head') && $('.scramble', en.target);
        if (h2) scramble(h2);
        revealObserver.unobserve(en.target);
    });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

revealMap.forEach(([sel, extra]) => {
    $$(sel).forEach((el, i) => {
        el.classList.add('reveal');
        if (extra) el.classList.add(extra);
        if (staggered.includes(sel)) el.style.transitionDelay = `${(i % 4) * 0.08}s`;
        revealObserver.observe(el);
    });
});
// după ce apare, scoatem delay-ul ca să nu încetinească hover-ul
document.addEventListener('transitionend', e => {
    if (e.target.classList && e.target.classList.contains('visible') && e.propertyName === 'opacity') e.target.style.transitionDelay = '';
});

// =========================================================
// 6. TOPOLOGIE - pachete care circulă între noduri
// =========================================================
(function topology() {
    const svg = $('#topo');
    const layer = $('#packets');
    if (!svg) return;
    const NS = 'http://www.w3.org/2000/svg';
    const parent = { r1: 'isp', sw1: 'r1', sw2: 'sw1', sw3: 'sw1', pc1: 'sw2', pc2: 'sw2', srv: 'sw3', pc3: 'sw3' };
    const hosts = ['pc1', 'pc2', 'srv', 'pc3'];
    const colors = { pc1: '#38bdf8', pc2: '#fbbf24', srv: '#a78bfa', pc3: '#4ade80', isp: '#f8fafc' };
    const chain = n => { const c = [n]; while (parent[n]) { n = parent[n]; c.push(n); } return c; };

    function route(a, b) {
        const ca = chain(a), cb = chain(b);
        const lca = ca.find(n => cb.includes(n));
        const segs = [];
        for (let i = 0; i < ca.indexOf(lca); i++) segs.push({ id: `l-${ca[i + 1]}-${ca[i]}`, rev: true, to: ca[i + 1] });
        const down = cb.slice(0, cb.indexOf(lca)).reverse();
        let prev = lca;
        for (const n of down) { segs.push({ id: `l-${prev}-${n}`, rev: false, to: n }); prev = n; }
        return segs;
    }

    const hit = id => {
        const g = $(`[data-node="${id}"]`, svg);
        if (!g) return;
        g.classList.add('hit');
        setTimeout(() => g.classList.remove('hit'), 260);
    };

    let running = true, active = 0;
    new IntersectionObserver(([en]) => { running = en.isIntersecting; }).observe(svg);

    function spawn() {
        if (!running || document.hidden || active > 9) return;
        const src = hosts[(Math.random() * hosts.length) | 0];
        let dst;
        const r = Math.random();
        if (r < 0.45) dst = 'isp';
        else { do { dst = hosts[(Math.random() * hosts.length) | 0]; } while (dst === src); }
        const [from, to] = Math.random() < 0.3 && dst === 'isp' ? ['isp', src] : [src, dst];
        const segs = route(from, to);
        const dot = document.createElementNS(NS, 'circle');
        dot.setAttribute('r', 3.6);
        dot.setAttribute('class', 'pkt');
        dot.setAttribute('fill', colors[from] || '#38bdf8');
        layer.appendChild(dot);
        active++;

        let si = 0, t = 0;
        let path = svg.getElementById(segs[0].id), len = path.getTotalLength();
        let last = performance.now();
        const speed = 0.14; // px/ms

        (function move(now) {
            t += (now - last) * speed / len; last = now;
            if (t >= 1) {
                hit(segs[si].to);
                si++;
                if (si >= segs.length) { dot.remove(); active--; return; }
                path = svg.getElementById(segs[si].id); len = path.getTotalLength(); t = 0;
            }
            const p = path.getPointAtLength((segs[si].rev ? 1 - t : t) * len);
            dot.setAttribute('cx', p.x); dot.setAttribute('cy', p.y);
            requestAnimationFrame(move);
        })(last);
    }
    if (!reduceMotion) setInterval(spawn, 520);
})();

// =========================================================
// 7. TERMINAL CISCO (se scrie singur)
// =========================================================
const termScript = [
    ['Router_Firma#', 'show ip interface brief', [
        'Interface     IP-Address      OK? Status  Protocol',
        'Se0/1/0       220.110.0.1     YES <ok>up</ok>      <ok>up</ok>',
        'Gi0/0.10      192.168.10.1    YES <ok>up</ok>      <ok>up</ok>',
        'Gi0/0.20      192.168.20.1    YES <ok>up</ok>      <ok>up</ok>',
        'Gi0/0.30      192.168.30.1    YES <ok>up</ok>      <ok>up</ok>',
        'Gi0/0.40      192.168.40.1    YES <ok>up</ok>      <ok>up</ok>'
    ]],
    ['SW1#', 'show vlan brief', [
        '10   IT           active   Fa0/1',
        '20   HR           active   Fa0/2',
        '30   GUEST        active',
        '40   SERVERS      active'
    ]],
    ['Router_Firma#', 'show ip route ospf', [
        'O    10.0.0.0/8 [110/65] via 220.110.0.2, Serial0/1/0'
    ]],
    ['PC1-IT>', 'ping 10.0.0.10', [
        'Reply from 10.0.0.10: bytes=32 time=2ms TTL=126',
        'Reply from 10.0.0.10: bytes=32 time=1ms TTL=126',
        'Packets: Sent = 4, Received = 4, Lost = 0 <ok>(0% loss)</ok>'
    ]],
    ['Router_Firma#', 'show ip nat translations', [
        'Pro  Inside global      Inside local',
        'icmp 220.110.0.1:1      192.168.10.2:1'
    ]],
    ['Router_Firma#', 'show access-lists 130', [
        'Extended IP access list 130',
        '  10 <am>deny</am>   ip 192.168.30.0 0.0.0.255 192.168.10.0 0.0.0.255',
        '  20 <am>deny</am>   ip 192.168.30.0 0.0.0.255 192.168.20.0 0.0.0.255',
        '  30 <ok>permit</ok> tcp 192.168.30.0 0.0.0.255 host 192.168.40.10 eq www',
        '  40 <ok>permit</ok> udp 192.168.30.0 0.0.0.255 host 192.168.40.10 eq domain'
    ]],
    ['PC3-Guest>', 'ping 192.168.10.2', [
        'Reply from 192.168.30.1: <am>Destination host unreachable.</am>'
    ]]
];

async function startTerminal() {
    const out = $('#term-out');
    if (!out) return;
    const colorize = s => s.replace(/<ok>/g, '<span class="ok">').replace(/<am>/g, '<span class="am">').replace(/<\/(ok|am)>/g, '</span>');
    const add = (html, cls = 'ln') => {
        const d = document.createElement('div');
        d.className = cls;
        d.innerHTML = html;
        out.appendChild(d);
        while (out.children.length > 14) out.firstChild.remove();
        return d;
    };

    if (reduceMotion) {
        const [p, c, lines] = termScript[0];
        add(`<span class="pr">${p}</span> ${c}`, 'ln cmd');
        lines.forEach(l => add(colorize(l)));
        return;
    }

    let i = 0;
    while (true) {
        const [prompt, cmd, lines] = termScript[i % termScript.length];
        const line = add(`<span class="pr">${prompt}</span> <span class="typed"></span>`, 'ln cmd cur');
        const typed = $('.typed', line);
        for (const ch of cmd) { typed.textContent += ch; await sleep(rand(28, 60)); }
        await sleep(220);
        line.classList.remove('cur');
        for (const l of lines) { add(colorize(l)); await sleep(70); }
        await sleep(1500);
        i++;
    }
}

// =========================================================
// 8. ROTATOR „currently →”
// =========================================================
async function startRotator() {
    const el = $('#rotator');
    if (!el || reduceMotion) return;
    const items = [
        'designing an enterprise network for my thesis',
        'labbing Cisco switching & VLANs in GNS3',
        'automating network tasks with Python & Bash',
        'reviewing the CCNA ITN theory, chapter by chapter',
        'a trainee in the IA-PracticAC program'
    ];
    let i = 0;
    await sleep(2600);
    while (true) {
        let s = el.textContent;
        while (s.length) { s = s.slice(0, -1); el.textContent = s; await sleep(18); }
        i = (i + 1) % items.length;
        for (const ch of items[i]) { el.textContent += ch; await sleep(rand(30, 55)); }
        await sleep(2600);
    }
}

// =========================================================
// 9. OSI - încapsulare animată
// =========================================================
(function osi() {
    const list = $('#osi');
    if (!list) return;
    const items = $$('li', list);
    const label = $('#pdu-label');
    [0, 3, 4, 5].forEach(i => items[i].classList.add('core')); // L7, L4, L3, L2 = unde lucrez cel mai mult

    if (reduceMotion) return;
    let idx = 0, paused = false, visible = false;
    list.addEventListener('mouseenter', () => { paused = true; items.forEach(li => li.classList.remove('on')); });
    list.addEventListener('mouseleave', () => { paused = false; });
    items.forEach(li => li.addEventListener('mouseenter', () => { label.textContent = `PDU: ${li.dataset.pdu}`; }));
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(list);

    setInterval(() => {
        if (paused || !visible) return;
        items.forEach(li => li.classList.remove('on'));
        if (idx < items.length) {
            items[idx].classList.add('on');
            label.textContent = `PDU: ${items[idx].dataset.pdu}`;
        }
        idx = (idx + 1) % (items.length + 2); // mică pauză după L1
    }, 650);
})();

// =========================================================
// 10. SUBNET CALCULATOR
// =========================================================
(function subnetCalc() {
    const input = $('#calc-in');
    if (!input) return;
    const box = input.closest('.calc-input');
    const bits = $('#bits');
    const out = {
        net: $('#c-net'), bc: $('#c-bc'), first: $('#c-first'), last: $('#c-last'),
        mask: $('#c-mask'), wc: $('#c-wc'), hosts: $('#c-hosts')
    };
    for (let i = 0; i < 32; i++) bits.appendChild(document.createElement('span'));
    const bitEls = $$('span', bits);

    const toIp = n => [24, 16, 8, 0].map(s => (n >>> s) & 255).join('.');
    let lastPrefix = -1;

    function set(el, v) {
        if (el.textContent !== v) {
            el.textContent = v;
            el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
        }
    }

    function calc() {
        const m = input.value.trim().match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\s*\/\s*(\d{1,2})$/);
        const ok = m && m.slice(1, 5).every(o => +o <= 255) && +m[5] <= 32;
        box.classList.toggle('bad', !ok);
        if (!ok) return;

        const ip = ((+m[1] << 24) | (+m[2] << 16) | (+m[3] << 8) | +m[4]) >>> 0;
        const p = +m[5];
        const mask = p === 0 ? 0 : (0xFFFFFFFF << (32 - p)) >>> 0;
        const net = (ip & mask) >>> 0;
        const bc = (net | (~mask >>> 0)) >>> 0;
        const size = 2 ** (32 - p);
        let first, last, hosts;
        if (p === 32)      { first = last = net; hosts = 1; }
        else if (p === 31) { first = net; last = bc; hosts = 2; }
        else               { first = net + 1; last = bc - 1; hosts = size - 2; }

        set(out.net, `${toIp(net)}/${p}`);
        set(out.bc, toIp(bc));
        set(out.first, toIp(first));
        set(out.last, toIp(last));
        set(out.mask, toIp(mask));
        set(out.wc, toIp(~mask >>> 0));
        set(out.hosts, hosts.toLocaleString('en-US'));

        if (p !== lastPrefix) {
            bitEls.forEach((b, i) => {
                b.style.transitionDelay = reduceMotion ? '0s' : `${Math.abs(i - (lastPrefix < 0 ? 0 : lastPrefix)) * 12}ms`;
                b.classList.toggle('n', i < p);
            });
            lastPrefix = p;
        }
    }

    input.addEventListener('input', calc);
    $$('.calc-presets button').forEach(b => b.addEventListener('click', () => { input.value = b.dataset.v; calc(); }));
    calc();
})();

// =========================================================
// 11. FILTRE PROIECTE (cu glider animat)
// =========================================================
const filters = $$('.filter');
const glider = $('#filter-glider');
const projects = $$('.project');

function moveGlider(btn) {
    glider.style.width = `${btn.offsetWidth}px`;
    glider.style.height = `${btn.offsetHeight}px`;
    glider.style.transform = `translate(${btn.offsetLeft}px, ${btn.offsetTop}px)`;
}
filters.forEach(btn => btn.addEventListener('click', () => {
    filters.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    moveGlider(btn);
    const f = btn.dataset.filter;
    projects.forEach(p => {
        const show = f === 'all' || p.dataset.cat === f;
        p.classList.toggle('hidden', !show);
        p.classList.remove('pop');
        if (show) { void p.offsetWidth; p.classList.add('pop', 'visible'); }
    });
}));
const placeGlider = () => moveGlider($('.filter.active'));
addEventListener('resize', placeGlider);
addEventListener('load', placeGlider);
document.fonts && document.fonts.ready.then(placeGlider);
placeGlider();

// =========================================================
// 12. TILT 3D + SPOTLIGHT + MAGNETIC
// =========================================================
if (finePointer && !reduceMotion) {
    $$('.tilt').forEach(el => {
        const max = el.classList.contains('topo-card') ? 4 : 7;
        el.addEventListener('mousemove', e => {
            const r = el.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width - 0.5;
            const py = (e.clientY - r.top) / r.height - 0.5;
            el.style.transition = 'transform .12s ease-out, border-color .3s, box-shadow .4s';
            el.style.transform = `perspective(900px) rotateX(${-py * max}deg) rotateY(${px * max}deg) translateY(-4px)`;
        });
        el.addEventListener('mouseleave', () => {
            el.style.transition = 'transform .6s cubic-bezier(.2,.7,.2,1), border-color .3s, box-shadow .4s';
            el.style.transform = '';
        });
    });

    $$('.magnetic').forEach(el => {
        el.addEventListener('mousemove', e => {
            const r = el.getBoundingClientRect();
            const x = e.clientX - r.left - r.width / 2;
            const y = e.clientY - r.top - r.height / 2;
            el.style.transform = `translate(${x * 0.2}px, ${y * 0.3}px)`;
        });
        el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
}

document.addEventListener('pointermove', e => {
    const el = e.target.closest && e.target.closest('.spotlight, .project');
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
});

// =========================================================
// 13. TIMELINE - linia se „încarcă” la scroll
// =========================================================
const tl = $('#timeline'), tlBar = $('#tl-progress');
function updateTimeline() {
    if (!tl) return;
    const r = tl.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * 0.6 - r.top) / (r.height - 40)));
    tlBar.style.transform = `scaleY(${p})`;
}
onScroll();

// =========================================================
// 14. MODAL PROIECT
// =========================================================
const modal = $('#project-modal');
const modalImgBox = $('.modal-img', modal);
const modalImg = $('#modal-img');
const modalClose = $('.modal-close', modal);
let lastFocus = null;

function openModal(item) {
    lastFocus = document.activeElement;
    $('#modal-title').textContent = item.dataset.title;
    $('#modal-desc').textContent = item.dataset.desc;
    $('#modal-github').href = item.dataset.github;

    $$('svg', modalImgBox).forEach(s => s.remove());
    modalImgBox.classList.toggle('light', !!$('.project-thumb.light', item));
    modalImgBox.classList.toggle('net', !item.dataset.image);
    if (item.dataset.image) {
        modalImg.style.display = '';
        modalImg.src = item.dataset.image;
        modalImg.alt = item.dataset.title;
    } else {
        modalImg.style.display = 'none'; modalImg.removeAttribute('src');
        modalImgBox.appendChild($('.project-thumb svg', item).cloneNode(true));
    }

    const tags = $('#modal-tags');
    tags.innerHTML = '';
    item.dataset.tags.split(',').forEach(t => {
        const s = document.createElement('span');
        s.className = 'chip';
        s.textContent = t.trim();
        tags.appendChild(s);
    });

    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => modal.classList.add('open'));
    modalClose.focus();
}
function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { modal.hidden = true; }, 300);
    if (lastFocus) lastFocus.focus();
}
projects.forEach(p => $('.project-hit', p).addEventListener('click', () => openModal(p)));
modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });

// =========================================================
// 15. COPY EMAIL + TOAST
// =========================================================
const toast = $('#toast');
let toastTimer;
function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
}
$$('.copy').forEach(btn => btn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(btn.dataset.copy); showToast('Copied: ' + btn.dataset.copy); }
    catch (e) { showToast(btn.dataset.copy); }
}));

// =========================================================
// 16. PING FLAVIUS
// =========================================================
(function ping() {
    const btn = $('#ping-btn'), out = $('#ping-out');
    if (!btn) return;
    let done = false;
    btn.addEventListener('click', async () => {
        if (done) { location.href = 'mailto:marianflavius27@yahoo.com'; return; }
        btn.disabled = true;
        out.innerHTML = '<span class="c-accent">$</span> ping -c 4 flavius\n';
        await sleep(300);
        out.insertAdjacentHTML('beforeend', 'PING flavius (marianflavius27@yahoo.com) 56(84) bytes of data.\n');
        for (let i = 1; i <= 4; i++) {
            await sleep(reduceMotion ? 0 : 420);
            out.insertAdjacentHTML('beforeend', `64 bytes from flavius: icmp_seq=${i} ttl=64 time=<span class="ok">${rand(0.3, 1.4).toFixed(2)} ms</span>\n`);
        }
        await sleep(reduceMotion ? 0 : 350);
        out.insertAdjacentHTML('beforeend', '\n--- flavius ping statistics ---\n4 packets transmitted, 4 received, <span class="ok">0% packet loss</span>\n<span class="am">host is up - say hi!</span>');
        btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Write me an email';
        btn.disabled = false;
        done = true;
    });
})();
