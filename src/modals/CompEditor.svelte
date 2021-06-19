<script>
	import { onMount, onDestroy, tick, getContext } from 'svelte';
	import { v4 as uuidv4 } from 'uuid';
	import AppData from '../stores/AppData.js';
	import HeroData from '../stores/HeroData.js';
	import HeroFinder from '../shared/HeroFinder.svelte';

	export let compID = null; // uuid for comp to be edited
	export let onSuccess = () => {}; // save success callback

	const { close } = getContext('simple-modal');

	// this will hold the comp as it's edited
	let comp = {
				name: '',
				uuid: uuidv4(),
				desc: '',
				starred: false,
				draft: true,
				author: '',
				lastUpdate: new Date(),
				heroes: {},
				lines: [],
				subs: [],
	}
	let openLine = null;
	let statusMessage = '';
	let showStatusMessage = false;
	let statusError = false;
	let heroFinderOpen = false;
	let hfConfig = {};
	let autosave;

	onMount(async () => {
		history.pushState({view: $AppData.activeView, modal: true, comp: true}, "Comp Editor", `?view=${$AppData.activeView}&comp=true&modal=true`);
		if(compID) {
			const compCopy = $AppData.Comps.find(e => e.uuid === compID);
			if(typeof compCopy === 'undefined') throw new Error(`Invalid CompID given to CompEditor: ${compID}.`);
			comp = JSON.parse(JSON.stringify(compCopy));
			comp.lastUpdate = new Date(comp.lastUpdate);
		}
		autosave = setTimeout(() => {
			if(comp.draft) saveDraft();
		}, 30000);
		await tick();
		const descInput = document.getElementById('descInput');
		descInput.style.height = 'inherit';
		descInput.style.height = getTextareaHeight(descInput) + 'px';
	});

	onDestroy(async () => {
		clearTimeout(autosave);
	});

	function deleteLine(lineIdx) {
		comp.lines = comp.lines.filter((e, i) => i !== lineIdx);
		if(openLine === lineIdx) {
			openLine = null;
		} else if(openLine > lineIdx ) {
			openLine--;
		}
	}

	function deleteSub(subIdx) {
		comp.subs = comp.subs.filter((e, i) => i !== subIdx);
	}

	function addLine() {
		comp.lines = [...comp.lines, {
			name: "New Line",
			heroes: ['unknown', 'unknown', 'unknown', 'unknown', 'unknown'],
		}];
		openLine = comp.lines.length - 1;
	}

	function addSub() {
		comp.subs = [...comp.subs, {
			name: "New Sub Group",
			heroes: [],
		}];
	}

	function getTextareaHeight(element) {
		const computed = window.getComputedStyle(element);
		return parseInt(computed.getPropertyValue('border-top-width'), 10)
			+ parseInt(computed.getPropertyValue('padding-top'), 10)
			+ element.scrollHeight
			+ parseInt(computed.getPropertyValue('padding-bottom'), 10)
			+ parseInt(computed.getPropertyValue('border-bottom-width'), 10);
	}

	function adjustHeight(event) {
		const el = event.target;
		el.style.height = 'inherit';
		el.style.height = getTextareaHeight(el) + 'px';
	}

	function cancelEdit() {
		close();
	}

	async function saveEdit() {
		comp.lastUpdate = new Date()
		const returnObj = await validateComp(comp);
		if(returnObj.retCode !== 0) {
			// validation error occurred
			statusMessage = `Validation error: ${returnObj.message}`;
			showStatusMessage = true;
			statusError = true;
			comp.draft = true;
			setTimeout(() => {
				statusMessage = '';
				showStatusMessage = false;
				statusError = false;
			}, 8000);
		} else {
			// message should contain a clean comp data object now
			comp = returnObj.message;
			if(compID) {
				// editing an existing comp
				const compIdx = $AppData.Comps.findIndex(e => e.uuid === compID);
				if(compIdx === -1) throw new Error(`Invalid CompID given to CompEditor: ${compID}.`);
				$AppData.Comps[compIdx] = comp;
			} else {
				// adding a new comp
				$AppData.Comps = [...$AppData.Comps, comp];
			}
			onSuccess();
			close();
		}
	}

	async function saveDraft() {
		clearTimeout(autosave);
		comp.draft = true;
		comp.lastUpdate = new Date()
		const returnObj = await validateComp(comp);
		if(returnObj.retCode !== 0) {
			// validation error occurred
			statusMessage = `Validation error: ${returnObj.message}`;
			showStatusMessage = true;
			statusError = true;
			setTimeout(() => {
				statusMessage = '';
				showStatusMessage = false;
				statusError = false;
			}, 8000);
		} else {
			// message should contain a clean comp data object now
			comp = returnObj.message;
			if(compID) {
				// editing an existing comp
				const compIdx = $AppData.Comps.findIndex(e => e.uuid === compID);
				if(compIdx === -1) throw new Error(`Invalid CompID given to CompEditor: ${compID}.`);
				$AppData.Comps[compIdx] = comp;
			} else {
				// adding a new comp
				$AppData.Comps = [...$AppData.Comps, comp];
				compID = comp.uuid;
			}
			onSuccess();
			statusMessage = "Draft saved";
			showStatusMessage = true;
			statusError = false;
			setTimeout(() => {
				statusMessage = '';
				showStatusMessage = false;
				statusError = false;
			}, 2000);
		}
		autosave = setTimeout(() => {
			if(comp.draft) saveDraft();
		}, 30000);
	}

	function openHeroFinder(config) {
		hfConfig = config;
		heroFinderOpen = true;
	}

	function closeHeroFinder() {
		heroFinderOpen = false;
		hfConfig = {};
	}

	function updateLineHero(idx, pos, hero) {
		comp.lines[idx].heroes[pos] = hero.id;
		comp.heroes[hero.id] = {
			ascendLv: hero.ascendLv,
			si: hero.si,
			furn: hero.furn,
			artifact: hero.artifact,
			core: hero.core,
		}
	}

	function updateSubHero(idx, pos, hero) {
		comp.subs[idx].heroes[pos] = hero.id;
		comp.heroes[hero.id] = {
			ascendLv: hero.ascendLv,
			si: hero.si,
			furn: hero.furn,
			artifact: hero.artifact,
			core: hero.core,
		}
	}

	function removeSubHero(subIdx, heroIdx) {
		comp.subs[subIdx].heroes = comp.subs[subIdx].heroes.filter((e, i) => i !== heroIdx);
	}

	function removeLineHero(lineIdx, heroIdx) {
		const heroID = comp.lines[lineIdx].heroes[heroIdx];
		comp.lines[lineIdx].heroes[heroIdx] = 'unknown';
		delete comp.heroes[heroID];
	}

	function handlePopState() {
		close();
	}
