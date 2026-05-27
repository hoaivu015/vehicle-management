document.addEventListener('DOMContentLoaded', () => {

    // ==========================================================================
    // ⚡ PHASE 1: DUAL-LAYER CROSS-FADE BACKGROUND SWAP (Zero-Flash)
    // ==========================================================================
    const carModelSelect = document.getElementById('car-model');
    const searchModelSelect = document.getElementById('search-model');
    const heroBg = document.getElementById('hero-bg');
    const heroSlideshow = document.getElementById('hero-slideshow');

    // Create 2 static image elements for zero-flash cross-fading
    const bgLayers = [
        document.createElement('img'),
        document.createElement('img')
    ];

    if (heroBg) {
        bgLayers.forEach((img, idx) => {
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.style.position = 'absolute';
            img.style.inset = '0';
            img.style.opacity = '0';
            img.style.transition = 'opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1)';
            img.style.zIndex = idx === 0 ? '-1' : '-2'; // layering
            heroBg.appendChild(img);
        });
    }

    let activeLayerIdx = 0;
    let slideshowFaded = false;

    if (heroSlideshow) {
        heroSlideshow.style.transition = 'opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1)';
    }

    // Function to perform cross-fade background swap
    function triggerBackgroundSwap(imgUrl) {
        if (!imgUrl || !heroBg) return;

        const inactiveLayerIdx = 1 - activeLayerIdx;
        const activeLayer = bgLayers[activeLayerIdx];
        const inactiveLayer = bgLayers[inactiveLayerIdx];

        // Preload image
        const tempImg = new Image();
        tempImg.src = imgUrl;
        tempImg.onload = () => {
            inactiveLayer.src = imgUrl;
            
            // Swap layers Z-Index so the incoming image is on top
            inactiveLayer.style.zIndex = '-1';
            activeLayer.style.zIndex = '-2';
            
            // Transition opacity
            inactiveLayer.style.opacity = '1';
            activeLayer.style.opacity = '0';

            // Fade out slideshow on first change
            if (!slideshowFaded && heroSlideshow) {
                heroSlideshow.style.opacity = '0';
                slideshowFaded = true;
            }

            activeLayerIdx = inactiveLayerIdx;
        };
    }

    // Bind event for sell.html car select
    if (carModelSelect) {
        carModelSelect.addEventListener('change', function () {
            const selectedVal = this.value;
            const imgUrl = modelImages[selectedVal];
            if (imgUrl) {
                triggerBackgroundSwap(imgUrl);
            }
        });
    }

    // Map models to background images for search-model in index.html
    const modelImages = {
        'vf3': new URL('./assets/cars/vf3.jpg', import.meta.url).href,
        'vf5': new URL('./assets/cars/vf5.jpg', import.meta.url).href,
        'vf6': new URL('./assets/cars/vf6.jpg', import.meta.url).href,
        'vf7': new URL('./assets/cars/vf7.jpg', import.meta.url).href,
        'vf8': new URL('./assets/cars/vf8.jpg', import.meta.url).href,
        'vf9': new URL('./assets/cars/vf9.jpg', import.meta.url).href,
        'vfe34': new URL('./assets/cars/vfe34.jpg', import.meta.url).href,
        'lux-a': new URL('./assets/cars/lux-a.jpg', import.meta.url).href,
        'fadil': new URL('./assets/cars/fadil.jpg', import.meta.url).href
    };

    if (searchModelSelect) {
        searchModelSelect.addEventListener('change', function () {
            const selectedVal = this.value;
            const imgUrl = modelImages[selectedVal];
            if (imgUrl) {
                triggerBackgroundSwap(imgUrl);
            }
        });
    }

    // ==========================================================================
    // 🧬 TWO-STEP MORPHING CAPSULE FORM LOGIC (sell.html specific)
    // ==========================================================================
    const btnNextStep = document.getElementById('btn-next-step');
    const btnPrevStep = document.getElementById('btn-prev-step');
    const sellStep1 = document.getElementById('sell-step-1');
    const sellStep2 = document.getElementById('sell-step-2');
    const pricingForm = document.getElementById('pricing-form');

    if (btnNextStep && btnPrevStep && sellStep1 && sellStep2) {
        
        // STEP 1 -> STEP 2
        btnNextStep.addEventListener('click', () => {
            // Smoothly morph form height & transition steps
            sellStep1.classList.add('fade-out');
            
            setTimeout(() => {
                sellStep1.style.display = 'none';
                sellStep1.classList.remove('fade-out');
                
                // Show Step 2
                sellStep2.style.display = 'flex';
                sellStep2.classList.remove('hidden-setup');
                sellStep2.classList.add('fade-in');
            }, 350);
        });

        // STEP 2 -> STEP 1
        btnPrevStep.addEventListener('click', () => {
            sellStep2.classList.add('fade-out');
            
            setTimeout(() => {
                sellStep2.style.display = 'none';
                sellStep2.classList.remove('fade-out');
                sellStep2.classList.add('hidden-setup');
                
                // Show Step 1
                sellStep1.style.display = 'flex';
                sellStep1.classList.add('fade-in');
            }, 300);
        });
    }


    // ==========================================================================
    // 🚗 GRID FILTERS & PROMPT SEARCH (index.html specific)
    // ==========================================================================
    const filterPills = document.querySelectorAll('.filter-pill');
    const carsGrid = document.getElementById('cars-grid');

    if (carsGrid) {
        // Filter by pills
        filterPills.forEach(pill => {
            pill.addEventListener('click', () => {
                filterPills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');

                const filterVal = pill.getAttribute('data-filter');
                filterCarCards(filterVal);
            });
        });
    }

    function filterCarCards(filterVal) {
        const carCards = document.querySelectorAll('#cars-grid .expressive-car-card');
        carCards.forEach(card => {
            const modelType = card.getAttribute('data-model');
            if (filterVal === 'all' || modelType === filterVal) {
                card.style.display = 'flex';
                setTimeout(() => { card.style.opacity = '1'; card.style.transform = 'scale(1)'; }, 50);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'scale(0.95)';
                setTimeout(() => { card.style.display = 'none'; }, 300);
            }
        });
    }

    // Filter from Unified Prompt Pill Search Button
    const btnSearchTrigger = document.getElementById('btn-search-trigger');
    if (btnSearchTrigger) {
        btnSearchTrigger.addEventListener('click', () => {
            const selectModel = document.getElementById('search-model').value;
            const selectPrice = document.getElementById('search-price').value;
            const carCards = document.querySelectorAll('#cars-grid .expressive-car-card');

            carCards.forEach(card => {
                const cardModel = card.getAttribute('data-model');
                const cardPrice = parseFloat(card.getAttribute('data-price'));
                
                let matchesModel = (selectModel === 'all' || cardModel === selectModel || (selectModel === 'lux-a' && cardModel === 'gas' || selectModel === 'fadil' && cardModel === 'gas'));
                
                let matchesPrice = true;
                if (selectPrice === 'under-400') matchesPrice = cardPrice < 400;
                else if (selectPrice === '400-600') matchesPrice = cardPrice >= 400 && cardPrice <= 600;
                else if (selectPrice === '600-800') matchesPrice = cardPrice >= 600 && cardPrice <= 800;
                else if (selectPrice === 'over-800') matchesPrice = cardPrice > 800;

                if (matchesModel && matchesPrice) {
                    card.style.display = 'flex';
                    setTimeout(() => { card.style.opacity = '1'; card.style.transform = 'scale(1)'; }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.95)';
                    setTimeout(() => { card.style.display = 'none'; }, 300);
                }
            });

            // Auto scroll to products section
            const gridSection = document.getElementById('product-grid-section');
            if (gridSection) {
                gridSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    // ==========================================================================
    // 🔢 STATS COUNTER ANIMATION
    // ==========================================================================
    function animateCounter(el, target, suffix = '', duration = 2200) {
        if (!el) return;
        let startTime = null;
        const easeOutQuart = t => 1 - Math.pow(1 - t, 4);

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const eased = easeOutQuart(progress);
            el.textContent = Math.floor(eased * target).toLocaleString('vi-VN') + suffix;
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    const counterObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            const carsCounter = document.getElementById('counter-cars');
            const billCounter = document.getElementById('counter-billion');
            if (carsCounter) animateCounter(carsCounter, 1245);
            if (billCounter) animateCounter(billCounter, 50, ' Tỷ');
            counterObserver.disconnect();
        }
    }, { threshold: 0.2 });

    const socialProof = document.getElementById('social-proof');
    if (socialProof) counterObserver.observe(socialProof);

    // ==========================================================================
    // 📜 SCROLL REVEAL SYSTEM
    // ==========================================================================
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -30px 0px'
    });

    document.querySelectorAll('.reveal').forEach(el => {
        revealObserver.observe(el);
    });

    // ==========================================================================
    // 🔗 PROCESS DRAW CONNECTING LINE
    // ==========================================================================
    const processSection = document.getElementById('process-steps');
    if (processSection) {
        const lineObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                processSection.classList.add('line-drawn');
                lineObserver.disconnect();
            }
        }, { threshold: 0.4 });
        lineObserver.observe(processSection);
    }

    // ==========================================================================
    // ❓ FAQ ACCORDION (Max-Height cubic-bezier transition)
    // ==========================================================================
    document.querySelectorAll('.faq-item').forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', () => {
                const isOpen = item.classList.contains('open');

                // Close all other items
                document.querySelectorAll('.faq-item.open').forEach(openItem => {
                    openItem.classList.remove('open');
                    openItem.querySelector('.faq-answer').style.maxHeight = null;
                });

                // Toggle current item
                if (!isOpen) {
                    item.classList.add('open');
                    const answer = item.querySelector('.faq-answer');
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                }
            });
        }
    });

    // ==========================================================================
    // 💻 INTERACTIVE 360° DETAIL MODAL & SUPABASE INTEGRATION
    // ==========================================================================
    const modal = document.getElementById('car-modal-view');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalOverlay = document.getElementById('modal-overlay');

    // Cloudinary Optimization Helper
    function optimizeCloudinaryUrl(url, options = {}) {
        if (!url) return "./assets/cars/vf8.jpg"; // Default fallback
        if (!url.includes('cloudinary.com')) return url;

        const width = options.width || 800;
        const quality = options.quality || 'auto';
        const format = options.format || 'auto';
        const crop = options.crop || 'fill';

        const params = [
            `w_${width}`,
            `q_${quality}`,
            `f_${format}`,
            `c_${crop}`
        ];

        if (options.height) {
            params.push(`h_${options.height}`);
        }

        const transformation = params.join(',');

        if (url.includes('/upload/')) {
            return url.replace('/upload/', `/upload/${transformation}/`);
        }

        return url;
    }

    // Initialize Supabase Client
    const supabaseUrl = 'https://wcnyxxbfdtsmgynozkvk.supabase.co';
    const supabaseKey = 'sb_publishable_DtL05cs1XRASAJsfyv2sRw_7JdtPa7X';
    let supabase = null;
    if (window.supabase) {
        supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
    } else {
        console.error('Supabase SDK not loaded.');
    }

    // Dynamic configurations
    let activeTelegramToken = '8354150269:AAF2da1-GZAXNgDVplWot053UDETG7CX5ss';
    let activeTelegramChatId = '2117317097';

    async function loadDynamicLandingPageConfig() {
        if (!supabase) return;

        try {
            const { data, error } = await supabase
                .from('landingpage_config')
                .select('*')
                .eq('id', 1)
                .maybeSingle();

            if (error) {
                console.warn('Error loading dynamic landing page config:', error.message);
                return;
            }

            if (data) {
                console.log('Dynamic landing page config loaded successfully!', data);
                
                // Update Telegram Bot credentials
                if (data.telegram_token) activeTelegramToken = data.telegram_token;
                if (data.telegram_chat_id) activeTelegramChatId = data.telegram_chat_id;

                // Update Zalo & Hotline links & labels
                const phoneText = data.hotline_number || '0888.81.38.38';
                const phoneRaw = data.phone || '0888813838';
                const addressText = data.address || '8F Đường Trịnh Hoài Đức, Tăng Nhơn Phú, Quận 9, TP. Hồ Chí Minh';
                const fanpageUrl = data.fanpage_url || 'https://www.facebook.com/otoluotsaigon9/';
                const mapUrl = data.map_iframe_url || '';

                // Find and update phone number displays
                // 1. Floating Nav Call button
                const btnNavHotline = document.querySelector('.btn-nav-hotline');
                if (btnNavHotline) {
                    btnNavHotline.setAttribute('href', `tel:${phoneRaw}`);
                    btnNavHotline.textContent = phoneText;
                }

                // 2. Mobile Sticky Footer links
                const btnCall = document.querySelector('.btn-call');
                if (btnCall) {
                    btnCall.setAttribute('href', `tel:${phoneRaw}`);
                }
                const btnZalo = document.querySelector('.btn-zalo');
                if (btnZalo) {
                    btnZalo.setAttribute('href', `https://zalo.me/${phoneRaw}`);
                }

                // 3. Main Footer Hotline & Address
                const footer = document.querySelector('footer');
                if (footer) {
                    // Update address link inside footer
                    const addressLink = footer.querySelector('a[href="#location"]');
                    if (addressLink) addressLink.textContent = addressText;

                    // Update hotline text and link
                    const hotlineLink = footer.querySelector('a[href^="tel:"]');
                    if (hotlineLink) {
                        hotlineLink.setAttribute('href', `tel:${phoneRaw}`);
                        hotlineLink.textContent = phoneText;
                    }

                    // Update fanpage URL
                    const fanpageLink = footer.querySelector('a[href*="facebook.com"]');
                    if (fanpageLink && fanpageUrl) {
                        fanpageLink.setAttribute('href', fanpageUrl);
                    }
                }

                // 4. Map Iframe URL
                const mapIframe = document.querySelector('.map-container iframe');
                if (mapIframe && mapUrl) {
                    mapIframe.setAttribute('src', mapUrl);
                }
            }
        } catch (e) {
            console.error('Failed to parse or apply dynamic configurations:', e);
        }
    }

    // Call dynamic landingpage configurations
    loadDynamicLandingPageConfig();

    // Global Store for Loaded Vehicles and Details Map
    let loadedVehicles = [];
    let carDetailsData = {};

    function formatPriceText(priceInVND) {
        if (!priceInVND || priceInVND <= 0) return 'Liên hệ';
        if (priceInVND >= 1000000000) {
            return (priceInVND / 1000000000).toFixed(2).replace('.00', '').replace(/0+$/, '').replace(/\.$/, '') + ' Tỷ';
        }
        return Math.round(priceInVND / 1000000) + ' Triệu';
    }

    // Fetch and render vehicle list dynamically
    async function fetchAndRenderVehicles() {
        if (!supabase || !carsGrid) return;

        try {
            // Load only active/available vehicles (not SOLD)
            let { data, error } = await supabase
                .from('vehicles')
                .select('*')
                .neq('status', 'SOLD')
                .or('show_on_landing.is.null,show_on_landing.eq.true')
                .order('id', { ascending: false });

            // Robust fallback: If advanced query with show_on_landing filter fails for any reason (e.g. column doesn't exist yet)
            if (error) {
                console.warn('Advanced landing page query failed, executing robust fallback without show_on_landing column:', error.message);
                const fallbackResult = await supabase
                    .from('vehicles')
                    .select('*')
                    .neq('status', 'SOLD')
                    .order('id', { ascending: false });
                data = fallbackResult.data;
                error = fallbackResult.error;
            }

            if (error) throw error;

            loadedVehicles = data || [];
            carDetailsData = {};

            if (loadedVehicles.length === 0) {
                carsGrid.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem; color: var(--color-text-secondary);">
                        <p style="font-size: 1.1rem; font-weight: 500;">Hiện tại toàn bộ xe đã được giao dịch. Vui lòng quay lại sau!</p>
                    </div>
                `;
                return;
            }

            // Clear skeletons
            carsGrid.innerHTML = '';

            loadedVehicles.forEach(car => {
                const nameLower = car.name.toLowerCase();
                const notesLower = (car.notes || '').toLowerCase();
                
                // Determine model filter value
                let modelType = 'gas';
                if (nameLower.includes('vf 3') || nameLower.includes('vf3')) modelType = 'vf3';
                else if (nameLower.includes('vf 5') || nameLower.includes('vf5')) modelType = 'vf5';
                else if (nameLower.includes('vf 6') || nameLower.includes('vf6')) modelType = 'vf6';
                else if (nameLower.includes('vf 7') || nameLower.includes('vf7')) modelType = 'vf7';
                else if (nameLower.includes('vf 8') || nameLower.includes('vf8')) modelType = 'vf8';
                else if (nameLower.includes('vf 9') || nameLower.includes('vf9')) modelType = 'vf9';
                else if (nameLower.includes('vfe34') || nameLower.includes('vf e34')) modelType = 'vfe34';

                const isElectric = modelType !== 'gas';

                // Determine badge details
                let badgeText = 'Đã Check Hãng';
                let badgeClass = '';
                if (isElectric) {
                    if (notesLower.includes('mua đứt') || notesLower.includes('pin mua')) {
                        badgeText = 'Pin Mua Đứt • Đã Check Hãng';
                        badgeClass = 'bg-emerald';
                    } else {
                        badgeText = 'Pin Thuê • Đã Check Hãng';
                        badgeClass = '';
                    }
                } else {
                    if (nameLower.includes('premium') || nameLower.includes('cao cấp')) {
                        badgeText = 'Xe Xăng • Bản Cao Cấp';
                        badgeClass = 'bg-orange';
                    } else {
                        badgeText = 'Xe Xăng • Đã Check Hãng';
                        badgeClass = 'bg-orange';
                    }
                }

                // Determine battery type status
                let resolvedBatteryType = car.battery_type || 'None';
                if (isElectric && (resolvedBatteryType === 'None' || !resolvedBatteryType)) {
                    if (notesLower.includes('mua đứt') || notesLower.includes('pin mua')) {
                        resolvedBatteryType = 'Pin Mua Đứt';
                    } else {
                        resolvedBatteryType = 'Pin Thuê';
                    }
                }

                // Determine battery/engine description for modal
                let batteryText = 'Bảo hành pin chính hãng VinFast';
                if (isElectric) {
                    if (resolvedBatteryType === 'Pin Mua Đứt') {
                        batteryText = 'Pin mua đứt chính hãng, bảo hành pin 10 năm';
                    } else {
                        batteryText = 'Hợp đồng thuê pin cực lợi thế, sức khỏe pin > 85%';
                    }
                } else {
                    batteryText = 'Động cơ xăng bốc khỏe, vận hành êm ái, full lịch sử hãng';
                }

                const priceText = formatPriceText(car.sale_price);

                // Populate dynamic carDetailsData mapping for 360 viewer modal
                carDetailsData[car.id] = {
                    title: car.name,
                    price: priceText,
                    class: `${isElectric ? 'DÒNG XE ĐIỆN' : 'ĐỘNG CƠ XĂNG'} · ĐỜI ${car.year || '2023'}`,
                    odo: car.odo ? car.odo.toLocaleString('vi-VN') + ' km' : 'Siêu lướt',
                    color: car.color || 'Bạc',
                    batteryType: isElectric ? resolvedBatteryType : 'Không có (Xe xăng)',
                    battery: batteryText,
                    img: optimizeCloudinaryUrl(car.image_url, { width: 800 })
                };

                // Create Card Element
                const cardEl = document.createElement('div');
                cardEl.className = 'expressive-car-card reveal visible'; // immediate fade-in setup
                cardEl.setAttribute('data-model', modelType);
                cardEl.setAttribute('data-price', (car.sale_price / 1000000).toString());
                cardEl.setAttribute('data-car-id', car.id);

                cardEl.innerHTML = `
                    <div class="card-top">
                        <!-- Image container aspect-[16/10] -->
                        <div class="card-img-container">
                            <img src="${optimizeCloudinaryUrl(car.image_url, { width: 600 })}" alt="${car.name}" class="card-img" style="opacity: 0; transition: opacity 0.5s ease;" onload="this.style.opacity='1'">
                            <div class="card-badge ${badgeClass}">
                                <span>${badgeText}</span>
                            </div>
                        </div>
                        
                        <div class="card-body">
                            <div class="card-meta-line">
                                <span class="meta-tag-blue">${isElectric ? 'DÒNG XE ĐIỆN' : 'XE XĂNG LƯỚT'}</span>
                                <span class="meta-tag-gray">ĐỜI ${car.year || '2023'}</span>
                            </div>
                            <h3 class="card-title">${car.name}</h3>
                            
                            <!-- Pills specifications -->
                            <div class="spec-pills">
                                <span class="spec-pill">⏱️ ${car.odo ? car.odo.toLocaleString('vi-VN') + ' km' : 'Siêu lướt'}</span>
                                <span class="spec-pill">🎨 ${car.color || 'Nhiều màu'}</span>
                                ${isElectric ? `<span class="spec-pill">🔋 ${resolvedBatteryType}</span>` : ''}
                            </div>
                        </div>
                    </div>
                    
                    <div class="card-bottom">
                        <div class="price-box">
                            <span class="price-label">Giá chào bán</span>
                            <span class="price-value">${priceText}</span>
                        </div>
                        <button class="btn-card-action btn-detail-trigger" type="button">
                            Xem Ưu Đãi
                        </button>
                    </div>
                `;

                carsGrid.appendChild(cardEl);
            });

        } catch (err) {
            console.error('Lỗi khi tải và kết xuất kho xe:', err);
            carsGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem; color: var(--color-text-secondary);">
                    <p style="font-size: 1.1rem; font-weight: 500;">Có lỗi xảy ra khi tải kho xe. Vui lòng tải lại trang hoặc liên hệ hotline!</p>
                </div>
            `;
        }
    }

    // Call dynamic load on init
    fetchAndRenderVehicles();

    // Event Delegation to handle dynamic modal clicks
    if (modal) {
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-detail-trigger');
            if (!btn) return;

            e.stopPropagation();
            const card = btn.closest('.expressive-car-card');
            if (!card) return;

            const carId = card.getAttribute('data-car-id');
            const carInfo = carDetailsData[carId];

            if (carInfo) {
                // Populate text info
                document.getElementById('modal-car-title').textContent = carInfo.title;
                document.getElementById('modal-car-class').textContent = carInfo.class;
                document.getElementById('modal-car-price').textContent = carInfo.price;
                document.getElementById('modal-spec-odo').textContent = carInfo.odo;
                document.getElementById('modal-spec-color').textContent = carInfo.color;
                const plateSpec = document.getElementById('modal-spec-plate');
                if (plateSpec && plateSpec.parentElement) {
                    plateSpec.parentElement.style.display = 'none';
                }
                document.getElementById('modal-spec-battery').textContent = carInfo.battery;

                // Load image
                const modalImg = document.getElementById('modal-display-img');
                if (modalImg) {
                    modalImg.src = carInfo.img;
                    modalImg.style.transform = 'perspective(1000px) rotateY(0deg) scale(1)';
                }

                // Reset 360 slider control
                const slider360 = document.getElementById('slider-360-control');
                if (slider360) {
                    slider360.value = 3; // Center value
                }
                const text360Label = document.querySelector('.label-360-instruction');
                if (text360Label) {
                    text360Label.textContent = 'Kéo xoay xe';
                }

                // Add data reference for the submit action in modal
                document.getElementById('btn-modal-action-submit').setAttribute('data-car-name', carInfo.title);

                // Show modal
                modal.classList.add('open');
                document.body.style.overflow = 'hidden'; // Lock body scroll
            }
        });
    }

    // Close modal functions
    function closeModal() {
        if (modal) {
            modal.classList.remove('open');
            document.body.style.overflow = '';
        }
    }

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (modalOverlay) modalOverlay.addEventListener('click', closeModal);

    // ESC key closes modal
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    // Simulated 360° View interactive slider rotation
    const slider360 = document.getElementById('slider-360-control');
    const modalImg = document.getElementById('modal-display-img');
    const text360Label = document.querySelector('.label-360-instruction');

    if (slider360 && modalImg) {
        const rotationAngles = {
            1: { deg: -30, text: 'Góc 1: Ba phần tư trước' },
            2: { deg: -15, text: 'Góc 2: Mặt trước sườn xe' },
            3: { deg: 0,   text: 'Góc 3: Chính diện xe' },
            4: { deg: 15,  text: 'Góc 4: Sườn xe sau' },
            5: { deg: 30,  text: 'Góc 5: Đuôi xe 360°' }
        };

        slider360.addEventListener('input', function () {
            const val = parseInt(this.value);
            const rotation = rotationAngles[val];
            if (rotation) {
                modalImg.style.transform = `perspective(1000px) rotateY(${rotation.deg}deg) scale(${1 + Math.abs(val - 3) * 0.03})`;
                modalImg.style.transition = 'transform 0.15s ease-out';
                
                if (text360Label) {
                    text360Label.textContent = rotation.text;
                    text360Label.style.color = '#3b82f6';
                }
            }
        });
    }

    // Modal submit handler
    const btnModalSubmit = document.getElementById('btn-modal-action-submit');
    if (btnModalSubmit) {
        btnModalSubmit.addEventListener('click', async () => {
            const carName = btnModalSubmit.getAttribute('data-car-name');
            const name = document.getElementById('modal-name') ? document.getElementById('modal-name').value : '';
            const phone = document.getElementById('modal-phone').value;

            if (!name) {
                alert('Vui lòng nhập Họ tên của bạn!');
                return;
            }
            if (!phone) {
                alert('Vui lòng nhập Số điện thoại để nhận chương trình ưu đãi!');
                return;
            }

            const originalText = btnModalSubmit.textContent;
            btnModalSubmit.textContent = '⏳ ĐANG GỬI...';
            btnModalSubmit.disabled = true;

            // CONFIG TELEGRAM BOT
            const TELEGRAM_TOKEN = activeTelegramToken; 
            const TELEGRAM_CHAT_ID = activeTelegramChatId; 

            const message = `
<b>🔥 YÊU CẦU MUA XE / NHẬN ƯU ĐÃI</b>
--------------------------
🚗 <b>Dòng xe quan tâm:</b> ${carName}
👤 <b>Họ tên khách hàng:</b> ${name}
📞 <b>Số điện thoại khách:</b> <a href="tel:${phone}">${phone}</a>
--------------------------
⏰ <b>Gửi lúc:</b> ${new Date().toLocaleString('vi-VN')}
            `;

            const params = new URLSearchParams({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'HTML',
                disable_web_page_preview: true
            });

            try {
                const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage?${params.toString()}`);
                if (response.ok) {
                    // Analytics trigger
                    if (typeof gtag === 'function') {
                        gtag('event', 'generate_lead', {
                            'event_category': 'Conversion',
                            'event_label': 'Modal Xem Ưu Đãi Mua Xe',
                            'car_model': carName
                        });
                    }

                    btnModalSubmit.textContent = '✅ ĐÃ GỬI!';
                    btnModalSubmit.style.background = '#16a34a';

                    setTimeout(() => {
                        closeModal();
                        btnModalSubmit.textContent = originalText;
                        btnModalSubmit.disabled = false;
                        btnModalSubmit.style.background = '';
                        if (document.getElementById('modal-name')) document.getElementById('modal-name').value = '';
                        document.getElementById('modal-phone').value = '';
                    }, 2000);
                } else {
                    throw new Error('API error');
                }
            } catch (err) {
                console.error(err);
                btnModalSubmit.textContent = '❌ LỖI GỬI!';
                btnModalSubmit.style.background = '#dc2626';
                setTimeout(() => {
                    btnModalSubmit.textContent = originalText;
                    btnModalSubmit.disabled = false;
                    btnModalSubmit.style.background = '';
                }, 2000);
            }
        });
    }

    // ==========================================================================
    // 🏠 PARALLAX MOUSE TILT (Collision-Free)
    // ==========================================================================
    const heroContent = document.querySelector('.hero__content');
    const heroSection_move = document.getElementById('hero');
    
    if (heroSection_move && heroContent) {
        heroSection_move.addEventListener('mousemove', (e) => {
            const { clientX, clientY } = e;
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            
            const moveX = (clientX - centerX) / 60;
            const moveY = (clientY - centerY) / 60;
            
            heroContent.style.transform = `translate(${moveX}px, ${moveY}px)`;
            
            const form = document.getElementById('pricing-form');
            if (form) {
                const rotateX = (clientY - centerY) / 80;
                const rotateY = (clientX - centerX) / 80;
                form.style.transform = `perspective(1000px) rotateX(${-rotateX}deg) rotateY(${rotateY}deg)`;
            }
        });
    }

    // ==========================================================================
    // 📱 STICKY FOOTER NAVIGATION DISPLAY
    // ==========================================================================
    const stickyFooter = document.getElementById('sticky-cta');
    const heroSection = document.getElementById('hero');

    if (stickyFooter && heroSection) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > heroSection.offsetHeight * 0.5) {
                stickyFooter.classList.add('visible');
            } else {
                stickyFooter.classList.remove('visible');
            }
        }, { passive: true });
    }

    // ==========================================================================
    // 🔋 BOKEH PARTICLES GENERATOR
    // ==========================================================================
    const bokehContainer = document.getElementById('hero-bokeh');
    if (bokehContainer) {
        for (let i = 0; i < 12; i++) {
            const bokeh = document.createElement('div');
            bokeh.className = 'bokeh-item';
            const size = Math.random() * 15 + 10;
            bokeh.style.width = `${size}px`;
            bokeh.style.height = `${size}px`;
            bokeh.style.left = `${Math.random() * 100}%`;
            bokeh.style.animationDelay = `${Math.random() * 10}s`;
            bokeh.style.animationDuration = `${Math.random() * 8 + 8}s`;
            bokehContainer.appendChild(bokeh);
        }
    }

    // ==========================================================================
    // 🎯 HERO PRIMARY CTA: SEND LEADS TO TELEGRAM (sell.html specific)
    // ==========================================================================
    const ctaBtn = document.getElementById('cta-primary');
    if (ctaBtn) {
        ctaBtn.addEventListener('click', async () => {
            const modelSelect = document.getElementById('car-model');
            const modelName = modelSelect.options[modelSelect.selectedIndex].text;
            const year = document.getElementById('year').value;
            const km = document.getElementById('km').value;
            const phone = document.getElementById('customer-phone').value;

            if (!phone) {
                alert('Vui lòng điền Số điện thoại để nhận định giá sơ bộ!');
                return;
            }

            const originalText = ctaBtn.textContent;
            ctaBtn.textContent = '⏳ ĐANG ĐỊNH GIÁ AI...';
            ctaBtn.disabled = true;

            const TELEGRAM_TOKEN = activeTelegramToken; 
            const TELEGRAM_CHAT_ID = activeTelegramChatId; 

            const message = `
<b>🚀 YÊU CẦU BÁO GIÁ THU MUA MỚI (AI)</b>
--------------------------
🚗 <b>Dòng xe cũ:</b> ${modelName}
📅 <b>Năm sản xuất:</b> ${year}
🛣️ <b>Số Odo:</b> ${km}
📞 <b>Số điện thoại:</b> <a href="tel:${phone}">${phone}</a>
--------------------------
⏰ <b>Gửi lúc:</b> ${new Date().toLocaleString('vi-VN')}
            `;

            const params = new URLSearchParams({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'HTML',
                disable_web_page_preview: true
            });

            try {
                const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage?${params.toString()}`);
                if (response.ok) {
                    if (typeof gtag === 'function') {
                        gtag('event', 'generate_lead', {
                            'event_category': 'Conversion',
                            'event_label': 'Form Định Giá Thu Mua Hero',
                            'car_model': modelName,
                            'car_year': year,
                            'car_km': km
                        });
                        
                        gtag('event', 'conversion', {
                            'send_to': 'AW-18153153954',
                            'value': 1.0,
                            'currency': 'VND'
                        });
                    }

                    // GTM Datalayer Push
                    window.dataLayer = window.dataLayer || [];
                    window.dataLayer.push({
                        'event': 'form_submit_success',
                        'form_id': 'hero_pricing_form_sell',
                        'car_model': modelName,
                        'car_year': year,
                        'car_km': km
                    });

                    if (typeof fbq === 'function') fbq('track', 'Lead', { content_name: modelName });
                    if (typeof ttq === 'function') ttq.track('CompleteRegistration', { content_name: modelName });

                    ctaBtn.textContent = '✅ ĐÃ GỬI THÀNH CÔNG!';
                    ctaBtn.style.background = '#16a34a';

                    setTimeout(() => {
                        ctaBtn.textContent = originalText;
                        ctaBtn.disabled = false;
                        ctaBtn.style.background = '';
                        document.getElementById('customer-phone').value = '';
                        
                        // Reset the form step back to step 1 smoothly
                        if (sellStep1 && sellStep2) {
                            sellStep2.style.display = 'none';
                            sellStep2.classList.remove('fade-out');
                            sellStep2.classList.add('hidden-setup');
                            
                            sellStep1.style.display = 'flex';
                            sellStep1.classList.add('fade-in');
                        }
                    }, 2500);
                } else {
                    throw new Error('Telegram API error');
                }
            } catch (err) {
                console.error(err);
                ctaBtn.textContent = '❌ LỖI GỬI. HÃY GỌI HOTLINE!';
                ctaBtn.style.background = '#dc2626';
                setTimeout(() => {
                    ctaBtn.textContent = originalText;
                    ctaBtn.disabled = false;
                    ctaBtn.style.background = '';
                }, 2500);
            }
        });
    }

    // ==========================================================================
    // 🎠 TESTIMONIAL SLIDER AUTOMATION
    // ==========================================================================
    const slider = document.querySelector('.testimonial-slider');
    const dots = document.querySelectorAll('.dot');
    
    if (slider && dots.length > 0) {
        let isPaused = false;
        let scrollInterval;

        slider.addEventListener('scroll', () => {
            const index = Math.round(slider.scrollLeft / slider.offsetWidth);
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
        }, { passive: true });

        const startAutoScroll = () => {
            scrollInterval = setInterval(() => {
                if (isPaused) return;
                const maxScroll = slider.scrollWidth - slider.offsetWidth;
                if (slider.scrollLeft >= maxScroll - 10) {
                    slider.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    slider.scrollBy({ left: slider.offsetWidth, behavior: 'smooth' });
                }
            }, 5000);
        };

        slider.addEventListener('mouseenter', () => isPaused = true);
        slider.addEventListener('mouseleave', () => isPaused = false);
        slider.addEventListener('touchstart', () => isPaused = true, { passive: true });
        slider.addEventListener('touchend', () => {
            setTimeout(() => isPaused = false, 2000);
        }, { passive: true });

        startAutoScroll();
    }

    // ==========================================================================
    // 🚀 MOBILE SLIDESHOW AUTOMATION
    // ==========================================================================
    const slides = document.querySelectorAll('.slideshow .slide');
    if (slides.length > 0) {
        let currentSlideIdx = 0;
        slides[currentSlideIdx].classList.add('active');

        setInterval(() => {
            if (slideshowFaded) return;
            
            slides[currentSlideIdx].classList.remove('active');
            currentSlideIdx = (currentSlideIdx + 1) % slides.length;
            slides[currentSlideIdx].classList.add('active');
        }, 5000);
    }
});
