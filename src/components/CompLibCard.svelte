<script>
	import {onMount} from 'svelte';
	import HeroData from '../stores/HeroData.js';
	
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

	$: avatarHero = $HeroData.find(e => e.id === comp.author.avatar);

	let age = 0;

	onMount(async () => {
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
		age = Date.now() - Date.parse(comp.comp_update);
	});

	function handleCompCardClick() {
		console.log('card clicked');
	}

	function handleFavoriteButtonClick() {
		console.log('favorite clicked');
	}

	function msToString(time) {
		// expect time to be number of milliseconds
		if(time < 60000) {
			// time is less than a minute
			return `a few seconds`;
		} else if(time < 3600000) {
			// time is less than an hour
			return `${Math.floor(time/60000)}min`;
		} else if(time < 86400000) {
			// time is less than a day
			return `${Math.floor(time/3600000)}hrs`;
		} else if(time < 2592000000) {
			// time is less than a month
			return `${Math.floor(time/86400000)}days`;
		} else if(time < 31560000000) {
			// time is less than a year
			return `${Math.floor(time/2592000000)}mo`;
		} else {
			// time is greater than a year
			return `${Math.floor(time/31560000000)}yrs`;
		}
	}
</script>

<div class="compLibCardContainer">
	<div class="votingContainer">
		<div class="likeArea">
			<button class="likeButton">
				<img class="likeImage" src="./img/utility/export.png" alt="Like" draggable="false">
			</button>
			<div class="likeText">
				{comp.upvotes}
			</div>
		</div>
		<div class="dislikeArea">
			<button class="dislikeButton">
				<img class="dislikeImage" src="./img/utility/import.png" alt="Dislike" draggable="false">
			</button>
			<div class="dislikeText">
				{comp.downvotes}
			</div>
		</div>
	</div>
	<div class="compCard" on:click={() => handleCompCardClick() }>
		<div class="compCardHead">
			<div class="authorContainer">
				<img class="avatar" src="{avatarHero.portrait}" alt="{avatarHero.name}" draggable="false">
				<div class="username">{comp.author.username}</div>
			</div>
			<div class="ageContainer">
				<span class="age">{msToString(age)}</span>
			</div>
			<div class="buttonArea">
				<div class="cardButtonsContainer">
					<div class="buttonArea">
						<button type="button" class="favoriteButton" on:click={(e) => { handleFavoriteButtonClick(idx); e.stopPropagation(); }}><img draggable="false" class="deleteIcon" src="./img/utility/trashcan.png" alt="Favorite"></button>
						<div class="tooltip favoriteTooltip"><span class="tooltipText">Favorite</span></div>
					</div>
				</div>
			</div>
		</div>
		<div class="compTitleContainer">
			<div class="compTitle">{comp.name}</div>
		</div>
		<div class="heroesContainer">
			<ul>
				{#each comp.heroes as hero}
				<li>
					<div class="compHero">{hero.name}</div>
				</li>
				{/each}
			</ul>
		</div>
	</div>
</div>

<style lang="scss">
	@media only screen and (min-width: 767px) {
	}
</style>
