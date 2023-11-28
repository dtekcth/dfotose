import { getGallery, getImagesInGallery } from '$lib/api/gallery.js';

export async function load(event) {
	const gallery = getGallery(event, event.params.id);
	const images = getImagesInGallery(event, event.params.id);
	return { gallery, images };
}
