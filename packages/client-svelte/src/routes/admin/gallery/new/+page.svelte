<script lang="ts">
	import { goto } from '$app/navigation';
	import { json } from '$lib';
	import { createGallery } from '$lib/api/gallery.js';

	async function onSave(data: { name: string; description: string; date: string }) {
		await createGallery({ fetch }, data);
		await goto('/admin/gallery');
	}
</script>

<form use:json={onSave}>
	<h4>Nytt galleri</h4>
	<p>
		<b>NOTERA:</b>Tänk på att inte ha för långt namn på ditt galleri!
	</p>

	<label for="name">Namn på galleri:</label>
	<input id="name" name="name" class="u-full-width" type="text" placeholder="namn" />

	<label for="description">Beskrivning utav gallery:</label>
	<textarea id="description" name="description" class="u-full-width" />

	<label for="date">Datum för galleri:</label>
	<input id="date" name="date" class="u-full-width" type="date" placeholder="yyyy-mm-dd" />
	<button type="submit" class="button-primary">Spara</button>
	<a href="/admin/gallery">Tillbaka</a>
</form>
