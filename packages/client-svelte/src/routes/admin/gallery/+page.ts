import { getGalleies } from '$lib/api/gallery.js';

export async function load(event) {
	event.depends('admin:galleries');
	const published = getGalleies(event, undefined, undefined, 'published');
	const unpublished = getGalleies(event, undefined, undefined, 'unpublished');

	return {
		published,
		unpublished
	};
}
