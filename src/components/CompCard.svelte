<script>
	import AppData from '../stores/AppData.js';
	import HeroData from '../stores/HeroData.js';
	
	export let comp = {};
	export let idx = {}
	export let highlightComp = null;
	export let delCallback = () => {};
	export let cardClickCallback = () => {};
	export let exportCallback = () => {};
	export let starCallback = () => {};

	function handleDeleteButtonClick(index) {
		delCallback(index);
	}

	function handleCompCardClick(index) {
		cardClickCallback(index);
	}

	function handleExportButtonClick(index) {
		exportCallback(index);
	}

	function handleStarClick(event, comp) {
		starCallback(event, comp);
	}
</script>

<div id="comp{idx}" class="compCard" class:highlight={highlightComp !== null && highlightComp === idx} class:active={idx === $AppData.selectedComp} on:click={() => handleCompCardClick(idx) }>
	<div class="compCardHead">
		<div class="titleAuthorContainer">
			<div class="compCardTitleContainer">
				<span class="compCardTitle">{comp.name}</span>
			</div>
			<div class="authorContainer">
				<span class="author">{comp.author}</span>
			</div>
		</div>
		<div class="buttonDraftArea">
			<div class="cardButtonsContainer">
				<div class="buttonArea">
					<button class="cardDeleteButton" on:click={(e) => { handleDeleteButtonClick(idx); e.stopPropagation(); }}><img class="deleteIcon" src="./img/utility/trashcan.png" alt="Delete"></button>
					<div class="tooltip deleteTooltip"><span class="tooltipText">Delete</span></div>
				</div>
				<div class="buttonArea">
					<button class="cardExportButton" on:click={(e) => { handleExportButtonClick(idx); e.stopPropagation(); }}><img class="exportIcon" src="./img/utility/export.png" alt="Export"></button>
					<div class="tooltip exportTooltip"><span class="tooltipText">Export</span></div>
				</div>
				<i class="star" class:active={comp.starred} on:click={(e) => handleStarClick(e, comp)}></i>
			</div>
			<div class="draftContainer">
				<div class="draftLabel" class:open={comp.draft}><span>draft</span></div>
			</div>
		</div>
	</div>
	<div class="compImgs">
		{#if comp.lines.length > 0}
			{#each comp.lines[0].heroes as hero}
				{#if $HeroData.some(e => e.id === hero)}
					<img class="compCardImg" class:claimed={$AppData.MH.List[hero].claimed} src={$HeroData.find(e => e.id === hero).portrait} alt={$HeroData.find(e => e.id === hero).name}>
				{:else}
					<i class="emptyCardSlot"></i>
				{/if}
			{/each}
		{:else}
			<i class="emptyCardSlot"></i>
			<i class="emptyCardSlot"></i>
			<i class="emptyCardSlot"></i>
			<i class="emptyCardSlot"></i>
			<i class="emptyCardSlot"></i>
		{/if}
	</div>
</div>

<style>
	.compCard {
		background-color: var(--appBGColor);
		border: 3px solid var(--appColorPrimary);
		border-radius: 10px;
		cursor: pointer;
		scroll-snap-align: center;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 0);
	}
	img {
		user-drag: none; 
		user-select: none;
		-moz-user-select: none;
		-webkit-user-drag: none;
		-webkit-user-select: none;
		-ms-user-select: none;
	}
	.compCard.highlight {
		animation: flash 1s linear 3;
	}
	.compCardHead {
		display: flex;
		justify-content: center;
		padding: 10px;
		padding-right: 5px;
		padding-top: 8px;
	}
	.titleAuthorContainer {
		width: 80%;
	}
	.compCardTitleContainer {
		width: 100%;
	}
	.compCardTitle {
		display: inline-block;
		font-size: 1.3rem;
		font-weight: bold;
		-ms-user-select: none;
		overflow: hidden;
		text-overflow: ellipsis;
		user-select: none;
		-webkit-user-select: none;
		white-space: nowrap;
		width: 100%;
	}
	.author {
		display: inline-block;
		-ms-user-select: none;
		overflow: hidden;
		user-select: none;
		-webkit-user-select: none;
		text-overflow: ellipsis;
		white-space: nowrap;
		width: 100%;
	}
	.buttonDraftArea {
		display: flex;
		flex-direction: column;
		width: 20%;
	}
	.cardButtonsContainer {
		align-items: center;
		display: grid;
		grid-gap: 5px;
		grid-template-columns: 1fr 1fr 1fr;
		height: 100%;
		justify-content: space-evenly;
		justify-items: center;
	}
	.buttonArea {
		align-items: center;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}
	.cardDeleteButton {
		background-color: transparent;
		border: 0;
		cursor: pointer;
		height: fit-content;
		margin: 0;
		outline: 0;
		padding: 0;
		padding-top: 1px;
	}
	.deleteIcon {
		filter: invert(1.0);
		max-width: 15px;
	}
	.cardExportButton {
		background-color: transparent;
		border: 0;
		cursor: pointer;
		height: fit-content;
		margin: 0;
		outline: 0;
		padding: 0;
		padding-top: 2px;
	}
	.exportIcon {
		filter: invert(1.0);
		max-width: 18px;
	}
	.tooltip {
		display: none;
	}
	.star {
		border-bottom: .7em solid gray;
		border-left: .3em solid transparent;
		border-right: .3em solid transparent;
		cursor: pointer;
		display: inline-block;
		font-size: 0.7rem;
		height: 0;
		margin-bottom: 1.2em;
		margin-left: .9em;
		margin-right: .9em;
		position: relative;
		width: 0;
	}
	.star:before, .star:after {
		border-bottom: .7em solid gray;
		border-left: 1em solid transparent;
		border-right: 1em solid transparent;
		content: '';
		display: block;
		height: 0;
		left: -1em;
		position: absolute;
		top: .6em;
		transform: rotate(-35deg);
		width: 0;
	}
	.star:after {
		transform: rotate(35deg);
	}
	.star.active, .star.active:before, .star.active:after {
		border-bottom-color: #F7BC19;
	}
	.star:active, .star:active:before, .star:active:after {
		border-bottom-color: #F7BC19;
	}
	.draftContainer {
		display: flex;
		font-style: italic;
		justify-content: flex-end;
		padding-right: 4px;
	}
	.draftLabel {
		visibility: hidden;
	}
	.draftLabel.open {
		visibility: visible;
	}
	.compImgs {
		align-items: center;
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		height: max-content;
		justify-content: center;
		padding: 5px;
	}
	.compCardImg {
		border-radius: 50%;
		margin: 3px;
		max-width: 50px;
	}
	.compCardImg.claimed {
		border: 3px solid var(--appColorPrimary);
	}
	.emptyCardSlot {
		background: transparent;
		border: 3px solid var(--appColorPriAccent);
		border-radius: 50%;
		flex-grow: 0;
		flex-shrink: 0;
		height: 50px;
		margin: 3px;
		width: 50px;
	}
	@media only screen and (min-width: 767px) {
		.tooltip {
			bottom: -2px;
			display: inline-block;
			position: relative;
			right: 22px;
		}
		.exportTooltip {
			right: 22.5px;
		}
		.tooltip .tooltipText {
			background-color: var(--appColorPrimary);
			border-radius: 6px;
			color: white;
			font-size: 0.8rem;
			-ms-user-select: none;
			opacity: 0;
			padding: 4px;
			position: absolute;
			text-align: center;
			transition: opacity 0.2s;
			user-select: none;
			visibility: hidden;
			-webkit-user-select: none;
			z-index: 1;
		}
		.compCard:hover {
			box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.15);
			transform: scale(1.02);
		}
		.compCard.active {
			border: 5px solid var(--appColorPrimary);
			transform: scale(1.03);
		}
		.titleAuthorContainer {
			width: 70%;
		}
		.buttonDraftArea {
			width: 30%;
		}
		.cardDeleteButton:hover+.tooltip .tooltipText {
			opacity: 1;
			visibility: visible;
		}
		.cardExportButton:hover+.tooltip .tooltipText {
			opacity: 1;
			visibility: visible;
		}
		.star:hover, .star:hover:before, .star:hover:after {
			border-bottom-color: #E0920B;
		}
		.star.active:hover, .star.active:hover:before, .star.active:hover:after {
			border-bottom-color: #F7BC19;
		}
	}
	@keyframes flash {
		0% {
			background-color: transparent;
		}
		50% {
			background-color: var(--appColorPriOpaque);
		}
		100% {
			background-color: transparent;
		}
	}
</style>