<script>
	import { onMount, createEventDispatcher } from 'svelte';
	import AppData from '../stores/AppData.js';
	import AvatarInput from '../shared/AvatarInput.svelte';
	import LoadingSpinner from '../shared/LoadingSpinner.svelte';
	import {getAuthorDetails} from '../rest/RESTFunctions.svelte';
	
	export let params = {};
	const dispatch = createEventDispatcher();

	let username = params.username;
	let user = {};
	let comps = [];
	let showPublished = false;
	let showLiked = false;

	onMount(async () => {
		$AppData.activeView = 'user';
		dispatch('routeEvent', {action: 'saveData'});
	});

	async function populateAuthorData() {
		await new Promise(resolve => setTimeout(resolve, 3000));
		const response = await getAuthorDetails(username);
		if(response.status !== 200) {
			throw new Error(`ERROR: received ${response.status} when querying for author public profile: ${response.data}`);
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
				showLiked = !showLiked;
				break;
			default:
				throw new Error(`ERROR: invalid type passed to handleShowClick: ${type}`);
		}
	}
</script>

{#await populateAuthorData()}
	<LoadingSpinner />
{:then _}
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
				<ul>
					{#each comps as comp}
					<li>
						{comp.name}
					</li>
					{/each}
				</ul>
			</div>
			<button class="expanderHeadButton" on:click={() => handleShowClick('liked')}>
				<i class="arrow {showLiked ? 'down' : 'right' }"></i>
				<div class="expandHeadText">Liked Comps</div>
			</button>
			<div class="expanderBody" class:open={showLiked}>
				<ul>
					{#each user.upvoted_comps as comp}
					<li>
						{comp.name}
					</li>
					{/each}
				</ul>
			</div>
		</section>
	</div>
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
			ul {
				margin: 0;
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
