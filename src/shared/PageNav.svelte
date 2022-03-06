<script>
	import {createEventDispatcher} from 'svelte';
	/* expect pageInfo to be of the format:
		{
			page: int <- current page (pages start at 1)
			pageCount: int <- max pages
			count: int <- number of items
			pageSize: int <- number of items per page
		}
	*/
	export let pageInfo = {};
	export let viewLimit = 2;

	const dispatch = createEventDispatcher();
	let pageArr = [];

	$: viewLimit = parseInt(viewLimit);
	$: pageArr = makePageArr(pageInfo.page, pageInfo.pageCount);
	$: if(pageInfo.page < 1) throw new Error(`ERROR current page cannot be < 1`);
	$: if(pageInfo.page > pageInfo.pageCount) throw new Error(`ERROR current page cannot be > pageCount`);
	$: if(viewLimit < 1) throw new Error(`Error viewLimit cannot be < 1`);

	function makePageArr(page, pageCount) {
		let arr = [];
		if(pageCount <= viewLimit + 2) {
			// fill arr with sequential numbers from 1 to pageCount
			arr = Array.from({length: pageCount}, (_, index) => index + 1);
		} else {
			const pageDist = pageCount - page;
			if(page <= viewLimit + 2) {
				// fill arr with sequential numbers from 1 to page
				arr = Array.from({length: page}, (_, index) => index + 1);
			} else {
				// show page 1, then a separator, then viewLimit pages before the current page, and the current page
				arr.push(1);
				arr.push(-1);
				for(let i = viewLimit; i >= 0; i--) {
					arr.push(page - i);
				}
			}
			if(pageDist <= viewLimit + 1) {
				// show up to viewLimit + 1 pages after page
				for(let i = 1; i <= pageDist; i++) {
					arr.push(page + i);
				}
			} else {
				// show viewLimit pages after page, a separator, and the final page
				for(let i = 1; i <= viewLimit; i++) {
					arr.push(page + i);
				}
				arr.push(-1);
				arr.push(pageCount);
			}
		}
		return arr;
	}

	function handlePageClick(newPage) {
		if(newPage >= 1 && newPage <= pageInfo.pageCount && newPage !== pageInfo.pageCount) dispatch('pageEvent', {data: {page: newPage}});
	}

	function handleIncrClick(type) {
		switch(type) {
			case 'prev':
				if(pageInfo.page > 1) dispatch('pageEvent', {data: {page: pageInfo.page - 1}});
				break;
			case 'next':
				if(pageInfo.page < pageInfo.pageCount) dispatch('pageEvent', {data: {page: pageInfo.page + 1}});
				break;
			default:
				throw new Error(`ERROR invalid increment type passed to handleIncrClick: ${type}`);
		}
	}
</script>

<div class="pageNavContainer">
	<ul class="pageList">
		<li>
			<button disabled={pageInfo.page === 1} class="pageOption prev" on:click={() => handleIncrClick('prev')}>Prev</button>
		</li>
		{#each pageArr as page}
			<li>
				{#if page > 0}
					<button class="pageOption" class:selected={page === pageInfo.page} on:click={() => handlePageClick(page)}>{page}</button>
				{:else}
					<div class="separator">
						<div class="circle"></div>
						<div class="circle"></div>
						<div class="circle"></div>
					</div>
				{/if}
			</li>
		{/each}
		<li>
			<button disabled={pageInfo.page === pageInfo.pageCount} class="pageOption next" on:click={() => handleIncrClick('next')}>Next</button>
		</li>
	</ul>
</div>

<style lang="scss">
	.pageList {
		display: flex;
		list-style-type: none;
		flex-wrap: wrap;
		justify-content: center;
		margin: 0;
		padding: 0;
		li {
			align-items: center;
			display: flex;
			justify-content: center;
			margin: 3px 5px;
		}
		.separator {
			align-items: center;
			display: flex;
			justify-content: center;
			.circle {
				background-color: var(--appColorPrimary);
				border-radius: 50%;
				flex-grow: 0;
				flex-shrink: 0;
				height: 7px;
				margin: 0px 1px;
				width: 7px;
			}
		}
		.pageOption {
			align-items: center;
			background-color: var(--appColorPrimary);
			border: 2px solid var(--appColorPrimary);
			border-radius: 50%;
			color: var(--appBGColor);
			cursor: pointer;
			display: flex;
			flex-grow: 0;
			flex-shrink: 0;
			height: 30px;
			justify-content: center;
			outline: none;
			width: 30px;
			&.selected {
				background-color: transparent;
				color: var(--appColorPrimary);
				font-weight: bold;
			}
			&:disabled {
				background-color: transparent;
				border-color: var(--appColorDisabled);
				color: var(--appColorDisabled);
			}
		}
	}
</style>
