import { getUser } from '$lib/api/user.js';

export const ssr = false;

export async function load(event) {
	const user = await getUser(event);
	event.depends('app:user');
	return {
		user
	};
}
