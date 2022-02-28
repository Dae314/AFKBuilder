<script>
	import { onMount, onDestroy, getContext } from 'svelte';
	import AppData from '../stores/AppData.js';
	import { getAllAuthors, getAllTags, getAllHeroes} from '../rest/RESTFunctions.svelte';
	import LoadingSpinner from '../shared/LoadingSpinner.svelte';
	import ErrorDisplay from '../components/ErrorDisplay.svelte';

	export let category = 'tag';
	export let curFilter = [];
	export let onSuccess = () => {};

	const { close } = getContext('simple-modal');

	let errorDisplayConf = {};
	let showErrorDisplay = false;
	let entityList = [];
	let sortType = 'popular';
	let selectedEntities = [];

	$: sortedEntityList = sortEntityList(entityList, sortType);

	onMount(async () => {
		history.pushState({view: $AppData.activeView, modal: true}, "Filter Picker", `?modal=true${window.location.hash}`);
	});

	onDestroy(() => {
		onSuccess(curFilter);
	});

	async function populateEntityList() {
		let response;
		switch(category) {
			case 'tag':
				response = await getAllTags();
				break;
			case 'hero':
				response = await getAllHeroes();
				break;
			case 'author':
				response = await getAllAuthors();
				break;
			default:
				throw new Error(`ERROR invalid category passed to FilterPicker: ${category}`);
		}
		if(response.status !== 200) {
			errorDisplayConf = {
				errorCode: response.status,
				headText: 'Something went wrong',
				detailText: response.data,
				showHomeButton: false,
			};
			showErrorDisplay = true;
		} else {
			entityList = response.data;
		}
	}

	function sortEntityList(list, type) {
		let tempList = [...list];
		switch(type) {
			case 'popular':
				return tempList.sort((a, b) => b.totalComps - a.totalComps);
			case 'alpha':
				return tempList.sort((a, b) => {
					let nameA = a.name.toLowerCase();
					let nameB = b.name.toLowerCase();
					return nameA < nameB ? -1 : 1;
				});
			default:
				throw new Error(`ERROR invalid sort type passed to sortEntityList: ${type}`);
		}
	}

	function handleRemoveFilter(idx) {
		curFilter = curFilter.filter((e, i) => i !== idx);
	}

	function handleAddFilters(type) {
		curFilter = curFilter.concat(selectedEntities.map(e => { return {name: e, type: type} }));
		selectedEntities = [];
	}

	function handleSelectEntity(entity) {
		if(selectedEntities.some(e => e === entity)) {
			// remove entity
			selectedEntities = selectedEntities.filter(e => e !== entity);
		} else {
			// add entity
			selectedEntities = [...selectedEntities, entity];
		}
	}

	function handlePopState() {
		close();
	}
</script>

<svelte:window on:popstate={handlePopState} />

<div class="filterPickerContainer">
	{#await populateEntityList()}
		<div class="loadingSpinnerContainer">
			<LoadingSpinner type="dual-ring" size="medium" color="{window.getComputedStyle(document.documentElement).getPropertyValue('--appColorPrimary')}" />
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
			<div class="filterPickerHead">
				<div class="filterHeadArea include">
					<h4 class="filterAreaTitle include">Include:</h4>
					<div class="filterAreaList include">
						{#each curFilter as entity, i}
							{#if entity.type === 'include'}
								<button type="button" class="rmEntityButton include" on:click={() => handleRemoveFilter(i)}>{entity.name}</button>
							{/if}
						{/each}
					</div>
				</div>
				<div class="filterHeadArea exclude">
					<h4 class="filterAreaTitle exclude">Exclude:</h4>
					<div class="filterAreaList exclude">
						{#each curFilter as entity, i}
							{#if entity.type === 'exclude'}
								<button type="button" class="rmEntityButton exclude" on:click={() => handleRemoveFilter(i)}>{entity.name}</button>
							{/if}
						{/each}
					</div>
				</div>
			</div>
			<div class="filterSortArea">
				<h5>Sort by:</h5>
				<div class="sortButtonArea">
					<button type="button" class="sortButton popular" class:selected={sortType === 'popular'} on:click={() => sortType = 'popular'}>Popular</button>
					<button type="button" class="sortButton alpha" class:selected={sortType === 'alpha'} on:click={() => sortType = 'alpha'}>A-Z</button>
				</div>
			</div>
			<div class="filterPickerBody">
				<ul class="entityList">
					{#each sortedEntityList.filter(e => !curFilter.some(i => i.name === e.name)) as entity}
						<li>
							<button type="button" class="entityButton" class:selected={selectedEntities.some(e => e === entity.name)} on:click={() => handleSelectEntity(entity.name)}>{entity.name} ({entity.totalComps})</button>
						</li>
					{/each}
				</ul>
			</div>
			<div class="filterPickerFooter">
				<button type="button" class="addEntityButton include" on:click={() => handleAddFilters('include')}>Add to Include</button>
				<button type="button" class="addEntityButton exclude" on:click={() => handleAddFilters('exclude')}>Add to Exclude</button>
			</div>
		{/if}
	{/await}
</div>

<style lang="scss">
	.filterPickerContainer {
		height: 100%;
	}
	.loadingSpinnerContainer {
		align-items: center;
		display: flex;
		justify-content: center;
	}
	.filterPickerHead {
		display: flex;
		max-height: 30%;
		.filterHeadArea {
			padding: 5px;
			text-align: center;
			width: 50%;
			.filterAreaTitle {
				margin: 0;
			}
			.filterAreaList {
				max-height: 100px;
				overflow-y: auto;
				.rmEntityButton {
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
	.filterSortArea {
		align-items: center;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 5px 0px;
		h5 {
			margin: 0;
			margin-bottom: 5px;
		}
		.sortButtonArea {
			align-items: center;
			display: flex;
			justify-content: center;
			.sortButton {
				background-color: transparent;
				border: 2px solid var(--appColorPrimary);
				border-radius: 10px;
				color: var(--appColorPrimary);
				margin: 0px 10px;
				padding: 5px;
				&.selected {
					background-color: var(--appColorPrimary);
					color: var(--appBGColor);
				}
			}
		}
	}
	.filterPickerBody {
		max-height: 350px;
		overflow-y: auto;
		padding-top: 10px;
		.entityList {
			display: grid;
			grid-auto-rows: 25px;
			grid-gap: 5px;
			grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
			list-style-type: none;
			margin: 0;
			padding: 0;
			li {
				align-items: center;
				display: flex;
				justify-content: center;
				.entityButton {
					align-items: center;
					background-color: var(--appColorDisabled);
					border: 2px solid var(--appColorDisabled);
					border-radius: 10px;
					color: var(--appBGColor);
					cursor: pointer;
					display: flex;
					height: 25px;
					justify-content: center;
					padding: 0px 5px;
					&.selected {
						background-color: var(--appColorPriDark);
						border-color: var(--appColorPriDark);
					}
				}
			}
		}
	}
	.filterPickerFooter {
		align-items: center;
		display: flex;
		justify-content: center;
		padding-top: 10px;
		.addEntityButton {
			background-color: var(--appColorPrimary);
			border: 2px solid var(--appColorPrimary);
			border-radius: 10px;
			color: var(--appBGColor);
			cursor: pointer;
			font-size: 0.9rem;
			font-weight: bold;
			margin: 0px 10px;
			padding: 5px;
			&.exclude {
				background-color: var(--appDelColor);
				border-color: var(--appDelColor);
			}
		}
	}
</style>
