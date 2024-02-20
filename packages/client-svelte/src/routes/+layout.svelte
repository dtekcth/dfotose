<script>
	import { writable } from 'svelte/store';
	import '../assets/scss/all.scss';
	import Footer from './footer.svelte';
	import Header from './header.svelte';
	import { setContext } from 'svelte';

	export let data;

	const user = writable();
	$: user.set(data.user);

	setContext('user', user);
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
