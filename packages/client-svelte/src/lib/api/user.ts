export interface User {
	_id: string;
	cid: string;
	name: string;
	fullname: string;
	dfotoMember: boolean;
	role: string;
	created_at: string;
}

export interface EligibleUser {
	cid: string;
	role: string;
}

export async function getUser(event: { fetch: typeof globalThis.fetch }): Promise<User | null> {
	const res = await event.fetch('/auth/user');
	if (!res.ok) return null;
	return await res.json();
}

export async function getUsers(event: { fetch: typeof globalThis.fetch }): Promise<User[]> {
	const res = await event.fetch('/auth/users');
	return await res.json();
}

export async function getEligibleUsers(event: {
	fetch: typeof globalThis.fetch;
}): Promise<EligibleUser[]> {
	const res = await event.fetch('/v1/user/eligible');
	return await res.json();
}

export async function createEligibleUser(
	event: {
		fetch: typeof globalThis.fetch;
	},
	user: EligibleUser
): Promise<void> {
	await event.fetch('/v1/user/eligible', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(user)
	});
}

export async function deleteEligibleUser(
	event: {
		fetch: typeof globalThis.fetch;
	},
	user: EligibleUser
): Promise<void> {
	await event.fetch(`/v1/user/eligible/${user.cid}`, {
		method: 'DELETE'
	});
}

export async function updateUser(
	event: { fetch: typeof globalThis.fetch },
	user: User
): Promise<void> {
	await event.fetch(`/auth/user/${user.cid}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(user)
	});
}

export async function loginUser(
	event: { fetch: typeof globalThis.fetch },
	cid: string,
	password: string
): Promise<User> {
	const res = await event.fetch('/auth/login', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ cid, password })
	});
	return await res.json();
}

export async function changeName(
	event: { fetch: typeof globalThis.fetch },
	user: User,
	name: string
): Promise<void> {
	await event.fetch(`/auth/user/${user.cid}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ fullname: name })
	});
}

export async function logoutUser(event: { fetch: typeof globalThis.fetch }): Promise<void> {
	await event.fetch('/auth/logout');
}
