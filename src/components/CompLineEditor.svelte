<script>
	import { createEventDispatcher } from 'svelte';
	import HeroData from '../stores/HeroData.js';
	import HeroButton from '../shared/HeroButton.svelte';
	import SimpleSortableList from '../shared/SimpleSortableList.svelte';
	import XButton from '../shared/XButton.svelte';
	import ToggleSwitch from '../shared/ToggleSwitch.svelte';

	const dispatch = createEventDispatcher();

	/* expext format:
		[{name: str, heroes: [heroID], type: str}]
	*/
	export let lines = [];
	/* expect format:
		{ heroID: {
				artifacts: {primary: [str], secondary: [str], situational: [str]},
				ascendLv: int,
				core: bool,
				engraving: int,
				furn: int,
				notes: str,
				si: int,
				stars: int,
			},
			...
		}
	*/
	export let compHeroes = [];
	export let selectedLine = 0; // must be a binding
	export let editMode = false;

	function handleHeroButtonEvent(event, config) {
		switch(event.detail.action) {
			case 'heroClick':
				if(editMode) {
					handleAddHeroClick(config);
				} else {
					dispatch('compLineEvent', {action: 'heroClick', data: event.detail.data});
				}
				break;
			default:
				throw new Error(`Invalid action specified on heroButtonEvent: ${action}`);
		}
	}

	function handleLineNavClick(type) {
		switch(type) {
			case 'prev':
				if(selectedLine === null || selectedLine === undefined || --selectedLine < 0) selectedLine = 0;
				break;
			case 'next':
				if(selectedLine === null || selectedLine === undefined) {
					selectedLine = 0;
					break;
				}
				if(++selectedLine >= lines.length) selectedLine = lines.length - 1;
				break;
			default:
				throw new Error(`Invalid type specified for lineNavClick: ${type}`);
		}
	}

	function handleAddLineClick() {
		dispatch('compLineEvent', {action: 'addLine'});
	}

	function handleDeleteLineClick() {
		dispatch('compLineEvent', {action: 'deleteLine', data: selectedLine});
	}

	function validateLineDisplay(list) {
		// catch if a user dragged something we weren't expecting and exit
		if(!Array.isArray(list)) return false;
		// don't allow overwrite if there are missing/additional heroes
		if(list.length !== 5) return false;
		for(const item of list) {
			// don't allow overwrite if hero isn't in HeroData and isn't 'unknown'
			if(!$HeroData.some(e => e.id === item) && !item === 'unknown') return false;
		}
		return true;
	}

	function validateLineEditHead(list) {
		// catch if a user dragged something we weren't expecting and exit
		if(!Array.isArray(list)) return false;
		// don't allow overwrite if there are missing lines
		if(list.length !== lines.length) return false;
		for(const item of list) {
			// don't allow overwrite if list is not a list of objects
			if(Object.prototype.toString.call(item) !== '[object Object]') return false;
		}
		return true;
	}

	function handleLineDisplaySort(event) {
		dispatch('compLineEvent', {action: 'lineDisplaySort', data: event});
	}

	function handleLineSort(event) {
		dispatch('compLineEvent', {action: 'lineSort', data: event});
	}

	function handleAddHeroClick(config) {
		dispatch('compLineEvent', {action: 'addHero', data: config});
	}

	function handleDeleteHeroClick(config) {
		dispatch('compLineEvent', {action: 'deleteHero', data: config});
	}

	function handleImportLineClick() {
		dispatch('compLineEvent', {action: 'importLine', data: {idx: selectedLine}});
	}

	function handleToggleChange(event) {
		if(event.detail.data.state) {
			lines[selectedLine].type = 'enemy';
		} else {
			lines[selectedLine].type = 'player';
		}
	}
</script>

