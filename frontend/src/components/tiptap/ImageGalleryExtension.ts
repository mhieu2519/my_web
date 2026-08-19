import { Node, mergeAttributes } from '@tiptap/core';

export interface ImageGalleryOptions {
    HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        imageGallery: {
            insertImageGallery: (images: string[]) => ReturnType;
        };
    }
}

export const ImageGallery = Node.create<ImageGalleryOptions>({
    name: 'imageGallery',
    group: 'block',
    atom: true,

    addOptions() {
        return { HTMLAttributes: {} };
    },

    addAttributes() {
        return {
            images: {
                default: [],
                parseHTML: (element) => {
                    const raw = element.getAttribute('data-images');
                    try {
                        return raw ? JSON.parse(raw) : [];
                    } catch {
                        return [];
                    }
                },
                renderHTML: (attributes) => ({
                    'data-images': JSON.stringify(attributes.images || []),
                }),
            },
        };
    },

    parseHTML() {
        return [{ tag: 'div.post-gallery' }];
    },

    renderHTML({ HTMLAttributes, node }) {
        const images: string[] = node.attrs.images || [];
        return [
            'div',
            mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { class: 'post-gallery' }),
            ...images.map((src) => ['img', { src, loading: 'lazy', alt: '' }]),
        ] as any;
    },

    addCommands() {
        return {
            insertImageGallery:
                (images: string[]) =>
                    ({ commands }: any) => {
                        return commands.insertContent({ type: this.name, attrs: { images } });
                    },
        };
    },
});