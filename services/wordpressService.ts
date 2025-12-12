import type { WordPressConfig, GeneratedPost } from '../types';

const base64ToBlob = (base64Data: string, mimeType: string): Blob => {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
};


const getAuthHeader = (config: WordPressConfig): string => {
    return 'Basic ' + btoa(`${config.username}:${config.password}`);
};

export const validateWordPressCredentials = async (config: WordPressConfig): Promise<{ isValid: boolean, error?: string }> => {
    if (!config.url || !config.username || !config.password) {
        return { isValid: false, error: 'All fields are required.' };
    }
    try {
        const url = new URL(config.url);
        const apiUrl = `${url.origin}/wp-json/wp/v2/users/me`;

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: { 'Authorization': getAuthHeader(config) }
        });

        if (response.ok) {
            return { isValid: true };
        } else {
            if (response.status === 401) {
                return { isValid: false, error: 'Authentication failed. Check username and Application Password.' };
            }
            const errorData = await response.json().catch(() => null);
            return { isValid: false, error: `Validation failed (${response.status}): ${errorData?.message || 'Could not connect. Check URL and CORS settings.'}` };
        }
    } catch (e: any) {
        return { isValid: false, error: `Network error: ${e.message}. Ensure the URL is correct and accessible.` };
    }
};

const uploadImageToWordPress = async (imageUrl: string, config: WordPressConfig): Promise<number> => {
    const url = new URL(config.url);
    const apiUrl = `${url.origin}/wp-json/wp/v2/media`;

    const [meta, base64] = imageUrl.split(',');
    if (!meta || !base64) throw new Error("Invalid image data format.");
    
    const mimeMatch = meta.match(/:(.*?);/);
    if (!mimeMatch) throw new Error("Could not determine image MIME type.");
    const mimeType = mimeMatch[1];
    const extension = mimeType.split('/')[1] || 'jpg';

    const blob = base64ToBlob(base64, mimeType);
    const formData = new FormData();
    formData.append('file', blob, `ai-generated-image-${Date.now()}.${extension}`);

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Authorization': getAuthHeader(config) },
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Image upload failed (${response.status}): ${errorData.message}`);
    }

    const mediaDetails = await response.json();
    return mediaDetails.id;
};

export const publishPostToWordPress = async (post: GeneratedPost, variationIndex: number, config: WordPressConfig): Promise<string> => {
    if (!post.imageDataUrl) throw new Error('Post has no image data to publish.');
    
    const url = new URL(config.url);
    const apiUrl = `${url.origin}/wp-json/wp/v2/posts`;
    const variation = post.variations[variationIndex];
    
    // 1. Upload image and get media ID
    const featuredMediaId = await uploadImageToWordPress(post.imageDataUrl, config);

    // 2. Combine content for publishing
    const allHashtags = [
        ...(post.hashtag_strategy?.core || []),
        ...(post.hashtag_strategy?.niche || []),
        ...(post.hashtag_strategy?.trending || []),
    ].join(' ');

    const postContent = `
        ${variation.post_text}
        <br><br>
        <p><em>${variation.call_to_action}</em></p>
        <br>
        <p>${allHashtags}</p>
    `.trim();

    // 3. Create the post
    const postData = {
        title: variation.post_title,
        content: postContent,
        status: 'draft', // Publish as draft by default
        featured_media: featuredMediaId,
    };

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Authorization': getAuthHeader(config),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Post creation failed (${response.status}): ${errorData.message}`);
    }

    const newPost = await response.json();
    return newPost.link; // URL to the created post
};