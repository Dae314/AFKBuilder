<script>
	import { getContext, createEventDispatcher, onMount } from 'svelte';
	import Confirm from '../modals/Confirm.svelte';
	import ChangeLog from '../modals/ChangeLog.svelte';
	import ModalCloseButton from '../modals/ModalCloseButton.svelte';
	import AppData from '../stores/AppData.js';

	export let version = '';
	export let isMobile = false;

	const dispatch = createEventDispatcher();
	const { open } = getContext('simple-modal');
	const contributors = [
		{ name: 'Dae314',
			image: './img/contributors/dae314.png',
			title: 'Maintainer',
			message: 'Got questions? Find me on the <a href="https://discord.com/invite/afkarena" target="_blank" rel="noreferrer noopener">AFK Arena Discord</a>!',
			website: '',
		},
		{ name: 'Wyatt Rice',
			image: './img/contributors/wyatt.jpg',
			title: 'Designer',
			message: 'Open for commissions!',
			website: 'https://twitter.com/wyattzx_',
		},
	];
	
	$: modalHeight = isMobile ? '75vh' : '80vh';

	onMount(async () => {
		$AppData.activeView = 'about';
		dispatch('routeEvent', {action: 'saveData'});
	});

	function handleClearDataButtonClick() {
		const bgColor = window.getComputedStyle(document.documentElement).getPropertyValue('--appBGColor');
		open(Confirm,
			{onConfirm: clearData, message: "Are you sure you want to CLEAR ALL DATA?"},
			{ closeButton: false,
				closeOnEsc: true,
				closeOnOuterClick: true,
				styleWindow: { width: 'fit-content' },
				styleContent: { width: 'fit-content', background: bgColor, borderRadius: '10px' },
			});
	}

	function handleTutorialButtonClick() {
		dispatch('routeEvent', {action: 'resetTutorial'});
	}

	function handleColorButtonClick() {
		const newMode = $AppData.colorProfile === 'light' ? 'dark' : 'light';
		dispatch('routeEvent', {action: 'changeColorProfile', data: {newMode}});
	}

	function clearData() {
		dispatch('routeEvent', {action: 'clearData'});
	}

	function openChangeLog() {
		const bgColor = window.getComputedStyle(document.documentElement).getPropertyValue('--appBGColor');
		open(ChangeLog,
		{},
		{ closeButton: ModalCloseButton,
			styleContent: {background: bgColor, padding: 0, borderRadius: '10px', maxHeight: modalHeight,},
		});
	}
</script>

