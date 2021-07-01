<script>
	import { getContext, createEventDispatcher } from 'svelte';
	import Confirm from '../modals/Confirm.svelte';

	export let version = '';

	const dispatch = createEventDispatcher();
	const { open } = getContext('simple-modal');

	const contributors = [
		{ name: 'Dae314',
			image: './img/contributors/dae314.png',
			title: 'Maintainer',
			message: 'Got questions? Find me on the AFKArena Discord! Dae314#2750',
			website: '',
		},
		{ name: 'Wyatt Rice',
			image: './img/contributors/wyatt.jpg',
			title: 'Design Consultant',
			message: 'Open for commissions!',
			website: 'https://www.twitter.com/wyattjrice',
		},
	];

	function handleClearDataButtonClick() {
		open(Confirm,
			{onConfirm: clearData, message: "Are you sure you want to CLEAR ALL DATA?"},
			{ closeButton: false,
				closeOnEsc: true,
				closeOnOuterClick: true,
				styleWindow: { width: 'fit-content', },
				styleContent: { width: 'fit-content', },
			});
	}

	function handleTutorialButtonClick() {
		dispatch('resetTutorial');
	}

	function clearData() {
		dispatch('clearData');
	}
</script>

<div class="aboutContainer">
	<div class="versionContainer">
		<span>Version: {version}</span>
	</div>
	<div class="titleContainer">
		<h1>AFKBuilder</h1>
	</div>
	<section class="aboutApp">
		<div class="generalDesc">
			AFKBuilder is a tool designed to help players build, share, and use community made team compositions for AFKArena.
			<br/>
			<br/>
			AFKBuilder runs entirely on your browser. None of your information is shared outside of the application. Your data is saved on your browser's local storage. Be sure to make a backup of your comps and hero list before clearing your browser data.
		</div>
		<div class="areaDesc">
			<div class="compDesc">
				<h2>Comps</h2>
				<div class="text">The Comp area of the app is where you can manage your list of compositions. Importing comps, editing comps, making new comps, and exporting comps for sharing and backup are all done here. Starred comps are comps that you are interested in or aiming for. Star your favorite comps to get customized recommendations based on their hero compositions.</div>
			</div>
			<div class="heroListDesc">
				<h2>Hero List</h2>
				<div class="text">The Hero List area of the app is a reference list for all of the heroes in the game as well as their recommended Signature Item and furniture benchmarks. Come here if you want to look up information about a specific hero. You can also claim heroes from this list as your own so you can customize them in the My Heroes area and receive customized recommendations about them.</div>
			</div>
			<div class="myHeroesDesc">
				<h2>My Heroes</h2>
				<div class="text">The My Heroes area of the app is where you can customize the heroes you claimed from the Hero List. Specify your hero's Ascension, Signature Item, and Furniture to get customized recommendations in the Recommendations area.</div>
			</div>
			<div class="recommendationsDesc">
				<h2>Recommendations</h2>
				<div class="text">The Recommendations area of the app is where you can get customized progression recommendations based on the data from My Heroes and your starred comps. Hereos who are core to your starred comps are listed first with customized Ascension, Signature Item, and Furniture recommendations.</div>
			</div>
		</div>
	</section>
	<section class="contributors">
		<h2>Contributors</h2>
		<div class="contributorGrid">
			{#each contributors as person}
				{#if person.website !== ''}
				<div class="contributorCard">
					<div class="left">
						<a href={person.website} target="_blank" rel="noreferrer noopener">
							<img class="avatar" src="{person.image}" alt="{person.name}">
							<div class="name"><span>{person.name}</span></div>
						</a>
					</div>
					<div class="right">
						<h3>{person.title}</h3>
						<div class="message"><span>{person.message}</span></div>
					</div>
				</div>
				{:else}
				<div class="contributorCard">
					<div class="left">
						<img class="avatar" src="{person.image}" alt="{person.name}">
						<div class="name"><span>{person.name}</span></div>
					</div>
					<div class="right">
						<h3>{person.title}</h3>
						<div class="message"><span>{person.message}</span></div>
					</div>
				</div>
				{/if}
			{/each}
		</div>
	</section>
	<section class="affiliate">
		<div class="disclaimer">
			<span>AFKBuilder has no affiliation with <a href="https://www.lilithgames.com/" target="_blank" rel="noreferrer noopener">Lilith Games</a> or <a href="https://www.afkarena.com/" target="_blank" rel="noreferrer noopener">AFK Arena</a></span> 
		</div>
	</section>
	<section class="config">
		<button type="button" class="configButton clearButton" on:click={handleClearDataButtonClick}><span>Clear Data</span></button>
		<button type="button" class="configButton tutorialButton" on:click={handleTutorialButtonClick}><span>Reset Tutorial</span></button>
		<form action="https://forms.gle/oKDQj2Jjqmf5DoTCA" target="_blank" rel="noreferrer noopener">
			<input class="configButton feedbackButton" type="submit" value="Send Feedback" />
		</form>
	</section>
</div>

<style lang="scss">
	.aboutContainer {
		height: calc(100vh - 45px);
		padding: 10px;
		overflow-y: auto;
		width: 100%;
	}
	.versionContainer {
		display: flex;
		flex-direction: row;
		justify-content: flex-end;
	}
	.titleContainer {
		padding-bottom: 10px;
		width: 100%;
		h1 {
			margin: 0;
			text-align: center;
		}
	}
	h2 {
		margin: 0;
		margin-bottom: 10px;
		margin-top: 20px;
		text-align: center;
	}
	.generalDesc {
		text-align: center;
	}
	.areaDesc {
		.text {
			text-align: center;
		}
	}
	.contributorGrid {
		display: grid;
		grid-gap: 10px;
		grid-template-columns: repeat(auto-fit, minmax(280px, 330px));
		justify-content: space-evenly;
		margin-bottom: 10px;
		overflow: hidden;
	}
	.contributorCard {
		border: 3px solid var(--appColorPrimary);
		border-radius: 10px;
		display: flex;
		flex-direction: row;
		height: 100%;
		padding: 10px;
		.left {
			align-items: center;
			border-right: 2px solid var(--appColorPrimary);
			display: flex;
			flex-direction: column;
			justify-content: center;
			min-width: 100px;
			padding-right: 10px;
		}
		a {
			align-items: center;
			color: inherit;
			display: flex;
			flex-direction: column;
			justify-content: center;
			text-decoration: none;
		}
		.avatar {
			border-radius: 50%;
			max-width: 50px;
		}
		.name {
			font-weight: bold;
		}
		.right {
			padding-left: 20px;
		}
		h3 {
			margin: 0;
			margin-bottom: 5px;
		}
	}
	.affiliate {
		padding-top: 10px;
		.disclaimer {
			font-size: 0.6rem;
			text-align: center;
			a {
				&:link {
					color: var(--appColorPrimary);
				}
				&:visited {
					color: var(--appColorPrimary);
				}
			}
		}
	}
	.config {
		border-top: 1px solid black;
		display: flex;
		justify-content: center;
		margin-top: 20px;
		padding: 15px;
		.configButton {
			background-color: transparent;
			border: 3px solid var(--appColorPrimary);
			border-radius: 10px;
			color: var(--appColorPrimary);
			cursor: pointer;
			font-size: 1rem;
			font-weight: bold;
			outline: none;
			padding: 10px;
			transition: all 0.2s;
		}
		.clearButton {
			border-color: var(--appDelColor);
			color: var(--appDelColor);
			margin-right: 20px;
		}
		form {
			margin-left: auto;
		}
	}
	@media only screen and (min-width: 767px) {
		.generalDesc {
			margin: 0 auto;
			width: 70%;
		}
		.areaDesc {
			display: grid;
			grid-gap: 20px;
			grid-template-columns: 1fr 1fr;
			grid-template-rows: 1fr 1fr;
			h2 {
				text-align: center;
			}
		}
		.contributors {
			h2 {
				text-align: left;
			}
		}
		.contributorGrid {
			justify-content: start;
		}
		.config {
			justify-content: flex-start;
			.configButton {
				&:hover {
					background-color: var(--appColorPrimary);
					color: white;
				}
			}
			.clearButton {
				&:hover {
					background-color: var(--appDelColor);
					color: white;
				}
			}
		}
	}
</style>
