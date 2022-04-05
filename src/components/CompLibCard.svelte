<script>
	import {createEventDispatcher} from 'svelte';
	import HeroData from '../stores/HeroData.js';
	import AppData from '../stores/AppData.js';
	import {validateJWT, toggleSave, toggleUpvote, toggleDownvote} from '../rest/RESTFunctions.svelte';
	import {msToString, votesToString} from '../utilities/Utilities.svelte';
	
	export let comp = {};
	/* expect comp to be of the format:
		{
			id: int,
			uuid: uuid,
			name: string,
			upvotes: int,
			downvotes: int,
			createdAt: datetime,
			heroes: [{id: int, name: string}],
			author: {username: string, avatar: string},
			comp_update: datetime,
		}
	*/
	if(!('id' in comp) ||
			!('uuid' in comp) ||
			!('name' in comp) ||
			!('upvotes' in comp) ||
			!('downvotes' in comp) ||
			!('createdAt' in comp) ||
			!('heroes' in comp) ||
			!('author' in comp) ||
			!('comp_update' in comp)
		){
		throw new Error(`ERROR invalid comp object passed to CompLibCard: ${comp}`);
	}
	// ensure comp.heroes is length 5
	if(comp.heroes.length > 5) {
		// remove extra heroes if length was > 5
		comp.heroes = comp.heroes.slice(0, 5);
	} else {
		// add 'unknown' heroes if length was < 5
		while(comp.heroes.length < 5) {
			comp.heroes.push({id: -1, name: 'unknown'});
		}
	}

	$: avatarHero = $HeroData.find(e => e.id === comp.author.avatar);
	$: liked = $AppData.user.jwt ? $AppData.user.liked_comps.some(e => e.uuid === comp.uuid) : false;
	$: disliked = $AppData.user.jwt ? $AppData.user.disliked_comps.some(e => e.uuid === comp.uuid) : false;
	$: favorited = $AppData.user.jwt ? $AppData.user.saved_comps.some(e => e.uuid === comp.uuid) : false;
	$: like_size = (comp.upvotes >= 1e5 && comp.upvotes < 1e6) || comp.upvotes >= 1e8 ? '0.95rem' : '1.2rem';
	$: dislike_size = (comp.downvotes >= 1e5 && comp.downvotes < 1e6) || comp.downvotes >= 1e8 ? '0.95rem' : '1.2rem';

	const dispatch = createEventDispatcher();
	const now = Date.now();
	const createdAt = new Date(comp.createdAt);
	const age = now - Date.parse(comp.createdAt);
	let showError = false;
	let errorConf = {};

	function handleCompCardClick() {
		// navigate to the comp detail view
		// note: clears all extraneous URL parameters
		window.location.assign(`${window.location.origin}/#/explore/comp/${comp.uuid}`);
	}

	async function handleFavoriteClick() {
		const valid = await validateJWT($AppData.user.jwt);
		if(valid) {
			dispatch('cardEvent', {action: 'loading'});
			// user is valid, perform query
			const response = await toggleSave($AppData.user.jwt, comp.uuid);
			if(response.status !== 200) {
				errorConf = {
					errorCode: response.status,
					headText: 'Something went wrong',
					detailText: response.data,
				}
				showError = true;
			} else {
				$AppData.user.saved_comps = response.data.comps;
				dispatch('cardEvent', {action: 'saveData'});
				dispatch('cardEvent', {action: 'syncFavorites'});
			}
			dispatch('cardEvent', {action: 'stopLoading'});
		} else {
			dispatch('cardEvent', {action: 'logout'});
		}
	}

	async function handleLikeClick() {
		if(!$AppData.user.disliked_comps.some(e => e.uuid === comp.uuid)) {
			dispatch('cardEvent', {action: 'loading'});
			const valid = await validateJWT($AppData.user.jwt);
			if(valid) {
				// user is valid, perform query
				const response = await toggleUpvote($AppData.user.jwt, comp.uuid);
					if(response.status !== 200) {
						errorConf = {
						errorCode: response.status,
						headText: 'Something went wrong',
						detailText: response.data.message,
					}
					showError = true;
				} else {
					$AppData.user.liked_comps = response.data.comps;
					comp.upvotes = response.data.upvotes;
					dispatch('cardEvent', {action: 'saveData'});
				}
			} else {
				dispatch('cardEvent', {action: 'logout'});
			}
			dispatch('cardEvent', {action: 'stopLoading'});
		}
	}

	async function handleDislikeClick() {
		if(!$AppData.user.liked_comps.some(e => e.uuid === comp.uuid)) {
			dispatch('cardEvent', {action: 'loading'});
			const valid = await validateJWT($AppData.user.jwt);
			if(valid) {
				// user is valid, perform query
				const response = await toggleDownvote($AppData.user.jwt, comp.uuid);
				if(response.status !== 200) {
					errorConf = {
						errorCode: response.status,
						headText: 'Something went wrong',
						detailText: response.data,
					}
					showError = true;
				} else {
					$AppData.user.disliked_comps = response.data.comps;
					comp.downvotes = response.data.downvotes;
					dispatch('cardEvent', {action: 'saveData'});
				}
			} else {
				dispatch('cardEvent', {action: 'logout'});
			}
			dispatch('cardEvent', {action: 'stopLoading'});
		}
	}

	function handleAuthorClick() {
		// navigate to author page
		// note: clears all extraneous URL parameters
		window.location.assign(`${window.location.origin}/#/users/${encodeURIComponent(comp.author.username)}`);
	}
