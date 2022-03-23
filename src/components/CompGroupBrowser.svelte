<script>
	import {getContext, createEventDispatcher} from 'svelte';
	import AppData from '../stores/AppData.js';
	import GroupEditor from '../modals/GroupEditor.svelte';
	import ModalCloseButton from '../modals/ModalCloseButton.svelte';

	const dispatch = createEventDispatcher();
	const { open } = getContext('simple-modal');

	const sortOptions = ['name', 'comps'];
	const defaultSort = 'name';

	let sortSelectEl;
	let curSort = defaultSort;
	export let search = '';

	$: groupList = makeGroupList($AppData.compGroups, {search}, curSort);

	function makeGroupList(groups, filters, sort) {
		let groupList = [...groups];

		// apply filters
		if(filters.search) groupList = groupList.filter(group => group.name.toLowerCase.includes(filters.search.toLowerCase()));
		
		// apply sort
		switch(sort) {
			case 'name':
				groupList.sort((a, b) => {
					const nameA = a.name.toLowerCase();
					const nameB = b.name.toLowerCase();
					return nameA < nameB ? -1 : 1;
				});
				break;
			case 'comps':
				groupList.sort((a, b) => {
					return a.comps.length > b.comps.length ? 1 : -1;
				});
				break;
			default:
				throw new Error(`Invalid sort type specified for group sort: ${sort}`);
		}

		return groupList;
	}

	function handleNewGroupClick() {
		open(GroupEditor,
				{onConfirm: handleGroupChange, type: 'new'},
				{closeButton: ModalCloseButton,
				 styleContent: {background: '#F0F0F2', padding: 0, borderRadius: '10px',}
				});
	}

	function handleGroupChange(event) {

	}
</script>

<div class="groupBrowserContainer">
	<div class="sortArea">
		<span class="selectText sortText">Sort by:</span>
		<select class="groupSelect sortSelect" value={curSort} bind:this={sortSelectEl} on:change={() => handleSortChange(sortSelectEl)}>
			{#each sortOptions as option}
				<option value={option}>{option}</option>
			{/each}
		</select>
	</div>
	<ul class="groupGrid">
		<li class="newGroup">
			<button type="button" class="newGroupButton" on:click={handleNewGroupClick}>
				<span class="plusIcon">+</span>
				<span class="buttonText">New Group</span>
			</button>
		</li>
		{#each groupList as group}
			<button type="button" class="groupButton">
				<span>{group.name}</span>
			</button>
		{/each}
	</ul>
</div>

<style lang="scss">
	.groupBrowserContainer {
		height: 100%;
		width: 100%;
	}
	.sortArea {
		display: flex;
		justify-content: flex-end;
		.selectText {
			margin-right: 5px;
		}
		.groupSelect {
			border: 1px solid var(--appColorPrimary);
			border-radius: 5px;
			outline: none;
			padding: 3px;
		}
	}
	.groupGrid {
		display: grid;
		grid-gap: 5px 5px;
		grid-template-columns: repeat(auto-fill, minmax(120px, 120px));
		grid-auto-rows: 170px;
		justify-content: space-around;
		margin: 0;
		padding: 0;
		list-style-type: none;
		li {
			align-items: center;
			display: flex;
			justify-content: center;
		}
		.newGroupButton {
			background-color: var(--appColorPrimary);
			border: 2px solid var(--appColorPrimary);
			border-radius: 10px;
			color: var(--appBGColor);
			cursor: pointer;
			height: 100%;
			outline: none;
			width: 100%;
			.plusIcon {
				display: block;
				font-size: 2rem;
				font-weight: bold;
				margin: 0 auto;
				transition: transform 0.7s;
				width: fit-content;
			}
		}
	}
	@media only screen and (min-width: 767px) {
		.newGroupButton {
			&:hover {
				.plusIcon {
					transform: rotateZ(180deg);
				}
			}
		}
	}
</style>
