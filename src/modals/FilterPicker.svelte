<script>
	import { onMount, getContext } from 'svelte';
	import { flip } from 'svelte/animate';
	import AppData from '../stores/AppData.js';
	import HeroData from '../stores/HeroData.js';
	import { getAllAuthors, getAllTags, getAllHeroes} from '../rest/RESTFunctions.svelte';
	import LoadingSpinner from '../shared/LoadingSpinner.svelte';
	import ToggleSwitch from '../shared/ToggleSwitch.svelte';
	import ErrorDisplay from '../components/ErrorDisplay.svelte';
	import { votesToString } from '../utilities/Utilities.svelte';

	export let category = 'tag';
	export let curFilter = [];
	export let onSuccess = () => {};

	const { close } = getContext('simple-modal');

	let errorDisplayConf = {};
	let showErrorDisplay = false;
	let entityList = [];
	let sortType = 'popular';
	let searchStr = '';
	let mode = 'include';

	$: sortedEntityList = sortEntityList(entityList, sortType, searchStr);

	onMount(async () => {
		history.pushState({view: $AppData.activeView, modal: true}, "Filter Picker", `?modal=true${window.location.hash}`);
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
			if(category === 'hero') {
				entityList = response.data.map(e => {
					e.displayName = $HeroData.find(i => i.id === e.name).name
					return e;
				});
			} else {
				entityList = response.data.map(e => {
					e.displayName = e.name
					return e;
				})
			}
		}
	}

	function sortEntityList(list, type, search) {
		let tempList = [...list];
		if(search) {
			tempList = tempList.filter(e => e.displayName.toLowerCase().includes(search.toLowerCase()));
		}
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

	function handleEntityClick(entity) {
		const idx = curFilter.findIndex(e => e.id === entity.id);
		switch(mode) {
			case 'include':
				if(idx > -1) {
					// filter entry already exists
					if(curFilter[idx].type === 'include') {
						// entry already exists for include, assume remove entry
						curFilter = curFilter.filter((e, i) => i !== idx);
					} else {
						// entry already exists for exclude, assume change to include
						curFilter[idx].type = 'include';
					}
				} else {
					// filter entry does not exist yet, add it
					curFilter = [...curFilter, {name: entity.name, displayName: entity.displayName, id: entity.id, type: 'include'}];
				}
				break;
			case 'exclude':
				if(idx > -1) {
					// filter entry already exists
					if(curFilter[idx].type === 'exclude') {
						// entry already exists for exclude, assume remove entry
						curFilter = curFilter.filter((e, i) => i !== idx);
					} else {
						// entry already exists for include, assume change to exclude
						curFilter[idx].type = 'exclude';
					}
				} else {
					// filter entry does not exist yet, add it
					curFilter = [...curFilter, {name: entity.name, displayName: entity.displayName, id: entity.id, type: 'exclude'}];
				}
				break;
			default:
				throw new Error(`ERROR invalid mode set for FilterPicker: ${mode}`);
		}
	}

	function handleModeChange(event) {
		if(event.detail.data.state) {
			// switched on
			mode = 'include';
		} else {
			// switched off
			mode = 'exclude';
		}
	}

	function handlePopState() {
		close();
	}

	function handleSave() {
		onSuccess(curFilter);
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
				<input class="searchInput" type="search" placeholder="Search" bind:value={searchStr} />
				<!-- <div class="modeArea">
					<div class="modeLabel">Exclude</div>
					<ToggleSwitch
						size="small"
						state={true}
						offColor={window.getComputedStyle(document.documentElement).getPropertyValue('--appDelColor')}
						on:toggleEvent={handleModeChange}
					/>
					<div class="modeLabel">Include</div>
				</div> -->
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
					{#each sortedEntityList as entity (entity.id)}
						<li animate:flip="{{duration: 300}}">
							<button
								type="button"
								class="entityButton"
								class:include={curFilter.some(e => e.name === entity.name && e.type === 'include')}
								class:exclude={curFilter.some(e => e.name === entity.name && e.type === 'exclude')}
								on:click={() => handleEntityClick(entity)}>
								<span class="entityName">{entity.displayName}</span>
								<span class="entityCount">{votesToString(entity.totalComps)}</span>
							</button>
						</li>
					{/each}
				</ul>
			</div>
			<div class="filterPickerFooter">
				<button type="button" class="footerButton save" on:click={handleSave}>Save</button>
				<button type="button" class="footerButton cancel" on:click={handlePopState}>Cancel</button>
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
		.searchInput {
			border: 2px solid var(--appColorPrimary);
			border-radius: 10px;
			font-size: 1rem;
			outline: none;
			padding: 5px;
			width: 100%;
			&:focus {
				outline: 1px solid var(--appColorPrimary);
			}
		}
		.modeArea {
			align-items: center;
			display: flex;
			justify-content: center;
			padding: 10px;
			width: 100%;
			.modeLabel {
				padding: 5px;
			}
		}
	}
	.filterSortArea {
		align-items: center;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding-top: 10px;
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
		background: white;
		border-radius: 10px;
		box-shadow: inset 7px 7px 14px #e6e6e6,
								inset -7px -7px 14px white;
		max-height: 350px;
		margin-top: 10px;
		overflow-y: auto;
		padding: 10px 0px;
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
					background-color: transparent;
					border: none;
					cursor: pointer;
					display: flex;
					height: 25px;
					justify-content: center;
					span {
						background-color: var(--appColorDisabled);
						border: 2px solid var(--appColorDisabled);
						border-radius: 7px;
						color: var(--appBGColor);
						padding: 1px 5px;
						text-align: center;
						&.entityName {
							border-bottom-right-radius: 0px;
							border-right: none;
							border-top-right-radius: 0px;
						}
						&.entityCount {
							background-color: #666;
							border-color: #666;
							border-bottom-left-radius: 0px;
							border-left: none;
							border-top-left-radius: 0px;
						}
					}
					&.include {
						span {
							background-color: var(--appColorPrimary);
							border-color: var(--appColorPrimary);
							&.entityCount {
								background-color: var(--appColorPriDark);
								border-color: var(--appColorPriDark);
							}
						}
					}
					&.exclude {
						span {
							background-color: var(--appDelColor);
							border-color: var(--appDelColor);
							&.entityCount {
								background-color: #b13f3f;
								border-color: #b13f3f;
							}
						}
					}
				}
			}
		}
	}
	.filterPickerFooter {
		align-items: center;
		display: flex;
		justify-content: flex-end;
		padding-top: 10px;
		.footerButton {
			background-color: var(--appColorPrimary);
			border: 2px solid var(--appColorPrimary);
			border-radius: 10px;
			color: var(--appBGColor);
			cursor: pointer;
			font-size: 0.9rem;
			font-weight: bold;
			margin: 0px 5px;
			padding: 5px;
			&.cancel {
				background-color: var(--appColorDisabled);
				border-color: var(--appColorDisabled);
				margin-right: 0;
			}
		}
	}
</style>
