<script lang="ts">
	import type { Gallery } from '$lib/api/gallery';
	import { createEventDispatcher } from 'svelte';

	export let gallery: Gallery;
	const dispatch = createEventDispatcher();

	$: editLink = `/admin/gallery/edit/${gallery._id}`;
</script>

<a href={editLink}>
	<li>
		<div>
			<p class="name">{gallery.name}</p>
			<p>{gallery.description}</p>
		</div>
		<button type="button" class="button button-danger" on:click={() => dispatch('delete')}>
			Ta bort
		</button>
	</li>
</a>
