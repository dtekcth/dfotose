<script lang="ts">
	import type { Image } from '$lib/api/gallery';

	export let image: Image;
	$: thumbnail = `/v1/image/${image._id}/thumbnail`;
</script>

<div class="image-card">
	<a href="/gallery/{image.galleryId}/image/{image._id}">
		<img alt="gallery item" src="https://dfoto.se{thumbnail}" loading="lazy" />
	</a>
</div>
