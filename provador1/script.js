(function () {
    const data = {
        carousel_01: {
            title: "Parte Superior",
            items: [
                {
                    img: 'https://t-static.dafiti.com.br/hHV7Hc-rQdJ__VGA-Auxkm8SBf8=/fit-in/430x623/static.dafiti.com.br/p/lez-a-lez-regata-cropped-lez-a-lez-ajustada-lisa-preta-9630-79143341-1-zoom.jpg',
                    sku: 'SKU-A1'
                },
                {
                    img: 'https://t-static.dafiti.br/_YVZ19PNPYb5a5blfrHe23uP838=/fit-in/430x623/static.dafiti.com.br/p/vans-camiseta-cropped-vans-relaxed-logo-branca-0206-15322541-1-zoom.jpg',
                    sku: 'SKU-A2'
                },
                {
                    img: 'https://t-static.dafiti.com.br/pl2gcMb8qqrrPVNUckUh0sCPB-Q=/fit-in/430x623/static.dafiti.com.br/p/hering-regata-feminina-decote-reto-hering-5062-97121841-1-zoom.jpg',
                    sku: 'SKU-A3'
                }
            ]
        },
        carousel_02: {
            title: "Parte Inferior",
            items: [
                {
                    img: 'https://t-static.dafiti.com.br/2nIu1T2lH587CA8x74R25kLLHNo=/fit-in/430x623/static.dafiti.com.br/p/lan%C3%A7a-perfume-cal%C3%A7a-jeans-lan%C3%A7a-perfume-wide-leg-lisa-azul-9506-77832541-1-zoom.jpg',
                    sku: 'SKU-B1'
                },
                {
                    img: 'https://static.dafiti.com.br/p/Hering-Cal%C3%A7a-Jeans-B%C3%A1sica-Feminina-Cintura-M%C3%A9dia-Flare-Petit-9439-81074341-5-zoom.jpg',
                    sku: 'SKU-B2'
                },
                {
                    img: 'https://t-static.dafiti.com.br/wVCo_UGjgOcWUwp6a2iZFvMjfLg=/fit-in/430x623/static.dafiti.com.br/p/lan%C3%A7a-perfume-cal%C3%A7a-jeans-feminina-lan%C3%A7a-perfume-wide-leg-azul-m%C3%A9dio-4320-96905741-1-zoom.jpg',
                    sku: 'SKU-B3'
                }
            ]
        },
        carousel_03: {
            title: "Calçados",
            items: [
                {
                    img: 'https://static.dafiti.com.br/p/Beira-Rio-Sand%C3%A1lia-Beira-Rio-Recortes-Preta-8145-09614241-3-zoom.jpg',
                    sku: 'SKU-C1'
                },
                {
                    img: 'https://static.dafiti.com.br/p/adidas-Originals-T%C3%AAnis-adidas-Originals-Superstar-Branco-8277-3749605-3-zoom.jpg',
                    sku: 'SKU-C2'
                },
                {
                    img: 'https://static.dafiti.com.br/p/Vizzano-Scarpin-Vizzano-Salto-Grosso-Off-White-1409-24040921-3-zoom.jpg',
                    sku: 'SKU-C3'
                }
            ]
        }
    };

    const currentIndices = {};

    function buildCarousels() {
        const container = document.getElementById('fittingRoomContainer');
        container.innerHTML = '';
        
        for (const categoryId in data) {
            const categoryData = data[categoryId];
            currentIndices[categoryId] = 0;

            const carouselHTML = `
                <div class="category-carousel">
                    <h2>${categoryData.title}</h2>
                    <div class="carousel-viewport" data-category="${categoryId}">
                        <div class="carousel-strip">
                            </div>
                    </div>
                    <div class="carousel-nav">
                        <button class="prev" data-category="${categoryId}" aria-label="Anterior">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                            </svg>
                        </button>
                        <span class="item-indicator" data-category="${categoryId}">1 / ${categoryData.items.length}</span>
                        <button class="next" data-category="${categoryId}" aria-label="Próxima">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                            </svg>
                        </button>
                    </div>
                </div>
            `;
            
            container.insertAdjacentHTML('beforeend', carouselHTML);
            const strip = container.querySelector(`.carousel-viewport[data-category="${categoryId}"] .carousel-strip`);
            categoryData.items.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'carousel-item';
                itemDiv.setAttribute('data-sku', item.sku);
                const img = document.createElement('img');
                img.src = item.img;
                itemDiv.appendChild(img);
                strip.appendChild(itemDiv);
            });
        }
    }
    
    function updateCarousel(categoryId) {
        const strip = document.querySelector(`.carousel-viewport[data-category="${categoryId}"] .carousel-strip`);
        const totalItems = data[categoryId].items.length;
        const index = currentIndices[categoryId];
        strip.style.transform = `translateX(-${index * 100}%)`;
        document.querySelector(`.item-indicator[data-category="${categoryId}"]`).textContent = `${index + 1} / ${totalItems}`;
        
        updateDeepLink(); 
    }

    function navigate(categoryId, direction) {
        const totalItems = data[categoryId].items.length;
        currentIndices[categoryId] = (currentIndices[categoryId] + direction + totalItems) % totalItems;
        updateCarousel(categoryId);
    }

    function updateDeepLink() {
        const selectedSkus = [];
        
        for (const categoryId in data) {
            const index = currentIndices[categoryId];
            const currentItem = data[categoryId].items[index];
            selectedSkus.push(currentItem.sku);
        }
        
        const skuList = selectedSkus.join('--');
        const deepLinkBase = 'logotipo://br/c?pathUrl=%26filters%3Dsku%SKU';
        
        const finalDeepLink = deepLinkBase.replace('sku%SKU', 'sku%2F' + skuList); 
        
        document.getElementById('buyLookLink').href = finalDeepLink;
        
        // console.log('Deep Link Atualizado:', finalDeepLink);
    }

    function init() {
        buildCarousels(); 

        document.querySelectorAll('.carousel-nav .next').forEach(b => b.addEventListener('click', () => navigate(b.dataset.category, 1)));
        document.querySelectorAll('.carousel-nav .prev').forEach(b => b.addEventListener('click', () => navigate(b.dataset.category, -1)));

        document.querySelectorAll('.carousel-viewport').forEach(viewport => {
            let touchStartX = 0;
            let touchEndX = 0;
            const swipeThreshold = 50; 

            viewport.addEventListener('touchstart', e => {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            viewport.addEventListener('touchend', e => {
                touchEndX = e.changedTouches[0].screenX;
                const deltaX = touchEndX - touchStartX;
                if (Math.abs(deltaX) > swipeThreshold) {
                    navigate(viewport.dataset.category, deltaX > 0 ? -1 : 1);
                }
            });
        });

        updateDeepLink(); 
    }

    init();
})();