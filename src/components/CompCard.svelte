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

	$: published = $AppData.user.published_comps.some(e => e.uuid === comp.uuid);

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
					<button type="button" class="cardDeleteButton" on:click={(e) => { handleDeleteButtonClick(idx); e.stopPropagation(); }}><img draggable="false" class="deleteIcon" src="./img/utility/trashcan.png" alt="Delete"></button>
					<div class="tooltip deleteTooltip"><span class="tooltipText">Delete</span></div>
				</div>
				<div class="buttonArea">
					<img class="publishedIcon" class:published={published} src="./img/utility/explore_white.png" alt="{published ? 'Published' : 'Unpublished'}" draggable="false" />
					<div class="tooltip publishedTooltip"><span class="tooltipText">{published ? 'Published' : 'Unpublished'}</span></div>
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
					<img draggable="false" class="compCardImg" class:claimed={$AppData.MH.List[hero].claimed} src={$HeroData.find(e => e.id === hero).portrait} alt={$HeroData.find(e => e.id === hero).name}>
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

<style lang="scss">
	.compCard {
		background-color: var(--appBGColor);
		border: 3px solid var(--appColorPrimary);
		border-radius: 10px;
		cursor: pointer;
		scroll-snap-align: center;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 0);
	}
	.compCard.highlight {
		animation: flash 1s linear 3;
	}
	img {
		user-select: none;
	}
	.compCardHead {
		display: flex;
		justify-content: center;
		padding: 10px;
		padding-right: 5px;
		padding-top: 8px;
		.titleAuthorContainer {
			flex-grow: 1;
			max-width: 80%;
			justify-content: flex-start;
			padding-right: 5px;
			.compCardTitleContainer {
				width: 100%;
				.compCardTitle {
					display: inline-block;
					font-size: 1.3rem;
					font-weight: bold;
					overflow: hidden;
					text-overflow: ellipsis;
					user-select: none;
					white-space: nowrap;
					width: 100%;
				}
			}
			.author {
				display: inline-block;
				overflow: hidden;
				user-select: none;
				text-overflow: ellipsis;
				white-space: nowrap;
				width: 100%;
			}
		}
		.buttonDraftArea {
			display: flex;
			flex-direction: column;
			justify-content: flex-end;
			min-width: 80px;
			width: 20%;
			.cardButtonsContainer {
				align-items: center;
				display: grid;
				grid-gap: 5px;
				grid-template-columns: 1fr 1fr 1fr;
				height: 100%;
				justify-content: space-evenly;
				justify-items: center;
				.buttonArea {
					align-items: center;
					display: flex;
					flex-direction: column;
					justify-content: center;
					position: relative;
				}
				.cardDeleteButton {
					background-color: transparent;
					border: 0;
					cursor: pointer;
					display: none;
					height: fit-content;
					margin: 0;
					outline: 0;
					padding: 0;
					padding-top: 1px;
					.deleteIcon {
						filter: invert(1.0);
						max-width: 15px;
					}
				}
				.publishedIcon {
					cursor: default;
					filter: invert(1.0);
					max-width: 20px;
					opacity: 35%;
					&.published {
						opacity: 100%;
					}
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
					&:before {
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
					&:after {
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
						transform: rotate(35deg);
					}
					&:active {
						border-bottom-color: var(--legendColor);
						&:before {
							border-bottom-color: var(--legendColor);
						}
						&:after {
							border-bottom-color: var(--legendColor);
						}
					}
				}
				.star.active {
					border-bottom-color: var(--legendColor);
					&:before {
						border-bottom-color: var(--legendColor);
					}
					&:after {
						border-bottom-color: var(--legendColor);
					}
				}
			}
			.draftContainer {
				display: flex;
				font-style: italic;
				justify-content: flex-end;
				padding-right: 4px;
				.draftLabel {
					visibility: hidden;
				}
				.draftLabel.open {
					visibility: visible;
				}
			}
		}
	}
	.tooltip {
		display: none;
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
			align-items: center;
			bottom: -15px;
			display: flex;
			justify-content: center;
			position: absolute;
			text-align: center;
			left: -32px;
			width: 80px;
			.tooltipText {
				background-color: var(--appColorPrimary);
				border-radius: 6px;
				color: white;
				font-size: 0.8rem;
				opacity: 0;
				padding: 4px;
				position: absolute;
				text-align: center;
				transition: opacity 0.2s;
				user-select: none;
				visibility: hidden;
				z-index: 1;
			}
		}
		.compCard {
			&:hover {
				box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.15);
				transform: scale(1.02);
			}
		}
		.compCard.active {
			border: 5px solid var(--appColorPrimary);
			transform: scale(1.03);
		}
		.compCardHead {
			.buttonDraftArea {
				.cardButtonsContainer {
					.cardDeleteButton {
						display: block;
					}
				}
			}
		}
		.titleAuthorContainer {
			width: 70%;
		}
		.buttonDraftArea {
			width: 30%;
			.cardDeleteButton {
				&:hover+.tooltip {
					.tooltipText {
						opacity: 1;
						visibility: visible;
					}
				}
			}
			.publishedIcon {
				&:hover+.tooltip {
					.tooltipText {
						opacity: 1;
						visibility: visible;
					}
				}
			}
			.star {
				&:hover {
					border-bottom-color: #E0920B;
					&:before {
						border-bottom-color: #E0920B;
					}
					&:after {
						border-bottom-color: #E0920B;
					}
				}
			}
			.star.active {
				&:hover {
					border-bottom-color: var(--legendColor);
					&:before {
						border-bottom-color: var(--legendColor);
					}
					&:after {
						border-bottom-color: var(--legendColor);
					}
				}
			}
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
