<script>
	import { onMount, getContext } from 'svelte';
	import { query } from 'svelte-apollo';
	import RangeSlider from 'svelte-range-slider-pips';
	import AppData from '../stores/AppData.js';
	import ErrorDisplay from './ErrorDisplay.svelte';
	import ModalCloseButton from '../modals/ModalCloseButton.svelte';
	import FilterPicker from '../modals/FilterPicker.svelte';
	import LoadingSpinner from '../shared/LoadingSpinner.svelte';
	import { gql_GET_COMP_LIST } from '../gql/queries.svelte';
	import { getCompAuthor } from '../rest/RESTFunctions.svelte';

	const { open } = getContext('simple-modal');

	let showErrorDisplay = false;
	let errorDisplayConf = {};
	let showFilters = false;
	let tag_filter = [];
	let author_filter = [];
	let hero_filter = [];
	const now = Date.now();
	const timeValues = [
		{ name: 'forever', value: new Date(now - 3.156e+11) }, // 10 years
		{ name: '1yr', value: new Date(now - 3.156e10) },
		{ name: '6mo', value: new Date(now - 1.577e10) },
		{ name: '1mo', value: new Date(now - 2.628e9) },
		{ name: '1w', value: new Date(now - 6.048e8) },
		{ name: '1d', value: new Date(now - 8.64e7) },
		{ name: 'now', value: new Date(now - 0) },
	];
	let timeLimits = [0, timeValues.length - 1];
	let processCompsPromise;
	let processedComps;

	$: minDate = timeValues[timeLimits[0]].value.toISOString();
	$: maxDate = timeValues[timeLimits[1]].value.toISOString();
	$: gqlFilter = makeFilter({tag_filter, author_filter, hero_filter, minDate, maxDate});
	$: compsQuery = query(gql_GET_COMP_LIST, { variables: { filter: gqlFilter } });
	$: if(!$compsQuery.loading) processCompsPromise = processComps($compsQuery.data.comps.data);
	$: console.log(processedComps);

	onMount(async () => {
		$AppData.activeView = 'explore';
	});

	function makeFilter({tag_filter, author_filter, hero_filter, minDate, maxDate}) {
		let andArr = [];
		let orArr = [];
		for(let tag of tag_filter) {
			andArr.push({ tags: { id: { eq: tag.id } } });
		}
		for(let hero of hero_filter) {
			andArr.push({ heroes: { id: { eq: hero.id } } });
		}
		for(let author of author_filter) {
			orArr.push({ author: { id: { eq: author.id } } });
		}
		if(orArr.length > 0) andArr.push({ or: orArr });
		andArr.push({ comp_update: { gte: minDate } });
		andArr.push({ comp_update: { lte: maxDate } });
		return { and: andArr };
	}

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

	async function processComps(compList) {
		let response;
		let procHeroes;
		let procAuthor;
		let processedList = [];
		if(compList) {
			for(const comp of compList) {
				response = await getCompAuthor(comp.attributes.uuid);
				if(response.status !== 200) {
					errorDisplayConf = {
						errorCode: response.status,
						headText: 'Something went wrong',
						detailText: response.data,
						showHomeButton: true,
					};
					showErrorDisplay = true;
				} else {
					procAuthor = response.data.author;
				}
				procHeroes = comp.attributes.heroes.data.map(e => {
					return { id: e.id, name: e.attributes.name};
				});
				processedList.push({
					id: comp.id,
					uuid: comp.attributes.uuid,
					name: comp.attributes.name,
					upvotes: comp.attributes.upvotes,
					downvotes: comp.attributes.downvotes,
					heroes: procHeroes,
					author: procAuthor,
					comp_update: comp.attributes.comp_update,
				});
			}
		}
		processedComps = processedList;
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
						<button type="button" class="rmFilterButton tag {tag.type}" on:click={() => handleRemoveFilter('tag', i)}>{tag.displayName}</button>
					{/each}
				</div>
			</div>
			<div class="filterArea">
				<button type="button" class="addFilterButton addAuthorButton" on:click={() => handleAddFilterButtonClick('author')}>Add Authors</button>
				<div class="filterItems authorFilters">
					{#each author_filter as author, i}
						<button type="button" class="rmFilterButton author {author.type}" on:click={() => handleRemoveFilter('author', i)}>{author.displayName}</button>
					{/each}
				</div>
			</div>
			<div class="filterArea">
				<button type="button" class="addFilterButton addHeroButton" on:click={() => handleAddFilterButtonClick('hero')}>Add Heroes</button>
				<div class="filterItems heroFilters">
					{#each hero_filter as hero, i}
						<button type="button" class="rmFilterButton hero {hero.type}" on:click={() => handleRemoveFilter('hero', i)}>{hero.displayName}</button>
					{/each}
				</div>
			</div>
		</div>
		<div class="secondaryFilters">
			<div class="filterArea">
				<div class="timeFilterArea">
					<RangeSlider
						id="timeSlider"
						bind:values={timeLimits}
						min={0}
						max={timeValues.length - 1}
						formatter={ v => timeValues[v].name }
						pips
						all='label'
						range
					/>
				</div>
			</div>
		</div>
	</div>
	<div class="pageSortArea">
		Paging and sorting goes here
	</div>
	<div class="compListArea">
		{#if $compsQuery.loading}
			<div class="loadingDiv">
				<LoadingSpinner type="dual-ring" size="medium" color={window.getComputedStyle(document.documentElement).getPropertyValue('--appColorPrimary')} />
			</div>
		{:else if $compsQuery.error}
			<ErrorDisplay
				errorCode="503"
				headText="Something went wrong"
				detailText="Check the console for details."
				showHomeButton={false}
			/>
		{:else}
			{#if showErrorDisplay}
				<ErrorDisplay
					errorCode={errorDisplayConf.errorCode}
					headText={errorDisplayConf.headText}
					detailText={errorDisplayConf.detailText}
					showHomeButton={errorDisplayConf.showHomeButton}
				/>
			{:else}
				{#await processCompsPromise}
					<div class="loadingDiv">
						<LoadingSpinner type="dual-ring" size="medium" color={window.getComputedStyle(document.documentElement).getPropertyValue('--appColorPrimary')} />
					</div>
				{:then _}
					<div>comps go here</div> 
				{/await}
			{/if}
		{/if}
	</div>
</div>

<style lang="scss">
	.exploreContainer {
		height: calc(100vh - var(--headerHeight));
		overflow-y: auto;
		padding: 0px 10px;
		position: relative;
		width: 100%;
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
		background-color: var(--appBGColor);
		border-radius: 10px;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
		left: 50%;
		margin-top: 10px;
		opacity: 0;
		overflow: hidden;
		padding: 10px 0px;
		position: absolute;
		transform: translate(-50%, 0);
		transition: all 0.2s;
		visibility: hidden;
		width: 95%;
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
		.secondaryFilters {
			.filterArea {
				.timeFilterArea {
					padding: 0px 30px;
				}
			}
		}
		:global(#timeSlider) {
			:global(.rangeBar) {
				background-color: var(--appColorPrimary);
			}
		}
	}
	.compListArea {
		height: 100%;
		width: 100%;
		.loadingDiv {
			align-items: center;
			display: flex;
			height: 100%;
			justify-content: center;
			width: 100%;
		}
	}
</style>
