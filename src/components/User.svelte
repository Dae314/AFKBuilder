<script>
	import { onMount, createEventDispatcher } from 'svelte';
	import qs from 'qs';
	import AppData from '../stores/AppData.js';
	import AvatarInput from '../shared/AvatarInput.svelte';
	import LoadingPage from '../shared/LoadingPage.svelte';
	import CompLibCard from './CompLibCard.svelte';
	import ErrorDisplay from './ErrorDisplay.svelte';
	import {getAuthorDetails} from '../rest/RESTFunctions.svelte';
	
	export let params = {};
	const dispatch = createEventDispatcher();

	let username = params.username;
	let user = {};
	let comps = [];
	let showPublished = false;
	let showFavorite = false;
	let showErrorDisplay = false;
	let errorDisplayConf = {};

	onMount(async () => {
		$AppData.activeView = 'user';
		dispatch('routeEvent', {action: 'saveData'});
	});

	async function populateAuthorData() {
		const response = await getAuthorDetails(username);
		if(response.status !== 200) {
			errorDisplayConf = {
				errorCode: response.status,
				headText: 'Something went wrong',
				detailText: response.data,
				showHomeButton: true,
			};
			showErrorDisplay = true;
		}
		comps = response.data.comps;
		user = response.data.author;
	}

	function handleShowClick(type) {
		switch(type) {
			case 'published':
				showPublished = !showPublished;
				break;
			case 'liked':
				showFavorite = !showFavorite;
				break;
			default:
				throw new Error(`ERROR: invalid type passed to handleShowClick: ${type}`);
		}
	}

	function handleCardEvent(event) {
		switch(event.detail.action) {
			case 'saveData':
				dispatch('routeEvent', {action: 'saveData'});
				break;
			case 'logout':
				dispatch('routeEvent', {action: 'logout'});
				break;
			default:
				throw new Error(`Invalid action specified for card event: ${event.detail.action}`);
		}
	}

	function handleShowMoreClick(type) {
		let newQS = new URLSearchParams();
		switch(type) {
			case 'published':
				const author = qs.stringify({
					filter: [{
						displayName: user.username,
						id: user.id,
						name: user.username,
						type: "include",
					}]
				});
				newQS.set('author_filter', author);
				window.location.assign(`${window.location.origin}/#/explore?${newQS.toString()}`);
				break;
			default:
				throw new Error(`Invalid type passed to handleShowMoreClick: ${type}`);
		}
	}
</script>

{#await populateAuthorData()}
	<LoadingPage />
{:then _}
	{#if showErrorDisplay}
		<ErrorDisplay
			errorCode={errorDisplayConf.errorCode}
			headText={errorDisplayConf.headText}
			detailText={errorDisplayConf.detailText}
			showHomeButton={errorDisplayConf.showHomeButton}
		/>
	{:else}
		<div class="userContainer">
			<section class="titleArea">
				<div class="userArea">
					<AvatarInput avatar={user.avatar} editable={false} />
					<div class="userHeadline">
						<h3>{user.username}</h3>
						<p class="userSubtitle">{user.upvotes} Received Likes</p>
					</div>
				</div>
			</section>
			<section class="bodyArea">
				<button class="expanderHeadButton" on:click={() => handleShowClick('published')}>
					<i class="arrow {showPublished ? 'down' : 'right' }"></i>
					<div class="expandHeadText">Published Comps</div>
				</button>
				<div class="expanderBody" class:open={showPublished}>
					<div class="compContainer">
						{#each comps as comp}
						<div class="cardContainer">
							<CompLibCard comp={comp} on:cardEvent={handleCardEvent} />
						</div>
						{/each}
						<div class="showMoreArea">
							<button type="button" class="showMoreButton" on:click={() => handleShowMoreClick('published')}>Show More</button>
						</div>
					</div>
				</div>
				<button class="expanderHeadButton" on:click={() => handleShowClick('liked')}>
					<i class="arrow {showFavorite ? 'down' : 'right' }"></i>
					<div class="expandHeadText">Favorite Comps</div>
				</button>
				<div class="expanderBody" class:open={showFavorite}>
					<div class="compContainer">
						{#each user.saved_comps as comp}
						<div class="cardContainer">
							<CompLibCard bind:comp={comp} on:cardEvent={handleCardEvent} />
						</div>
						{/each}
					</div>
				</div>
			</section>
		</div>
	{/if}
{/await}

<style lang="scss">
	.userContainer {
		display: flex;
		flex-direction: column;
		height: calc(100vh - var(--headerHeight));
		overflow-y: auto;
		padding-top: 10px;
		width: 100%;
	}
	.titleArea {
		padding-bottom: 10px;
		position: relative;
		width: 100%;
		&:after {
			content: '';
			position: absolute;
			bottom: 0;
			width: 80%; // controls length
			left: 10%; // controls centering, use % to center
			border-bottom: 2px solid black;
		}
		.userArea {
			align-items: center;
			display: flex;
			flex-direction: column;
			justify-content: center;
			.userHeadline {
				h3 {
					margin: 0;
				}
				.userSubtitle {
					font-size: 0.8rem;
					margin: 0;
					text-align: center;
				}
			}
		}
	}
	.bodyArea {
		padding-left: 20px;
		.expanderHeadButton {
			align-items: center;
			background-color: transparent;
			border: none;
			cursor: pointer;
			display: flex;
			justify-content: flex-start;
			margin-top: 20px;
			outline: none;
			padding: 10px;
			padding-left: 10px;
			position: relative;
			width: 100%;
		}
		.arrow {
			border: solid black;
			border-width: 0 3px 3px 0;
			display: inline-block;
			margin-right: 16px;
			padding: 3px;
			transition: transform 0.2s ease-out;
			&.right {
				transform: rotate(-45deg);
			}
			&.down {
				transform: rotate(45deg);
			}
		}
		.expandHeadText {
			font-size: 1rem;
		}
		.expanderBody {
			max-height: 0px;
			opacity: 0%;
			transition: all 0.2s;
			visibility: hidden;
			&.open {
				max-height: 100%;
				opacity: 100%;
				visibility: visible;
			}
			.compContainer {
				display: grid;
				grid-gap: 5px 5px;
				grid-template-columns: repeat(auto-fill, minmax(400px, 400px));
				grid-auto-rows: 240px;
				justify-content: space-evenly;
			}
			.showMoreArea {
				align-items: center;
				display: flex;
				height: 100%;
				justify-content: center;
				width: 100%;
				.showMoreButton {
					background-color: var(--appColorPrimary);
					border: 2px solid var(--appColorPrimary);
					border-radius: 5px;
					color: var(--appBGColor);
					cursor: pointer;
					font-weight: bold;
					font-size: 2rem;
					outline: none;
					padding: 10px;
				}
			}
		}
	}
	@media only screen and (min-width: 767px) {
		.userContainer {
			padding-left: 30px;
		}
		.titleArea {
			&:after {
				left: 8px;
			}
			.userArea {
				flex-direction: row;
				justify-content: flex-start;
				.userHeadline {
					margin-left: 10px;
					.userSubtitle {
						text-align: left;
					}
				}
			}
		}
	}
</style>