<div class="aboutContainer">
	<div class="versionContainer">
		<button type="button" class="versionButton" on:click={openChangeLog}>
			<span>Version: {version}</span>
		</button>
	</div>
	<div class="titleContainer">
		<h1>AFKBuilder</h1>
	</div>
	<section class="aboutApp">
		<div class="generalDesc">
			<p>AFKBuilder is an <a href="https://github.com/Dae314/AFKBuilder" target="_blank" rel="noreferrer noopener">open source</a> tool designed to help players build, share, and use community made team compositions for AFK Arena.</p>
			<p>Login to get the most out of AFKBuilder! Until you login, AFKBuilder runs entirely on your browser, and your data is stored in its local storage. If you do not login, you will still be able to explore community comps and make your own, <em>but you will not be able to like, dislike, favorite, or publish comps.</em> Users who login will have full access to all of the features in AFKBuilder, and their Comps and My Heroes saved to their server profile so if you login on multiple devices, you will be able to see the same data.</p>
			<p>AFKBuilder stores minimal personal information only when you login. We store no information on users who do not login. For more information about the data we store, see our <a href={`${window.location.origin}/#/privacy`} target="_blank" rel="noreferrer noopener">Privacy Policy</a>. Cookies in the form of local storage entries are used to store your configuration.</p>
			<p>By using AFKBuilder, you agree to our <a href={`${window.location.origin}/#/terms`} target="_blank" rel="noreferrer noopener">Terms of Service</a></p>
		</div>
		<div class="areaDesc">
			<div class="exploreDesc areaDescSect">
				<h2>Explore</h2>
				<div class="text">
					<p>
						Explore community made comps! Use our deep filtering system to filter for specific authors, heroes, or tags. Vote for the best comps, and favorite the ones that you want to keep and get recommendations for. Click on a comp to see more details for it, and share that comp simply by copying the URL! You can also sort results how you want:
					</p>
					<ul>
						<li>best - comps are sorted based on upvote and downvote ratio</li>
						<li>top - for those who don't like algorithms and just want to see the comps with the most upvotes</li>
						<li>new - see the newest comps uploaded to the site</li>
						<li>updated - see comps that have recently been updated by their authors</li>
					</ul>
				</div>
			</div>
			<div class="compDesc areaDescSect">
				<h2>Comps</h2>
				<div class="text">
					<p>
						Create, edit, import, export, and publish your comps all in one area. Any comps you favorite in <em>Explore</em> will appear here (although you won't be able to edit them). Starring comps in this area automatically sends all of their heroes into your personalized recommendation section. Create or edit comps with our powerful editor, and when you're done, publish your creation so others can find it!
					</p>
					<p>
						Want to get organized? Group comps however you want with the group engine. Of course you can still search, sort, and filter comps in this area just like you can in <em>Explore</em>. Note: only comps you have saved locally will appear in <em>Comps</em>. For community comps, check out the <em>Explore</em> section.
					</p>
				</div>
			</div>
			<div class="recommendationsDesc areaDescSect">
				<h2>Recommendations</h2>
				<div class="text">
					<p>
						Ever wonder what to build next? This section will tell you! First, fill in your heroes into the <em>My Heroes</em> area, then star comps in the <em>Comps</em> section to receive personalized hero investment recommendations. Heroes in a comp you have starred that you do not yet have fully invested will appear here. You can tap on the checkmark for any investment you've completed to automatically update your <em>My Heroes</em>.
					</p>
				</div>
			</div>
			<div class="myHeroesDesc areaDescSect">
				<h2>My Heroes</h2>
				<div class="text">
					<p>
						Your hero box away from home. Keep track of all of your hero investments, and if you are new to the game, keep track of the copies you are collecting for the heroes you own. If you don't want personalized <em>Recommendations</em>, then there's no need to complete this section. Of course you would also then be missing out on powerful searching and filtering that's available, but that's your choice.
					</p>
				</div>
			</div>
			<div class="heroListDesc areaDescSect">
				<h2>Hero List</h2>
				<div class="text">
					<p>
						Say hello to our database of every hero in Esperia. Don't remember what Mortas' 'Greed' skill does? Come here and find out (or just tap on his portrait in a comp). Want to see how many Celestial Rangers are in the game? Use our powerful search and filters to find exactly what you want. Hero SI, Furniture, and Engraving recommendations are gathered from various publically available community guides.
					</p>
				</div>
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
						<div class="message"><span>{@html person.message}</span></div>
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
						<div class="message"><span>{@html person.message}</span></div>
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
		<button type="button" class="configButton colorButton" class:darkButton={$AppData.colorProfile === 'light'} on:click={handleColorButtonClick}><span>{$AppData.colorProfile === 'light' ? 'Dark Mode' : 'Light Mode'}</span></button>
		<form action="https://forms.gle/oKDQj2Jjqmf5DoTCA" target="_blank" rel="noreferrer noopener">
			<input class="configButton feedbackButton" type="submit" value="Send Feedback" />
		</form>
	</section>
</div>

<style lang="scss">
	.aboutContainer {
		height: 100%;
		height: calc(var(--vh, 1vh) * 100 - var(--headerHeight)); /* gymnastics to set height for mobile browsers */
		padding: 10px;
		overflow-y: auto;
		width: 100%;
	}
	.versionContainer {
		display: flex;
		flex-direction: row;
		justify-content: flex-end;
	}
	.versionButton {
		background-color: var(--appBGColor);
		border: none;
		border-radius: 5px;
		box-shadow: var(--neu-sm-i-BGColor-shadow);
		color: var(--appColorBlack);
		cursor: pointer;
		outline: none;
		padding: 5px;
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
		margin: 10px 0px;
		text-align: center;
	}
	.generalDesc {
		text-align: center;
		p {
			margin-top: 0;
		}
		a {
			&:link {
				color: var(--appColorPrimary);
			}
			&:visited {
				color: var(--appColorPrimary);
			}
		}
	}
	.areaDesc {
		.text {
			text-align: center;
			p {
				margin-top: 0;
			}
			ul {
				text-align: left;
			}
		}
	}
	.contributorGrid {
		display: grid;
		grid-gap: 20px;
		grid-template-columns: repeat(auto-fit, minmax(280px, 330px));
		justify-content: space-evenly;
		margin-bottom: 10px;
	}
	.contributorCard {
		border: none;
		border-radius: 10px;
		box-shadow: var(--neu-sm-i-BGColor-shadow);
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
		.message {
			:global(a) {
				&:link {
					color: var(--appColorPrimary);
				}
				&:visited {
					color: var(--appColorPrimary);
				}
			}
		}
	}
	.affiliate {
		padding-top: 10px;
		div {
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
		flex-wrap: wrap;
		gap: 20px;
		justify-content: center;
		margin-top: 10px;
		padding: 15px;
		.configButton {
			background-color: var(--appBGColor);
			border: none;
			border-radius: 10px;
			box-shadow: var(--neu-med-i-BGColor-shadow);
			color: var(--appColorPrimary);
			cursor: pointer;
			font-size: 1rem;
			font-weight: bold;
			outline: none;
			padding: 10px;
			transition: all 0.2s;
			&.darkButton {
				background-color: #2E3440;
				color: #ECEFF4;
			}
		}
		.clearButton {
			border-color: var(--appDelColor);
			color: var(--appDelColor);
		}
	}
	em, :global(em) {
		color: var(--appColorPrimary);
		font-style: normal;
		font-weight: bold;
	}
	@media only screen and (min-width: 767px) {
		.aboutContainer {
			height: 100vh;
		}
		.versionButton {
			&:hover {
				background: var(--neu-convex-BGColor-bg);
			}
		}
		.generalDesc {
			margin: 0 auto;
			width: 70%;
		}
		.areaDesc {
			justify-content: center;
			display: flex;
			flex-direction: row;
			flex-wrap: wrap;
			.areaDescSect {
				background: var(--appBGColor);
				border-radius: 10px;
				box-shadow: var(--neu-med-ni-BGColor-shadow);
				margin: 10px;
				max-width: 48%;
				padding: 10px;
			}
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
					background: var(--neu-convex-BGColor-wide-bg);
				}
				&.darkButton {
					&:hover {
						background: #2E3440;
					}
				}
			}
			.clearButton {
				&:hover {
					background: var(--neu-convex-BGColor-wide-bg);
				}
			}
			form {
				margin-left: auto;
			}
		}
	}
</style>
