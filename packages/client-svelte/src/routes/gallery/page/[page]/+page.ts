import { getGalleies } from '$lib/api/gallery';

export async function load(event) {
	const data = await getGalleies(event, Number(event.params.page));
	return {
		...data,
		page: Number(event.params.page)
	};
}
