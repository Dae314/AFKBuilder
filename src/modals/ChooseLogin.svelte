<script>
	const base_uri = REST_URI
	const providers = [
		{ name: 'Google',
			uri: `${base_uri}/connect/google`,
		},
		{ name: 'Facebook',
			uri: `${base_uri}/connect/facebook`,
		},
		{ name: 'Discord',
			uri: `${base_uri}/connect/discord`,
		},
	]
</script>

<div class="choseLoginContainer">
	<h4>Login with:</h4>
	<ul>
		{#each providers as provider}
		<li>
			<a href={provider.uri}>{provider.name}</a>
		</li>
		{/each}
	</ul>
</div>

<style lang="scss">
</style>
