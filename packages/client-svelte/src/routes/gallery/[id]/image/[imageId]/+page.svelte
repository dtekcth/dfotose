<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { addTag } from '$lib/api/gallery.js';

	export let data;

	$: currentIndex = data.images.findIndex((image) => image._id === data.imageId);
	$: currentImage = data.images[currentIndex];

	$: nextId = data.images[(currentIndex + 1) % data.images.length]?._id;
	$: prevId = data.images[(currentIndex - 1) % data.images.length]?._id;

	let newTag = '';

	function handleKeydown(event: KeyboardEvent) {
		console.log(event);

		if (event.key == 'ArrowRight') {
			goto(imgLink(nextId));
		} else if (event.key == 'ArrowLeft') {
			goto(imgLink(prevId));
		}
	}

	function imgLink(id: string) {
		return `/gallery/${data.gallery._id}/image/${id}`;
	}

	async function onAddTag(event: SubmitEvent) {
		event.preventDefault();
		await addTag(currentImage._id, newTag);
		await invalidate(`/v1/image/${data.gallery._id}`);
		newTag = '';
	}
</script>

<svelte:document on:keydown={handleKeydown} />

<div class="image-view">
	<div class="image-with-buttons">
		<a href={nextId ? imgLink(nextId) : '#'}>
			<img
				src="https://dfoto.se/v1/image/{currentImage._id}/preview"
				alt="photograph"
				class="primary-image"
				loading="lazy"
			/>
		</a>
		<div class="buttons">
			<a href={prevId ? imgLink(prevId) : '#'}> Föregående </a>
			<div class="middle">
				<span>
					bild {currentIndex + 1} / {data.images.length}
				</span>
				<a href="/gallery/{data.gallery._id}">Tillbaka till galleriet </a>
			</div>
			<a href={nextId ? imgLink(nextId) : '#'}> Nästa </a>
		</div>
	</div>

	<div class="details">
		<span>
			<b>Fotograf</b>: {currentImage.author ?? currentImage.authorCid}
		</span>
		<span>
			<b>Bild-Id</b>: {currentImage._id}
		</span>
		<a href="/v1/image/{currentImage._id}/fullsize" target="_blank">
			Öppna bilden i full storlek
		</a>
		<div class="tags">
			<b>Taggar</b>: {currentImage.tags.join(', ')}
		</div>
		<form on:submit={onAddTag} class="new-tag-form">
			<input type="text" name="newTag" placeholder="ny tagg" bind:value={newTag} />
			<button type="submit" class="button"> Lägg till </button>
		</form>
	</div>
</div>
