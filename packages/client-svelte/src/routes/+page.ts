import { getGalleies } from '$lib/api/gallery';

export async function load(event) {
	const data = await getGalleies(event);
	return data;
}
