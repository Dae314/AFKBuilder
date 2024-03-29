<script>
	import { onMount, getContext, createEventDispatcher } from 'svelte';
	import { querystring, replace } from 'svelte-spa-router';
	// import { query } from 'svelte-apollo';
	import RangeSlider from 'svelte-range-slider-pips';
	import {debounce} from 'lodash';
	import qs from 'qs';
	import JSONURL from 'json-url';
	import AppData from '../stores/AppData.js';
	import ErrorDisplay from './ErrorDisplay.svelte';
	import CompLibCard from './CompLibCard.svelte';
	import ModalCloseButton from '../modals/ModalCloseButton.svelte';
	import FilterPicker from '../modals/FilterPicker.svelte';
	import LoadingSpinner from '../shared/LoadingSpinner.svelte';
	import PageNav from '../shared/PageNav.svelte';
	// import { gql_GET_COMP_LIST } from '../gql/queries.svelte';
	import { getCompAuthor, getComps } from '../rest/RESTFunctions.svelte';

	const { open } = getContext('simple-modal');
	const dispatch = createEventDispatcher();
	const jsurl = JSONURL('lzma'); // json-url compressor

	// configuration defaults
	const timeValues = [
		{ name: 'forever', value: offset(-3.156e+11) }, // 10 years
		{ name: '1yr', value: offset(-3.156e10) },
		{ name: '6mo', value: offset(-1.577e10) },
		{ name: '1mo', value: offset(-2.628e9) },
		{ name: '1w', value: offset(-6.048e8) },
		{ name: '1d', value: offset(-8.64e7) },
		{ name: 'now', value: offset(0) },
	];
	const pageViewLimit = 2;
	const sortOptions = ['best', 'top', 'new', 'updated'];
	const defaultSort = 'best';
	const compPageOptions = [1, 5, 10, 25];
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
	// let processCompsPromise;
	let processedComps = [];
	let curSort = defaultSort;
	let compPageLimit = defaultPageLimit;
	let curPage = defaultStartPage;
	let pageInfo = {page: 1, pageCount: 1, pageSize: compPageLimit, total: 0};
	let sortSelectEl;
	let pageLimitSelectEl;

	$: processQS($querystring);
	// $: gqlFilter = makeFilter({searchStr, tag_filter, author_filter, hero_filter, timeLimits});
	$: restFilter = makeRestFilter({searchStr, tag_filter, author_filter, hero_filter, timeLimits});
	$: pageSettings = makePageSettings({curPage, compPageLimit});
	$: sortSettings = makeSortSettings({curSort});
	$: restQS = makeRESTQS({restFilter, pageSettings, sortSettings});
	$: restPromise = populateCompsData(restQS);
	// $: compsQuery = query(gql_GET_COMP_LIST, { variables: { filter: gqlFilter, pagination: pageSettings, sort: sortSettings }, fetchPolicy: 'no-cache' });
	// $: if(!$compsQuery.loading && $compsQuery.data) processCompsPromise = processComps($compsQuery.data.comps.data);
	// $: if(!$compsQuery.loading && $compsQuery.data) pageInfo = $compsQuery.data.comps.meta.pagination;

	onMount(async () => {
		$AppData.activeView = 'explore';
	});

	// return a function that calculates a time offset
	function offset(time) {
		return () => new Date(Date.now() + time);
	}

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

	async function populateCompsData(restQS) {
		const response = await getComps(restQS);
		if(response.status !== 200) {
			errorDisplayConf = {
				errorCode: response.status,
				headText: 'Something went wrong',
				detailText: response.data,
				showHomeButton: true,
			};
			showErrorDisplay = true;
			return;
		}
		let processedList = [];
		let procHeroes;
		for(const comp of response.data.comps) {
			procHeroes = comp.attributes.heroes.data.map(e => {
				return { id: e.id, name: e.attributes.name};
			});
			let data;
			try {
				const json = await jsurl.decompress(comp.attributes.comp_string);
				data = JSON.parse(json);
			} catch(err) {
				errorDisplayConf = {
					errorCode: 400,
					headText: 'Unable to process comps',
					detailText: 'See console for details',
					showHomeButton: false,
				};
				console.log(err);
				showErrorDisplay = true;
				return;
			}
			let line_preview = data.lines[0].heroes;
			processedList.push({
				id: comp.id,
				uuid: comp.attributes.uuid,
				name: comp.attributes.name,
				upvotes: comp.attributes.upvotes,
				downvotes: comp.attributes.downvotes,
				createdAt: comp.attributes.createdAt,
				heroes: procHeroes,
				author: comp.attributes.author,
				comp_update: comp.attributes.comp_update,
				line_preview: line_preview,
			});
		}
		processedComps = processedList;
		pageInfo = response.data.meta.pagination;
	}

	function makeFilter({searchStr, tag_filter, author_filter, hero_filter, timeLimits}) {
		let andArr = [];
		let orArr = [];

		const minDate = timeValues[timeLimits[0]].value().toISOString();
		const maxDate = timeValues[timeLimits[1]].value().toISOString();

		// create filter array
		if(searchStr) andArr.push({
			or: [
				{ name: { containsi: searchStr } },
				{ tags: { name: { containsi: searchStr} } },
			]
		});
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

		// only add time filters if the values are non-default
		if(timeLimits[0] !== defaultMinTime) {
			andArr.push({ createdAt: { gte: minDate } });
		}
		if(timeLimits[1] !== defaultMaxTime) {
			andArr.push({ createdAt: {lte: maxDate } });
		}
		return { and: andArr };
	}

	function makeRestFilter({searchStr, tag_filter, author_filter, hero_filter, timeLimits}) {
		let andArr = [];
		let orArr = [];

		const minDate = timeValues[timeLimits[0]].value().toISOString();
		const maxDate = timeValues[timeLimits[1]].value().toISOString();

		// create filter array
		if(searchStr) andArr.push({
			$or: [
				{ name: { $containsi: searchStr } },
				{ tags: { name: { $containsi: searchStr} } },
			]
		});
		for(let tag of tag_filter) {
			if(tag.type === 'include') {
				andArr.push({ tags: { id: { $eq: tag.id } } });
			} else {
				andArr.push({ tags: { id: { $not: { $eq: tag.id } } } });
			}
		}
		for(let hero of hero_filter) {
			if(hero.type === 'include') {
				andArr.push({ heroes: { id: { $eq: hero.id } } });
			} else {
				andArr.push({ heroes: { id: { $not: { $eq: hero.id } } } });
			}
		}
		for(let author of author_filter) {
			if(author.type === 'include') {
				orArr.push({ author: { id: { $eq: author.id } } });
			} else {
				andArr.push({ author: { id: { $not: { $eq: author.id } } } });
			}
		}
		if(orArr.length > 0) andArr.push({ $or: orArr });

		// only add time filters if the values are non-default
		if(timeLimits[0] !== defaultMinTime) {
			andArr.push({ createdAt: { $gte: minDate } });
		}
		if(timeLimits[1] !== defaultMaxTime) {
			andArr.push({ createdAt: { $lte: maxDate } });
		}
		return { $and: andArr };
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

	function makeRESTQS({restFilter, pageSettings, sortSettings}) {
		return qs.stringify({
			filters: restFilter,
			pagination: pageSettings,
			sort: sortSettings,
			populate: ['heroes'],
		});
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
		const bgColor = window.getComputedStyle(document.documentElement).getPropertyValue('--appBGColor');
		open(FilterPicker,
			{ category,
				curFilter,
				onSuccess: (filterList) => handleFilterChangeSuccess({filterList, category}),
			},
			{ closeButton: ModalCloseButton,
				styleWindow: { background: bgColor },
				styleContent: {background: bgColor, borderRadius: '10px'},
			}
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
		if(parseInt(selectObj.value) !== defaultPageLimit) {
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

	function handleCardEvent(event) {
		switch(event.detail.action) {
			case 'saveData':
				dispatch('routeEvent', {action: 'saveData'});
				break;
			case 'logout':
				dispatch('routeEvent', {action: 'logout'});
				break;
			case 'syncFavorites':
				dispatch('routeEvent', {action: 'syncFavorites'});
				break;
			case 'loading':
				dispatch('routeEvent', {action: 'showNotice', data: { noticeConf: {type: 'loading'}}});
				break;
			case 'stopLoading':
				dispatch('routeEvent', {action: 'clearNotice'});
				break;
			default:
				throw new Error(`Invalid action specified for card event: ${event.detail.action}`);
		}
	}
</script>

<div class="exploreContainer">
	<div class="exploreHead">
		<div class="mobileSearchArea">
			<input id="compSearch" value={searchStr} on:search={handleSearchStrChange} class="filterInput" type="search" placeholder="Search titles or tags" />
			<button type="button" class="headButton searchButton" on:click|stopPropagation={handleSearchButtonClick}>
				<img class="searchImage" class:light={$AppData.colorProfile === 'light'} src="./img/utility/search_white.png" alt="search" />
			</button>
			<button type="button" class="headButton openFiltersButton" class:open={showFilters} on:click|stopPropagation={() => showFilters = !showFilters}>
				<img class="openFiltersImage" class:light={$AppData.colorProfile === 'light'} src='./img/utility/filter_white.png' alt="Open Filters">
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
		<!-- {#if $compsQuery.loading}
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
		{:else} -->
		{#await restPromise}
			<div class="loadingDiv">
				<LoadingSpinner type="dual-ring" size="medium" color={window.getComputedStyle(document.documentElement).getPropertyValue('--appColorPrimary')} />
			</div>
		{:then _}
			{#if showErrorDisplay}
				<ErrorDisplay
					errorCode={errorDisplayConf.errorCode}
					headText={errorDisplayConf.headText}
					detailText={errorDisplayConf.detailText}
					showHomeButton={errorDisplayConf.showHomeButton}
				/>
			{:else}
				<!-- {#await processCompsPromise}
					<div class="loadingDiv">
						<LoadingSpinner type="dual-ring" size="medium" color={window.getComputedStyle(document.documentElement).getPropertyValue('--appColorPrimary')} />
					</div>
				{:then _} -->
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
								<CompLibCard bind:comp={comp} on:cardEvent={handleCardEvent} />
							{/each}
						</div>
						<div class="pageNavArea">
							<PageNav pageInfo={pageInfo} on:pageEvent={handlePageEvent} viewLimit={pageViewLimit} />
						</div>
					{/if}
				<!-- {/await} -->
			{/if}
		{/await}
		<!-- {/if} -->
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
		height: 100%;
		height: calc(var(--vh, 1vh) * 100 - var(--headerHeight)); /* gymnastics to set height for mobile browsers */
		overflow-y: auto;
		padding: 0px 10px;
		padding-bottom: 10px;
		position: relative;
		width: 100%;
	}
	.exploreHead {
		display: flex;
		padding-top: 15px;
		.headButton {
			align-items: center;
			background-color: transparent;
			border: none;
			border-radius: 10px;
			cursor: pointer;
			display: flex;
			height: 40px;
			justify-content: center;
			outline: none;
			padding: 0;
			position: absolute;
			transition: all 0.2s;
			width: 40px;
		}
		.mobileSearchArea {
			align-items: center;
			display: flex;
			position: relative;
			width: 100%;
			.filterInput {
				background-color: var(--appBGColorLight);
				border: none;
				border-radius: 5px;
				box-shadow: var(--neu-med-i-BGColor-shadow);
				color: var(--appColorBlack);
				font-size: 1.2rem;
				outline: none;
				padding: 8px;
				width: 100%;
				&:focus {
					background-color: var(--appTextInputFocusBG);
				}
				&::placeholder {
					color: var(--appColorBlack);
					opacity: 0.5;
				}
			}
			.searchButton {
				right: 71px;
				.searchImage {
					max-width: 25px;
					opacity: 0.3;
					&.light {
						filter: invert(1);
					}
				}
			}
			.openFiltersButton {
				right: 31px;
				.openFiltersImage {
					max-width: 25px;
					opacity: 0.3;
					&.light {
						filter: invert(1);
					}
				}
				&.open {
					.openFiltersImage {
						opacity: 0.7;
					}
				}
			}
		}
	}
	.filterContainer {
		background-color: var(--appBGColor);
		border-radius: 10px;
		box-shadow: var(--neu-large-ni-BGColor-shadow);
		left: 50%;
		margin-top: 15px;
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
				border-right: 1px solid var(--appColorBlack);
				display: flex;
				flex-direction: column;
				width: 33.33%;
				&:last-child {
					border-right: none;
				}
				.addFilterButton {
					background-color: var(--appBGColor);
					border: none;
					border-radius: 10px;
					box-shadow: var(--neu-sm-i-BGColor-shadow);
					color: var(--appColorBlack);
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
					margin-top: 10px;
					.rmFilterButton {
						background: var(--appBGColor);
						border: none;
						border-radius: 30px;
						box-shadow: var(--neu-sm-i-BGColor-shadow);
						color: var(--appColorBlack);
						cursor: pointer;
						font-size: 0.7rem;
						flex-grow: 0;
						flex-shrink: 0;
						margin: 5px 5px;
						max-width: 125px;
						outline: none;
						overflow: hidden;
						padding: 4px;
						text-overflow: ellipsis;
						transition: all 0.2s;
						white-space: nowrap;
						&:before {
							background-color: var(--appDelColor);
							border-radius: 50%;
							color: var(--appBGColor);
							content: '—';
							font-weight: bold;
							font-size: 0.6rem;
							margin-right: 2px;
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
				background-color: var(--appColorTertiary);
			}
			:global(.rangeHandle) {
				:global(.rangeNub) {
					background-color: var(--appColorBlack);
				}
			}
			:global(.rangePips) {
				:global(.pip) {
					background-color: var(--appColorBlack);
					:global(.pipVal) {
						color: var(--appColorBlack);
					}
				}
			}
		}
	}
	.pageSortArea {
		display: flex;
		padding-top: 10px;
		.sortArea {
			font-size: 0.9rem;
			margin-left: auto;
			.exploreSelect {
				background: var(--appBGColor);
				border: 1px solid var(--appColorBlack);
				border-radius: 5px;
				color: var(--appColorBlack);
				outline: none;
				padding: 3px;
			}
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
			grid-gap: 10px 20px;
			grid-template-columns: repeat(auto-fill, minmax(400px, 400px));
			grid-auto-rows: 240px;
			justify-content: space-around;
		}
	}
	.exploreFooter {
		display: flex;
		.resultInfo {
			display: none;
		}
		.pageLimitArea {
			margin-left: auto;
			.selectText {
				font-size: 0.9rem;
			}
			.exploreSelect {
				background: var(--appBGColor);
				border: 1px solid var(--appColorBlack);
				border-radius: 5px;
				color: var(--appColorBlack);
				outline: none;
				padding: 3px;
			}
		}
	}
	@media only screen and (min-width: 767px) {
		.exploreContainer {
			height: 100vh;
		}
		.exploreHead {
			padding-left: 12.5%;
			padding-right: 12.5%;
			.mobileSearchArea {
				.searchButton {
					&:hover {
						.searchImage {
							opacity: 0.5;
						}
					}
				}
				.openFiltersButton {
					&:hover {
						.openFiltersImage {
							opacity: 0.5;
						}
					}
					&.open {
						.openFiltersImage {
							opacity: 0.7;
						}
					}
				}
			}
		}
		.filterContainer {
			width: 75%;
			.primaryFilters {
				.filterArea {
					.filterItems {
						.rmFilterButton {
							&:hover {
								background-color: var(--appDelColor);
								color: var(--appColorWhite);
								&:before {
									background-color: var(--appBGColor);
									color: var(--appDelColor);
								}
							}
						}
					}
				}
			}
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