<div class="compLineEditorContainer">
	<div class="lineDisplay">
		{#if lines[selectedLine]}
			<div class="lineTitle" class:edit={editMode} class:enemy={lines[selectedLine].type === 'enemy'}>
				{#if editMode}
					<input type="text" class="titleInput" bind:value={lines[selectedLine].name} maxlength="30" class:invalid={lines[selectedLine].name.length <= 0 || lines[selectedLine].name.length >= 30}>
					<div class="deleteLineArea">
						<button type="button" class="titleButton deleteLineButton" on:click|stopPropagation={handleDeleteLineClick}>
							<img class="deleteLineImage" src="./img/utility/trashcan_white.png" alt="Delete Line">
						</button>
						<div class="tooltip">
							<span class="tooltipText">Delete</span>
						</div>
					</div>
					<div class="importLineArea">
						<button type="button" class="titleButton importLineButton" on:click|stopPropagation={handleImportLineClick}>
							<img class="importLineImage" src="./img/utility/import_line_white.png" alt="Import Line">
						</button>
						<div class="tooltip">
							<span class="tooltipText">Import</span>
						</div>
					</div>
				{:else}
					{#if lines[selectedLine].type === 'enemy'}
						<span class="enemyTitle">Enemy</span>
					{/if}
					<span>{lines[selectedLine].name}</span>
				{/if}
			</div>
			{#if editMode}
				<div class="lineEditMembers" class:enemy={lines[selectedLine].type === 'enemy'}>
					<SimpleSortableList
						list={[...lines[selectedLine].heroes].reverse()}
						groupID="lineDisplay"
						validate={validateLineDisplay}
						on:sort={handleLineDisplaySort}
						let:item={hero}
						let:i={i}>
						{#if hero === 'unknown'}
							<button type="button" class="addHeroButton" on:click={() => handleAddHeroClick({idx: selectedLine, pos: i, compHeroData: compHeroes})}>
								<span>+</span>
							</button>
						{:else}
							<div class="heroButtonArea">
								<HeroButton
									hero={hero}
									heroDetails={compHeroes[hero]}
									on:heroButtonEvent={(event) => handleHeroButtonEvent(event, {idx: selectedLine, pos: i, oldHeroID: hero, compHeroData: compHeroes})}
								/>
								<div class="deleteHeroArea">
									<XButton clickCallback={() => handleDeleteHeroClick({lineIdx: selectedLine, heroIdx: i})} size="medium" hoverable />
								</div>
							</div>
						{/if}
					</SimpleSortableList>
				</div>
			{:else}
				<div class="lineMembers" class:enemy={lines[selectedLine].type === 'enemy'}>
					<div class="detailBackline">
						{#if lines.length > 0}
							{#each lines[selectedLine].heroes as hero, i}
								{#if i >= 2}
									{#if $HeroData.some(e => e.id === hero)}
										<div class="heroButtonArea">
											<HeroButton
												hero={hero}
												heroDetails={compHeroes[hero]}
												on:heroButtonEvent={handleHeroButtonEvent}
											/>
										</div>
									{:else}
										<i class="emptyLineSlot"></i>
									{/if}
								{/if}
							{/each}
						{/if}
					</div>
					<div class="detailFrontline">
						{#if lines.length > 0}
							{#each lines[selectedLine].heroes as hero, i}
								{#if i < 2}
									{#if $HeroData.some(e => e.id === hero)}
										<div class="heroButtonArea">
											<HeroButton
												hero={hero}
												heroDetails={compHeroes[hero]}
												on:heroButtonEvent={handleHeroButtonEvent}
											/>
										</div>
									{:else}
										<i class="emptyLineSlot"></i>
									{/if}
								{/if}
							{/each}
						{/if}
					</div>
				</div>
			{/if}
			<div class="lineOptions" class:edit={editMode}>
				<ul>
					<li>
						<span class="optionLabel">{lines[selectedLine].type}</span>
						<ToggleSwitch
							size="small"
							state={lines[selectedLine].type === 'enemy'}
							onColor={window.getComputedStyle(document.documentElement).getPropertyValue('--appDelColor')}
							offColor={window.getComputedStyle(document.documentElement).getPropertyValue('--appColorPrimary')}
							on:toggleEvent={handleToggleChange}
						/>
					</li>
				</ul>
			</div>
		{:else}
			<div class="noLine">
				<span>Select a line below</span>
			</div>
		{/if}
		<button type="button" class="lineNavButton prevLineButton" disabled={selectedLine <= 0} on:click={() => handleLineNavClick('prev')}>&#10096;</button>
		<button type="button" class="lineNavButton nextLineButton" disabled={selectedLine >= lines.length - 1} on:click={() => handleLineNavClick('next')}>&#10097;</button>
	</div>
	<div class="lineSwitcher">
		{#if editMode}
			<SimpleSortableList
				list={lines}
				groupID="lineEditHead"
				validate={validateLineEditHead}
				on:sort={handleLineSort}
				let:i={i}>
				<button type="button" class="lineSwitchButton" class:active={selectedLine === i} on:click={() => selectedLine = i}></button>
			</SimpleSortableList>
			<button type="button" class="addLineButton" on:click={handleAddLineClick}>+</button>
		{:else}
			{#each lines as line, i}
				<button type="button" class="lineSwitchButton" class:active={selectedLine === i} on:click={() => selectedLine = i}></button>
			{/each}
		{/if}
	</div>
</div>

<style lang="scss">
	.compLineEditorContainer {
		padding-bottom: 10px;
		width: 100%;
	}
	.lineDisplay {
		align-items: center;
		border-radius: 10px;
		box-shadow: var(--neu-med-ni-BGColor-shadow);
		display: flex;
		flex-direction: column;
		justify-content: center;
		max-height: 425px;
		min-height: 425px;
		padding: 10px;
		position: relative;
		width: 100%;
		.lineTitle {
			padding: 10px;
			font-size: 1.1rem;
			font-weight: bold;
			max-width: 300px;
			overflow: hidden;
			position: relative;
			text-align: center;
			text-overflow: ellipsis;
			white-space: nowrap;
			&.edit {
				overflow: visible;
			}
			.titleInput {
				background-color: var(--appBGColor);
				border: none;
				border-radius: 5px;
				box-shadow: var(--neu-sm-i-BGColor-shadow);
				color: var(--appColorBlack);
				font-weight: bold;
				outline: none;
				padding: 3px;
				text-align: center;
				width: 100px;
				&:focus {
					background-color: var(--appTextInputFocusBG);
					box-shadow: var(--neu-sm-i-BGColor-pressed-shadow);
				}
				&::placeholder {
					color: var(--appColorBlack);
					opacity: 0.5;
				}
				&.invalid {
					outline: 2px solid var(--appDelColor);
				}
			}
			.deleteLineArea {
				position: absolute;
				right: -20px;
				top: 13px;
				.deleteLineButton {
					align-items: center;
					background-color: var(--appDelColor);
					border: none;
					border-radius: 5px;
					box-shadow: var(--neu-sm-i-BGColor-pressed-shadow);
					cursor: pointer;
					display: flex;
					justify-content: center;
					outline: none;
					padding: 5px;
					.deleteLineImage {
						max-width: 12px;
					}
				}
			}
			.importLineArea {
				position: absolute;
				left: -20px;
				top: 13px;
				.importLineButton {
					align-items: center;
					background-color: var(--appColorPrimary);
					border: none;
					border-radius: 5px;
					box-shadow: var(--neu-sm-i-BGColor-pressed-shadow);
					cursor: pointer;
					display: flex;
					justify-content: center;
					outline: none;
					padding: 5px;
					.importLineImage {
						max-width: 12px;
					}
				}
			}
			.enemyTitle {
				display: block;
			}
			&.enemy {
				color: var(--appDelColor);
				.titleInput {
					color: var(--appDelColor);
				}
			}
		}
		.tooltip {
			display: none;
		}
		.lineEditMembers {
			align-items: center;
			display: flex;
			width: 170px;
			flex-direction: column-reverse;
			height: 340px;
			flex-wrap: wrap;
			justify-content: center;
			.addHeroButton {
				background: transparent;
				border: 3px solid var(--appColorPrimary);
				border-radius: 50%;
				color: var(--appColorPrimary);
				cursor: pointer;
				flex-grow: 0;
				flex-shrink: 0;
				font-size: 1.5rem;
				height: 60px;
				margin: 5px;
				margin-bottom: 20px;
				padding: 0;
				width: 60px;
			}
			.heroButtonArea {
				margin: 5px;
			}
			&.enemy {
				direction: rtl;
			}
		}
		.lineMembers {
			align-items: center;
			border-radius: 10px;
			display: flex;
			flex-direction: row;
			justify-content: center;
			min-height: 295px;
			width: 100%;
			&.enemy {
				direction: rtl;
			}
		}
		.detailFrontline {
			align-items: center;
			display: flex;
			flex-direction: column;
			justify-content: center;
			width: 80px;
		}
		.detailBackline {
			align-items: center;
			display: flex;
			flex-direction: column;
			justify-content: center;
			width: 80px;
			margin-right: 10px;
		}
		.heroButtonArea {
			margin: 5px;
			position: relative;
			.deleteHeroArea {
				position: absolute;
				top: -10px;
				right: -7px;
			}
		}
		.emptyLineSlot {
			background: transparent;
			border: 3px solid var(--appColorPriAccent);
			border-radius: 50%;
			flex-grow: 0;
			flex-shrink: 0;
			height: 70px;
			margin: 5px;
			margin-bottom: 20px;
			width: 70px;
		}
		.lineNavButton {
			align-items: center;
			background-color: transparent;
			border: none;
			color: var(--appColorBlack);
			cursor: pointer;
			display: flex;
			font-size: 2rem;
			height: 100%;
			outline: none;
			justify-content: center;
			position: absolute;
			transition: all 0.2s;
			width: 50px;
			&.prevLineButton {
				border-radius: 10px 0px 0px 10px;
				left: 0px;
			}
			&.nextLineButton {
				border-radius: 0px 10px 10px 0px;
				right: 0px;
			}
			&:disabled {
				color: var(--appColorDisabled);
				cursor: default;
			}
		}
		.lineOptions {
			display: none;
			ul {
				display: flex;
				list-style-type: none;
				margin: 0;
				padding: 0;
				li {
					align-items: center;
					display: flex;
					justify-content: center;
					.optionLabel {
						text-align: center;
						width: 50px;
					}
				}
			}
			&.edit {
				display: block;
			}
		}
		.noLine {
			align-items: center;
			height: 100%;
			color: var(--appColorBlack);
			font-size: 1.5rem;
			font-weight: bold;
			justify-content: center;
			text-align: center;
			width: 100%;
		}
	}
	.lineSwitcher {
		align-items: center;
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: center;
		margin-top: 10px;
		width: 100%;
		.lineSwitchButton {
			background-color: var(--appColorDisabled);
			border: none;
			border-radius: 50%;
			cursor: pointer;
			flex-grow: 0;
			flex-shrink: 0;
			height: 10px;
			margin: 5px;
			padding: 0;
			width: 10px;
			&.active {
				background-color: var(--appColorPrimary);
			}
		}
		.addLineButton {
			align-items: center;
			background-color: transparent;
			border: none;
			border-radius: 50%;
			box-shadow: var(--neu-sm-i-BGColor-shadow);
			color: var(--appColorPrimary);
			cursor: pointer;
			display: flex;
			font-size: 1rem;
			font-weight: bold;
			height: 23px;
			justify-content: center;
			margin-left: 5px;
			padding: 0;
			user-select: none;
			width: 23px;
		}
	}
	@media only screen and (min-width: 767px) {
		.compLineEditorContainer {
			flex-grow: 0;
			flex-shrink: 0;
			margin-right: 20px;
			width: 340px;
		}
		.lineDisplay {
			.lineTitle {
				.titleInput {
					width: 170px;
				}
				.tooltip {
					display: block;
					opacity: 0;
					position: absolute;
					left: -11px;
					top: -30px;
					transition: all 0.2s;
					visibility: hidden;
					.tooltipText {
						background: var(--appBGColor);
						border-radius: 5px;
						box-shadow: var(--neu-sm-ni-BGColor-pressed-shadow);
						font-size: 0.8rem;
						font-weight: normal;
						padding: 3px;
					}
				}
				.titleButton:hover {
					+.tooltip {
						opacity: 1;
						visibility: visible;
					}
				}
			}
			.lineNavButton {
				&:hover {
					background-color: var(--appBGColorDark);
				}
				&:disabled {
					&:hover {
						background-color: transparent;
					}
				}
			}
		}
		.lineSwitcher {
			.addLineButton {
				&:hover {
					background: var(--neu-convex-BGColor-bg);
				}
			}
		}
	}
</style>
