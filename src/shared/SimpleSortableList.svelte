<script>
	import { createEventDispatcher } from 'svelte';
	import { flip } from 'svelte/animate';
	import { v4 as uuidv4 } from 'uuid';

	const dispatch = createEventDispatcher();

	// PROPS
	export let list = [];
	export let groupID = '';
	export let validate = () => true;
	let localList = [];

	$: localList = makeLocalList(list);

	function makeLocalList(inputList) {
		let returnList = [];
		if(inputList.length !== localList.length) {
			for(const item of inputList) {
				returnList.push({id: uuidv4(), value: item});
			}
		} else {
			returnList = [...localList];
			for(let i = 0; i < returnList.length; i++) {
				if(returnList[i].value !== inputList[i]) {
					returnList[i].value = inputList[i];
				}
			}
		}
		return returnList;
	}

	// DRAG AND DROP
	let isOver = null;
	function getDraggedParent(node) {
		if(node.dataset && node.dataset.index) {
			return node.dataset;
		} else {
			return getDraggedParent(node.parentNode);
		}
	}
	function start(event) {
		event.dataTransfer.setData("source", JSON.stringify({from: event.target.dataset.index, group: groupID}));
	}
	function over(event) {
		event.preventDefault();
		let dragged = getDraggedParent(event.target);
		if (isOver !== dragged.index) isOver = dragged.index;
	}
	function leave(event) {
		let dragged = getDraggedParent(event.target);
		if(isOver === dragged.index) isOver = null;
	}
	function drop(event) {
		isOver = null;
		event.preventDefault();
		if(event.dataTransfer.getData("source")) {
			let dragged = getDraggedParent(event.target);
			const dragData = JSON.parse(event.dataTransfer.getData("source"));
			const from = dragData.from;
			const group = dragData.group;
			let to = dragged.index;
			if(group === groupID) reorder(from, to);
		}
	}
	// DISPATCH REORDER
	function reorder(from, to) {
		let newList = [...list];
		newList[from] = [newList[to], (newList[to] = newList[from])][0];
		if(validate(newList)) {
			localList[from] = [localList[to], (localList[to] = localList[from])][0];
			dispatch("sort", {newList: newList, from: from, to: to, groupID: groupID,});
		}
	}
</script>

{#if localList && localList.length}
	{#each localList as item, i (item.id)}
		<div
			data-index={i}
			draggable="true"
			on:dragstart={start}
			on:dragover={over}
			on:dragleave={leave}
			on:drop={drop}
			animate:flip={{duration: 300}}
			class:over={i === isOver}
			class="dataItem">
			<slot item={item.value} i={i}>
			</slot>
		</div>
	{/each}
{/if}

<style lang="scss">
	.dataItem {
		border: 2px dashed transparent;
		border-radius: 5px;
		transition: border 0.1s linear;
	}
	.dataItem.over {
		border-color: var(--appColorPriAccent);
	}
</style>
