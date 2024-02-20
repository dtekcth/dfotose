import { getEligibleUsers, getUsers } from '$lib/api/user.js';

export async function load(event) {
	const users = getUsers(event);
	const eligibleUsers = getEligibleUsers(event);

	event.depends('app:eligibleUsers');

	return {
		users,
		eligibleUsers
	};
}
