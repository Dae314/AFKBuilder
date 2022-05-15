<script>
	import {getContext, createEventDispatcher} from 'svelte';
	import { v4 as uuidv4 } from 'uuid';
	import {replace, querystring} from 'svelte-spa-router';
	import AppData from '../stores/AppData.js';
	import XButton from '../shared/XButton.svelte';
	import Confirm from '../modals/Confirm.svelte';

	const dispatch = createEventDispatcher();
	const { open } = getContext('simple-modal');

	const sortOptions = ['new', 'name', 'comps'];
	const defaultSort = 'new';
	const minNameLen = 1;
	const maxNameLen = 10;

	let sortSelectEl;
	let curSort = defaultSort;
	export let search = '';

	$: groupList = makeGroupList($AppData.compGroups, {search}, curSort);

	function makeGroupList(groups, filters, sort) {
		let groupList = [...groups];

		// apply filters
		if(filters.search) groupList = groupList.filter(group => group.name.toLowerCase().includes(filters.search.toLowerCase()));
		
		// apply sort
		switch(sort) {
			case 'new':
				groupList.sort((a, b) => {
					return a.createdAt >= b.createdAt ? -1 : 1;
				});
				break;
			case 'name':
				groupList.sort((a, b) => {
					const nameA = a.name.toLowerCase();
					const nameB = b.name.toLowerCase();
					return nameA < nameB ? -1 : 1;
				});
				break;
			case 'comps':
				groupList.sort((a, b) => {
					return a.comps.length > b.comps.length ? -1 : 1;
				});
				break;
			default:
				throw new Error(`Invalid sort type specified for group sort: ${sort}`);
		}

		return groupList;
	}

	function handleNewGroupClick() {
		$AppData.compGroups = [...$AppData.compGroups, {name: 'New Group', uuid: uuidv4(), comps: [], createdAt: new Date()}];
		dispatch('groupEvent', {action: 'groupChange'});
	}

	function handleSortChange(selectObj) {
		curSort = selectObj.value;
	}

	function handleDelClick(group) {
		const message = `Delete group named ${group.name}?`;
		const bgColor = window.getComputedStyle(document.documentElement).getPropertyValue('--appBGColor');
		open(Confirm,
				{onConfirm: handleDeleteGroup, confirmData: group, message: message},
				{closeButton: false,
				 closeOnEsc: true,
				 closeOnOuterClick: true,
				 styleWindow: { width: 'fit-content', background: bgColor },
				 styleContent: { width: 'fit-content', background: bgColor, borderRadius: '10px' },
				});
	}

	function handleDeleteGroup(group) {
		let newQS = new URLSearchParams($querystring);
		if(newQS.has('group')) {
			const groupID = decodeURIComponent(newQS.get('group'));
			if(groupID === group.uuid) {
				// group to delete is active group, remove group URL query parameter
				newQS.delete('group');
				replace(`/comps?${newQS.toString()}`);
			}
		}
		$AppData.compGroups = $AppData.compGroups.filter(e => e.uuid !== group.uuid);
		dispatch('groupEvent', {action: 'groupChange'});
	}

	function handleGroupClick(group) {
		dispatch('groupEvent', {action: 'groupNav', data: group.uuid});
	}

	function handleGroupNameBlur(event, groupID) {
		const el = event.target;
		const groupIdx = $AppData.compGroups.findIndex(e => e.uuid === groupID);
		const newName = el.value;
		if(newName.length >= minNameLen && newName.length <= maxNameLen) {
			$AppData.compGroups[groupIdx].name = el.value;
			dispatch('groupEvent', {action: 'groupChange'});
		}
	}

	function handleGroupNameKey(event) {
		const el = event.target;
		if (event.keyCode === 13) el.blur();
	}
</script>

