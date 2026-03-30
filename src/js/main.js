//Flip card
document.querySelectorAll('.js-flip-card').forEach(card => {
    card.addEventListener('click', function () {
        this.classList.toggle('is-flipped');
    });
});

document.addEventListener('DOMContentLoaded', () => {

//Init sliders
    initPainTypesSlider();
    initReviewsSlider();
    initChooseSlider();
    initSupportersSlider();
    initVideoReviewsSlider();

//Read more
    const blocks = document.querySelectorAll('.read-more');

    blocks.forEach(initReadMore);

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
            blocks.forEach((block) => {
                const api = block._readMoreApi;
                if (api) api.refresh();
            });
        });
    }

    window.addEventListener('resize', () => {
        blocks.forEach((block) => {
            const api = block._readMoreApi;
            if (api) api.refresh();
        });
    });

    function initReadMore(block) {
        const textEl = block.querySelector('.read-more__text');
        if (!textEl) return;

        const limit = parseInt(block.dataset.limit || '180', 10);

        const paragraphs = getParagraphTexts(textEl);
        const totalLength = paragraphs.join(' ').length;

        if (totalLength <= limit) return;

        const fullHTML = textEl.innerHTML.trim();
        const shortHTML = buildTrimmedHTML(paragraphs, limit);

        let button = block.querySelector('.read-more__toggle');
        if (!button) {
            button = document.createElement('button');
            button.type = 'button';
            button.className = 'read-more__toggle';
            block.appendChild(button);
        }

        let expanded = false;
        let animating = false;

        function isReadMoreEnabled() {
            return window.innerWidth <= 1023;
        }

        function measureHeight(html) {
            const rect = textEl.getBoundingClientRect();
            const width = Math.ceil(rect.width);

            if (!width) return Math.ceil(textEl.scrollHeight || 0) + 6;

            const style = window.getComputedStyle(textEl);
            const clone = document.createElement('div');

            clone.className = textEl.className;
            clone.style.position = 'absolute';
            clone.style.left = '-99999px';
            clone.style.top = '0';
            clone.style.visibility = 'hidden';
            clone.style.pointerEvents = 'none';
            clone.style.height = 'auto';
            clone.style.minHeight = '0';
            clone.style.maxHeight = 'none';
            clone.style.overflow = 'visible';
            clone.style.boxSizing = style.boxSizing;
            clone.style.width = width + 'px';

            clone.style.paddingTop = style.paddingTop;
            clone.style.paddingRight = style.paddingRight;
            clone.style.paddingBottom = style.paddingBottom;
            clone.style.paddingLeft = style.paddingLeft;

            clone.style.borderTopWidth = style.borderTopWidth;
            clone.style.borderRightWidth = style.borderRightWidth;
            clone.style.borderBottomWidth = style.borderBottomWidth;
            clone.style.borderLeftWidth = style.borderLeftWidth;
            clone.style.borderStyle = style.borderStyle;

            clone.style.fontFamily = style.fontFamily;
            clone.style.fontSize = style.fontSize;
            clone.style.fontWeight = style.fontWeight;
            clone.style.lineHeight = style.lineHeight;
            clone.style.letterSpacing = style.letterSpacing;
            clone.style.wordSpacing = style.wordSpacing;
            clone.style.whiteSpace = 'normal';

            clone.innerHTML = html;

            document.body.appendChild(clone);
            const height = Math.ceil(clone.getBoundingClientRect().height) + 6;
            clone.remove();

            return height;
        }

        function setCollapsed(noAnimation = false) {
            textEl.innerHTML = shortHTML;

            const h = measureHeight(shortHTML);

            if (noAnimation) {
                const prev = textEl.style.transition;
                textEl.style.transition = 'none';
                textEl.style.height = h + 'px';
                textEl.offsetHeight;
                textEl.style.transition = prev || '';
            } else {
                textEl.style.height = h + 'px';
            }

            button.textContent = 'Read more';
            button.setAttribute('aria-expanded', 'false');
            button.style.display = '';
            expanded = false;
        }

        function setExpandedDesktop(noAnimation = false) {
            textEl.innerHTML = fullHTML;

            if (noAnimation) {
                const prev = textEl.style.transition;
                textEl.style.transition = 'none';
                textEl.style.removeProperty('height');
                textEl.offsetHeight;
                textEl.style.transition = prev || '';
            } else {
                textEl.style.removeProperty('height');
            }

            button.style.display = 'none';
            button.setAttribute('aria-expanded', 'true');
            expanded = true;
        }

        function setExpandedMobile(noAnimation = false) {
            textEl.innerHTML = fullHTML;
            const h = measureHeight(fullHTML);

            if (noAnimation) {
                const prev = textEl.style.transition;
                textEl.style.transition = 'none';
                textEl.style.height = h + 'px';
                textEl.offsetHeight;
                textEl.style.transition = prev || '';
                textEl.style.removeProperty('height');
            } else {
                textEl.style.height = h + 'px';
            }

            button.textContent = 'Show less';
            button.setAttribute('aria-expanded', 'true');
            button.style.display = '';
            expanded = true;
        }

        function animateTo(nextExpanded) {
            if (animating || !isReadMoreEnabled()) return;
            animating = true;

            const startHeight = Math.ceil(textEl.getBoundingClientRect().height);

            textEl.style.height = startHeight + 'px';
            textEl.offsetHeight;

            if (nextExpanded) {
                textEl.innerHTML = fullHTML;
            } else {
                textEl.innerHTML = shortHTML;
            }

            const targetHeight = measureHeight(nextExpanded ? fullHTML : shortHTML);

            requestAnimationFrame(() => {
                textEl.style.height = targetHeight + 'px';
            });

            button.textContent = nextExpanded ? 'Show less' : 'Read more';
            button.setAttribute('aria-expanded', nextExpanded ? 'true' : 'false');

            const onEnd = (e) => {
                if (e.propertyName !== 'height') return;

                textEl.removeEventListener('transitionend', onEnd);
                animating = false;
                expanded = nextExpanded;

                if (expanded) {
                    textEl.style.removeProperty('height');
                } else {
                    textEl.style.height = measureHeight(shortHTML) + 'px';
                }

                updateSwiper(block);
            };

            textEl.addEventListener('transitionend', onEnd);
        }

        button.addEventListener('click', () => {
            if (!isReadMoreEnabled()) return;
            animateTo(!expanded);
        });

        function refreshState() {
            if (animating) return;

            if (isReadMoreEnabled()) {
                if (expanded) {
                    setExpandedMobile(true);
                } else {
                    setCollapsed(true);
                }
            } else {
                setExpandedDesktop(true);
            }

            updateSwiper(block);
        }

        setCollapsed(true);

        if ('ResizeObserver' in window) {
            const ro = new ResizeObserver(() => {
                refreshState();
            });

            ro.observe(block);
        }

        block._readMoreApi = {
            refresh() {
                refreshState();
            }
        };
    }

    function getParagraphTexts(textEl) {
        const ps = Array.from(textEl.querySelectorAll('p'));

        if (ps.length) {
            return ps.map((p) => normalizeText(p.textContent));
        }

        return [normalizeText(textEl.textContent)];
    }

    function normalizeText(str) {
        return (str || '').trim().replace(/\s+/g, ' ');
    }

    function buildTrimmedHTML(paragraphs, limit) {
        let remaining = limit;
        const result = [];

        for (let i = 0; i < paragraphs.length; i++) {
            const text = paragraphs[i];

            if (remaining <= 0) break;

            if (text.length <= remaining) {
                result.push(`<p>${escapeHtml(text)}</p>`);
                remaining -= text.length;
            } else {
                const trimmed = trimToWord(text, remaining);
                result.push(`<p>${escapeHtml(trimmed)}...</p>`);
                break;
            }
        }

        return result.join('');
    }

    function trimToWord(text, limit) {
        const sliced = text.slice(0, limit).trim();
        const lastSpace = sliced.lastIndexOf(' ');

        return lastSpace > 0
            ? sliced.slice(0, lastSpace).trim()
            : sliced;
    }

    function escapeHtml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function updateSwiper(block) {
        const swiperEl = block.closest('.swiper');

        if (swiperEl && swiperEl.swiper) {
            setTimeout(() => {
                swiperEl.swiper.updateAutoHeight?.(350);
                swiperEl.swiper.update?.();
            }, 20);
        }
    }

    //Before and after
    const sliders = document.querySelectorAll('.js-before-after');

    sliders.forEach((slider) => {
        const range = slider.querySelector('.before-after__range');
        if (!range) return;

        let isDragging = false;

        const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

        const setPosition = (value) => {
            const percent = clamp(Number(value), 0, 100);
            slider.style.setProperty('--pos', `${percent}%`);
            range.value = percent;
        };

        const updateFromClientX = (clientX) => {
            const rect = slider.getBoundingClientRect();
            const x = clamp(clientX - rect.left, 0, rect.width);
            const percent = (x / rect.width) * 100;
            setPosition(percent);
        };

        const getClientX = (e) => {
            if (e.touches && e.touches.length) return e.touches[0].clientX;
            if (e.changedTouches && e.changedTouches.length) return e.changedTouches[0].clientX;
            return e.clientX;
        };

        const startDrag = (e) => {
            isDragging = true;
            updateFromClientX(getClientX(e));
        };

        const moveDrag = (e) => {
            if (!isDragging) return;

            if (e.cancelable) {
                e.preventDefault();
            }

            updateFromClientX(getClientX(e));
        };

        const endDrag = () => {
            isDragging = false;
        };

        range.addEventListener('input', () => {
            setPosition(range.value);
        });

        range.addEventListener('change', () => {
            setPosition(range.value);
        });

        slider.addEventListener('mousedown', startDrag);
        window.addEventListener('mousemove', moveDrag);
        window.addEventListener('mouseup', endDrag);

        slider.addEventListener('touchstart', startDrag, { passive: true });
        window.addEventListener('touchmove', moveDrag, { passive: false });
        window.addEventListener('touchend', endDrag);
        window.addEventListener('touchcancel', endDrag);

        setPosition(range.value || 50);
    });

