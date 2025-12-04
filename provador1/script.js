(function () {
    const data = {
        carousel_01: {
            title: "Parte Superior",
            items: [
                {
                    img: 'https://t-static.dafiti.com.br/bbGookK2YhEtd4hvMlgjWDT7uBk=/fit-in/430x623/static.dafiti.com.br/p/aeropostale-camiseta-aeropostale-reta-estampada-off-white-1658-16377241-1-zoom.jpg',
                    sku: 'AE553APM38IJH'
                },
                {
                    img: 'https://t-static.dafiti.com.br/h6zrrQaZGqhfTAabkgYuJtD4RY4=/fit-in/430x623/static.dafiti.com.br/p/osklen-camiseta-osklen-united-kingdom-preta-7199-75686931-1-zoom.jpg',
                    sku: 'OS047APM42TSB'
                },
                {
                    img: 'https://t-static.dafiti.com.br/k1mh3-mfaQzXZTiqya39I7PCIrY=/fit-in/430x623/static.dafiti.com.br/p/osklen-camiseta-osklen-reta-label-verde-2138-21405331-1-zoom.jpg',
                    sku: 'OS047APM87PDK'
                }
            ]
        },
        carousel_02: {
            title: "Parte Inferior",
            items: [
                {
                    img: 'https://static.dafiti.com.br/p/Youcom-Cal%C3%A7a-Jeans-Preta-Baggy-Cargo-8907-59072741-4-zoom.jpg',
                    sku: 'YO938APM04XQT'
                },
                {
                    img: 'https://t-static.dafiti.com.br/Zu9-oR1xAbq9ysANI9pyho92gG8=/fit-in/430x623/static.dafiti.com.br/p/gap-cal%C3%A7a-sarja-gap-slim-pockets-off-white-0609-46084541-1-zoom.jpg',
                    sku: '2FAE553APM38IJH'
                },
                {
                    img: 'https://static.dafiti.com.br/p/Youcom-Cal%C3%A7a-Reta-Jeans-Claro-6442-85246141-5-zoom.jpg',
                    sku: 'YO938APM41XBE'
                }
            ]
        },
        carousel_03: {
            title: "Calçados",
            items: [
                {
                    img: 'https://t-static.dafiti.com.br/Co5ne6GSWYeQkN0RVwYdhNl4Q4c=/fit-in/430x623/static.dafiti.com.br/p/new-balance-t%C3%AAnis--new-balance-740-branco-2612-26302541-1-zoom.jpg',
                    sku: 'NE184SCF37DVM'
                },
                {
                    img: 'https://t-static.dafiti.com.br/o6oeaPRssxk5VVBjMwKx_R3vNh0=/fit-in/430x623/static.dafiti.com.br/p/nike-t%C3%AAnis-nike-pacific-feminino-4198-24502741-1-zoom.jpg',
                    sku: 'NI288SHF57NYS'
                },
                {
                    img: 'https://t-static.dafiti.com.br/5TUPW5AluReDbWvsl9qsPbWDIRI=/fit-in/430x623/static.dafiti.com.br/p/asics-t%C3%AAnis-asics-gel-nunobiki-branco-0304-76343541-1-zoom.jpg',
                    sku: 'AS296SCF32YOD'
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
        
        // 1. Junta todos os SKUs com o separador '--'
        const skuList = selectedSkus.join('--');
        
        // 2. Define a base do Deep Link
        const deepLinkBase = 'dafiti://br/c?pathUrl=%26filters%3Dsku%3D';
        
        // 3. Concatena a base com a lista de SKUs
        const finalDeepLink = deepLinkBase + skuList;
        
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