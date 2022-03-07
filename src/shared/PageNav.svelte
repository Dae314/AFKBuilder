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
	$: if(pageInfo.pageCount > 0 && pageInfo.page > pageInfo.pageCount) throw new Error(`ERROR current page cannot be > pageCount`);
	$: if(viewLimit < 1) throw new Error(`Error viewLimit cannot be < 1`);

	function makePageArr(page, pageCount) {
		let arr = [];
		if(pageCount <= viewLimit + 2) {
			arr = Array.from({length: pageCount}, (_, index) => index + 1);
		} else {
			if(page <= viewLimit) {
				// fill arr with sequential numbers from 1 to page + viewLimit
				arr = Array.from({length: page + viewLimit}, (_, index) => index + 1);
			} else if(pageCount - page <= viewLimit) {
				// fill arr with sequential numbers from page - viewLimit to pageCount
				for(let i = page - viewLimit; i <= pageCount; i++) {
					arr.push(i);
				}
			} else {
				// fill arr with sequential numbers from page - viewLimit to page + viewLimit
				for(let i = page - viewLimit; i <= page + viewLimit; i++) {
					arr.push(i);
				}
			}
		}
		return arr;
	}

	function handlePageClick(newPage) {
		if(newPage >= 1 && newPage <= pageInfo.pageCount && newPage !== pageInfo.page) dispatch('pageEvent', {data: {page: newPage}});
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

	function handleJumpClick(type) {
		switch(type) {
			case 'start':
				if(pageInfo.page !== 1) dispatch('pageEvent', {data: {page: 1}});
				break;
			case 'end':
				if(pageInfo.page !== pageInfo.pageCount) dispatch('pageEvent', {data: {page: pageInfo.pageCount}});
				break;
			default:
				throw new Error(`ERROR invalid increment type passed to handleIncrClick: ${type}`);
		}
	}
</script>

<div class="pageNavContainer">
	<ul class="pageList">
		<li>
			<button class="pageOption start" on:click={() => handleJumpClick('start')}>&#10094;&#10094;</button>
		</li>
		<li>
			<button disabled={pageInfo.page === 1} class="pageOption prev" on:click={() => handleIncrClick('prev')}>&#10094;</button>
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
			<button disabled={pageInfo.page === pageInfo.pageCount} class="pageOption next" on:click={() => handleIncrClick('next')}>&#x276F;</button>
		</li>
		<li>
			<button class="pageOption end" on:click={() => handleJumpClick('end')}>&#x276F;&#x276F;</button>
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
		}
		.separator {
			align-items: end;
			display: flex;
			height: 100%;
			justify-content: center;
			margin: 0;
			padding-bottom: 4px;
			.circle {
				background-color: var(--appColorPrimary);
				border-radius: 50%;
				flex-grow: 0;
				flex-shrink: 0;
				height: 5px;
				margin: 0px 1px;
				width: 5px;
			}
		}
		.pageOption {
			align-items: center;
			background-color: transparent;
			border: none;
			border-radius: 50%;
			color: var(--appColorPrimary);
			cursor: pointer;
			display: flex;
			flex-grow: 0;
			flex-shrink: 0;
			font-size: 1rem;
			justify-content: center;
			margin: 3px 3px;
			outline: none;
			user-select: none;
			&.selected {
				background-color: var(--appColorPrimary);
				color: var(--appBGColor);
				height: 30px;
				width: 30px;
			}
			&:disabled {
				background-color: transparent;
				border-color: var(--appColorDisabled);
				color: var(--appColorDisabled);
			}
		}
	}
</style>
