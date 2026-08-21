import sanitizeHtml from 'sanitize-html';

// Dùng cho nội dung bài viết (content) — cho phép các thẻ định dạng cơ bản mà tiptap tạo ra
export function sanitizePostContent(html: string): string {
    return sanitizeHtml(html, {
        allowedTags: [
            'p', 'br', 'strong', 'em', 'u', 's', 'blockquote',
            'h1', 'h2', 'h3', 'h4',
            'ul', 'ol', 'li',
            'a', 'img', 'div', 'span', 'figure', 'figcaption',
            'pre', 'code',
        ],
        allowedAttributes: {
            a: ['href', 'target', 'rel'],
            img: ['src', 'alt', 'loading'],
            div: ['class', 'data-images'],
            '*': ['class'],
        },
        allowedSchemes: ['http', 'https', 'data'],
        disallowedTagsMode: 'discard', // thẻ không nằm trong allowedTags sẽ bị loại bỏ hoàn toàn, không giữ lại nội dung con dưới dạng text lộn xộn... thực ra mặc định 'discard' vẫn giữ text bên trong, chỉ bỏ thẻ — đúng ý muốn
        transformTags: {
            a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer nofollow', target: '_blank' }),
        },
    });
}

// Dùng cho các trường text thuần (excerpt, coverCaption...) — không cho bất kỳ thẻ HTML nào
export function sanitizePlainText(input: string): string {
    return sanitizeHtml(input, { allowedTags: [], allowedAttributes: {} });
}