import { searchTags } from '$lib/api/gallery';

export async function load(event) {
	const tag = event.url.searchParams.get('q') ?? '';
	const images = await searchTags(event, tag);
	return { images, tag };
}
