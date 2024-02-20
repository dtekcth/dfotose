<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { json } from '$lib';
	import { setPublished, updateGallery } from '$lib/api/gallery';
	import GalleryImagesView from './gallery-images-view.svelte';

	export let data;

	$: shootDate = new Date(data.gallery.shootDate).toISOString().split('T')[0];

	$: console.log(data.gallery);

	async function onSave(form: { name: string; description: string; shootDate: string }) {
		updateGallery({ fetch }, data.gallery._id, form);
		await invalidate('admin:galleries');
	}

	async function onPublishToggle() {
		await setPublished({ fetch }, data.gallery, !data.gallery.published);
		await invalidate('admin:galleries');
	}
</script>

<div>
	<form use:json={onSave}>
		<h4>Ändrar galleri: {data.gallery._id}</h4>
		<label for="name">Namn på galleri:</label>
		<input
			id="name"
			name="name"
			class="u-full-width"
			type="text"
			value={data.gallery.name}
			placeholder="namn"
		/>

		<label for="description">Beskrivning utav gallery:</label>
		<textarea
			id="description"
			name="description"
			class="u-full-width"
			value={data.gallery.description}
		/>

		<label for="shootDate">Datum för galleri:</label>
		<input
			id="shootDate"
			name="shootDate"
			class="u-full-width"
			type="date"
			value={shootDate}
			placeholder="yyyy-mm-dd"
		/>

		<button type="submit" class="button-primary">Spara</button>
		<a href="/admin/gallery">Tillbaka</a>

		<br />
		<button type="button" class="button-primary" on:click={onPublishToggle}>
			{data.gallery.published ? 'Publicera' : 'O-Publicera'}
		</button>
	</form>
	<hr />
	<GalleryImagesView gallery={data.gallery} images={data.images} />
</div>
