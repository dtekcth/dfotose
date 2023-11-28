<script lang="ts">
	import { goto } from '$app/navigation';
	import GalleryViewer from '$lib/components/gallery-viewer.svelte';

	export let data;

	const page = 1;

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowLeft') {
			goto(`/gallery/page/${page - 1}`);
		} else if (event.key === 'ArrowRight') {
			goto(`/gallery/page/${page + 1}`);
		}
	}
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div on:keydown={handleKeydown}>
	<div class="gallery-list">
		{#each data.galleries as gallery (gallery._id)}
			<GalleryViewer {gallery} />
		{/each}
	</div>
	<div class="gallery-pagination">
		<a href="#">Föregående</a>
		<span>
			sida 1 / {data.total}
		</span>
		<a href="/gallery/page/2">Nästa</a>
	</div>
</div>
