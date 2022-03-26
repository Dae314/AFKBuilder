<script>
	import {createEventDispatcher} from 'svelte';
	import AppData from '../stores/AppData.js';
	import HeroData from '../stores/HeroData.js';
	
	export let comp = {};
	export let idx = {}
	export let highlightComp = null;

	const dispatch = createEventDispatcher();

	let showGroupMenu = false;

	$: published = $AppData.user.jwt ? $AppData.user.published_comps.some(e => e.uuid === comp.uuid) : false;

	function handleDeleteButtonClick(uuid) {
		dispatch('cardEvent', {action: 'deleteClick', data: uuid});
	}

	function handleCompCardClick(uuid) {
		dispatch('cardEvent', {action: 'cardClick', data: uuid});
	}

	function handleExportButtonClick(uuid) {
		dispatch('cardEvent', {action: 'exportClick', data: uuid});
	}

	function handleGroupButtonClick() {
		showGroupMenu = !showGroupMenu;
	}

	function handleGroupChange(groupUUID) {
		showGroupMenu = false;
		dispatch('cardEvent', {action: 'groupChange', data: {compUUID: comp.uuid, groupUUID}});
	}

	function handleStarClick(uuid) {
		dispatch('cardEvent', {action: 'starClick', data: uuid});
	}
</script>

<div id="comp{idx}" class="compCard" class:highlight={highlightComp !== null && highlightComp === idx} class:active={comp.uuid === $AppData.selectedComp} on:click={() => handleCompCardClick(comp.uuid) }>
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
					<button
						type="button"
						class="cardDeleteButton"
						on:click|stopPropagation={() => handleDeleteButtonClick(comp.uuid)}>
						<img
							draggable="false"
							class="deleteIcon"
							src={comp.source === 'local' ? './img/utility/trashcan.png' : './img/utility/favorite_unfilled_white.png'}
							alt="Delete">
					</button>
					<div class="tooltip deleteTooltip"><span class="tooltipText">{comp.source === 'local' ? 'Delete' : 'Unfavorite'}</span></div>
				</div>
				<div class="buttonArea">
					<img class="publishedIcon" class:published={published} src="./img/utility/explore_white.png" alt="{published ? 'Published' : 'Unpublished'}" draggable="false" />
					<div class="tooltip publishedTooltip"><span class="tooltipText">{published ? 'Published' : 'Unpublished'}</span></div>
				</div>
				<div class="buttonArea groupArea">
					<button
						type="button"
						class="cardGroupButton"
						on:click|stopPropagation={handleGroupButtonClick}>
						<img
							draggable="false"
							class="groupIcon"
							src="./img/utility/group_manage_white.png"
							alt="Edit Groups">
					</button>
					<div class="tooltip groupTooltip"><span class="tooltipText">Edit Groups</span></div>
					<div class="groupListArea" class:open={showGroupMenu} on:click|stopPropagation>
						<ul class="groupList">
							{#each $AppData.compGroups as group}
								<li>
									<button
										type="button"
										class="groupButton"
										class:claimed={group.comps.includes(comp.uuid)}
										on:click|stopPropagation={() => handleGroupChange(group.uuid)}>
										{group.name}
									</button>
								</li>
							{/each}
						</ul>
					</div>
				</div>
				<i class="star" class:active={comp.starred} on:click|stopPropagation={() => handleStarClick(comp.uuid)}></i>
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
		background: var(--neu-convex-BGLight-bg);
		border-radius: 10px;
		box-shadow: var(--neu-med-i-BGLight-shadow);
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
			max-width: 70%;
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
			width: 30%;
			.cardButtonsContainer {
				align-items: center;
				cursor: default;
				display: grid;
				grid-gap: 5px;
				grid-template-columns: 1fr 1fr 1fr 1fr;
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
					height: fit-content;
					margin: 0;
					outline: 0;
					padding: 0;
					padding-top: 1px;
					&:disabled {
						cursor: not-allowed;
					}
					.deleteIcon {
						filter: invert(1.0);
						max-width: 15px;
						&.disabled {
							filter: invert(0.35);
						}
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
				.groupArea {
					.cardGroupButton {
						background-color: transparent;
						border: 0;
						cursor: pointer;
						height: fit-content;
						margin: 0;
						outline: 0;
						padding: 0;
						.groupIcon {
							filter: invert(1.0);
							max-width: 15px;
						}
					}
					.groupListArea {
						background-color: var(--appBGColorDark);
						border-radius: 5px;
						opacity: 0;
						position: absolute;
						visibility: hidden;
						top: 23px;
						transition: all 0.2s;
						z-index: 2;
						&:before {
							border-bottom: 5px solid var(--appBGColorDark);
							border-left: 5px solid transparent;
							border-right: 5px solid transparent;
							content: "";
							height: 0;
							left: 50%;
							position: absolute;
							top: -5px;
							transform: translate(-50%, 0%);
							width: 0;
						}
						&.open {
							opacity: 1;
							visibility: visible;
						}
						.groupList {
							margin: 0;
							max-height: 260px;
							max-width: 90px;
							overflow-y: auto;
							padding: 3px;
							list-style-type: none;
							.groupButton {
								border: 2px solid var(--appColorPrimary);
								border-radius: 3px;
								background-color: transparent;
								color: var(--appColorPrimary);
								cursor: pointer;
								outline: none;
								overflow: hidden;
								padding: 3px;
								margin: 3px 0px;
								max-width: 75px;
								text-overflow: ellipsis;
								user-select: none;
								white-space: nowrap;
								&.claimed {
									background-color: var(--appColorPrimary);
									color: var(--appBGColor);
								}
							}
						}
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
				box-shadow: var(--neu-med-i-BGLight-hover-shadow);
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
			.cardGroupButton {
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
