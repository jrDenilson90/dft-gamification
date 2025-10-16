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

document.addEventListener('DOMContentLoaded', () => {
    const wrapper = document.querySelector('.carousel-wrapper') || document.getElementById('carouselTrack')?.parentElement;
    const track = document.getElementById('carouselTrack');
    const nav = document.getElementById('carouselNav');

    let currentIndex = 0;
    const slideCount = DADOS_GAMES.slides.length;

    // estado do drag (em px)
    let isPointerDown = false;
    let isDragging = false;
    let startX = 0;
    let currentTranslatePx = 0;
    let prevTranslatePx = 0;
    let rafId = null;

    // config
    const threshold = 0.5;      // 0.5 => 50% do slide width
    const dragDetectPx = 5;    // precisa mover >= 5px para iniciar drag
    const transitionDuration = 220; // ms

    // util
    function escapeHtml(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#39;');
    }

    function createSlideHTML(item, idx) {
        const media = item.video
            ? `<video muted loop playsinline src="${escapeHtml(item.video)}"></video>`
            : `<img loading="lazy" src="${escapeHtml(item.img)}" alt="${escapeHtml(item.titulo || '')}">`;

        return `
            <div class="carousel-slide" data-index="${idx}" style="min-width:100%; box-sizing:border-box;">
            <div class="media-container">${media}</div>
            <div class="slide-content">
                <p class="category">${escapeHtml(item.marca || '')}</p>
                <h2 class="title">${escapeHtml(item.titulo || '')}</h2>
                <p class="description">${escapeHtml(item.description || '')}</p>
                <a href="${escapeHtml(item.link || '#')}" class="cta-button" data-tracking-id="${escapeHtml(item.trackingId || '')}">${escapeHtml(DADOS_GAMES.textCta)}</a>
            </div>
            </div>
        `;
    }

    // calculo largura do slide visível (wrapper clientWidth)
    function getSlideWidth() {
        if (!wrapper) return window.innerWidth;
        return wrapper.clientWidth;
    }

    // render
    function render() {
        track.innerHTML = '';
        nav.innerHTML = '';

        DADOS_GAMES.slides.forEach((it, i) => {
            track.insertAdjacentHTML('beforeend', createSlideHTML(it, i));
            const dot = document.createElement('div');
            dot.className = 'nav-dot';
            dot.setAttribute('data-slide', String(i));
            dot.setAttribute('role', 'button');
            dot.setAttribute('aria-label', `Ir para slide ${i + 1}`);
            dot.tabIndex = 0;
            dot.addEventListener('click', () => goTo(i));
            nav.appendChild(dot);
        });

        // inicializa posição
        updateActiveDot();
        setTranslateForIndex(currentIndex, false);
        attachCTAListeners();
        ensureVideoAutoplay();
        addPointerEvents();
    }

    function updateActiveDot() {
        const dots = nav.querySelectorAll('.nav-dot');
        dots.forEach(d => d.classList.remove('active'));
        const active = nav.querySelector(`.nav-dot[data-slide="${currentIndex}"]`);
        if (active) active.classList.add('active');
    }

    function setTranslateForIndex(index, withTransition) {
        const slideW = getSlideWidth();
        const targetPx = -index * slideW;
        if (withTransition) track.style.transition = `transform ${transitionDuration}ms ease`;
        else track.style.transition = 'none';
        track.style.transform = `translateX(${targetPx}px)`;
        prevTranslatePx = targetPx;
        currentTranslatePx = targetPx;
    }

    function goTo(index) {
        if (index < 0) index = 0;
        if (index >= slideCount) index = slideCount - 1;
        currentIndex = index;
        updateActiveDot();
        setTranslateForIndex(currentIndex, true);
        handleVideoPlayback();
    }

    function goNext() { goTo(currentIndex + 1); }
    function goPrev() { goTo(currentIndex - 1); }

    // video helpers
    function ensureVideoAutoplay() {
        const firstVideo = track.querySelector('video');
        if (firstVideo) {
            firstVideo.muted = true;
            const p = firstVideo.play();
            if (p !== undefined) p.catch(() => { });
        }
    }
    function handleVideoPlayback() {
        const slidesEls = track.querySelectorAll('.carousel-slide');
        slidesEls.forEach((s, idx) => {
            const v = s.querySelector('video');
            if (v) {
                if (idx === currentIndex) {
                    v.muted = true;
                    const p = v.play();
                    if (p !== undefined) p.catch(() => { });
                } else {
                    try { v.pause(); v.currentTime = 0; } catch (e) { }
                }
            }
        });
    }

    // tracking CTA (evita clique após drag)
    function attachCTAListeners() {
        const ctas = track.querySelectorAll('.cta-button');
        ctas.forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (isDragging) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    return;
                }
                const id = btn.getAttribute('data-tracking-id');
                if (id) {
                    try { window.brazeBridge && brazeBridge.logClick && brazeBridge.logClick(id); } catch (err) { }
                }
            });
        });
    }

    // pointer events (baseado em px)
    function addPointerEvents() {
        track.addEventListener('pointerdown', onPointerDown);
        track.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
        window.addEventListener('pointercancel', onPointerUp);
        track.style.touchAction = 'pan-y';
        window.addEventListener('resize', () => {
            // ao redimensionar, recalcula a posição para o slide atual
            setTranslateForIndex(currentIndex, false);
        });
    }

    function onPointerDown(e) {
        isPointerDown = true;
        isDragging = false;
        startX = getClientX(e);
        // sem transição enquanto arrasta
        track.style.transition = 'none';
        try { track.setPointerCapture && track.setPointerCapture(e.pointerId); } catch (_) { }
        rafId = requestAnimationFrame(renderWhileDragging);
    }

    function onPointerMove(e) {
        if (!isPointerDown) return;
        const x = getClientX(e);
        const movedPx = x - startX;

        // inicia drag somente se mover o suficiente
        if (!isDragging && Math.abs(movedPx) > dragDetectPx) {
            isDragging = true;
        }
        if (!isDragging) return;

        // usa prevTranslatePx + movedPx, mas clamp entre limites
        const slideW = getSlideWidth();
        const tentativePx = prevTranslatePx + movedPx;
        const maxPx = 0;
        const minPx = -((slideCount - 1) * slideW);
        currentTranslatePx = Math.max(Math.min(tentativePx, maxPx), minPx);

        // apply immediate transform (via RAF loop)
    }

    function onPointerUp(e) {
        if (!isPointerDown) return;
        isPointerDown = false;
        cancelAnimationFrame(rafId);

        const endX = getClientX(e);
        const movedPx = endX - startX;
        const slideW = getSlideWidth();
        const neededPx = slideW * threshold;

        if (isDragging) {
            if (movedPx <= -neededPx && currentIndex < slideCount - 1) {
                currentIndex += 1;
            } else if (movedPx >= neededPx && currentIndex > 0) {
                currentIndex -= 1;
            }
            updateActiveDot();
            setTranslateForIndex(currentIndex, true);
            handleVideoPlayback();
        } else {
            // clique curto: restaura a posição do slide atual
            setTranslateForIndex(currentIndex, true);
        }

        // atualiza prevTranslatePx (fixa posição)
        prevTranslatePx = -currentIndex * slideW;
        currentTranslatePx = prevTranslatePx;

        try { track.releasePointerCapture && track.releasePointerCapture(e.pointerId); } catch (_) { }
        // limpa flag de dragging ligeiramente depois para permitir clicks
        setTimeout(() => { isDragging = false; }, 50);
    }

    function renderWhileDragging() {
        track.style.transform = `translateX(${currentTranslatePx}px)`;
        if (isPointerDown) rafId = requestAnimationFrame(renderWhileDragging);
    }

    function getClientX(e) {
        if (e.touches && e.touches[[0]]()) return e.touches[[0]]().clientX;
        if (typeof e.clientX === 'number') return e.clientX;
        return 0;
    }

    // teclado
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') goNext();
        if (e.key === 'ArrowLeft') goPrev();
    });

    // inicializa
    render();

    // debug API
    window._carousel = { goTo, goNext, goPrev, getCurrent: () => currentIndex };
});
