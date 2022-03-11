<script>
	import { onMount } from 'svelte';
	import AppData from '../stores/AppData.js';
	import LoadingSpinner from '../shared/LoadingSpinner.svelte';

	const base_uri = REST_URI
	const providers = [
		{ name: 'Google',
			logo: './img/app/google-logo-color.png',
			logoAlt: './img/app/google-logo-white.png',
			uri: `${base_uri}/connect/google`,
		},
		{ name: 'Facebook',
			logo: './img/app/facebook-logo-color.png',
			logoAlt: './img/app/facebook-logo-white.png',
			uri: `${base_uri}/connect/facebook`,
		},
		{ name: 'Discord',
			logo: './img/app/discord-logo-color.png',
			logoAlt: './img/app/discord-logo-white.png',
			uri: `${base_uri}/connect/discord`,
		},
	];
	let loading = false;

	onMount(async () => {
		history.pushState({view: $AppData.activeView, modal: true}, "Choose Login", `?modal=true${window.location.hash}`);
	});

	function handleProviderClick(uri) {
		// navigate to the correct login route
		loading = true;
		window.location.assign(uri);
	}
</script>

<div class="choseLoginContainer">
	{#if loading}
		<div class="loadingSpinnerContainer">
			<LoadingSpinner type="dual-ring" size="medium" color="{window.getComputedStyle(document.documentElement).getPropertyValue('--appColorPrimary')}" />
		</div>
	{:else}
		<h4>Login with:</h4>
		<ul>
			{#each providers as provider}
			<li>
				<button type="button" class="{provider.name.toLowerCase()}Button providerButton" on:click={() => handleProviderClick(provider.uri)}>
					<img class="providerLogo" src="{provider.logo}" alt="{provider.name}">
					<img class="providerLogoAlt" src="{provider.logoAlt}" alt="{provider.name}">
					<span class="{provider.name.toLowerCase()}Text providerText">{provider.name}</span>
				</button>
			</li>
			{/each}
		</ul>
	{/if}
</div>

<style lang="scss">
	.chooseLoginContainer {
		width: fit-content;
	}
	.loadingSpinnerContainer {
		align-items: center;
		display: flex;
		height: 100%;
		justify-content: center;
		width: 100%;
	}
	h4 {
		font-size: 1.2rem;
		margin: 0;
		padding-top: 10px;
		text-align: center;
		width: 100%;
	}
	ul {
		align-items: center;
		display: flex;
		flex-direction: column;
		list-style-type: none;
		margin: 0;
		margin-top: 10px;
		padding: 0;
		width: 100%;
		li {
			margin: 10px 0px;
		}
	}
	.providerLogo {
		max-width: 20px;
	}
	.providerButton {
		align-items: center;
		display: flex;
		background-color: transparent;
		border: 3px solid var(--appColorDisabled);
		border-radius: 30px;
		cursor: pointer;
		justify-content: center;
		padding: 3px;
		transition: all 0.2s;
		width: 150px;
	}
	.googleButton {
		border-color: var(--googleProviderColor);
	}
	.facebookButton {
		border-color: var(--facebookProviderColor);
	}
	.discordButton {
		border-color: var(--discordProviderColor);
	}
	.providerText {
		font-weight: bold;
		font-size: 1.0rem;
		margin-left: 15px;
		width: 75px;
	}
	.googleText {
		color: var(--googleProviderColor);
	}
	.facebookText {
		color: var(--facebookProviderColor);
	}
	.discordText {
		color: var(--discordProviderColor);
	}
	.providerLogoAlt {
		display: none;
		max-width: 20px;
	}
	@media only screen and (min-width: 767px) {
		.providerButton:hover {
			.providerText {
				color: white;
			}
		}
		.googleButton:hover {
			background-color: var(--googleProviderColor);
			.providerLogo {
				display: none;
			}
			.providerLogoAlt {
				display: block;
			}
		}
		.facebookButton:hover {
			background-color: var(--facebookProviderColor);
			.providerLogo {
				display: none;
			}
			.providerLogoAlt {
				display: block;
			}
		}
		.discordButton:hover {
			background-color: var(--discordProviderColor);
			.providerLogo {
				display: none;
			}
			.providerLogoAlt {
				display: block;
			}
		}
	}
</style>
