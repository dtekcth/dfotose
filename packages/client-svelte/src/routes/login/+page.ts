import { redirect } from '@sveltejs/kit';

export async function load(event) {
	const parent = await event.parent();
	if (parent.user && parent.user.role != 'None') {
		throw redirect(302, '/');
	}
}
