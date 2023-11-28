<script lang="ts">
	const uiState: any = {};
</script>

<div class="footer">
	<div class="footer-content">
		<p>
			Du kan komma i kontakt med oss genom att maila
			<a href="mailto:dfoto@dtek.se">dfoto@dtek.se</a>!
		</p>
		<h3>Vi ses genom kameralinsen!</h3>
		{#if uiState?.user?.isLoggedIn}
			<span>Du är inloggad som {uiState?.user?.cid}</span>
		{:else}
			<a href="/login"> Logga in </a>
		{/if}

		<br />
		<p>
			Hittar du något du inte gillar med sidan? Fixa det!
			<a href="https://github.com/dtekcth/dfotose">Här</a> är koden.
		</p>
		<p>Copyright &copy; DFoto {new Date().getFullYear()}.</p>
	</div>
</div>
