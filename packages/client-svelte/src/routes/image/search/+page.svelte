<script lang="ts">
	import ImageCard from '$lib/components/image-card.svelte';

	export let data;
</script>

<div class="tag-search-view">
	<h2>
		Taggsökning: <span class="tag">{data.tag}</span>
	</h2>

	<div class="image-list">
		{#each data.images as image}
			<ImageCard {image}></ImageCard>
		{:else}
			<p>Inga resultat hittade.</p>
		{/each}
	</div>
</div>
