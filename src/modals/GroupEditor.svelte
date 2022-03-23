<script>
	import { onMount, getContext } from 'svelte';
	import { flip } from 'svelte/animate';
	import { v4 as uuidv4 } from 'uuid';
	import AppData from '../stores/AppData.js';
	import { votesToString } from '../utilities/Utilities.svelte';

	export let onConfirm = () => {};
	export let type = 'new';
	export let group = {};
	export let comp = {};

	const { close } = getContext('simple-modal');

	let sortType = 'popular';
	let searchStr = '';

	// setup group/comp object (make sure we do not modify the original)
	switch(type) {
		case 'new':
			group = {
				uuid: uuidv4(),
				name: 'New Group',
				comps: [],
			}
			break;
		case 'edit':
			group = JSON.parse(JSON.stringify(group));
			break;
		case 'comp':
			comp = JSON.parse(JSON.stringify(comp));
			break;
		default:
			throw new Error(`ERROR invalid type passed to Group Editor: ${type}`);
	}

	$: optionList = makeOptionList(type, sortType);

	onMount(async () => {
		history.pushState({view: $AppData.activeView, modal: true}, "Confirm", `?modal=true${window.location.hash}`);
	});

	function makeOptionList(type, sort) {
		let optionList = [];
		switch(type) {
			case 'new':
			case 'edit':
				optionList = [...$AppData.Comps].filter(e => !e.hidden).map(e => {
					return {name: e.name, uuid: e.uuid, count: e.groups.length, members: e.groups}
				});
				break;
			case 'comp':
				optionList = [...$AppData.compGroups].map(e => {
					return {name: e.name, uuid: e.uuid, count: e.comps.length, members: e.comps}
				});
				break;
			default:
				throw new Error(`ERROR invalid type passed to GroupEditor: ${type}`);
		}

		if(searchStr) optionList = optionList.filter(e => e.name.toLowerCase().includes(searchStr.toLowerCase()));

		switch(sort) {
			case 'popular':
				optionList.sort((a, b) => {
					return a.count >= b.count ? 1 : -1;
				});
				break;
			case 'alpha':
				optionList.sort((a, b) => {
					let aName = a.name.toLowerCase();
					let bName = b.name.toLowerCase();
					return aName >= bName ? 1 : -1;
				});
				break;
			default:
				throw new Error(`ERROR invalid sort type passed to GroupEditor: ${sort}`);
		}

		return optionList;
	}

	function handleCancelClick() {
		close();
	}

	function handleConfirmClick() {
		if(type === 'new' || type === 'edit') {
			onConfirm({type: type, data: group});
		} else if(type === 'comp') {
			onConfirm({type: type, data: comp});
		}
		close();
	}

	function handlePopState() {
		close();
	}

	function handleOptionClick(option) {
		switch(type) {
			case 'new':
			case 'edit':
				if(group.comps.some(e => e === option.uuid)) {
					// comp already added, remove it
					group.comps = group.comps.filter(e => e !== option.uuid);
				} else {
					// comp not added, add it
					group.comps = [...group.comps, option.uuid];
				}
				break;
			case 'comp':
				if(comp.groups.some(e => e === option.uuid)) {
					// group already added, remove it
					comp.groups = comp.groups.filter(e => e !== option.uuid);
				} else {
					// group not added, add it
					comp.groups = [...comp.groups, option.uuid];
				}
				break;
			default:
				throw new Error(`ERROR invalid type passed to Group Editor: ${type}`);
		}
	}
</script>

<svelte:window on:popstate={handlePopState} />

<div class="groupEditorContainer">
	<div class="groupEditHead">
		{#if type === 'new'}
			<h4>New Group</h4>
		{:else if type === 'edit'}
			<h4>Edit Group</h4>
		{:else if type === 'comp'}
			<h4>Edit Comp Groups</h4>
		{/if}
	</div>
	{#if type !== 'comp'}
		<div class="titleArea">
			<label for="groupTitle">Name</label>
			<input name="groupTitle" type="text" bind:value={group.name} />
		</div>
	{/if}
	<div class="searchArea">
		<input class="searchInput" type="search" placeholder="Search" bind:value={searchStr} />
	</div>
	<div class="filterSortArea">
		<h5>Sort by:</h5>
		<div class="sortButtonArea">
			<button type="button" class="sortButton popular" class:selected={sortType === 'popular'} on:click={() => sortType = 'popular'}>Popular</button>
			<button type="button" class="sortButton alpha" class:selected={sortType === 'alpha'} on:click={() => sortType = 'alpha'}>A-Z</button>
		</div>
	</div>
	<h5 class="optionListTitle">Add {type === 'comp' ? 'Groups' : 'Comps'}</h5>
	<div class="optionListArea">
		<ul class="optionList">
			{#each optionList as option (option.uuid)}
				<li animate:flip="{{duration: 300}}">
					<button
						type="button"
						class="optionButton"
						class:active={type === 'comp' ? comp.groups.some(e => e === option.uuid) : group.comps.some(e => e === option.uuid)}
						on:click={() => handleOptionClick(option)}>
						<span class="optionName">{option.name}</span>
						<span class="optionCount">{votesToString(option.count)}</span>
					</button>
				</li>
			{/each}
		</ul>
	</div>
	<div class="groupEditFooter">
		<button type="button" class="footerButton save" on:click={handleConfirmClick}>Save</button>
		<button type="button" class="footerButton cancel" on:click={handleCancelClick}>Cancel</button>
	</div>
</div>

<style lang="scss">
	.groupEditorContainer {
		padding: 10px;
	}
	.groupEditHead {
		text-align: center;
		padding-bottom: 10px;
		h4 {
			font-size: 1.5rem;
			margin: 0;
		}
	}
	.titleArea {
		padding-bottom: 10px;
		text-align: center;
		label {
			display: block;
			font-weight: bold;
		}
		input {
			border: 2px solid var(--appColorPrimary);
			border-radius: 10px;
			font-size: 1rem;
			outline: none;
			padding: 3px;
			text-align: center;
		}
	}
	.searchArea {
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
				cursor: pointer;
				margin: 0px 10px;
				padding: 5px;
				&.selected {
					background-color: var(--appColorPrimary);
					color: var(--appBGColor);
				}
			}
		}
	}
	.optionListTitle {
		margin: 5px 0px;
		text-align: center;
	}
	.optionListArea {
		background: white;
		border-radius: 10px;
		box-shadow: inset 7px 7px 14px #dddddf,
								inset -7px -7px 14px #ffffff;
		max-height: 350px;
		margin-top: 10px;
		overflow-y: auto;
		padding: 10px 0px;
		.optionList {
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
				.optionButton {
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
						&.optionName {
							border-bottom-right-radius: 0px;
							border-right: none;
							border-top-right-radius: 0px;
							max-width: 120px;
							overflow: hidden;
							text-overflow: ellipsis;
							white-space: nowrap;
						}
						&.optionCount {
							background-color: #666;
							border-color: #666;
							border-bottom-left-radius: 0px;
							border-left: none;
							border-top-left-radius: 0px;
						}
					}
					&.active {
						span {
							background-color: var(--appColorPrimary);
							border-color: var(--appColorPrimary);
							&.optionCount {
								background-color: var(--appColorPriDark);
								border-color: var(--appColorPriDark);
							}
						}
					}
				}
			}
		}
	}
	.groupEditFooter {
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
