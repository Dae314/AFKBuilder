<script>
	import { onMount, getContext } from 'svelte';
	import { querystring, replace } from 'svelte-spa-router';
	import { query } from 'svelte-apollo';
	import RangeSlider from 'svelte-range-slider-pips';
	import {debounce} from 'lodash';
	import qs from 'qs';
	import AppData from '../stores/AppData.js';
	import ErrorDisplay from './ErrorDisplay.svelte';
	import CompLibCard from './CompLibCard.svelte';
	import ModalCloseButton from '../modals/ModalCloseButton.svelte';
	import FilterPicker from '../modals/FilterPicker.svelte';
	import LoadingSpinner from '../shared/LoadingSpinner.svelte';
	import PageNav from '../shared/PageNav.svelte';
	import { gql_GET_COMP_LIST } from '../gql/queries.svelte';
	import { getCompAuthor } from '../rest/RESTFunctions.svelte';
import { element_is } from 'svelte/internal';

	const { open } = getContext('simple-modal');

	// configuration defaults
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
	const pageViewLimit = 2;
	const sortOptions = ['best', 'top', 'new', 'updated'];
	const defaultSort = 'best';
	const compPageOptions = [1, 10, 25, 50, 100];
	const defaultStartPage = 1;
	const defaultPageLimit = 25;
	const defaultSearchStr = '';
	const defaultTagFilter = [];
	const defaultAuthorFilter = [];
	const defaultHeroFilter = [];
	const defaultMinTime = 0;
	const defaultMaxTime = timeValues.length - 1;

	let showErrorDisplay = false;
	let errorDisplayConf = {};
	let searchStr = defaultSearchStr;
	let showFilters = false;
	let tag_filter = defaultTagFilter;
	let author_filter = defaultAuthorFilter;
	let hero_filter = defaultHeroFilter;
	let timeLimits = [defaultMinTime, defaultMaxTime];
	let processCompsPromise;
	let processedComps = [];
	let curSort = defaultSort;
	let compPageLimit = defaultPageLimit;
	let curPage = defaultStartPage;
	let pageInfo = {page: 1, pageCount: 1, pageSize: compPageLimit, total: 0};
	let sortSelectEl;
	let pageLimitSelectEl;

	$: processQS($querystring);
	$: gqlFilter = makeFilter({searchStr, tag_filter, author_filter, hero_filter, timeLimits});
	$: pageSettings = makePageSettings({curPage, compPageLimit});
	$: sortSettings = makeSortSettings({curSort});
	$: compsQuery = query(gql_GET_COMP_LIST, { variables: { filter: gqlFilter, pagination: pageSettings, sort: sortSettings } });
	$: if(!$compsQuery.loading) processCompsPromise = processComps($compsQuery.data.comps.data);
	$: if(!$compsQuery.loading) pageInfo = $compsQuery.data.comps.meta.pagination;

	onMount(async () => {
		$AppData.activeView = 'explore';
	});

	function processQS(queryString) {
		const urlqs = new URLSearchParams(queryString);
		searchStr = urlqs.has('searchStr') ? decodeURIComponent(urlqs.get('searchStr')) : defaultSearchStr;
		tag_filter = urlqs.has('tag_filter') ? qs.parse(urlqs.get('tag_filter')).filter.map(e => {e.id = parseInt(e.id); return e}) : defaultTagFilter;
		author_filter = urlqs.has('author_filter') ? qs.parse(urlqs.get('author_filter')).filter.map(e => {e.id = parseInt(e.id); return e}) : defaultAuthorFilter;
		hero_filter = urlqs.has('hero_filter') ? qs.parse(urlqs.get('hero_filter')).filter.map(e => {e.id = parseInt(e.id); return e}) : defaultHeroFilter;
		timeLimits[0] = urlqs.has('minDate') ? parseInt(decodeURIComponent(urlqs.get('minDate'))) : defaultMinTime;
		timeLimits[1] = urlqs.has('maxDate') ? parseInt(decodeURIComponent(urlqs.get('maxDate'))) : defaultMaxTime;
		curPage = urlqs.has('page') ? parseInt(decodeURIComponent(urlqs.get('page'))) : defaultStartPage;
		compPageLimit = urlqs.has('pageLimit') ? parseInt(decodeURIComponent(urlqs.get('pageLimit'))) : defaultPageLimit;
		curSort = urlqs.has('sort') ? decodeURIComponent(urlqs.get('sort')) : defaultSort;
	}

	function makeFilter({searchStr, tag_filter, author_filter, hero_filter, timeLimits}) {
		let andArr = [];
		let orArr = [];

		const minDate = timeValues[timeLimits[0]].value.toISOString();
		const maxDate = timeValues[timeLimits[1]].value.toISOString();

		// create filter array
		andArr.push({ name: { containsi: searchStr } });
		for(let tag of tag_filter) {
			if(tag.type === 'include') {
				andArr.push({ tags: { id: { eq: tag.id } } });
			} else {
				andArr.push({ tags: { id: { not: { eq: tag.id } } } });
			}
		}
		for(let hero of hero_filter) {
			if(hero.type === 'include') {
				andArr.push({ heroes: { id: { eq: hero.id } } });
			} else {
				andArr.push({ heroes: { id: { not: { eq: hero.id } } } });
			}
		}
		for(let author of author_filter) {
			if(author.type === 'include') {
				orArr.push({ author: { id: { eq: author.id } } });
			} else {
				andArr.push({ author: { id: { not: { eq: author.id } } } });
			}
		}
		if(orArr.length > 0) andArr.push({ or: orArr });
		andArr.push({ createdAt: { gte: minDate } });
		andArr.push({ createdAt: { lte: maxDate } });
		return { and: andArr };
	}
	
	function makePageSettings({curPage, compPageLimit}) {
		return {
			page: curPage,
			pageSize: compPageLimit,
		}
	}

	function makeSortSettings({curSort}) {
		switch(curSort) {
			case 'best':
				return ['score:desc', 'name:asc'];
			case 'top':
				return ['upvotes:desc', 'name:asc'];
			case 'new':
				return ['createdAt:desc', 'name:asc'];
			case 'updated':
				return ['comp_update:desc', 'name:asc'];
			default:
				return ['score:desc', 'name:asc'];
		}
	}

	function handleSearchStrChange(event) {
		let newQS = new URLSearchParams($querystring);
		if(event.target.value) {
			newQS.set('searchStr', encodeURIComponent(event.target.value));
		} else {
			newQS.delete('searchStr');
		}
		if(newQS.has('page')) newQS.delete('page');
		replace(`/explore?${newQS.toString()}`);
	}

	function handleSearchButtonClick() {
		const search = document.getElementById('compSearch');
		let newQS = new URLSearchParams($querystring);
		if(search.value) {
			newQS.set('searchStr', encodeURIComponent(search.value));
		} else {
			newQS.delete('searchStr');
		}
		if(newQS.has('page')) newQS.delete('page');
		replace(`/explore?${newQS.toString()}`);
	}

	function handleRemoveFilter(category, idx) {
		let newQS = new URLSearchParams($querystring);
		let new_filter = [];
		switch(category) {
			case 'tag':
				new_filter = tag_filter.filter((e, i) => i !== idx);
				if(new_filter.length !== 0) {
					newQS.set('tag_filter', qs.stringify({filter: new_filter}));
				} else {
					newQS.delete('tag_filter');
				}
				break;
			case 'author':
				new_filter = author_filter.filter((e, i) => i !== idx);
				if(new_filter.length !== 0) {
					newQS.set('author_filter', qs.stringify({filter: new_filter}));
				} else {
					newQS.delete('author_filter');
				}
				break;
			case 'hero':
				new_filter = hero_filter.filter((e, i) => i !== idx);
				if(new_filter.length !== 0) {
					newQS.set('hero_filter', qs.stringify({filter: new_filter}));
				} else {
					newQS.delete('hero_filter');
				}
				break;
			default:
				throw new Error(`ERROR invalid category passed to handleRemoveFilter: ${category}`)
		}
		if(newQS.has('page')) newQS.delete('page');
		replace(`/explore?${newQS.toString()}`);
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
		let newQS = new URLSearchParams($querystring);
		switch(category) {
			case 'tag':
				if(filterList.length !== 0) {
					newQS.set('tag_filter', qs.stringify({filter: filterList}));
				} else {
					newQS.delete('tag_filter');
				}
				break;
			case 'author':
				if(filterList.length !== 0) {
					newQS.set('author_filter', qs.stringify({filter: filterList}));
				} else {
					newQS.delete('author_filter');
				}
				break;
			case 'hero':
				if(filterList.length !== 0) {
					newQS.set('hero_filter', qs.stringify({filter: filterList}));
				} else {
					newQS.delete('hero_filter');
				}
				break;
			default:
				throw new Error(`ERROR invalid category passed to handleFilterChangeSuccess: ${category}`);
		}
		if(newQS.has('page')) newQS.delete('page');
		replace(`/explore?${newQS.toString()}`);
	}

	function handleTimeValueChange(event) {
		let newQS = new URLSearchParams($querystring);
		const newLimits = event.detail.values;
		if(newLimits[0] !== defaultMinTime) {
			newQS.set('minDate', encodeURIComponent(newLimits[0]));
		} else {
			newQS.delete('minDate');
		}
		if(newLimits[1] !== defaultMaxTime) {
			newQS.set('maxDate', encodeURIComponent(newLimits[1]));
		} else {
			newQS.delete('maxDate');
		}
		if(newQS.has('page')) newQS.delete('page');
		replace(`/explore?${newQS.toString()}`);
	}

	function handleSortChange(selectObj) {
		let newQS = new URLSearchParams($querystring);
		if(selectObj.value !== defaultSort) {
			newQS.set('sort', encodeURIComponent(selectObj.value));
		} else {
			newQS.delete('sort');
		}
		if(newQS.has('page')) newQS.delete('page');
		replace(`/explore?${newQS.toString()}`);
	}

	function handlePageLimitChange(selectObj) {
		let newQS = new URLSearchParams($querystring);
		if(selectObj.value !== defaultPageLimit) {
			newQS.set('pageLimit', encodeURIComponent(selectObj.value));
		} else {
			newQS.delete('pageLimit');
		}
		if(newQS.has('page')) newQS.delete('page');
		replace(`/explore?${newQS.toString()}`);
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
					createdAt: comp.attributes.createdAt,
					heroes: procHeroes,
					author: procAuthor,
					comp_update: comp.attributes.comp_update,
				});
			}
		}
		processedComps = processedList;
	}

	function handlePageEvent(event) {
		let newQS = new URLSearchParams($querystring);
		if(event.detail.data.page !== defaultStartPage) {
			newQS.set('page', encodeURIComponent(event.detail.data.page));
		} else {
			newQS.delete('page');
		}
		replace(`/explore?${newQS.toString()}`);
	}
