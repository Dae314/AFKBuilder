<script>
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

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
		event.dataTransfer.setData("text/plain", JSON.stringify({from: event.target.dataset.index, group: groupID}));
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
		let dragged = getDraggedParent(event.target);
		const dragData = JSON.parse(event.dataTransfer.getData("text/plain"));
		const from = dragData.from;
		const group = dragData.group;
		let to = dragged.index;
		if(group === groupID) reorder(from, to);
	}
	// DISPATCH REORDER
	function reorder(from, to) {
		let newList = [...list];
		newList[from] = [newList[to], (newList[to] = newList[from])][0];
		dispatch("sort", {newList: newList, from: from, to: to});
	}
	// PROPS
	export let list = [];
	export let groupID = '';
</script>

{#if list && list.length}
	{#each list as item, i (i)}
		<div
			data-index={i}
			draggable="true"
			on:dragstart={start}
			on:dragover={over}
			on:dragleave={leave}
			on:drop={drop}
			class:over={i === isOver}
			class="dataItem">
			<slot {item} {i}>
			</slot>
		</div>
	{/each}
{/if}

<style lang="scss">
	.dataItem {
		border: 2px dashed transparent;
		border-radius: 5px;
		margin: 5px;
		transition: border 0.1s linear;
	}
	.dataItem.over {
		border-color: var(--appColorPriAccent);
	}
</style>
