<script>
	import { onMount } from 'svelte';
	import AppData from '../stores/AppData.js';

	let showFilters = false;

	onMount(async () => {
		$AppData.activeView = 'explore';
	});
</script>

<div class="exploreContainer">
	<div class="exploreHead">
		<div class="mobileSearchArea">
			<input class="filterInput" type="text" placeholder="search" />
		</div>
		<div class="filterButtonArea">
			<button type="button" class="openFiltersButton" class:open={showFilters} on:click={() => showFilters = !showFilters}>
				<img class="openFiltersImage" src={ showFilters ? './img/utility/filter_color.png' : './img/utility/filter_white.png' } alt="Open Filters">
			</button>
		</div>
	</div>
	<div class="filterContainer" class:open={showFilters}>
		<div class="filterInputArea">
			<label class="filterInputLabel" for="tagFilterInput">Tags</label>
			<input id="tagFilterInput" class="filterInput" type="text" placeholder="Tags">
		</div>
		<div class="filterInputArea">
			<label class="filterInputLabel" for="authorFilterInput">Author</label>
			<input id="authorFilterInput" class="filterInput" type="text" placeholder="Author">
		</div>
		<div class="filterInputArea">
			<label class="filterInputLabel" for="heroFilterInput">Heroes</label>
			<input id="heroFilterInput" class="filterInput" type="text" placeholder="Heroes">
		</div>
	</div>
</div>

<style lang="scss">
	.exploreContainer {
		height: calc(100vh - var(--headerHeight));
		overflow-y: auto;
		width: 100%;
	}
	.filterInput {
		border: 1px solid var(--appColorPrimary);
		border-radius: 5px;
		font-size: 1.2rem;
		padding: 8px;
		&:focus {
			border-color: var(--appColorPrimary);
			box-shadow: 0 0 0 2px var(--appColorPrimary);
			outline: 0;
		}
	}
	.exploreHead {
		display: flex;
		padding: 10px;
		padding-top: 15px;
		.mobileSearchArea {
			align-items: center;
			display: flex;
			padding-right: 10px;
			width: 100%;
			.filterInput {
				width: 100%;
			}
		}
		.filterButtonArea {
			align-items: center;
			display: flex;
			.openFiltersButton {
				align-items: center;
				background-color: var(--appColorPrimary);
				border: 2px solid var(--appColorPrimary);
				border-radius: 10px;
				box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
				display: flex;
				height: 40px;
				justify-content: center;
				outline: none;
				transition: all 0.2s;
				width: 40px;
				.openFiltersImage {
					max-width: 25px;
				}
				&.open {
					background-color: transparent;
				}
			}
		}
	}
	.filterContainer {
		max-height: 0px;
		overflow: hidden;
		padding: 0px 10px;
		transition: all 0.5s;
		&.open {
			max-height: 2000px;
		}
		.filterInputLabel {
			display: block;
			font-weight: bold;
			margin-bottom: 5px;
		}
	}
</style>
