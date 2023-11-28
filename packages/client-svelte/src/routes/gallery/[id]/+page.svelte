<script lang="ts">
	import ImageCard from './image-card.svelte';

	export let data;

	$: date = new Date(data.gallery.shootDate).toLocaleDateString('sv-SE');
</script>

{#if data.gallery}
	<div class="gallery-view">
		<div class="title">
			<h2>
				{data.gallery.name} - {date}
			</h2>
			<p>
				{data.images.length} bilder.
				<br />
				{data.gallery.description}
			</p>
		</div>
		<div class="image-list">
			{#each data.images as image}
				<ImageCard {image}></ImageCard>
			{/each}
		</div>
	</div>
{:else}
	<p>Galleriet finns inte</p>
{/if}
