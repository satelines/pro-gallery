
import { createLayout } from 'pro-layouts';
import { addPresetStyles } from 'pro-gallery-lib';
import addLayoutStyles from '../helpers/layoutHelper';

export const createLayoutFixer = () => {
    const convertDtoToLayoutItem = (dto) => {
        const isLayoutItem = !!(dto.id && dto.width > 0 && dto.height > 0);
        if (isLayoutItem) {
            return dto;
        } else {
            const metadata = dto.metadata || dto.metaData;
            return {
            id: dto.itemId || dto.photoId,
            width: metadata.width,
            height: metadata.height,
            ...dto,
            };
        }
    }

    const setAttributes = (node, attributes) =>
        node &&
        attributes &&
        Object.keys(attributes).forEach((attr) =>
            node.setAttribute(attr, attributes[attr]),
        );

    const setStyle = (node, styleProperties) =>
        node &&
        styleProperties &&
        Object.keys(styleProperties).forEach((prop) => {
            const propValue = styleProperties[prop];
            if (propValue !== undefined) {
                node.style[prop] = propValue;
            } else {
                node.style.removeProperty(prop);
            }
        });

    const getItemWrapperStyle = (item, styleParams) => ({
        width: item.width + 'px',
        height: item.height + (styleParams.externalInfoHeight || 0) + 'px'
    })

    const getItemContainerStyle = (item, styleParams) => {
        const itemWrapperStyles = getItemWrapperStyle(item, styleParams)
        const { isRTL } = styleParams
        return {
            opacity: 1,
            transition: 'opacity .8s ease',
            top: item.offset.top + 'px',
            left: isRTL ? 'auto' : item.offset.left + 'px',
            right: !isRTL ? 'auto' : item.offset.left + 'px',
            ...itemWrapperStyles
        }
    }

    const createWebComponent = () => {
        if (window.layoutFixerCreated === true) {
            return;
        }
        window.layoutFixerCreated = true;
        console.log('[LAYOUT FIXER] createWebComponent');
        class LayoutFixerElement extends HTMLElement {
            constructor() {
                super();
                this.retries = 3;
                this.connectedCallback = this.connectedCallback.bind(this);
            }

            retry() {
                if (this.retries > 0) {
                    this.retries--;
                    console.log('[LAYOUT FIXER] retrying...', this.retries);
                    window.requestAnimationFrame(this.connectedCallback);
                } else {
                    console.log('[LAYOUT FIXER] reached retries limit');
                }
            }

            connectedCallback() {
                if (this.setStylesDone) {
                    return;
                }
                console.log('[LAYOUT FIXER] connectedCallback');
                this.parentId = this.getAttribute('parentid');
                this.parent = document.getElementById(this.parentId);
                if (!this.parent) {
                    console.log('[LAYOUT FIXER] no parent found', this.parent);
                    this.retry();
                    return;
                } else {
                    console.log('[LAYOUT FIXER] parent found', this.parent);
                }

                this.useLayouter = true
                this.items = JSON.parse(this.getAttribute('items')).map(convertDtoToLayoutItem);
                if (!(this.items && this.items.length > 0)) {
                    this.useLayouter = false
                }

                this.styleParams = addLayoutStyles(addPresetStyles(JSON.parse(this.getAttribute('styles'))));
                
                if (!(this.styleParams && typeof this.styleParams === 'object')) {
                    this.useLayouter = false
                }

                const {width, height, top} = this.parent && this.parent.getBoundingClientRect();
                this.measures = {
                    top,
                    width,
                    height,
                    galleryWidth: width,
                    galleryHeight: height,
                    scrollBase: top,
                };
                console.log('[LAYOUT FIXER] measured container', this.measures);
               
                if (this.measures && this.useLayouter && typeof createLayout === 'function') {
                    this.layout = createLayout({
                        items: this.items,
                        styleParams: this.styleParams,
                        container: this.measures
                    })
                    console.log('[LAYOUT FIXER] created layout', this.layout);
                }

                if (typeof this.measures === 'object') {
                    setAttributes(this.parent, {
                        'data-top': this.measures.top,
                        'data-width': this.measures.width,
                        'data-height': this.measures.height
                    })
                }

                if (this.useLayouter && this.layout && this.layout.items && this.layout.items.length > 0) {
                    this.parent.querySelectorAll('.gallery-item-container').forEach((element, idx) => {
                        !idx && console.log('[LAYOUT FIXER] set first Container Style', idx, getItemContainerStyle(this.layout.items[idx], this.styleParams));
                        setStyle(element, getItemContainerStyle(this.layout.items[idx], this.styleParams))
                    })
                    this.parent.querySelectorAll('.gallery-item-wrapper').forEach((element, idx) => {
                        !idx && console.log('[LAYOUT FIXER] set first Wrapper Style', idx, getItemWrapperStyle(this.layout.items[idx], this.styleParams));
                        setStyle(element, getItemWrapperStyle(this.layout.items[idx], this.styleParams))
                    })
                    this.setStylesDone = true;
                    console.log('[LAYOUT FIXER] Done');
                    console.timeEnd('[LAYOUT FIXER] Done');
                }
            }
        }
        window.customElements.define('layout-fixer', LayoutFixerElement);

    }

    if (typeof window !== 'undefined') {
        try {
            console.log('[LAYOUT FIXER] start (script is running)');
            createWebComponent()
        } catch (e) {
            console.error('Cannot create layout fixer', e);
        }
    }
}