</script>

{#if showError}
	<div class="compLibCardError">
		<h3>{errorConf.errorCode}</h3>
		<div class="errorHeadText">{errorConf.headText}</div>
		<div class="errorDetailText">{errorConf.detailText}</div>
	</div>
{:else}
	<div class="compLibCardContainer">
		<div class="votingContainer">
			<button class="voteButton likeButton" class:active={liked} on:click={handleLikeClick}>
				<img class="voteImage likeImage" src="{liked ? './img/utility/like_filled_white.png' : './img/utility/like_unfilled.png'}" alt="Like" draggable="false">
				<div class="voteText likeText" style="font-size: {like_size};">
					{votesToString(comp.upvotes)}
				</div>
			</button>
			<button class="voteButton dislikeButton" class:active={disliked} on:click={handleDislikeClick}>
				<img class="voteImage dislikeImage" src="{disliked ? './img/utility/dislike_filled_white.png' : './img/utility/dislike_unfilled.png'}" alt="Dislike" draggable="false">
				<div class="voteText dislikeText" style="font-size: {dislike_size};">
					{votesToString(comp.downvotes)}
				</div>
			</button>
		</div>
		<div class="compCard">
			<div class="compCardHead">
				<div class="authorAgeContainer">
					<button type="button" class="authorButton" on:click={handleAuthorClick}>
						<img class="avatar" src="{avatarHero.portrait}" alt="{avatarHero.name}" draggable="false">
						<div class="username">{comp.author.username}</div>
					</button>
					<div class="ageContainer">
						<span class="age" title="{createdAt.toLocaleString()}">Published {msToString(age)}</span>
					</div>
				</div>
				<div class="buttonContainer">
					<div class="buttonArea">
						<button type="button" class="favoriteButton" on:click={handleFavoriteClick}>
							<img draggable="false" class="favoriteImage" src="{favorited ? './img/utility/favorite_filled.png' : './img/utility/favorite_unfilled.png'}" alt="Favorite">
						</button>
						<div class="tooltip favoriteTooltip"><span class="tooltipText">{favorited ? 'Unfavorite' : 'Favorite'}</span></div>
					</div>
				</div>
			</div>
			<button type="button" class="compButton" on:click={handleCompCardClick}>
				<div class="compTitleContainer" >
					<div class="compTitle">{comp.name}</div>
				</div>
				<div class="heroesContainer">
					{#each comp.heroes as hero}
						{#if $HeroData.some(e => e.id === hero.name)}
							<img draggable="false" class="heroImage" src={$HeroData.find(e => e.id === hero.name).portrait} alt={$HeroData.find(e => e.id === hero.name).name}>
						{:else}
							<i class="emptyHeroSlot"></i>
						{/if}
					{/each}
				</div>
			</button>
		</div>
	</div>
{/if}

<style lang="scss">
	.compLibCardError {
		align-items: center;
		border: 3px solid var(--appDelColor);
		border-radius: 10px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		h3 {
			color: var(--appDelColor);
			font-size: 1.2rem;
			margin: 0;
			padding: 0;
		}
		.errorHeadText {
			font-size: 1.0rem;
		}
		.errorDetailText {
			margin-top: 10px;
			font-size: 0.9rem;
		}
	}
	.compLibCardContainer {
		border-radius: 10px;
		box-shadow: var(--neu-med-i-BGColor-shadow);
		display: flex;
		height: 220px;
		overflow: hidden;
		width: 400px;
	}
	.votingContainer {
		display: flex;
		flex-direction: column;
		max-width: 60px;
		min-width: 60px;
		width: 60px;
		.voteButton {
			align-items: center;
			background: transparent;
			border: none;
			cursor: pointer;
			display: flex;
			flex-direction: column;
			height: 50%;
			justify-content: center;
			outline: none;
			padding: 0;
			text-align: center;
			.voteImage {
				max-width: 30px;
			}
			.voteText {
				margin: 10px;
				font-weight: bold;
			}
			.likeText {
				color: var(--appColorPrimary);
			}
			.dislikeText {
				color: var(--appDelColor);
			}
		}
		.likeButton {
			&.active {
				background-color: var(--appColorPrimary);
				.voteText {
					color: var(--appBGColor);
				}
			}
		}
		.dislikeButton {
			&.active {
				background-color: var(--appDelColor);
				.voteText {
					color: var(--appBGColor);
				}
			}
		}
	}
	.compCard {
		height: 100%;
		padding: 10px;
		width: 100%;
		.compCardHead {
			border-bottom: 1px solid black;
			display: flex;
			padding-bottom: 5px;
			.authorAgeContainer {
				display: flex;
				flex-direction: column;
				.authorButton {
					align-items: center;
					background-color: transparent;
					border: none;
					cursor: pointer;
					display: flex;
					margin: 0;
					outline: none;
					padding: 0;
					.avatar {
						border-radius: 50%;
						max-width: 40px;
					}
					.username {
						font-size: 1rem;
						margin-left: 10px;
						user-select: none;
					}
				}
				.ageContainer {
					.age {
						font-size: 0.8rem;
						user-select: none;
					}
				}
			}
			.buttonContainer {
				margin-left: auto;
				.buttonArea {
					position: relative;
				}
				.tooltip {
					display: none;
				}
				.favoriteButton {
					background: transparent;
					border: none;
					cursor: pointer;
					outline: none;
					.favoriteImage {
						max-width: 20px;
					}
				}
			}
		}
		.compButton {
			background-color: transparent;
			border: none;
			cursor: pointer;
			display: flex;
			flex-direction: column;
			height: 138px;
			margin: 0;
			outline: none;
			padding: 0;
			padding-top: 5px;
			width: 100%;
		}
		.compTitleContainer {
			.compTitle {
				font-weight: bold;
				font-size: 2rem;
				user-select: none;
			}
		}
		.heroesContainer {
			align-items: center;
			display: flex;
			flex-direction: row;
			flex-wrap: wrap;
			.heroImage {
				border-radius: 50%;
				margin: 5px;
				max-width: 50px;
			}
			.emptyHeroSlot {
				background: transparent;
				border: 3px solid var(--appColorPriAccent);
				border-radius: 50%;
				flex-grow: 0;
				flex-shrink: 0;
				height: 50px;
				margin: 5px;
				width: 50px;
			}
		}
	}
	@media only screen and (min-width: 767px) {
		.compCard {
			.compCardHead {
				.buttonContainer {
					.tooltip {
						display: block;
						opacity: 0%;
						position: absolute;
						left: -30px;
						text-align: center;
						top: 20px;
						transition: all 0.2s;
						visibility: hidden;
						width: 90px;
						.tooltipText {
							background-color: var(--mythicColor);
							border-radius: 5px;
							color: var(--appBGColor);
							font-size: 0.65rem;
							font-weight: bold;
							padding: 3px;
						}
					}
					.favoriteButton:hover + .favoriteTooltip {
						opacity: 100%;
						visibility: visible;
					}
				}
			}
		}
	}
</style>