//Explore Accordion
    document.querySelectorAll('.explore-accordion').forEach((accordion) => {
        const items = accordion.querySelectorAll('.explore-accordion__item');

        items.forEach((item) => {
            const button = item.querySelector('.explore-accordion__header');
            const content = item.querySelector('.explore-accordion__content');

            button.addEventListener('click', () => {
                const isOpen = item.classList.contains('is-open');

                items.forEach((otherItem) => {
                    const otherContent = otherItem.querySelector('.explore-accordion__content');

                    if (otherItem !== item) {
                        if (otherItem.classList.contains('is-open')) {
                            otherContent.style.height = otherContent.scrollHeight + 'px';

                            requestAnimationFrame(() => {
                                otherContent.style.height = '0px';
                            });

                            otherItem.classList.remove('is-open');
                        }
                    }
                });

                if (isOpen) {
                    content.style.height = content.scrollHeight + 'px';

                    requestAnimationFrame(() => {
                        content.style.height = '0px';
                    });

                    item.classList.remove('is-open');
                } else {
                    item.classList.add('is-open');
                    content.style.height = content.scrollHeight + 'px';

                    content.addEventListener('transitionend', function handler() {
                        if (item.classList.contains('is-open')) {
                            content.style.height = 'auto';
                        }
                        content.removeEventListener('transitionend', handler);
                    });
                }
            });
        });
    });

