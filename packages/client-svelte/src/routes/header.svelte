<script lang="ts">
	import TagSearchBar from './tag-search-bar.svelte';

	const user = { role: 'None' };
</script>

<div class="header">
	<div class="header-content">
		<a href="/">
			<img src="/assets/images/logo.png" alt="" />
		</a>
		<ul>
			<li>
				<a href="/"> Bilder </a>
			</li>
			<li>
				<a href="/about"> Om oss </a>
			</li>
			{#if user?.role != 'None'}
				<li>
					<a href="/admin">Admin </a>
				</li>
			{/if}
		</ul>
		<div class="info">
			<TagSearchBar />
		</div>
	</div>
</div>
