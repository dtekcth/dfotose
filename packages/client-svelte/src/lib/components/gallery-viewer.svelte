<script lang="ts">
	import type { Gallery } from '$lib/api/gallery';

	export let gallery: Gallery;

	$: thumbnailPreview = `https://dfoto.se/v1/gallery/${gallery._id}/thumbnail-preview`;
	$: galleryViewLink = `/gallery/${gallery._id}`;
	$: date = new Date(gallery.shootDate).toLocaleDateString('sv-SE');
</script>

<div class="gallery-card">
	<a href={galleryViewLink}>
		<img src={thumbnailPreview} alt="thumbnail" loading="lazy" />
		<div class="title">
			<div class="text">
				<span class="name">{gallery.name}</span>
				<span class="date">{date} </span>
			</div>
		</div>
	</a>
</div>