//Models
    const root = document.querySelector('.explore-models__wrapper');
    if (!root) return;

    const stage = root.querySelector('.explore__content-stage');

    const infoWrappers = Array.from(root.querySelectorAll('.explore__info-wrapper[data-model]'));
    const productItems = Array.from(root.querySelectorAll('.explore__product-item[data-model]'));
    const nav = root.querySelector('.explore__products-nav');
    const prevBtn = root.querySelector('.product-prev');
    const nextBtn = root.querySelector('.product-next');
    const desktopMq = window.matchMedia('(min-width: 1024px)');

    let activeModel = null;
    let isAnimating = false;

    const infoMap = new Map();
    const productMap = new Map();

    infoWrappers.forEach((item) => {
        infoMap.set(item.dataset.model, item);
    });

    productItems.forEach((item) => {
        productMap.set(item.dataset.model, item);
    });

    const modelOrder = productItems
        .map(item => item.dataset.model)
        .filter(model => infoMap.has(model));

    function wait(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    function clearInfoInlineStyles(element) {
        element.style.height = '';
        element.style.transition = '';
        element.style.overflow = '';
    }

    function clearStageInlineStyles() {
        if (!stage) return;
        stage.style.height = '';
        stage.style.transition = '';
        stage.style.overflow = '';
    }

    function slideDown(element, duration = 400) {
        return new Promise((resolve) => {
            clearInfoInlineStyles(element);

            element.hidden = false;
            element.style.display = 'block';

            const targetHeight = element.scrollHeight || element.offsetHeight;

            if (!targetHeight) {
                clearInfoInlineStyles(element);
                resolve();
                return;
            }

            let finished = false;

            const finish = () => {
                if (finished) return;
                finished = true;

                element.removeEventListener('transitionend', onEnd);
                clearTimeout(fallbackTimer);

                element.style.transition = '';
                element.style.height = 'auto';
                element.style.overflow = '';
                resolve();
            };

            const onEnd = (e) => {
                if (e.target !== element) return;
                finish();
            };

            element.style.overflow = 'hidden';
            element.style.height = '0px';
            element.offsetHeight;
            element.style.transition = `height ${duration}ms ease`;
            element.style.height = `${targetHeight}px`;

            element.addEventListener('transitionend', onEnd);
            const fallbackTimer = setTimeout(finish, duration + 80);
        });
    }

    function slideUp(element, duration = 400) {
        return new Promise((resolve) => {
            clearInfoInlineStyles(element);

            const startHeight = element.scrollHeight || element.offsetHeight;

            if (!startHeight) {
                element.hidden = true;
                element.style.display = 'none';
                clearInfoInlineStyles(element);
                resolve();
                return;
            }

            let finished = false;

            const finish = () => {
                if (finished) return;
                finished = true;

                element.removeEventListener('transitionend', onEnd);
                clearTimeout(fallbackTimer);

                element.hidden = true;
                element.style.display = 'none';
                clearInfoInlineStyles(element);
                resolve();
            };

            const onEnd = (e) => {
                if (e.target !== element) return;
                finish();
            };

            element.style.overflow = 'hidden';
            element.style.height = `${startHeight}px`;
            element.offsetHeight;
            element.style.transition = `height ${duration}ms ease`;
            element.style.height = '0px';

            element.addEventListener('transitionend', onEnd);
            const fallbackTimer = setTimeout(finish, duration + 80);
        });
    }

    function switchInfoBlocks(currentEl, nextEl, duration = 400) {
        return new Promise((resolve) => {
            if (!stage) {
                clearInfoInlineStyles(currentEl);
                clearInfoInlineStyles(nextEl);

                currentEl.hidden = true;
                currentEl.style.display = 'none';

                nextEl.hidden = false;
                nextEl.style.display = 'block';

                resolve();
                return;
            }

            clearInfoInlineStyles(currentEl);
            clearInfoInlineStyles(nextEl);
            clearStageInlineStyles();

            currentEl.hidden = false;
            currentEl.style.display = 'block';

            const currentHeight = currentEl.scrollHeight || currentEl.offsetHeight;

            stage.style.height = `${currentHeight}px`;
            stage.style.overflow = 'hidden';
            stage.offsetHeight;

            nextEl.hidden = false;
            nextEl.style.display = 'block';
            nextEl.style.position = 'absolute';
            nextEl.style.visibility = 'hidden';
            nextEl.style.pointerEvents = 'none';
            nextEl.style.left = '0';
            nextEl.style.right = '0';

            const nextHeight = nextEl.scrollHeight || nextEl.offsetHeight;

            nextEl.style.position = '';
            nextEl.style.visibility = '';
            nextEl.style.pointerEvents = '';
            nextEl.style.left = '';
            nextEl.style.right = '';

            currentEl.hidden = true;
            currentEl.style.display = 'none';

            nextEl.hidden = false;
            nextEl.style.display = 'block';

            if (!nextHeight || currentHeight === nextHeight) {
                clearStageInlineStyles();
                resolve();
                return;
            }

            let finished = false;

            const finish = () => {
                if (finished) return;
                finished = true;

                stage.removeEventListener('transitionend', onEnd);
                clearTimeout(fallbackTimer);

                clearStageInlineStyles();
                resolve();
            };

            const onEnd = (e) => {
                if (e.target !== stage) return;
                finish();
            };

            stage.style.transition = `height ${duration}ms ease`;
            stage.style.height = `${nextHeight}px`;

            stage.addEventListener('transitionend', onEnd);
            const fallbackTimer = setTimeout(finish, duration + 80);
        });
    }

    function updateArrows() {
        if (!nav) return;

        const shouldShow = desktopMq.matches && !!activeModel && modelOrder.length > 1;
        nav.hidden = !shouldShow;
    }

    function resetState() {
        infoWrappers.forEach((item) => {
            item.hidden = true;
            item.style.display = 'none';
            clearInfoInlineStyles(item);
        });

        productItems.forEach((item) => {
            item.hidden = false;
            item.style.display = '';
        });

        clearStageInlineStyles();

        activeModel = null;
        updateArrows();
    }

    function scrollToExploreTop() {
        const offset = 0; // якщо є sticky header, постав сюди його висоту
        const top = root.getBoundingClientRect().top + window.pageYOffset - offset;

        window.scrollTo({
            top: Math.max(0, top),
            behavior: 'smooth'
        });
    }

    async function openModel(model, shouldScroll = false) {
        if (isAnimating) return;
        if (!infoMap.has(model) || !productMap.has(model)) return;
        if (activeModel === model) return;

        isAnimating = true;

        if (shouldScroll) {
            scrollToExploreTop();
            await wait(150);
        }

        const nextInfo = infoMap.get(model);
        const nextProduct = productMap.get(model);

        if (activeModel) {
            const currentInfo = infoMap.get(activeModel);
            const currentProduct = productMap.get(activeModel);

            currentProduct.hidden = false;
            currentProduct.style.display = '';

            nextProduct.hidden = true;
            nextProduct.style.display = 'none';

            await switchInfoBlocks(currentInfo, nextInfo);
        } else {
            nextProduct.hidden = true;
            nextProduct.style.display = 'none';

            await slideDown(nextInfo);
        }

        activeModel = model;
        updateArrows();
        isAnimating = false;
    }

    async function closeModel(model) {
        if (isAnimating) return;
        if (!infoMap.has(model) || !productMap.has(model)) return;

        isAnimating = true;

        const info = infoMap.get(model);
        const product = productMap.get(model);

        await slideUp(info);
        product.hidden = false;
        product.style.display = '';

        clearStageInlineStyles();

        if (activeModel === model) {
            activeModel = null;
        }

        updateArrows();
        isAnimating = false;
    }

    function getAdjacentModel(step) {
        if (!activeModel) return null;

        const currentIndex = modelOrder.indexOf(activeModel);
        if (currentIndex === -1) return null;

        let nextIndex = currentIndex + step;

        if (nextIndex < 0) nextIndex = modelOrder.length - 1;
        if (nextIndex >= modelOrder.length) nextIndex = 0;

        return modelOrder[nextIndex];
    }

    productItems.forEach((item) => {
        item.addEventListener('click', () => {
            if (isAnimating) return;

            const model = item.dataset.model;
            if (!model) return;

            openModel(model, true);
        });
    });

    infoWrappers.forEach((item) => {
        const closeBtns = item.querySelectorAll('.explore__btn-close, .explore__btn-hide');

        closeBtns.forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                closeModel(item.dataset.model);
            });
        });
    });

    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (!desktopMq.matches) return;

            const model = getAdjacentModel(-1);
            if (model) {
                openModel(model, true);
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (!desktopMq.matches) return;

            const model = getAdjacentModel(1);
            if (model) {
                openModel(model, true);
            }
        });
    }

    desktopMq.addEventListener('change', () => {
        clearStageInlineStyles();
        updateArrows();
    });

    resetState();
});

