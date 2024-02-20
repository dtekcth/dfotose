<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { json } from '$lib';
	import { changeName, logoutUser } from '$lib/api/user.js';

	export let data;

	let saveSuccess = false;

	async function changeNameSubmit(form: { fullname: string }) {
		data.user && (await changeName({ fetch }, data.user, form.fullname));
		saveSuccess = true;
		invalidate('app:user');
	}

	function logout() {
		logoutUser({ fetch });
		invalidate('app:user');
		goto('/');
	}
</script>

<div>
	<p>Välkommen {data.user?.cid}.</p>

	<form use:json={changeNameSubmit}>
		<label for="fullname">Ditt namn:</label>
		<input id="fullname" name="fullname" type="text" value={data.user?.fullname} />
		<button type="submit">Spara</button>
		{#if saveSuccess}
			<span>Sparat!</span>
		{/if}
		<p>
			Det är detta namnet som syns på dina bilder, om du inte har satt något namn syns ditt cid.
		</p>
	</form>
	<button on:click={logout}>Logga ut</button>
	<hr />
	<a href="/admin/gallery">
		<button type="button">Hantera gallerier</button>
	</a>
	<a href="/admin/members">
		<button type="button">Hantera medlemmar</button>
	</a>
</div>
