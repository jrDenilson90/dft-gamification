const DADOS_GAMES = {
    textCta: 'Ver detalhes',
    slides: [
        {
            video: 'https://res.cloudinary.com/dlkvec7ey/video/upload/v1759521111/superstar_vdyhk6.mp4',
            marca: 'adidas',
            titulo: 'Superstar II Branco',
            description: 'O clássico para quem busca estilo autêntico e atitude urbana em todos os passos.',
            link: 'dafiti://br/d/AD464SCF93VGG',
            trackingId: 'cta_superstar_branco'
        },
        {
            img: 'https://braze-images.com/appboy/communication/assets/image_assets/images/68e3a93405a596006390323e/original.jpg?1759750451',
            marca: 'adidas',
            titulo: 'Superstar II Preto',
            description: 'Para quem quer marcar presença: design icônico, preto intenso e personalidade em qualquer ocasião.',
            link: 'dafiti://br/d/AD464SCU37VTY',
            trackingId: 'cta_superstar_preto'
        },
        {
            img: 'https://braze-images.com/appboy/communication/assets/image_assets/images/68e3a9342caadf0063700912/original.jpg?1759750452',
            marca: 'adidas',
            titulo: 'Superstar II Preto Estampado',
            description: 'Versão reimaginada com estampa para quem busca ousadia.',
            link: 'dafiti://br/d/AD464SCF00NXZ',
            trackingId: 'cta_superstar_estampado'
        },
        {
            img: 'https://braze-images.com/appboy/communication/assets/image_assets/images/68e3a934ff238c0065d6021b/original.jpg?1759750452',
            marca: 'adidas',
            titulo: 'Superstar II Branco (All White)',
            description: 'Todo em branco, é a escolha perfeita para quem busca dar um toque de tradição no visual.',
            link: 'dafiti://br/d/AD464SCU01NXY',
            trackingId: 'cta_superstar_allwhite'
        },
        {
            img: 'https://braze-images.com/appboy/communication/assets/image_assets/images/68e3a934a7d96000653ff38b/original.jpg?1759750452',
            marca: 'adidas',
            titulo: 'Superstar Slip On Preto',
            description: 'Versão "Slip On" do Superstar, sem cadarços e com elásticos cruzados. Combinação de praticidade e inovação.',
            link: 'dafiti://br/d/AD464SCF72QTB',
            trackingId: 'cta_superstar_slipon'
        }
    ]
};