function initMovingBullet(swiper) {
    const pagination = swiper.pagination?.el;
    if (!pagination) return;

    let indicator = pagination.querySelector('.swiper-pagination-indicator');

    if (!indicator) {
        indicator = document.createElement('span');
        indicator.className = 'swiper-pagination-indicator';
        pagination.appendChild(indicator);
    }

    moveMovingBullet(swiper);
}

function moveMovingBullet(swiper) {
    const pagination = swiper.pagination?.el;
    if (!pagination) return;

    const activeBullet = pagination.querySelector('.swiper-pagination-bullet-active');
    const indicator = pagination.querySelector('.swiper-pagination-indicator');

    if (!activeBullet || !indicator) return;

    indicator.style.width = `${activeBullet.offsetWidth}px`;
    indicator.style.height = `${activeBullet.offsetHeight}px`;
    indicator.style.transform = `translate(${activeBullet.offsetLeft}px, ${activeBullet.offsetTop}px)`;
}

function initPainTypesSlider() {
    const section = document.querySelector('.pain-types');
    if (!section) return;

    const accordion = section.querySelector('.accordion');
    const swiperEl = section.querySelector('.pain-types-slider') || section.querySelector('.swiper');
    const paginationEl = section.querySelector('.pain-types-pagination') || section.querySelector('.swiper-pagination');
    const nextEl = section.querySelector('.pain-types-next') || section.querySelector('.swiper-button-next');
    const prevEl = section.querySelector('.pain-types-prev') || section.querySelector('.swiper-button-prev');

    if (!accordion || !swiperEl || typeof Swiper === 'undefined') return;

    const accItems = Array.from(accordion.querySelectorAll('.acc-item'));
    const accButtons = Array.from(accordion.querySelectorAll('.acc-panel-inner button'));

    function open(panel, item) {
        if (!panel || !item) return;

        item.classList.add('is-open');
        panel.style.height = panel.getBoundingClientRect().height + 'px';

        requestAnimationFrame(() => {
            panel.style.height = panel.scrollHeight + 'px';
        });

        const onEnd = (e) => {
            if (e.propertyName !== 'height') return;
            panel.removeEventListener('transitionend', onEnd);

            if (item.classList.contains('is-open')) {
                panel.style.height = 'auto';
            }
        };

        panel.addEventListener('transitionend', onEnd);
    }

    function close(panel, item) {
        if (!panel || !item) return;

        item.classList.remove('is-open');

        if (panel.style.height === 'auto' || !panel.style.height) {
            panel.style.height = panel.scrollHeight + 'px';
        } else {
            panel.style.height = panel.getBoundingClientRect().height + 'px';
        }

        requestAnimationFrame(() => {
            panel.style.height = '0px';
        });
    }

    function openOnlyItem(itemToOpen) {
        accItems.forEach((item) => {
            const panel = item.querySelector('.acc-panel');
            const isOpen = item.classList.contains('is-open');

            if (item === itemToOpen) {
                if (!isOpen) open(panel, item);
            } else {
                if (isOpen) close(panel, item);
            }
        });
    }

    function setActiveButton(activeBtn) {
        accButtons.forEach((btn) => {
            btn.classList.toggle('is-active', btn === activeBtn);
        });
    }

    function getButtonBySlide(index) {
        return accordion.querySelector(`.acc-panel-inner button[data-slide="${index}"]`);
    }

    function syncActiveSlideVideo(swiper) {
        swiper.slides.forEach((slide, index) => {
            const videos = slide.querySelectorAll('video');

            videos.forEach((video) => {
                if (index === swiper.activeIndex) {
                    const playPromise = video.play();
                    if (playPromise && typeof playPromise.catch === 'function') {
                        playPromise.catch(() => {});
                    }
                } else {
                    video.pause();
                    video.currentTime = 0;
                }
            });
        });
    }

    function resetFlippedOnInactiveSlides(swiper) {
        swiper.slides.forEach((slide, index) => {
            if (index !== swiper.activeIndex) {
                slide.querySelectorAll('.js-flip-card.is-flipped').forEach((card) => {
                    card.classList.remove('is-flipped');
                });
            }
        });
    }

    const painSwiper = swiperEl.swiper || new Swiper(swiperEl, {
        slidesPerView: 1,
        spaceBetween: 0,
        effect: 'fade',
        fadeEffect: {
            crossFade: true
        },
        speed: 500,
        autoHeight: true,
        navigation: {
            nextEl,
            prevEl
        },
        pagination: {
            el: paginationEl,
            clickable: true
        },
        on: {
            init(swiper) {
                requestAnimationFrame(() => {
                    initMovingBullet(swiper);
                    syncActiveSlideVideo(swiper);
                    resetFlippedOnInactiveSlides(swiper);
                });
            }
        }
    });

    function activateButton(button, slideSpeed = 500) {
        if (!button) return;

        const item = button.closest('.acc-item');
        const slideIndex = parseInt(button.dataset.slide, 10);

        if (!item || Number.isNaN(slideIndex)) return;

        openOnlyItem(item);
        setActiveButton(button);

        if (painSwiper.activeIndex !== slideIndex) {
            painSwiper.slideTo(slideIndex, slideSpeed);
        } else {
            moveMovingBullet(painSwiper);
            syncActiveSlideVideo(painSwiper);
            resetFlippedOnInactiveSlides(painSwiper);
        }
    }

    function syncAccordionWithSlide(slideIndex) {
        const button = getButtonBySlide(slideIndex);
        if (!button) return;

        const item = button.closest('.acc-item');
        openOnlyItem(item);
        setActiveButton(button);
    }

    accordion.querySelectorAll('.acc-item.is-open .acc-panel').forEach((panel) => {
        panel.style.height = 'auto';
    });

    accordion.addEventListener('click', (e) => {
        const button = e.target.closest('.acc-panel-inner button');

        if (button && accordion.contains(button)) {
            e.preventDefault();
            e.stopPropagation();
            activateButton(button);
            return;
        }

        const trigger = e.target.closest('.acc-trigger');

        if (trigger && accordion.contains(trigger)) {
            e.preventDefault();

            const item = trigger.closest('.acc-item');
            if (!item) return;

            if (item.classList.contains('is-open')) return;

            const firstButton = item.querySelector('.acc-panel-inner button');
            activateButton(firstButton);
        }
    });

    painSwiper.on('slideChange', function () {
        syncAccordionWithSlide(this.activeIndex);

        requestAnimationFrame(() => {
            moveMovingBullet(this);
            syncActiveSlideVideo(this);
            resetFlippedOnInactiveSlides(this);
        });
    });

    painSwiper.on('resize', function () {
        requestAnimationFrame(() => {
            moveMovingBullet(this);
        });
    });

    painSwiper.on('paginationUpdate', function () {
        requestAnimationFrame(() => {
            moveMovingBullet(this);
        });
    });

    const initialOpenItem = accordion.querySelector('.acc-item.is-open') || accItems[0];
    const initialButton = initialOpenItem?.querySelector('.acc-panel-inner button');

    if (initialButton) {
        activateButton(initialButton, 0);
    } else {
        requestAnimationFrame(() => {
            initMovingBullet(painSwiper);
            syncActiveSlideVideo(painSwiper);
            resetFlippedOnInactiveSlides(painSwiper);
        });
    }
}

