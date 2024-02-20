<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { loginUser } from '$lib/api/user';

	let username = '';
	let password = '';

	async function login(event: Event) {
		event.preventDefault();

		const user = await loginUser({ fetch }, username, password);
		invalidate('app:user');

		if (user?.role !== 'None') {
			goto('/admin');
		} else {
			goto('/');
		}
	}
</script>

<div class="login-content">
	<form on:submit={login}>
		<input
			type="text"
			class="u-full-width"
			name="username"
			placeholder="CID"
			bind:value={username}
		/>
		<input
			type="password"
			class="u-full-width"
			name="password"
			placeholder="Lösenord"
			bind:value={password}
		/>

		<button type="submit">Logga In</button>
	</form>
</div>
