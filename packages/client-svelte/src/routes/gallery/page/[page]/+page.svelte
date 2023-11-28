<script lang="ts">
	import { goto } from '$app/navigation';
	import GalleryViewer from '$lib/components/gallery-viewer.svelte';

	export let data;

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowLeft') {
			goto(`/gallery/page/${data.page - 1}`);
		} else if (event.key === 'ArrowRight') {
			goto(`/gallery/page/${data.page + 1}`);
		}
	}
</script>

<svelte:document on:keydown={handleKeydown} />

<div>
	<div class="gallery-list">
		{#each data.galleries as gallery (gallery._id)}
			<GalleryViewer {gallery} />
		{/each}
	</div>
	<div class="gallery-pagination">
		<a href="/gallery/page/{data.page - 1}">Föregående</a>
		<span>
			sida {data.page} / {data.total}
		</span>
		<a href="/gallery/page/{data.page + 1}">Nästa</a>
	</div>
</div>
