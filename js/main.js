(function () {
    'use strict';

    function initHeader() {
        const burger = document.getElementById('burger');
        const nav = document.getElementById('nav');
        if (!burger || !nav) return;

        if (!nav.querySelector('.nav__head')) {
            const head = document.createElement('div');
            head.className = 'nav__head';
            head.innerHTML =
                '<span class="nav__head-title">Меню</span>' +
                '<button class="nav__close" type="button" data-nav-close aria-label="Закрыть меню">' +
                '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">' +
                '<line x1="18" y1="6" x2="6" y2="18"/>' +
                '<line x1="6" y1="6" x2="18" y2="18"/>' +
                '</svg>' +
                '</button>';
            nav.prepend(head);
        }

        const closeNav = () => {
            nav.classList.remove('is-open');
            burger.classList.remove('is-active');
            burger.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        };

        const openNav = () => {
            nav.classList.add('is-open');
            burger.classList.add('is-active');
            burger.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
        };

        burger.addEventListener('click', () => {
            if (nav.classList.contains('is-open')) closeNav();
            else openNav();
        });

        const closeBtn = nav.querySelector('[data-nav-close]');
        if (closeBtn) closeBtn.addEventListener('click', closeNav);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && nav.classList.contains('is-open')) closeNav();
        });

        nav.querySelectorAll('[data-dropdown]').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const isMobile = window.matchMedia('(max-width: 900px)').matches;
                if (isMobile) return;

                const item = btn.closest('.nav__item--dropdown');
                nav.querySelectorAll('.nav__item--dropdown').forEach((i) => {
                    if (i !== item) i.classList.remove('is-open');
                });
                item.classList.toggle('is-open');
            });
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav__item--dropdown')) {
                document.querySelectorAll('.nav__item--dropdown.is-open')
                    .forEach((i) => i.classList.remove('is-open'));
            }
        });

        nav.querySelectorAll('a').forEach((a) => {
            a.addEventListener('click', () => {
                if (window.matchMedia('(max-width: 900px)').matches) closeNav();
            });
        });

        const path = location.pathname.split('/').pop() || 'index.html';
        nav.querySelectorAll('a.nav__link').forEach((a) => {
            if (a.getAttribute('href') === path) a.classList.add('is-active');
        });
    }

    const PRICES = {
        'bez-otdelki': { price: 70, min: 3000, label: 'Без отделки' },
        's-otdelkoy': { price: 100, min: 4000, label: 'С отделкой' },
        'predchistovaya': { price: 120, min: 4000, label: 'Предчистовая' }
    };
    const EXTRAS = {
        teplo: { price: 3000, label: 'Тепловизионное обследование' },
        ploshchad: { price: 2500, label: 'Официальная проверка площади' },
        zakluchenie: { price: 5000, label: 'Заключение специалиста' }
    };

    function updateRangeFill(range) {
        const min = +range.min || 0;
        const max = +range.max || 100;
        const val = +range.value;
        const fill = ((val - min) / (max - min)) * 100;
        range.style.setProperty('--fill', fill + '%');
    }

    function initAreaRanges() {
        document.querySelectorAll('[data-area-range]').forEach((range) => {
            updateRangeFill(range);
            const target =
                range.closest('.calc-mini, .calc-area')?.querySelector('[data-area-value]') ||
                range.closest('.hero, .calculator, [data-calculator-form]')?.querySelector('[data-area-value]');

            const apply = () => {
                updateRangeFill(range);
                if (target) target.textContent = range.value;
                document.dispatchEvent(new CustomEvent('calc:update'));
            };

            range.addEventListener('input', apply);
            apply();
        });
    }

    function initTabs() {
        document.querySelectorAll('[data-tabs]').forEach((root) => {
            const btns = root.querySelectorAll('[data-tab]');
            const panels = root.querySelectorAll('[data-tab-panel]');
            const nav = root.querySelector('.tabs__nav');

            if (nav && !nav.getAttribute('role')) nav.setAttribute('role', 'tablist');

            btns.forEach((btn, i) => {
                if (!btn.id) btn.id = 'tab-' + i + '-' + Math.random().toString(36).slice(2, 8);
                btn.setAttribute('role', 'tab');
                btn.setAttribute('aria-selected', btn.classList.contains('is-active') ? 'true' : 'false');
            });

            panels.forEach((p) => {
                p.setAttribute('role', 'tabpanel');
                p.hidden = !p.classList.contains('is-active');
            });

            btns.forEach((btn) => {
                btn.addEventListener('click', () => {
                    const id = btn.dataset.tab;

                    btns.forEach((b) => {
                        const active = b === btn;
                        b.classList.toggle('is-active', active);
                        b.setAttribute('aria-selected', active ? 'true' : 'false');
                    });

                    panels.forEach((p) => {
                        const active = p.dataset.tabPanel === id;
                        p.classList.toggle('is-active', active);
                        p.hidden = !active;
                    });
                });
            });
        });
    }

    function initFilters() {
        document.querySelectorAll('[data-filter-group]').forEach((group) => {
            const target = document.querySelector(group.dataset.filterGroup);
            if (!target) return;

            const items = target.querySelectorAll('[data-category]');
            const btns = group.querySelectorAll('[data-filter]');

            btns.forEach((btn) => {
                btn.addEventListener('click', () => {
                    btns.forEach((b) => b.classList.toggle('is-active', b === btn));
                    const cat = btn.dataset.filter;

                    items.forEach((it) => {
                        const cats = (it.dataset.category || '').split(/\s+/);
                        it.hidden = !(cat === 'all' || cats.includes(cat));
                    });
                });
            });
        });
    }

    function initCalculator() {
        const root = document.getElementById('calculator');
        if (!root) return;

        const form = root.querySelector('[data-calculator-form]');
        const totalEl = root.querySelector('[data-total]');
        const breakdownEl = root.querySelector('[data-breakdown]');
        const areaRange = root.querySelector('[data-area-range]');
        const extraInputs = root.querySelectorAll('input[name="extra"]');

        const fmt = (n) => n.toLocaleString('ru-RU') + ' ₽';

        const recalc = () => {
            const typeInput = form.querySelector('input[name="type"]:checked');
            const type = typeInput ? typeInput.value : 'bez-otdelki';
            const area = +areaRange.value;
            const cfg = PRICES[type];

            const base = Math.max(cfg.min, area * cfg.price);
            const rows = [{ label: cfg.label + ', ' + area + ' м²', price: base }];

            let extrasSum = 0;
            extraInputs.forEach((i) => {
                if (i.checked) {
                    const e = EXTRAS[i.value];
                    if (e) {
                        extrasSum += e.price;
                        rows.push({ label: e.label, price: e.price });
                    }
                }
            });

            totalEl.textContent = fmt(base + extrasSum);
            breakdownEl.innerHTML = rows
                .map((r) => '<li><span>' + r.label + '</span><b>' + fmt(r.price) + '</b></li>')
                .join('');
        };

        form.addEventListener('input', recalc);
        form.addEventListener('change', recalc);
        document.addEventListener('calc:update', recalc);
        recalc();
    }

    function initModal() {
        const modal = document.getElementById('orderModal');
        if (!modal) return;

        const dialog = modal.querySelector('.modal__window');
        let previousFocus = null;

        if (dialog) {
            dialog.setAttribute('role', 'dialog');
            dialog.setAttribute('aria-modal', 'true');
        }

        const open = () => {
            previousFocus = document.activeElement;
            modal.hidden = false;
            document.body.style.overflow = 'hidden';
            const focusable = dialog?.querySelector('input, button, [href]');
            focusable?.focus();
        };

        const close = () => {
            modal.hidden = true;
            document.body.style.overflow = '';
            if (previousFocus && typeof previousFocus.focus === 'function') {
                previousFocus.focus();
            }
        };

        document.querySelectorAll('[data-open-modal]').forEach((btn) => {
            btn.addEventListener('click', (e) => { e.preventDefault(); open(); });
        });
        modal.querySelectorAll('[data-close-modal]').forEach((el) => {
            el.addEventListener('click', close);
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !modal.hidden) close();
        });
    }

    function initForms() {
        document.querySelectorAll('[data-form]').forEach((form) => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();

                const phone = form.querySelector('input[name="phone"]');
                if (phone) {
                    const digits = phone.value.replace(/\D/g, '');
                    if (digits.length < 11) {
                        phone.style.borderColor = '#e74c3c';
                        phone.focus();
                        return;
                    }
                    phone.style.borderColor = '';
                }

                const success = form.querySelector('.form__success');
                if (success) success.hidden = false;

                const controls = form.querySelectorAll('input, button[type="submit"]');
                controls.forEach((el) => {
                    el.disabled = true;
                    el.style.opacity = '.6';
                });
                setTimeout(() => {
                    form.reset();
                    controls.forEach((el) => {
                        el.disabled = false;
                        el.style.opacity = '';
                    });
                    if (success) {
                        setTimeout(() => { success.hidden = true; }, 3000);
                    }
                }, 3000);
            });
        });
    }

    function initPhoneMask() {
        document.querySelectorAll('input[type="tel"]').forEach((input) => {
            input.addEventListener('input', () => {
                const digits = input.value.replace(/\D/g, '');
                if (!digits) { input.value = ''; return; }

                let v = digits;
                if (v[0] === '8') v = '7' + v.slice(1);
                if (v[0] !== '7') v = '7' + v;
                v = v.slice(0, 11);

                let out = '+7';
                if (v.length > 1) out += ' (' + v.slice(1, 4);
                if (v.length >= 5) out += ') ' + v.slice(4, 7);
                if (v.length >= 8) out += '-' + v.slice(7, 9);
                if (v.length >= 10) out += '-' + v.slice(9, 11);
                input.value = out;
            });
        });
    }

    function animateCounter(el) {
        const target = +el.dataset.counter;
        const suffix = el.dataset.suffix || '';
        const duration = 1200;
        const start = performance.now();

        const tick = (now) => {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3); 
            const value = Math.floor(target * eased);
            el.textContent = value.toLocaleString('ru-RU') + suffix;
            if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }

    function initCounters() {
        const items = document.querySelectorAll('[data-counter]');
        if (!items.length) return;

        if (!('IntersectionObserver' in window)) {
            items.forEach(animateCounter);
            return;
        }

        const io = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                observer.unobserve(entry.target);
                animateCounter(entry.target);
            });
        }, { threshold: 0.4 });

        items.forEach((el) => io.observe(el));
    }

    document.addEventListener('DOMContentLoaded', () => {
        initHeader();
        initAreaRanges();
        initTabs();
        initFilters();
        initCalculator();
        initModal();
        initForms();
        initPhoneMask();
        initCounters();
    });
})();