function initReviewsSlider() {
    const reviewsSwiperEl = document.querySelector('.swiper-reviews');
    if (!reviewsSwiperEl || typeof Swiper === 'undefined') return;

    const reviewsSection = reviewsSwiperEl.closest('.reviews') || reviewsSwiperEl.parentElement;
    const reviewsNav = reviewsSection?.querySelector('.reviews-nav');

    const reviewsPaginationEl = reviewsNav?.querySelector('.swiper-pagination');
    const reviewsNextEl = reviewsNav?.querySelector('.reviews-next');
    const reviewsPrevEl = reviewsNav?.querySelector('.reviews-prev');

    const reviewsSwiper = reviewsSwiperEl.swiper || new Swiper(reviewsSwiperEl, {
        slidesPerView: 1,
        spaceBetween: 0,
        effect: 'fade',
        fadeEffect: {
            crossFade: true
        },
        speed: 500,
        autoHeight: true,
        navigation: {
            nextEl: reviewsNextEl,
            prevEl: reviewsPrevEl
        },
        pagination: {
            el: reviewsPaginationEl,
            clickable: true
        },
        on: {
            init(swiper) {
                requestAnimationFrame(() => {
                    initMovingBullet(swiper);
                });
            }
        }
    });

    reviewsSwiper.on('slideChange', function () {
        requestAnimationFrame(() => {
            moveMovingBullet(this);
        });
    });

    reviewsSwiper.on('resize', function () {
        requestAnimationFrame(() => {
            moveMovingBullet(this);
        });
    });

    reviewsSwiper.on('paginationUpdate', function () {
        requestAnimationFrame(() => {
            moveMovingBullet(this);
        });
    });
}

