<script lang="ts">
	import type { Gallery, Image } from '$lib/api/gallery';
	import UploadImagesForm from './upload-images-form.svelte';

	export let gallery: Gallery;
	export let images: Image[];
	const selected: boolean[] = [];

	function onRemoveClick() {}

	async function onThumbChange(image: Image) {}
</script>

<div>
	<UploadImagesForm {gallery} />
	<p>
		Tänk på att när du laddar upp bilder kan det ta någon minut innan de dyker upp nedan. Det är för
		att de måste hanteras utav servern innan de kan användas.
	</p>
	<hr />
	<b>Markerade bilder: </b>
	<button type="button" class="button-danger" on:click={onRemoveClick}> Ta bort </button>
	<table class="u-full-width admin-image-list">
		<thead>
			<tr>
				<th>#</th>
				<th>thumbnail</th>
				<th>filnamn</th>
				<th>bild</th>
			</tr>
		</thead>
		<tbody>
			{#each images as image, index (image._id)}
				<tr>
					<td>
						<input type="checkbox" bind:checked={selected[index]} />
					</td>
					<td>
						<input
							type="radio"
							name="is-thumbnail"
							checked={image.isGalleryThumbnail}
							on:change={() => onThumbChange(image)}
						/>
					</td>
					<td> {image.filename} </td>
					<td>
						<img src="https://dfoto.se/v1/image/{image._id}/thumbnail" alt={image.filename} />
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