<div class="groupBrowserContainer">
	<div class="sortArea">
		<div class="sortElements">
			<span class="selectText sortText">Sort by:</span>
			<select class="groupSelect sortSelect" value={curSort} bind:this={sortSelectEl} on:change={() => handleSortChange(sortSelectEl)}>
				{#each sortOptions as option}
					<option value={option}>{option}</option>
				{/each}
			</select>
		</div>
	</div>
	<ul class="groupGrid">
		<li class="newGroup">
			<button type="button" class="newGroupButton" on:click={handleNewGroupClick}>
				<span class="plusIcon">+</span>
				<span class="buttonText">New Group</span>
			</button>
		</li>
		<li class="allComps">
			<button type="button" class="groupButton allCompsButton" on:click={() => handleGroupClick({uuid: 'ALLCOMPS'})}>
				<div class="groupBody">
					<div class="groupName">
						All Comps
					</div>
					<span class="count">{$AppData.Comps.length}</span>
				</div>
			</button>
		</li>
		{#each groupList as group}
			<button type="button" class="groupButton" on:click={() => handleGroupClick(group)}>
				<div class="delArea">
					<XButton size="medium" clickCallback={() => handleDelClick(group)} />
				</div>
				<div class="groupBody">
					<input
						class="groupName"
						type="text"
						value={group.name}
						minlength={minNameLen}
						maxlength={maxNameLen}
						required
						on:click|stopPropagation
						on:blur={event => handleGroupNameBlur(event, group.uuid)}
						on:keyup|preventDefault={handleGroupNameKey}
					/>
					<span class="count">{group.comps.length}</span>
				</div>
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
		position: relative;
		width: 100%;
		.sortElements {
			position: absolute;
			left: 50%;
			top: -32px;
			transform: translate(-50%, 0%);
			.selectText {
				font-size: 0.9rem;
			}
			.groupSelect {
				border: 1px solid black;
				border-radius: 5px;
				outline: none;
				padding: 3px;
			}
		}
	}
	.groupGrid {
		background-color: var(--appBGColorLight);
		border-radius: 10px;
		box-shadow: var(--neu-large-ni-BGColor-shadow);
		display: grid;
		grid-gap: 20px 20px;
		grid-template-columns: repeat(auto-fill, minmax(120px, 120px));
		grid-auto-rows: 170px;
		justify-content: space-around;
		margin: 0;
		padding: 10px 15px;
		list-style-type: none;
		li {
			align-items: center;
			display: flex;
			justify-content: center;
		}
		.newGroupButton {
			background-color: var(--appBGColor);
			border: none;
			border-radius: 10px;
			color: black;
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
		.groupButton {
			align-items: flex-start;
			background: var(--neu-convex-BGLight-bg);
			border: none;
			border-radius: 10px;
			box-shadow: var(--neu-med-i-BGLight-shadow);
			color: black;
			display: flex;
			cursor: pointer;
			flex-direction: column;
			outline: none;
			padding: 3px;
			position: relative;
			.delArea {
				position: absolute;
				right: 5px;
				top: 5px;
			}
			.groupBody {
				align-items: center;
				display: flex;
				flex-direction: column;
				height: 100%;
				justify-content: center;
				width: 100%;
				.groupName {
					background-color: var(--appBGColorLight);
					border: none;
					border-bottom: 1px solid var(--appBGColorDark);
					font-size: 1rem;
					outline: none;
					text-align: center;
					width: 100px;
					&:focus {
						border-radius: 5px;
						outline: 1px solid var(--appBGColorDark);
						&:invalid {
							border-bottom-color: var(--appDelColor);
							outline: 1px solid var(--appDelColor);
						}
					}
					&:invalid {
						border-bottom-color: var(--appDelColor);
						outline: 1px solid var(--appDelColor);
					}
				}
				.count {
					font-size: 1.3rem;
					font-weight: bold;
					padding-top: 10px;
				}
			}
			&.allCompsButton {
				height: 100%;
				width: 100%;
			}
		}
	}
	@media only screen and (min-width: 767px) {
		.sortArea {
			display: flex;
			justify-content: flex-end;
			.sortElements {
				left: auto;
				right: 15px;
				top: -23px;
				transform: none;
			}
		}
		.groupGrid {
			margin: 10px 15px;
			.newGroupButton {
				&:hover {
					background-color: var(--appColorPriAccent);
					.plusIcon {
						transform: rotateZ(180deg);
					}
				}
			}
		}
	}
</style>