document.addEventListener('DOMContentLoaded', function () {
    // --- Seletores dos Elementos ---
    const track = document.getElementById('carouselTrack');
    const nav = document.getElementById('carouselNav');
    const closeButton = document.getElementById('closeButton');

    // --- Estado do Carrossel ---
    let currentSlide = 0;
    let startX = 0;
    let slides = [];     // array de elementos de slide
    let dots = [];       // array de elementos de nav

    // --- Util ---
    function createElementFromHTML(html) {
        const template = document.createElement('template');
        template.innerHTML = html.trim();
        return template.content.firstChild;
    }
    function escapeHtml(str) {
        if (!str && str !== 0) return '';
        return String(str)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#39;');
    }

    // Cria slide
    function buildSlide(data, index) {
        const hasVideo = !!data.video;
        const mediaHTML = hasVideo
            ? `<video muted loop playsinline src="${escapeHtml(data.video)}"></video>`
            : `<img loading="lazy" src="${escapeHtml(data.img)}" alt="${escapeHtml(data.titulo || '')}">`;

        const slideHTML = `
            <div class="carousel-slide" data-index="${index}">
                <div class="media-container">${mediaHTML}</div>
                <div class="slide-content">
                    <p class="category">${escapeHtml(data.marca || '')}</p>
                    <h2 class="title">${escapeHtml(data.titulo || '')}</h2>
                    <p class="description">${escapeHtml(data.description || '')}</p>
                    <a href="${escapeHtml(data.link || '#')}" class="cta-button" data-tracking-id="${escapeHtml(data.trackingId || '')}">${escapeHtml(DADOS_GAMES.textCta)}</a>
                </div>
            </div>
        `;
        return createElementFromHTML(slideHTML);
    }

    // Cria dot
    function buildDot(i) {
        const dot = document.createElement('div');
        dot.className = 'nav-dot';
        dot.setAttribute('data-slide', String(i));
        dot.setAttribute('role', 'button');
        dot.setAttribute('aria-label', `Ir para slide ${i + 1}`);
        dot.tabIndex = 0;
        dot.addEventListener('click', () => showSlide(i));
        dot.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') showSlide(i); });
        return dot;
    }

    // --- Renderização ---
    function renderCarousel() {
        track.innerHTML = '';
        nav.innerHTML = '';
        slides = [];
        dots = [];

        DADOS_GAMES.slides.forEach((item, idx) => {
            const slideEl = buildSlide(item, idx);
            track.appendChild(slideEl);
            slides.push(slideEl);

            const dot = buildDot(idx);
            nav.appendChild(dot);
            dots.push(dot);
        });

        // marca primeiro como ativo
        if (slides.length) {
            slides[0].classList.add('active');
            dots[0].classList.add('active');
        }

        attachCTAListeners();
        ensureVideoAutoplayForCurrent();
    }

    // --- Navegação ---
    function showSlide(index) {
        if (index < 0) index = 0;
        if (index >= slides.length) index = slides.length - 1;
        slides.forEach(s => s.classList.remove('active'));
        dots.forEach(d => d.classList.remove('active'));

        const slide = slides[index];
        if (!slide) return;
        slide.classList.add('active');
        dots[index].classList.add('active');
        currentSlide = index;
        handleVideoPlayback(index);
    }

    function handleVideoPlayback(activeIndex) {
        slides.forEach((s, i) => {
            const videoEl = s.querySelector('video');
            if (videoEl) {
                if (i === activeIndex) {
                    videoEl.muted = true;
                    const p = videoEl.play();
                    if (p !== undefined) p.catch(() => { /* autoplay bloqueado */ });
                } else {
                    try { videoEl.pause(); videoEl.currentTime = 0; } catch (e) { /* ignore */ }
                }
            }
        });
    }

    function ensureVideoAutoplayForCurrent() {
        const activeVideo = track.querySelector('.carousel-slide.active video') || track.querySelector('video');
        if (activeVideo) {
            activeVideo.muted = true;
            const p = activeVideo.play();
            if (p !== undefined) p.catch(err => console.log('Autoplay do vídeo bloqueado pelo navegador.', err));
        }
    }

    // --- Swipe (touch) ---
    track.addEventListener('touchstart', (e) => { startX = e.touches[[0]]().clientX; }, { passive: true });
    track.addEventListener('touchend', (e) => {
        const endX = e.changedTouches[[0]]().clientX;
        const diffX = startX - endX;
        if (Math.abs(diffX) > 50) {
            if (diffX > 0) { showSlide(currentSlide + 1); }
            else { showSlide(currentSlide - 1); }
        }
    });

    // --- Mouse drag (desktop) ---
    let isDown = false, startDragX = 0;
    track.addEventListener('mousedown', e => { isDown = true; startDragX = e.clientX; track.classList.add('dragging'); });
    document.addEventListener('mouseup', e => {
        if (!isDown) return;
        isDown = false;
        track.classList.remove('dragging');
        const diff = startDragX - e.clientX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) showSlide(currentSlide + 1);
            else showSlide(currentSlide - 1);
        }
    });

    // --- Tracking e CTA listeners ---
    function attachCTAListeners() {
        const ctas = track.querySelectorAll('.cta-button');
        ctas.forEach(btn => {
            btn.addEventListener('click', (ev) => {
                const trackingId = btn.getAttribute('data-tracking-id');
                if (trackingId) {
                    try {
                        if (window.brazeBridge && typeof brazeBridge.logClick === 'function') {
                            brazeBridge.logClick(trackingId);
                        }
                    } catch (e) {
                        console.error('Braze Bridge não disponível.', e);
                    }
                }
                // não previne o comportamento do link (deeplink dafiti://)
            });
        });
    }

    // --- Botão de fechar ---
    closeButton.addEventListener('click', () => {
        try {
            if (window.brazeBridge && typeof brazeBridge.logClick === 'function') {
                brazeBridge.logClick('close_button_clicked');
                brazeBridge.closeMessage && brazeBridge.closeMessage();
            }
        } catch (e) {
            console.error('Braze Bridge não disponível.', e);
        }
        const overlay = document.querySelector('.modal-overlay');
        if (overlay) overlay.remove();
    });

    // --- Inicialização ---
    renderCarousel();

    // Exibe primeiro slide (caso renderCarousel não tenha marcado)
    if (slides.length) showSlide(0);

    // Teclado
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') showSlide(currentSlide + 1);
        if (e.key === 'ArrowLeft') showSlide(currentSlide - 1);
        if (e.key === 'Escape') closeButton.click();
    });

    // debug
    window._carousel = { showSlide, getCurrent: () => currentSlide, slides };
});