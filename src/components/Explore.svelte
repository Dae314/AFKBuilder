<script>
	import { onMount, getContext } from 'svelte';
	import AppData from '../stores/AppData.js';
	import ModalCloseButton from '../modals/ModalCloseButton.svelte';
	import FilterPicker from '../modals/FilterPicker.svelte';

	const { open } = getContext('simple-modal');

	let showFilters = false;
	let include_tags = ['one', 'two'];
	let exclude_tags = ['three', 'four'];
	let include_authors = ['five', 'six'];
	let exclude_authors = ['seven', 'eight'];
	let include_heroes = ['nine', 'ten'];
	let exclude_heroes = ['eleven', 'twelve'];

	onMount(async () => {
		$AppData.activeView = 'explore';
	});

	function handleRemoveFilter(category, idx) {
		switch(category) {
			case 'include_tags':
				include_tags = include_tags.filter((e, i) => i !== idx);
				break;
			case 'exclude_tags':
				exclude_tags = exclude_tags.filter((e, i) => i !== idx);
				break;
			case 'include_authors':
				include_authors = include_authors.filter((e, i) => i !== idx);
				break;
			case 'exclude_authors':
				exclude_authors = exclude_authors.filter((e, i) => i !== idx);
				break;
			case 'include_heroes':
				include_heroes = include_heroes.filter((e, i) => i !== idx);
				break;
			case 'exclude_heroes':
				exclude_heroes = exclude_heroes.filter((e, i) => i !== idx);
				break;
			default:
				throw new Error(`ERROR invalid category passed to handleRemoveFilter: ${category}`)
		}
	}

	function handleAddFilterButtonClick(category) {
		let curInclude;
		let curExclude;
		switch(category) {
			case 'tag':
				curInclude = include_tags;
				curExclude = exclude_tags;
				break;
			case 'author':
				curInclude = include_authors;
				curExclude = exclude_authors;
				break;
			case 'hero':
				curInclude = include_heroes;
				curExclude = exclude_heroes;
				break;
			default:
				throw new Error(`ERROR invalid category passed to handleAddFilterButtonClick: ${category}`);
		}
		open(FilterPicker,
			{ category,
				curInclude,
				curExclude,
				onSuccess: (array) => handleFilterChangeSuccess({array, category}),
			},
			{ closeButton: ModalCloseButton }
		);
	}

	function handleFilterChangeSuccess({array, category}) {
		console.log(`Array: ${array}, category: ${category}`);
	}
</script>

