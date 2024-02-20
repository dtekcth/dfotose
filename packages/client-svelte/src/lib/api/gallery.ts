export type ListResponse<T, F extends string = 'data'> = {
	total: number;
} & Record<F, T[]>;

export interface Gallery {
	_id: string;
	name: string;
	description?: string;
	published: boolean;
	shootDate: string;
	created_at: string;
}

export interface Image {
	_id: string;
	isGalleryThumbnail: true;
	tags: [];
	filename: string;
	author?: string;
	authorCid: string;
	galleryId: string;
	thumbnail: string;
	preview: string;
	fullSize: string;
	shotAt: string;
	exifData: unknown;
}

export async function getGalleies(
	event: { fetch: typeof globalThis.fetch },
	page?: number,
	limit?: number,
	status?: 'published' | 'unpublished' | 'all'
): Promise<ListResponse<Gallery, 'galleries'>> {
	const params = new URLSearchParams();
	if (page) params.append('page', page.toString());
	if (limit) params.append('limit', limit.toString());
	if (status) params.append('status', status);

	const res = await event.fetch(`/v1/gallery?${params.toString()}`);
	return await res.json();
}

export async function getGallery(
	event: { fetch: typeof globalThis.fetch },
	id: string
): Promise<Gallery> {
	const res = await event.fetch(`/v1/gallery/${id}`);
	return await res.json();
}

export async function getImagesInGallery(
	event: { fetch: typeof globalThis.fetch },
	id: string
): Promise<Image[]> {
	const res = await event.fetch(`/v1/image/${id}`);
	return await res.json();
}

export async function addTag(imageId: string, tag: string): Promise<void> {
	await fetch(`/v1/image/${imageId}/tags`, {
		method: 'POST',
		body: JSON.stringify({ tagName: tag })
	});
}

export async function searchTags(
	event: { fetch: typeof globalThis.fetch },
	query: string
): Promise<Image[]> {
	const res = await event.fetch(`/v1/image/tags/${query}/search`);
	return await res.json();
}

export async function deleteGallery(
	event: { fetch: typeof globalThis.fetch },
	gallery: Gallery
): Promise<void> {
	await event.fetch(`/v1/gallery/${gallery._id}`, { method: 'DELETE' });
}

export async function createGallery(
	event: { fetch: typeof globalThis.fetch },
	data: { name: string; description: string; date: string }
) {
	const res = await event.fetch('/v1/gallery', {
		method: 'POST',
		body: JSON.stringify(data)
	});
	return await res.json();
}

export async function setPublished(
	event: { fetch: typeof globalThis.fetch },
	gallery: Gallery,
	published: boolean
) {
	const route = published ? 'publish' : 'unpublish';
	await event.fetch(`/v1/gallery/${gallery._id}/${route}`, {
		method: 'POST'
	});
}

export async function updateGallery(
	event: { fetch: typeof globalThis.fetch },
	galleryId: string,
	gallery: Omit<Gallery, '_id' | 'published' | 'created_at'>
) {
	await event.fetch(`/v1/gallery/${galleryId}`, {
		method: 'PUT',
		body: JSON.stringify(gallery)
	});
}
