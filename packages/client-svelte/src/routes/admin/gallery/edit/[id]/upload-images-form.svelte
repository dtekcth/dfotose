<script lang="ts">
	import { progress } from '$lib';
	import type { Gallery } from '$lib/api/gallery';

	let uploadProgress = -1;
	$: uploading = uploadProgress !== -1;

	export let gallery: Gallery;
</script>

<form
	action="/v1/image/{gallery._id}"
	use:progress={(event) => {
		uploadProgress = (event.loaded / event.total) * 100;
		if (uploadProgress >= 100) {
			uploadProgress = -1;
		}
	}}
>
	<h1>Ladda upp bilder</h1>
	<input id="image" type="file" class="u-full-width" name="photos" accept="image/*" multiple />
	<input class="button-primary button-orange" type="submit" value="Upload" />
</form>
{#if uploading}
	<div>
		<p>Laddar upp: {uploadProgress}% klart.</p>
	</div>
{/if}