<div class="exploreContainer">
	<div class="exploreHead">
		<div class="mobileSearchArea">
			<input class="filterInput" type="text" placeholder="search" />
		</div>
		<div class="filterButtonArea">
			<button type="button" class="openFiltersButton" class:open={showFilters} on:click={() => showFilters = !showFilters}>
				<img class="openFiltersImage" src={ showFilters ? './img/utility/filter_color.png' : './img/utility/filter_white.png' } alt="Open Filters">
			</button>
		</div>
	</div>
	<div class="filterContainer" class:open={showFilters}>
		<div class="primaryFilters">
			<div class="filterArea">
				<button type="button" class="addFilterButton addTagButton" on:click={() => handleAddFilterButtonClick('tag')}>Add Tags</button>
				<div class="filterItems tagFilters">
					{#each include_tags as tag, i}
						<button type="button" class="rmFilterButton tag include" on:click={() => handleRemoveFilter('include_tags', i)}>{tag}</button>
					{/each}
					{#each exclude_tags as tag, i}
						<button type="button" class="rmFilterButton tag exclude" on:click={() => handleRemoveFilter('exclude_tags', i)}>{tag}</button>
					{/each}
				</div>
			</div>
			<div class="filterArea">
				<button type="button" class="addFilterButton addAuthorButton" on:click={() => handleAddFilterButtonClick('author')}>Add Authors</button>
				<div class="filterItems authorFilters">
					{#each include_authors as author, i}
						<button type="button" class="rmFilterButton author include" on:click={() => handleRemoveFilter('include_authors', i)}>{author}</button>
					{/each}
					{#each exclude_authors as author, i}
						<button type="button" class="rmFilterButton author exclude" on:click={() => handleRemoveFilter('exclude_authors', i)}>{author}</button>
					{/each}
				</div>
			</div>
			<div class="filterArea">
				<button type="button" class="addFilterButton addHeroButton" on:click={() => handleAddFilterButtonClick('hero')}>Add Heroes</button>
				<div class="filterItems heroFilters">
					{#each include_heroes as hero, i}
						<button type="button" class="rmFilterButton hero include" on:click={() => handleRemoveFilter('include_heroes', i)}>{hero}</button>
					{/each}
					{#each exclude_heroes as hero, i}
						<button type="button" class="rmFilterButton hero exclude" on:click={() => handleRemoveFilter('exclude_heroes', i)}>{hero}</button>
					{/each}
				</div>
			</div>
		</div>
		<div class="secondaryFilters">
			<div class="filterArea">
			</div>
		</div>
	</div>
</div>

<style lang="scss">
	.exploreContainer {
		height: calc(100vh - var(--headerHeight));
		overflow-y: auto;
		width: 100%;
		padding: 0px 10px;
	}
	.exploreHead {
		display: flex;
		padding-top: 15px;
		.mobileSearchArea {
			align-items: center;
			display: flex;
			padding-right: 10px;
			width: 100%;
			.filterInput {
				border: 1px solid var(--appColorPrimary);
				border-radius: 5px;
				font-size: 1.2rem;
				padding: 8px;
				width: 100%;
				&:focus {
					border-color: var(--appColorPrimary);
					box-shadow: 0 0 0 2px var(--appColorPrimary);
					outline: 0;
				}
			}
		}
		.filterButtonArea {
			align-items: center;
			display: flex;
			.openFiltersButton {
				align-items: center;
				background-color: var(--appColorPrimary);
				border: 2px solid var(--appColorPrimary);
				border-radius: 10px;
				box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
				cursor: pointer;
				display: flex;
				height: 40px;
				justify-content: center;
				outline: none;
				transition: all 0.2s;
				width: 40px;
				.openFiltersImage {
					max-width: 25px;
				}
				&.open {
					background-color: transparent;
				}
			}
		}
	}
	.filterContainer {
		border-radius: 10px;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
		margin-top: 10px;
		opacity: 0;
		overflow: hidden;
		padding: 10px 0px;
		transition: all 0.2s;
		visibility: hidden;
		width: 100%;
		&.open {
			opacity: 1;
			visibility: visible;
		}
		.primaryFilters {
			display: flex;
			.filterArea {
				align-items: center;
				border-right: 1px solid black;
				display: flex;
				flex-direction: column;
				width: 33.33%;
				&:last-child {
					border-right: none;
				}
				.addFilterButton {
					background-color: var(--appColorPrimary);
					border: 2px solid var(--appColorPrimary);
					border-radius: 10px;
					color: var(--appBGColor);
					cursor: pointer;
					padding: 5px;
					font-size: 1rem;
					outline: none;
				}
				.filterItems {
					align-items: center;
					display: flex;
					flex-wrap: wrap;
					justify-content: center;
					margin-top: 5px;
					.rmFilterButton {
						background: var(--appColorPrimary);
						border: 2px solid var(--appColorPrimary);
						border-radius: 30px;
						color: var(--appBGColor);
						cursor: pointer;
						font-size: 0.7rem;
						flex-grow: 0;
						flex-shrink: 0;
						margin: 2px 5px;
						outline: none;
						&:before {
							background-color: var(--appBGColor);
							border-radius: 50%;
							color: var(--appColorPrimary);
							content: '—';
							font-weight: bold;
							font-size: 0.6rem;
							margin-right: 3px;
							text-align: center;
						}
						&.exclude {
							background: var(--appDelColor);
							border-color: var(--appDelColor);
							&:before {
								color: var(--appDelColor);
							}
						}
					}
				}
			}
		}
	}
</style>