</script>

<svelte:window on:popstate={handlePopState} />

<div class="editorContainer">
	<section class="sect1">
		<div class="editorHead">
			<input class="titleInput" type="text" bind:value={comp.name} placeholder="Title">
			<input class="authorInput" type="text" bind:value={comp.author} placeholder="Author">
			{#if comp.draft}
				<div class="draftContainer"><span class="draftLabel">draft</span></div>
			{/if}
		</div>
		<div class="row1">
			<div class="lineEditor">
				<h4 class="lineEditorTitle">Lines</h4>
				<div class="lineEditHead">
					{#each comp.lines as line, i}
						<button class="linePickerOption" class:open={openLine === i} on:click={() => openLine = i}>
							{line.name}
							<button class="removeButton" on:click={(e) => { deleteLine(i); e.stopPropagation(); }}>x</button>
						</button>
					{/each}
					<button class="linePickerOption addLineButton" on:click={addLine}>+</button>
				</div>
				<div class="lineEditBody">
					{#if openLine === null}
						<span class="noLine">Select a line to edit.</span>
					{:else}
						<input type="text" class="lineNameInput" bind:value={comp.lines[openLine].name} placeholder="Line Name">
						<div class="lineDisplay">
							<div class="backline">
								{#each comp.lines[openLine].heroes as  hero, i}
								{#if i >= 2}
									{#if hero === 'unknown'}
										<button class="addHeroButton lineButton" on:click={() => openHeroFinder({idx: openLine, pos: i, onSuccess: updateLineHero, close: closeHeroFinder, compHeroData: comp.heroes, })}>
											<span>+</span>
										</button>
									{:else}
										<button class="heroButton" on:click={() => openHeroFinder({idx: openLine, pos: i, onSuccess: updateLineHero, close: closeHeroFinder, oldHeroID: hero, compHeroData: comp.heroes, })}>
											<div class="imgContainer">
												<img src={$HeroData.find(e => e.id === hero).portrait} alt={$HeroData.find(e => e.id === hero).name}>
												<span class="coreMark" class:visible={comp.heroes[hero].core}></span>
												<button class="removeHeroButton lineHeroButton" on:click={() => removeLineHero(openLine, i)}><span>x</span></button>
											</div>
										</button>
										<p class="heroButton" on:click={() => openHeroFinder({idx: openLine, pos: i, onSuccess: updateLineHero, close: closeHeroFinder, oldHeroID: hero, compHeroData: comp.heroes,})}>{$HeroData.find(e => e.id === hero).name}</p>
									{/if}
								{/if}
								{/each}
							</div>
							<div class="frontline">
								{#each comp.lines[openLine].heroes as  hero, i}
								{#if i < 2}
									{#if hero === 'unknown'}
										<button class="addHeroButton lineButton" on:click={() => openHeroFinder({idx: openLine, pos: i, onSuccess: updateLineHero, close: closeHeroFinder, compHeroData: comp.heroes, })}>
											<span>+</span>
										</button>
									{:else}
										<button class="heroButton" on:click={() => openHeroFinder({idx: openLine, pos: i, onSuccess: updateLineHero, close: closeHeroFinder, oldHeroID: hero, compHeroData: comp.heroes, })}>
											<div class="imgContainer">
												<img src={$HeroData.find(e => e.id === hero).portrait} alt={$HeroData.find(e => e.id === hero).name}>
												<span class="coreMark" class:visible={comp.heroes[hero].core}></span>
												<button class="removeHeroButton lineHeroButton" on:click={() => removeLineHero(openLine, i)}><span>x</span></button>
											</div>
										</button>
										<p class="heroButton" on:click={() => openHeroFinder({idx: openLine, pos: i, onSuccess: updateLineHero, close: closeHeroFinder, oldHeroData: comp.heroes[hero], oldHeroID: hero, compHeroData: comp.heroes, })}>{$HeroData.find(e => e.id === hero).name}</p>
									{/if}
								{/if}
								{/each}
							</div>
						</div>
					{/if}
				</div>
			</div>
			<div class="descEditor">
				<h4>Description</h4>
				<textarea id="descInput" class="descInput" bind:value={comp.desc} placeholder="Description" on:input={(e) => adjustHeight(e)}></textarea>
			</div>
		</div>
		<div class="row2">
			<div class="subEditor">
				<h4>Substitutes</h4>
				<div class="subContainer">
					{#each comp.subs as sub, i}
						<div class="subGroup">
							<div class="subTitle">
								<input class="subTitleInput" type="text" bind:value={sub.name} placeholder="Subgroup Name">
								<button class="removeButton" on:click={(e) => { deleteSub(i); e.stopPropagation(); }}>x</button>
							</div>
							<div class="subLine">
								{#each sub.heroes as hero, j}
									<div class="subGroupMember">
										<button class="heroButton" on:click={() => openHeroFinder({idx: i, pos: j, onSuccess: updateSubHero, close: closeHeroFinder, oldHeroData: comp.heroes[hero], oldHeroID: hero, compHeroData: comp.heroes, })}>
											<img
												src={$HeroData.some(e => e.id === hero) ? $HeroData.find(e => e.id === hero).portrait : './img/portraits/unavailable.png'}
												alt={$HeroData.some(e => e.id === hero) ? $HeroData.find(e => e.id === hero).name : 'Pick a Hero'}>
											<button class="removeHeroButton subHeroButton" on:click={() => removeSubHero(i, j)}><span>x</span></button>
										</button>
										<p>{$HeroData.find(e => e.id === hero).name}</p>
									</div>
								{/each}
								<button class="addHeroButton" on:click={() => openHeroFinder({idx: i, pos: sub.heroes.length, onSuccess: updateSubHero, close: closeHeroFinder, compHeroData: comp.heroes, })}>+</button>
							</div>
						</div>
					{/each}
					<div class="newSubArea">
						<button class="subAddButton" on:click={addSub}>Add Substitute Line</button>
					</div>
				</div>
			</div>
		</div>
		<div class="footer">
			<button class="footerButton draftButton" on:click={saveDraft}>Save Draft</button>
			<button class="footerButton saveButton" on:click={() => { comp.draft = false; saveEdit(); }}>Save</button>
			<button class="footerButton cancelButton" on:click={cancelEdit}>Cancel</button>
		</div>
	</section>
	<section class="sect2" class:visible={heroFinderOpen}>
		{#if heroFinderOpen}
			<HeroFinder config={hfConfig} />
		{/if}
	</section>
	<section class="sect3">
		<div class="statusMessage" class:visible={showStatusMessage} class:error={statusError}>{statusMessage}</div>
	</section>
</div>

<style>
	.editorContainer {
		padding: 10px;
	}
	.sect2 {
		display: none;
		visibility: hidden;
	}
	.sect3 {
		left: 50%;
		position: fixed;
		top: 80px;
		transform: translate(-50%, 0);
		width: fit-content;
	}
	.sect2.visible {
		display: block;
		height: 100%;
		left: 0;
		position: fixed;
		top: 0;
		visibility: visible;
		width: 100%;
		z-index: 4;
	}
	.statusMessage {
		background-color: rgba(50, 50, 50, 0.7);
		border-radius: 10px;
		color: rgba(255, 255, 255, 0.7);
		display: none;
		opacity: 0;
		padding: 5px;
		transition: visibility 0.3s, opacity 0.3s;
		visibility: hidden;
	}
	.statusMessage.visible {
		display: block;
		opacity: 1;
		visibility: visible;
	}
	.statusMessage.error {
		background-color: var(--appDelColorOpaque)
	}
	h4 {
		margin: 0;
		margin-bottom: 10px;
		margin-top: 15px;
	}
	.draftContainer {
		padding-top: 3px;
	}
	.draftLabel {
		color: var(--appDelColor);
		font-weight: bold;
		font-style: italic;
	}
	.lineEditorTitle {
		margin-top: 0;
	}
	input {
		border: 1px solid var(--appColorPrimary);
	}
	input:focus {
		outline: 2px solid var(--appColorPrimary);
	}
	.editorHead {
		align-items: center;
		border-bottom: 1px solid black;
		display: flex;
		flex-direction: column;
		padding-bottom: 5px;
	}
	.titleInput {
		font-size: 1.5rem;
		margin-bottom: 10px;
		margin-bottom: 5px;
		text-align: center;
		width: 80%;
	}
	.authorInput {
		text-align: center;
	}
	.lineEditor {
		padding: 10px 0px;
		width: 100%;
	}
	.lineEditHead {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		width: 100%;
	}
	.linePickerOption {
		align-items: center;
		border: 0;
		border: 2px solid var(--appColorPrimary);
		border-bottom: none;
		border-radius: 10px 10px 0px 0px;
		cursor: pointer;
		display: flex;
		justify-content: center;
		padding: 3px;
	}
	.linePickerOption.open {
		background-color: var(--appColorPrimary);
		color: white;
	}
	.linePickerOption .removeButton {
		align-items: center;
		background-color: #aaa;
		border: none;
		border-radius: 50%;
		cursor: pointer;
		display: flex;
		font-size: 0.5rem;
		height: 10px;
		justify-content: center;
		margin-left: 5px;
		width: 10px;
	}
	.addLineButton {
		padding: 5px;
	}
	.lineEditBody {
		align-items: center;
		background-color: transparent;
		border: 2px solid var(--appColorPrimary);
		border-radius: 10px;
		color: black;
		display: flex;
		flex-direction: column;
		padding: 5px;
		width: 100%;
	}
	.noLine {
		color: rgba(100, 100, 100, 0.5);
		font-size: 1rem;
		font-weight: bold;
		-ms-user-select: none;
		text-align: center;
		text-transform: uppercase;
		-webkit-user-select: none;
		width: 100%;
	}
	.lineNameInput {
		text-align: center;
	}
	.lineDisplay {
		align-items: center;
		display: flex;
		flex-direction: row;
		justify-content: center;
		padding: 10px;
	}
	.frontline, .backline {
		align-items: center;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}
	.lineButton {
		margin: 5px;
	}
	.heroButton {
		background: transparent;
		border: none;
		cursor: pointer;
		position: relative;
	}
	.heroButton img {
		border-radius: 50%;
		max-width: 60px;
	}
	.imgContainer {
		height: fit-content;
		position: relative;
		width: fit-content;
	}
	.coreMark {
		background-color: var(--appDelColor);
		border-radius: 50%;
		bottom: 0px;
		display: none;
		height: 20px;
		position: absolute;
		right: -4px;
		visibility: hidden;
		width: 20px;
	}
	.coreMark.visible {
		display: inline-block;
		pointer-events: none;
		visibility: visible;
	}
	.removeHeroButton {
		background-color: #aaa;
		border: none;
		border-radius: 50%;
		cursor: pointer;
		outline: none;
		position: absolute;
		right: 0;
		top: 0;
	}
	.removeHeroButton.lineHeroButton {
		right: -6px;
	}
	.heroButton+p {
		color: black;
		font-size: 0.8rem;
		font-weight: bold;
		margin: 0;
		text-align: center;
	}
	.subLine p {
		color: black;
	}
	.lineDisplay p {
		margin-bottom: 5px;
	}
	#descInput {
		max-height: 250px;
		min-height: 50px;
		width: 100%;
	}
	.subGroup {
		margin-bottom: 10px;
	}
	.subTitle {
		border-bottom: 2px solid black;
		display: flex;
		flex-direction: row;
		margin-bottom: 5px;
		padding: 5px;
	}
	.subTitle .removeButton {
		align-items: center;
		background-color: #aaa;
		border: none;
		border-radius: 50%;
		cursor: pointer;
		display: flex;
		font-size: 1rem;
		height: 25px;
		justify-content: center;
		margin-left: 5px;
		width: 25px;
	}
	.subLine {
		display: flex;
		flex-wrap: wrap;
		max-width: 100%;
	}
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
		margin-left: 5px;
		width: 60px;
	}
	.newSubArea {
		align-items: center;
		display: flex;
		justify-content: center;
	}
	.subAddButton {
		background-color: var(--appColorPrimary);
		border: 2px solid var(--appColorPrimary);
		border-radius: 10px;
		color: white;
		cursor: pointer;
		height: fit-content;
		padding: 5px;
		width: fit-content;
	}
	.footer {
		display: flex;
		justify-content: flex-end;
		margin-top: 15px;
	}
	.footerButton {
		background-color: transparent;
		border: 3px solid var(--appColorPrimary);
		border-radius: 10px;
		color: var(--appColorPrimary);
		cursor: pointer;
		font-size: 1.05rem;
		margin-right: 10px;
	}
	.cancelButton {
		margin-right: 0;
	}
	@media only screen and (min-width: 767px) {
		.row1 {
			display: flex;
			flex-direction: row;
		}
		.lineEditor {
			flex-grow: 0;
			flex-shrink: 0;
			margin-right: 10px;
			width: 340px;
		}
		.lineEditHead {
			justify-content: flex-start;
		}
		.lineEditBody {
			border-radius: 0px 10px 10px 10px;
		}
		.descEditor {
			width: 100%;
		}
		#descInput {
			max-height: 337px;
		}
		.subContainer {
			display: grid;
			grid-gap: 5px 20px;
			grid-template-columns: repeat(auto-fit, minmax(310px, 1fr));
			grid-template-rows: repeat(auto-fit, minmax(95px, 1fr));
			justify-content: space-evenly;
			overflow: hidden;
			padding: 0;
		}
		.footerButton:hover {
			background-color: var(--appColorPrimary);
			color: white;
		}
		.cancelButton:hover {
			background-color: var(--appColorPriAccent);
			color: white;
		}
	}
</style>