//Choose slider
function initChooseSlider() {
    const chooseSwiperEl = document.querySelector('.swiper-choose');
    if (!chooseSwiperEl || typeof Swiper === 'undefined') return;

    const chooseNav = chooseSwiperEl.querySelector('.choose-nav') || chooseSwiperEl.parentElement?.querySelector('.choose-nav');
    const choosePaginationEl = chooseNav?.querySelector('.swiper-pagination');
    const chooseNextEl = chooseNav?.querySelector('.choose-next');
    const choosePrevEl = chooseNav?.querySelector('.choose-prev');

    const chooseSwiper = chooseSwiperEl.swiper || new Swiper(chooseSwiperEl, {
        slidesPerView: 'auto',
        slidesPerGroup: 1,
        spaceBetween: 10,
        speed: 500,
        navigation: {
            nextEl: chooseNextEl,
            prevEl: choosePrevEl
        },
        pagination: {
            el: choosePaginationEl,
            clickable: true
        },
        breakpoints: {
            768: {
                spaceBetween: 0
            }
        },
        on: {
            init(swiper) {
                requestAnimationFrame(() => {
                    initMovingBullet(swiper);
                });
            }
        }
    });

    chooseSwiper.on('slideChange', function () {
        requestAnimationFrame(() => {
            moveMovingBullet(this);
        });
    });

    chooseSwiper.on('resize', function () {
        requestAnimationFrame(() => {
            moveMovingBullet(this);
        });
    });

    chooseSwiper.on('paginationUpdate', function () {
        requestAnimationFrame(() => {
            moveMovingBullet(this);
        });
    });
}

