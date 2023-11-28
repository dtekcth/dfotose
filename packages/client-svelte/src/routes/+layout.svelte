<script>
	import '../assets/scss/all.scss';
	import Footer from './footer.svelte';
	import Header from './header.svelte';
</script>

<Header></Header>
<div class="sticky-header"></div>
<div class="content">
	<div class="row">
		<div class="wrapper">
			<slot />
		</div>
	</div>
</div>
<Footer></Footer>