</script>

<div class="exploreContainer">
	<div class="exploreHead">
		<div class="mobileSearchArea">
			<input id="compSearch" value={searchStr} on:search={handleSearchStrChange} class="filterInput" type="search" placeholder="search" />
			<button type="button" class="headButton searchButton" on:click={handleSearchButtonClick}>
				<img class="searchImage" src="./img/utility/search_white.png" alt="search" />
			</button>
		</div>
		<div class="filterButtonArea">
			<button type="button" class="headButton openFiltersButton" class:open={showFilters} on:click={() => showFilters = !showFilters}>
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
						values={timeLimits}
						min={0}
						max={timeValues.length - 1}
						formatter={ v => timeValues[v].name }
						on:change={debounce(handleTimeValueChange, 300)}
						pips
						all='label'
						range
					/>
				</div>
			</div>
		</div>
	</div>
	<div class="pageSortArea">
		<div class="sortArea">
			<span class="selectText sortText">Sort by:</span>
			<select class="exploreSelect sortSelect" value={curSort} bind:this={sortSelectEl} on:change={() => handleSortChange(sortSelectEl)}>
				{#each sortOptions as option}
					<option value={option}>{option}</option>
				{/each}
			</select>
		</div>
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
					{#if processedComps.length <= 0}
						<div class="noComps">
							<span>No comps found :(</span>
						</div>
					{:else}
						<div class="pageNavArea">
							<PageNav pageInfo={pageInfo} on:pageEvent={handlePageEvent} viewLimit={pageViewLimit} />
						</div>
						<div class="compGrid">
							{#each processedComps as comp}
								<CompLibCard bind:comp={comp} />
							{/each}
						</div>
						<div class="pageNavArea">
							<PageNav pageInfo={pageInfo} on:pageEvent={handlePageEvent} viewLimit={pageViewLimit} />
						</div>
					{/if}
				{/await}
			{/if}
		{/if}
	</div>
	<div class="exploreFooter">
		<div class="resultInfo">
			<span>{pageInfo.total} {pageInfo.total === 1 ? 'result' : 'results'}</span>
		</div>
		<div class="pageLimitArea">
			<span class="selectText pageLimitText">Results per page:</span>
			<select class="exploreSelect pageLimitSelect" value={compPageLimit} bind:this={pageLimitSelectEl} on:change={() => handlePageLimitChange(pageLimitSelectEl)}>
				{#each compPageOptions as option}
					<option value={option}>{option}</option>
				{/each}
			</select>
		</div>
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
		.headButton {
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
		}
		.mobileSearchArea {
			align-items: center;
			display: flex;
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
			.searchButton {
				margin-left: 9px;
				.searchImage {
					max-width: 25px;
				}
			}
		}
		.filterButtonArea {
			align-items: center;
			display: flex;
			margin-left: 5px;
			.openFiltersButton {
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
		z-index: 2;
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
						max-width: 125px;
						outline: none;
						overflow: hidden;
						padding: 2px;
						text-overflow: ellipsis;
						white-space: nowrap;
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
	.exploreSelect {
		border: 1px solid var(--appColorPrimary);
		border-radius: 5px;
		outline: none;
		padding: 3px;
	}
	.pageSortArea {
		display: flex;
		padding-top: 10px;
		.sortArea {
			margin-left: auto;
		}
	}
	.noComps {
		color: rgba(100, 100, 100, 0.3);
		font-size: 4rem;
		font-weight: bold;
		height: 100%;
		padding: 50px 0px;
		text-align: center;
		text-transform: uppercase;
		width: 100%;
		user-select: none;
	}
	.pageNavArea {
		display: flex;
		justify-content: center;
		margin-bottom: 10px;
		width: 100%;
	}
	.compListArea {
		padding-top: 0px;
		width: 100%;
		.loadingDiv {
			align-items: center;
			display: flex;
			height: 100%;
			justify-content: center;
			width: 100%;
		}
		.compGrid {
			display: grid;
			grid-gap: 5px 5px;
			grid-template-columns: repeat(auto-fill, minmax(400px, 400px));
			grid-auto-rows: 240px;
			justify-content: space-around;
		}
	}
	.exploreFooter {
		display: flex;
		.pageLimitArea {
			margin-left: auto;
		}
	}
	@media only screen and (min-width: 767px) {
		.exploreHead {
			padding-left: 12.5%;
			padding-right: 12.5%;
		}
		.filterContainer {
			width: 75%;
		}
		.pageSortArea {
			padding-left: 12.5%;
			padding-right: 12.5%;
		}
		.exploreFooter {
			padding-left: 12.5%;
			padding-right: 12.5%;
		}
	}
</style>
