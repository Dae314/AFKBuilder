<script>
	import { onMount, getContext } from 'svelte';
	import AppData from '../stores/AppData.js';
	import ModalCloseButton from '../modals/ModalCloseButton.svelte';
	import FilterPicker from '../modals/FilterPicker.svelte';

	const { open } = getContext('simple-modal');

	let showFilters = false;
	let tag_filter = [
		{ name: 'one', type: 'include' },
		{ name: 'two', type: 'exclude' },
		{ name: 'three', type: 'include' },
		{ name: 'four', type: 'exclude' },
	];
	let author_filter = [
		{ name: 'five', type: 'include' },
		{ name: 'six', type: 'exclude' },
		{ name: 'seven', type: 'include' },
		{ name: 'eight', type: 'exclude' },
	];
	let hero_filter = [
		{ name: 'nine', type: 'include' },
		{ name: 'ten', type: 'exclude' },
		{ name: 'eleven', type: 'include' },
		{ name: 'twelve', type: 'exclude' },
	];

	onMount(async () => {
		$AppData.activeView = 'explore';
	});

	function handleRemoveFilter(category, idx) {
		switch(category) {
			case 'tag':
				tag_filter = tag_filter.filter((e, i) => i !== idx);
				break;
			case 'author':
				author_filter = author_filter.filter((e, i) => i !== idx);
				break;
			case 'hero':
				hero_filter = hero_filter.filter((e, i) => i !== idx);
				break;
			default:
				throw new Error(`ERROR invalid category passed to handleRemoveFilter: ${category}`)
		}
	}

	function handleAddFilterButtonClick(category) {
		let curFilter;
		switch(category) {
			case 'tag':
				curFilter = tag_filter;
				break;
			case 'author':
				curFilter = author_filter;
				break;
			case 'hero':
				curFilter = hero_filter;
				break;
			default:
				throw new Error(`ERROR invalid category passed to handleAddFilterButtonClick: ${category}`);
		}
		open(FilterPicker,
			{ category,
				curFilter,
				onSuccess: (filterList) => handleFilterChangeSuccess({filterList, category}),
			},
			{ closeButton: ModalCloseButton }
		);
	}

	function handleFilterChangeSuccess({filterList, category}) {
		switch(category) {
			case 'tag':
				tag_filter = filterList;
				break;
			case 'author':
				author_filter = filterList;
				break;
			case 'hero':
				hero_filter = filterList;
				break;
			default:
				throw new Error(`ERROR invalid category passed to handleFilterChangeSuccess: ${category}`);
		}
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
					{#each tag_filter as tag, i}
						<button type="button" class="rmFilterButton tag {tag.type}" on:click={() => handleRemoveFilter('tag', i)}>{tag.name}</button>
					{/each}
				</div>
			</div>
			<div class="filterArea">
				<button type="button" class="addFilterButton addAuthorButton" on:click={() => handleAddFilterButtonClick('author')}>Add Authors</button>
				<div class="filterItems authorFilters">
					{#each author_filter as author, i}
						<button type="button" class="rmFilterButton author {author.type}" on:click={() => handleRemoveFilter('author', i)}>{author.name}</button>
					{/each}
				</div>
			</div>
			<div class="filterArea">
				<button type="button" class="addFilterButton addHeroButton" on:click={() => handleAddFilterButtonClick('hero')}>Add Heroes</button>
				<div class="filterItems heroFilters">
					{#each hero_filter as hero, i}
						<button type="button" class="rmFilterButton hero {hero.type}" on:click={() => handleRemoveFilter('hero', i)}>{hero.name}</button>
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
