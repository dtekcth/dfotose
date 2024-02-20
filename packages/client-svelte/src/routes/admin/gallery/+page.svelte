<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { deleteGallery, type Gallery } from '$lib/api/gallery';
	import GalleryView from './gallery-view.svelte';

	export let data;

	let publishedSearch = '';

	$: total = data.published.total + data.unpublished.total;
	$: publishedSearched = data.published.galleries.filter((gallery) =>
		gallery.name.toLowerCase().includes(publishedSearch.toLowerCase())
	);

	async function onDeleteGallery(gallery: Gallery) {
		if (!confirm(`Är du säker på att du vill ta bort galleriet ${gallery.name}?`)) return;
		await deleteGallery({ fetch }, gallery);
		await invalidate('admin:galleries');
	}
</script>

<div>
	<h4>Gallerier</h4>
	<a href="/admin/gallery/new"> Skapa nytt galleri </a>

	<div>
		<p>Totalt {total} gallerier.</p>
		<h3>Opublicerade gallerier ({data.unpublished.total} st)</h3>
		<ul class="editable-gallery-list">
			{#each data.unpublished.galleries as gallery (gallery._id)}
				<GalleryView {gallery} on:delete={() => onDeleteGallery(gallery)}></GalleryView>
			{/each}
		</ul>

		<h3>Publicerade gallerier ({data.published.total} st)</h3>
		<div>
			Sök:
			<input
				class="u-full-width"
				type="text"
				placeholder="sök bland publicerade gallerier"
				bind:value={publishedSearch}
			/>
		</div>
		<ul class="editable-gallery-list">
			{#each publishedSearched as gallery (gallery._id)}
				<GalleryView {gallery} on:delete={() => onDeleteGallery(gallery)}></GalleryView>
			{/each}
		</ul>
	</div>
</div>