//Supporters
function initSupportersSlider() {
    const supportersSwiperEl = document.querySelector('.supporters-swiper');
    if (!supportersSwiperEl || typeof Swiper === 'undefined') return;

    const supportersSection = supportersSwiperEl.closest('.supporters') || supportersSwiperEl.parentElement;
    const supportersNav = supportersSection?.querySelector('.supporters-nav');

    const supportersPaginationEl = supportersNav?.querySelector('.swiper-pagination');
    const supportersNextEl = supportersNav?.querySelector('.supporters-next');
    const supportersPrevEl = supportersNav?.querySelector('.supporters-prev');

    const supportersSwiper = supportersSwiperEl.swiper || new Swiper(supportersSwiperEl, {
        slidesPerView: 'auto',
        slidesPerGroup: 1,
        spaceBetween: 16,
        speed: 500,
        watchOverflow: true,
        navigation: {
            nextEl: supportersNextEl,
            prevEl: supportersPrevEl
        },
        pagination: {
            el: supportersPaginationEl,
            clickable: true
        },
        breakpoints: {
            1024: {
                spaceBetween: 40,
            },
        },
        on: {
            init(swiper) {
                requestAnimationFrame(() => {
                    initMovingBullet(swiper);
                });
            }
        }
    });

    supportersSwiper.on('slideChange', function () {
        requestAnimationFrame(() => {
            moveMovingBullet(this);
        });
    });

    supportersSwiper.on('resize', function () {
        requestAnimationFrame(() => {
            moveMovingBullet(this);
        });
    });

    supportersSwiper.on('paginationUpdate', function () {
        requestAnimationFrame(() => {
            moveMovingBullet(this);
        });
    });
}

