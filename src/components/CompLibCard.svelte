<script>
	import {createEventDispatcher} from 'svelte';
	import HeroData from '../stores/HeroData.js';
	import AppData from '../stores/AppData.js';
	
	export let comp = {};
	/* expect comp to be of the format:
		{
			id: int,
			uuid: uuid,
			name: string,
			upvotes: int,
			downvotes: int,
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
			!('heroes' in comp) ||
			!('author' in comp) ||
			!('comp_update' in comp)
		) {
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
	$: liked = $AppData.user.liked_comps.some(e => e.uuid === comp.uuid);
	$: disliked = $AppData.user.disliked_comps.some(e => e.uuid === comp.uuid);
	$: favorited = $AppData.user.saved_comps.some(e => e.uuid === comp.uuid);

	let age = Date.now() - Date.parse(comp.comp_update);
	const dispatch = createEventDispatcher();
	const root = document.documentElement;
	root.style.setProperty('--vote-text-size', '1.2rem');

	function msToString(time) {
		// expect time to be number of milliseconds
		// time is less than a minute
		if(time < 6e4) return `a few seconds`;
		// time is less than an hour
		if(time < 3.6e6) return `${Math.floor(time/6e4)} min`;
		// time is less than a day
		if(time < 8.64e7) return `${Math.floor(time/3.6e6)} hrs`;
		// time is less than a month
		if(time < 2.592e9) return `${Math.floor(time/8.64e7)} days`;
		// time is less than a year
		if(time < 3.156e10) return `${Math.floor(time/2.592e9)} mo`;
		// time is greater than a year
		return `${Math.floor(time/3.156e10)} yrs`;
	}

	function votesToString(votes) {
		if(votes < 1e3) return votes;
		if(votes < 1e6) return `${Math.round((votes/1e3) * 10)/10}k`;
		if(votes < 1e9) return `${Math.round(votes/1e6 * 10)/10}m`;
		return 'a lot';
	}

	function handleCompCardClick() {
		// navigate to the comp detail view
		// note: clears all extraneous URL parameters
		window.location.assign(`${window.location.origin}/#/library/comp/${comp.uuid}`);
	}

	function handleFavoriteClick() {
		console.log('favorite clicked');
	}

	function handleLikeClick() {
		console.log('like clicked');
	}

	function handleDislikeClick() {
		console.log('dislike clicked');
	}

	function handleAuthorClick() {
		console.log('author clicked');
	}
</script>

<div class="compLibCardContainer">
	<div class="votingContainer">
		<button class="voteButton likeButton" class:active={liked} on:click={handleLikeClick}>
			<img class="voteImage likeImage" src="{liked ? './img/utility/like_filled.png' : './img/utility/like_unfilled.png'}" alt="Like" draggable="false">
			<div class="voteText likeText">
				{votesToString(comp.upvotes)}
			</div>
		</button>
		<button class="voteButton dislikeButton" class:active={disliked} on:click={handleDislikeClick}>
			<img class="voteImage dislikeImage" src="{disliked ? './img/utility/dislike_filled.png' : './img/utility/dislike_unfilled.png'}" alt="Dislike" draggable="false">
			<div class="voteText dislikeText">
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
					<span class="age">{msToString(age)}</span>
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

<style lang="scss">
	.compLibCardContainer {
		display: flex;
		height: 220px;
		width: 450px;
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
			text-align: center;
			.voteImage {
				max-width: 30px;
			}
			.voteText {
				font-size: var(--vote-text-size);
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
			border: 3px solid var(--appColorPrimary);
			border-top-left-radius: 10px;
			&.active {
				background-color: var(--appColorPrimary);
				.voteText {
					color: var(--appBGColor);
				}
			}
		}
		.dislikeButton {
			border: 3px solid var(--appDelColor);
			border-bottom-left-radius: 10px;
			&.active {
				background-color: var(--appDelColor);
				.voteText {
					color: var(--appBGColor);
				}
			}
		}
	}
	.compCard {
		border-top-right-radius: 10px;
		border-bottom-right-radius: 10px;
		border: 3px solid var(--appColorPrimary);
		border-left: none;
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
			height: 100%;
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
						left: -28px;
						text-align: center;
						transition: all 0.2s;
						visibility: hidden;
						width: 90px;
						.tooltipText {
							background-color: var(--mythicColor);
							border-radius: 5px;
							color: var(--appBGColor);
							font-size: 0.8rem;
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
