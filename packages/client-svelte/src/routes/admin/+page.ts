import { redirect } from '@sveltejs/kit';

export async function load(event) {
	const data = await event.parent();
	if (!data) throw redirect(302, '/login');
}