//Video reviews slider
function initVideoReviewsSlider() {
    const videoReviewsSwiperEl = document.querySelector('.swiper-video-reviews');
    if (!videoReviewsSwiperEl || typeof Swiper === 'undefined') return;

    const videoReviewsSection = videoReviewsSwiperEl.closest('.video-reviews') || videoReviewsSwiperEl.parentElement;
    const videoReviewsNav = videoReviewsSection?.querySelector('.video-reviews-nav');

    const videoReviewsPaginationEl = videoReviewsNav?.querySelector('.swiper-pagination');
    const videoReviewsNextEl = videoReviewsNav?.querySelector('.video-reviews-next');
    const videoReviewsPrevEl = videoReviewsNav?.querySelector('.video-reviews-prev');

    const videoReviewsSwiper = videoReviewsSwiperEl.swiper || new Swiper(videoReviewsSwiperEl, {
        slidesPerView: 'auto',
        slidesPerGroup: 1,
        spaceBetween: 16,
        speed: 500,
        watchOverflow: true,
        navigation: {
            nextEl: videoReviewsNextEl,
            prevEl: videoReviewsPrevEl
        },
        pagination: {
            el: videoReviewsPaginationEl,
            clickable: true
        },
        breakpoints: {
            1024: {
                spaceBetween: 32,
            },
        },
        on: {
            init(swiper) {
                requestAnimationFrame(() => {
                    initMovingBullet(swiper);
                });
            }
        }
    });

    videoReviewsSwiper.on('slideChange', function () {
        requestAnimationFrame(() => {
            moveMovingBullet(this);
        });
    });

    videoReviewsSwiper.on('resize', function () {
        requestAnimationFrame(() => {
            moveMovingBullet(this);
        });
    });

    videoReviewsSwiper.on('paginationUpdate', function () {
        requestAnimationFrame(() => {
            moveMovingBullet(this);
        });
    });
}