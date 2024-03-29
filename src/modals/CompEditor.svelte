<script>
	import { onMount, onDestroy, tick, getContext } from 'svelte';
	import { v4 as uuidv4 } from 'uuid';
	import Editor from '@toast-ui/editor';
	import '@toast-ui/editor/dist/toastui-editor.css';
	import '@toast-ui/editor/dist/theme/toastui-editor-dark.css';
	import AppData from '../stores/AppData.js';
	import HeroData from '../stores/HeroData.js';
	import HeroFinder from './HeroFinder.svelte';
	import ImportLine from './ImportLine.svelte';
	import BeastEditor from './BeastEditor.svelte';
	import CompLineEditor from '../components/CompLineEditor.svelte';
	import SimpleSortableList from '../shared/SimpleSortableList.svelte';
	import XButton from '../shared/XButton.svelte';
	import HeroButton from '../shared/HeroButton.svelte';
	import {validateJWT} from '../rest/RESTFunctions.svelte';

	export let compID = null; // uuid for comp to be edited
	export let onSuccess = () => {}; // save success callback
	export let isMobile = false;

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
		tags: [],
		hidden: false,
		source: 'local',
	}
	let openLine = null;
	let statusMessage = '';
	let showStatusMessage = false;
	let statusError = false;
	let heroFinderOpen = false;
	let importLineOpen = false;
	let beastEditorOpen = false;
	let hfConfig = {};
	let ilConfig = {};
	let beastConfig = {};
	let newTagText = '';
	let addTagOpen = false;
	let openSuggestions = false;
	let autosave;
	let editor; // ToastUI editor
	let tagInputEl;
	const tagValidation = new RegExp('^[A-Za-z0-9-_.~]*$');

	$: tagSuggestions = makeTagSuggestions();
	$: isValidTag = newTagText !== '' && tagValidation.test(newTagText);
	$: validLogin = $AppData.user.jwt && validateJWT($AppData.user.jwt);

	onMount(async () => {
		const queryString = window.location.search;
		const urlParams = new URLSearchParams(queryString);
		if(urlParams.has('comp')) {
			history.pushState({view: $AppData.activeView, modal: true, comp: true}, "Comp Editor", `?comp=true&modal=true${window.location.hash}`);
		} else {
			history.pushState({view: $AppData.activeView, modal: true, comp: false}, "Comp Editor", `?modal=true${window.location.hash}`);
		}
		if(compID) {
			const compCopy = $AppData.Comps.find(e => e.uuid === compID);
			if(typeof compCopy === 'undefined') throw new Error(`Invalid CompID given to CompEditor: ${compID}.`);
			comp = JSON.parse(JSON.stringify(compCopy));
			comp.lastUpdate = new Date(comp.lastUpdate);
		}
		if(validLogin) comp.author = $AppData.user.username;
		autosave = setTimeout(() => {
			if(comp.draft) saveDraft();
		}, 30000);
		await tick();
		if($AppData.colorProfile === 'light') {
			editor = new Editor({
				el: document.querySelector('#tuieditor'),
				events: {
					change: handleContentChange,
				},
				height: '346.5px',
				initialValue: comp.desc,
				initialEditType: 'wysiwyg',
				language: 'en_US',
				placeholder: 'Description',
				toolbarItems: [
					['heading', 'bold', 'italic', 'strike'],
					['hr', 'quote'],
					['ul', 'ol'],
					['table', 'image', 'link'],
					['code', 'codeblock'],
				],
				usageStatistics: false,
				useDefaultHTMLSanitizer: true,
			});
		} else {
			editor = new Editor({
				el: document.querySelector('#tuieditor'),
				theme: 'dark',
				events: {
					change: handleContentChange,
				},
				height: '346.5px',
				initialValue: comp.desc,
				initialEditType: 'wysiwyg',
				language: 'en_US',
				placeholder: 'Description',
				toolbarItems: [
					['heading', 'bold', 'italic', 'strike'],
					['hr', 'quote'],
					['ul', 'ol'],
					['table', 'image', 'link'],
					['code', 'codeblock'],
				],
				usageStatistics: false,
				useDefaultHTMLSanitizer: true,
			});
		}
		setTimeout(() => editor.blur(), 5);
	});

	onDestroy(async () => {
		clearTimeout(autosave);
	});

	function makeTagSuggestions() {
		let suggestions = [];
		// start suggestions off as an array of all tags in all comps
		for(const comp of $AppData.Comps.filter(e => !e.hidden)) {
			for(const tag of comp.tags) {
				if(suggestions.find(e => e.name === tag)) {
					// tag already counted
					suggestions.find(e => e.name === tag).count++;
				} else {
					// tag not yet counted
					suggestions.push({name: tag, count: 1});
				}
			}
		}
		// filter suggestions to just strings that match what's already been typed
		suggestions = suggestions.filter(e => e.name.toLowerCase().includes(newTagText.toLowerCase()));
		// sort suggestions by frequency
		suggestions = suggestions.sort((a, b) => b.count - a.count);
		// take only the first 10 suggestions
		suggestions = suggestions.slice(0, 10);

		// finally make suggestions into an array of strings
		return suggestions.map(e => e.name);
	}

	function deleteLine(lineIdx) {
		let lineHeroes = comp.lines[lineIdx].heroes;
		comp.lines[lineIdx].heroes = ['unknown', 'unknown', 'unknown', 'unknown', 'unknown'];
		for(let hero of lineHeroes) {
			if(hero !== 'unknown') removeHeroesReference(hero);
		}
		comp.lines = comp.lines.filter((e, i) => i !== lineIdx);
		if(openLine === lineIdx) {
			openLine = null;
		} else if(openLine > lineIdx ) {
			openLine--;
		}
	}

	function deleteSub(subIdx) {
		let subHeroes = comp.subs[subIdx].heroes;
		comp.subs[subIdx].heroes = [];
		for(let hero of subHeroes) {
			removeHeroesReference(hero);
		}
		comp.subs = comp.subs.filter((e, i) => i !== subIdx);
	}

	function addLine() {
		comp.lines = [...comp.lines, {
			name: "New Line",
			heroes: ['unknown', 'unknown', 'unknown', 'unknown', 'unknown'],
			type: 'player',
			beasts: { primary: [], secondary: [], situational: [] },
		}];
		openLine = comp.lines.length - 1;
	}

	function addSub() {
		comp.subs = [...comp.subs, {
			name: "New Sub Group",
			heroes: [],
		}];
	}

	function handleContentChange() {
		if(editor) comp.desc = editor.getMarkdown();
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
			onSuccess(comp.uuid);
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
			onSuccess(comp.uuid);
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
		clearTimeout(autosave); // turn off autosaving while HeroFinder is open
		heroFinderOpen = true;
	}

	function closeHeroFinder() {
		heroFinderOpen = false;
		// save and resume autosaving now that HeroFinder is closed
		if(comp.draft) saveDraft();
		hfConfig = {};
	}

	function handleImportLineClick(config) {
		ilConfig = config;
		clearTimeout(autosave); // turn off autosaving while ImportLine is open
		importLineOpen = true;
	}

	function handleImportLine({srcUUID, srcLine, destLine}) {
		if(srcUUID !== comp.uuid || srcLine !== destLine) {
			const srcComp = $AppData.Comps.find(e => e.uuid === srcUUID);
			const srcHeroes = srcComp.lines[srcLine].heroes;
			// remove any heroes who already exist in the line
			let heroID;
			for(let i = 0; i < comp.lines[destLine].heroes.length; i++) {
				if(comp.lines[destLine].heroes[i] !== 'unknown') {
					heroID = comp.lines[destLine].heroes[i];
					comp.lines[destLine].heroes[i] = 'unknown';
					removeHeroesReference(heroID);
				}
			}
			// import all hero details from source
			for(const hero of srcHeroes) {
				if($HeroData.some(e => e.id === hero)) comp.heroes[hero] = srcComp.heroes[hero];
			}
			// replace the line with the one from source
			comp.lines[destLine] = srcComp.lines[srcLine];
		}
		// do nothing if user requested to import the same line into itself
	}

	function closeImportLine() {
		importLineOpen = false;
		// save and resume autosaving now that ImportLine is closed
		if(comp.draft) saveDraft();
		ilConfig = {};
	}

	function handleBeastDetailClick(config) {
		beastConfig = config;
		clearTimeout(autosave); // turn off autosaving while ImportLine is open
		beastEditorOpen = true;
	}

	function handleBeastChange({lineIdx, beasts}) {
		comp.lines[lineIdx].beasts = beasts;
		closeBeastEditor();
	}

	function closeBeastEditor() {
		beastEditorOpen = false;
		// save and resume autosaving now that HeroFinder is closed
		if(comp.draft) saveDraft();
		beastConfig = {};
	}

	function updateLineHero(idx, pos, hero, oldHeroID) {
		// need to reverse the list to update the right hero due to how the list is displayed
		let rHeroes = [...comp.lines[idx].heroes].reverse();
		rHeroes[pos] = hero.id;
		comp.heroes[hero.id] = {
			ascendLv: hero.ascendLv,
			si: hero.si,
			furn: hero.furn,
			stars: hero.stars,
			engraving: hero.engraving,
			artifacts: hero.artifacts,
			core: hero.core,
			notes: hero.notes,
		}
		// reverse it back for storage
		comp.lines[idx].heroes = rHeroes.reverse();
		// check if the last reference to the old hero was replaced, and remove it if necessary
		if(oldHeroID !== '' && oldHeroID !== hero.id) removeHeroesReference(oldHeroID);
	}

	function updateSubHero(idx, pos, hero, oldHeroID) {
		comp.subs[idx].heroes[pos] = hero.id;
		comp.heroes[hero.id] = {
			ascendLv: hero.ascendLv,
			si: hero.si,
			furn: hero.furn,
			stars: hero.stars,
			engraving: hero.engraving,
			artifacts: hero.artifacts,
			core: hero.core,
			notes: hero.notes,
		}
		// check if the last reference to the old hero was replaced, and remove it if necessary
		if(oldHeroID !== '' && oldHeroID !== hero.id) removeHeroesReference(oldHeroID);
	}

	function removeSubHero(subIdx, heroIdx) {
		const heroID = comp.subs[subIdx].heroes[heroIdx];
		comp.subs[subIdx].heroes = comp.subs[subIdx].heroes.filter((e, i) => i !== heroIdx);
		removeHeroesReference(heroID);
	}

	function removeLineHero(lineIdx, heroIdx) {
		// need to reverse the list to remove the right hero due to how the list is displayed
		let rHeroes = [...comp.lines[lineIdx].heroes].reverse();
		const heroID = rHeroes[heroIdx];
		rHeroes[heroIdx] = 'unknown';
		// reverse it back for storage
		comp.lines[lineIdx].heroes = rHeroes.reverse();
		removeHeroesReference(heroID);
	}

	// function checks all subs and lines for reference to heroID and
	// removes them from comp.heroes if no references are present
	function removeHeroesReference(heroID) {
		for(const sub of comp.subs) {
			// reference found in a sub line, abort removal
			if(sub.heroes.includes(heroID)) return 0;
		}
		for(const line of comp.lines) {
			// reference found in an example line, abort removal
			if(line.heroes.includes(heroID)) return 0;
		}
		// no references found in any example or sub lines, OK to delete
		delete comp.heroes[heroID];
	}

	function handlePopState() {
		close();
	}

	function handleAddTag() {
		const valid = newTagText !== '' && tagValidation.test(newTagText);
		if(valid) {
			comp.tags = [...comp.tags, newTagText];
		}
		newTagText = '';
		openSuggestions = false;
		addTagOpen = false;
	}
	
	function removeTag(index) {
		comp.tags = comp.tags.filter((e, i) => i !== index);
	}

	function handleTagKeyUp(event) {
		if(event.code === 'Enter') {
			handleAddTag();
			return 0;
		} else {
			tagSuggestions = makeTagSuggestions();
		}
	}

	function takeTagSuggestion(suggestion) {
		newTagText = suggestion;
		tagInputEl.blur();
	}

	function handleLineSort(event) {
		const newList = event.detail.newList;
		const from = parseInt(event.detail.from);
		const to = parseInt(event.detail.to);
		comp.lines = newList;
		if(openLine !== null) {
			if(openLine === from) {
				openLine = to;
			} else if(openLine === to) {
				openLine = from;
			}
		}
	}

	function handleLineDisplaySort(event) {
		const newList = event.detail.newList.reverse();
		comp.lines[openLine].heroes = newList;
	}

	function validateSubLine(list) {
		// catch if a user dragged something we weren't expecting and exit
		if(!Array.isArray(list)) return false;
		for(const item of list) {
			// don't allow overwrite if hero isn't in HeroData
			if(!$HeroData.some(e => e.id === item)) return false;
		}
		return true;
	}

	function handleSubSort(event) {
		const newList = event.detail.newList;
		const group = event.detail.groupID;
		const subIdx = parseInt(group.slice(8, group.length));
		comp.subs[subIdx].heroes = newList;
	}

	async function handleLineEvent(event) {
		let config;
		switch(event.detail.action) {
			case 'addLine':
				addLine();
				break;
			case 'deleteLine':
				deleteLine(event.detail.data);
				break;
			case 'lineDisplaySort':
				handleLineDisplaySort(event.detail.data);
				break;
			case 'addHero':
				config = event.detail.data;
				config.onSuccess = updateLineHero;
				config.close = closeHeroFinder;
				openHeroFinder(config);
				break;
			case 'deleteHero':
				removeLineHero(event.detail.data.lineIdx, event.detail.data.heroIdx);
				break;
			case 'lineSort':
				handleLineSort(event.detail.data);
				break;
			case 'importLine':
				config = event.detail.data;
				config.onSuccess = handleImportLine;
				config.close = closeImportLine;
				handleImportLineClick(config);
				break;
			case 'beastDetail':
				config = event.detail.data;
				config.onSuccess = handleBeastChange;
				config.close = closeBeastEditor;
				config.line = comp.lines[event.detail.data.lineIdx];
				handleBeastDetailClick(config);
				break;
			default:
				throw new Error(`Invalid action specified on compLineEvent: ${action}`);
		}
	}

	async function handleHeroButtonEvent(event, config) {
		switch(event.detail.action) {
			case 'heroClick':
				openHeroFinder(config);
				break;
			default:
				throw new Error(`Invalid action specified on heroButtonEvent: ${action}`);
		}
	}
</script>

<svelte:window on:popstate={handlePopState} />

<div class="editorContainer">
	<section class="sect1">
		<div class="editorHead">
			<input class="titleInput" type="text" bind:value={comp.name} placeholder="Title" maxlength="50" class:invalid={comp.name.length >= 50 || comp.name.length <= 0}>
			<input disabled={validLogin} class="authorInput" type="text" bind:value={comp.author} placeholder="Author" maxlength="50" class:invalid={comp.author.length >= 50 || comp.author.length <= 0}>
			{#if comp.draft}
				<div class="draftContainer"><span class="draftLabel">draft</span></div>
			{/if}
			<div class="tagsArea">
				<h5>Tags</h5>
				<div class="tagDisplay">
					{#each comp.tags as tag, i}
						<button type="button" class="rmTagButton" on:click={() => removeTag(i)}>
							<span class="tagText">{tag}</span>
						</button>
					{/each}
					{#if !addTagOpen}
						<button
							type="button"
							class="addTagButton"
							class:noMargin={comp.tags.length === 0}
							disabled={comp.tags.length >= $AppData.maxCompTags}
							on:click={async () => {
								addTagOpen = true;
								await tick();
								document.querySelector('#newTagInput').focus();
							}}>
							<span>+</span>
						</button>
					{:else}
						<div class="newTagInputArea">
							<input
								id="newTagInput"
								class="tagInput"
								class:noMargin={comp.tags.length === 0}
								class:invalid={!isValidTag}
								type="text"
								bind:value={newTagText}
								bind:this={tagInputEl}
								on:focus={() => {tagSuggestions = makeTagSuggestions(); openSuggestions = true; }}
								on:blur={handleAddTag}
								on:keyup={(e) => handleTagKeyUp(e)}
								maxlength="20">
							<div class="suggestions" class:open={openSuggestions}>
								{#each tagSuggestions as suggestion}
									<button type="button" class="suggestionButton" on:mousedown={() => takeTagSuggestion(suggestion)}><span>{suggestion}</span></button>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
		<div class="row1">
			<div class="lineEditArea">
				<CompLineEditor
					lines={comp.lines}
					compHeroes={comp.heroes}
					bind:selectedLine={openLine}
					editMode
					on:compLineEvent={handleLineEvent}
				/>
			</div>
			<div class="descEditor">
				<h4>Description</h4>
				<div id="tuieditor"></div>
				<div class="editorLimit" class:maxed={comp.desc.length >= $AppData.maxDescLen}><span>{comp.desc.length}/{$AppData.maxDescLen}</span></div>
			</div>
		</div>
		<div class="row2">
			<div class="subEditor">
				<h4>Substitutes</h4>
				<div class="subContainer">
					{#each comp.subs as sub, i}
						<div class="subGroup">
							<div class="subTitle">
								<input class="subTitleInput" type="text" bind:value={sub.name} placeholder="Subgroup Name" maxlength="50" class:invalid={sub.name.length <= 0 || sub.name.length >= 50}>
								<div class="removeButtonContainer">
									<button type="button" class="deleteSubButton" on:click|stopPropagation={() => deleteSub(i)}>
										<img class="deleteSubImage" src="./img/utility/trashcan_white.png" alt="Delete Sub">
									</button>
								</div>
							</div>
							<div class="subLine">
								<SimpleSortableList
									list={sub.heroes}
									groupID="subLine-{i}"
									validate={validateSubLine}
									on:sort={handleSubSort}
									let:item={hero}
									let:i={j}>
									<div class="subGroupMember">
										<HeroButton 
											hero={hero}
											heroDetails={comp.heroes[hero]}
											on:heroButtonEvent={(event) => handleHeroButtonEvent(event, {idx: i, pos: j, onSuccess: updateSubHero, close: closeHeroFinder, oldHeroData: comp.heroes[hero], oldHeroID: hero, compHeroData: comp.heroes,})}
										/>
										<div class="removeHeroContainer">
											<XButton clickCallback={() => removeSubHero(i, j)} size="medium" hoverable />
										</div>
									</div>
								</SimpleSortableList>
								<button type="button" class="addHeroButton" on:click={() => openHeroFinder({idx: i, pos: sub.heroes.length, onSuccess: updateSubHero, close: closeHeroFinder, compHeroData: comp.heroes, })}>+</button>
							</div>
						</div>
					{/each}
					<div class="newSubArea">
						<button type="button" class="subAddButton" on:click={addSub}>Add Substitute Line</button>
					</div>
				</div>
			</div>
		</div>
		<div class="footer">
			<button type="button" class="footerButton draftButton" on:click={saveDraft}>Save Draft</button>
			<button type="button" class="footerButton saveButton" on:click={() => { comp.draft = false; saveEdit(); }}>Save</button>
			<button type="button" class="footerButton cancelButton" on:click={cancelEdit}>Cancel</button>
		</div>
	</section>
	<section class="sect2" class:visible={heroFinderOpen}>
		{#if heroFinderOpen}
			<HeroFinder config={hfConfig} isMobile={isMobile} />
		{/if}
	</section>
	<section class="sect3" class:visible={importLineOpen}>
		{#if importLineOpen}
			<ImportLine config={ilConfig} />
		{/if}
	</section>
	<section class="sect4" class:visible={beastEditorOpen}>
		{#if beastEditorOpen}
			<BeastEditor config={beastConfig} />
		{/if}
	</section>
	<section class="sect5">
		<div class="statusMessage" class:visible={showStatusMessage} class:error={statusError}>{statusMessage}</div>
	</section>
</div>

<style lang="scss">
	.editorContainer {
		color: var(--appColorBlack);
		padding: 10px;
	}
	.sect2 {
		display: none;
		visibility: hidden;
		&.visible {
			display: block;
			height: 100%;
			left: 0;
			position: fixed;
			top: 0;
			visibility: visible;
			width: 100%;
			z-index: 4;
		}
	}
	.sect3 {
		display: none;
		visibility: hidden;
		&.visible {
			display: block;
			height: 100%;
			left: 0;
			position: fixed;
			top: 0;
			visibility: visible;
			width: 100%;
			z-index: 4;
		}
	}
	.sect4 {
		display: none;
		visibility: hidden;
		&.visible {
			display: block;
			height: 100%;
			left: 0;
			position: fixed;
			top: 0;
			visibility: visible;
			width: 100%;
			z-index: 4;
		}
	}
	.sect5 {
		left: 50%;
		position: fixed;
		top: 80px;
		transform: translate(-50%, 0);
		width: fit-content;
		z-index: 5;
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
		&.visible {
			display: block;
			opacity: 1;
			visibility: visible;
		}
		&.error {
			background-color: var(--appDelColorOpaque);
		}
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
	.editorHead {
		align-items: center;
		border-bottom: 1px solid black;
		display: flex;
		flex-direction: column;
		.titleInput {
			background-color: var(--appBGColor);
			border: none;
			border-radius: 5px;
			box-shadow: var(--neu-sm-i-BGColor-shadow);
			color: var(--appColorBlack);
			font-size: 1.5rem;
			margin-bottom: 15px;
			outline: none;
			text-align: center;
			width: 80%;
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
		.authorInput {
			background-color: var(--appBGColor);
			border: none;
			border-radius: 5px;
			box-shadow: var(--neu-sm-i-BGColor-shadow);
			color: var(--appColorBlack);
			margin-bottom: 10px;
			outline: none;
			text-align: center;
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
			&:disabled {
				color: var(--appColorDisabled);
			}
		}
		.tagsArea {
			width: 100%;
			display: flex;
			flex-direction: column;
			h5 {
				margin: 0px;
				margin-bottom: 10px;
				text-align: center;
			}
			.tagDisplay {
				align-items: center;
				display: flex;
				flex-direction: row;
				flex-wrap: wrap;
				justify-content: center;
				margin-bottom: 10px;
				width: 100%;
				.rmTagButton {
					background-color: var(--appBGColor);
					border: none;
					border-radius: 15px;
					box-shadow: var(--neu-sm-ni-BGColor-shadow);
					color: var(--appColorBlack);
					cursor: pointer;
					display: inline-block;
					font-size: 0.8rem;
					margin: 0px 8px;
					margin-bottom: 10px;
					outline: none;
					padding: 2px 8px;
					text-align: center;
					.tagText {
						border: none;
						border-radius: 15px;
						display: inline-block;
						user-select: none;
					}
					&:before {
						background-color: var(--appDelColor);
						border-radius: 50%;
						color: var(--appBGColor);
						content: '—';
						font-weight: bold;
						font-size: 0.6rem;
						margin-right: 5px;
						text-align: center;
					}
				}
				.addTagButton {
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
					margin-bottom: 7px;
					margin-left: 10px;
					padding: 0;
					user-select: none;
					-webkit-appearance: none;
					width: 23px;
					&:disabled {
						color: #BEBEBE;
						cursor: default;
					}
					&.noMargin {
						margin: 0;
					}
				}
				.newTagInputArea {
					position: relative;
					.tagInput {
						background-color: var(--appBGColor);
						border: none;
						border-radius: 5px;
						box-shadow: var(--neu-sm-i-BGColor-shadow);
						color: var(--appColorBlack);
						margin-left: 10px;
						margin-bottom: 7px;
						outline: none;
						text-align: center;
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
						&.noMargin {
							margin: 0;
						}
					}
					.suggestions {
						background-color: var(--appBGColor);
						border: none;
						border-radius: 0px 0px 10px 10px;
						box-shadow: var(--neu-sm-i-BGColor-shadow);
						display: flex;
						flex-direction: column;
						left: 22.5px;
						opacity: 0;
						position: absolute;
						top: 26px;
						transition: all 0.2s;
						visibility: hidden;
						width: 80%;
						z-index: 5;
						&.open {
							visibility: visible;
							opacity: 1;
						}
						.suggestionButton {
							background: transparent;
							border: none;
							color: var(--appBlack);
							cursor: pointer;
							font-size: 1rem;
							outline: none;
							overflow: hidden;
							text-overflow: ellipsis;
							white-space: nowrap;
							&:last-child {
								border-bottom: 0;
								border-radius: 0px 0px 10px 10px;
							}
						}
					}
				}
			}
		}
	}
	.row1 {
		.lineEditArea {
			padding: 10px 0px;
		}
	}
	.subLine {
		display: flex;
		flex-wrap: wrap;
		max-width: 100%;
	}
	.editorLimit {
		display: flex;
		justify-content: flex-end;
		font-size: 0.8rem;
	}
	.editorLimit.maxed {
		color: var(--appDelColor);
		font-weight: bold;
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
		padding-bottom: 10px;
		.subTitleInput {
			background-color: var(--appBGColor);
			border: none;
			border-radius: 5px;
			box-shadow: var(--neu-sm-i-BGColor-shadow);
			color: var(--appColorBlack);
			font-weight: bold;
			outline: none;
			padding: 3px;
			text-align: center;
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
		.removeButtonContainer {
			margin-left: 10px;
			.deleteSubButton {
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
				.deleteSubImage {
					max-width: 12px;
				}
			}
		}
	}
	.subGroupMember {
		align-items: center;
		display: flex;
		flex-direction: column;
		margin: 10px;
		position: relative;
		.removeHeroContainer {
			position: absolute;
			right: -7px;
			top: -10px;
		}
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
		margin: 10px;
		margin-top: 20px;
		width: 60px;
	}
	.newSubArea {
		align-items: center;
		display: flex;
		justify-content: center;
		.subAddButton {
			background-color: var(--appBGColor);
			border: none;
			border-radius: 10px;
			box-shadow: var(--neu-sm-i-BGColor-shadow);
			color: var(--appColorPrimary);
			cursor: pointer;
			font-weight: bold;
			height: fit-content;
			padding: 5px;
			width: fit-content;
		}
	}
	.footer {
		display: flex;
		justify-content: flex-end;
		margin-top: 15px;
	}
	.footerButton {
		background-color: var(--appBGColor);
		border: none;
		border-radius: 10px;
		box-shadow: var(--neu-sm-i-BGColor-shadow);
		color: var(--appColorPrimary);
		cursor: pointer;
		font-size: 1.05rem;
		font-weight: bold;
		margin-right: 10px;
		outline: none;
		padding: 5px;
	}
	.cancelButton {
		margin-right: 0;
		color: var(--appColorBlack);
	}
	@media only screen and (min-width: 767px) {
		.editorHead {
			.tagsArea {
				.tagDisplay {
					.addTagButton {
						&:hover {
							background: var(--neu-convex-BGColor-bg);
						}
						&:disabled {
							&:hover {
								background: var(--appBGColor);
							}
						}
					}
					.newTagInputArea {
						.suggestions {
							.suggestionButton {
								&:hover {
									background-color: var(--appBGColorDark);
								}
							}
						}
					}
				}
			}
		}
		.row1 {
			display: flex;
			flex-direction: row;
		}
		.descEditor {
			width: 100%;
		}
		.subContainer {
			display: grid;
			grid-gap: 5px 20px;
			grid-template-columns: repeat(auto-fit, minmax(310px, 1fr));
			grid-template-rows: repeat(auto-fit, minmax(95px, 1fr));
			justify-content: space-evenly;
			padding: 0;
		}
		.footerButton {
			&:hover {
				background: var(--neu-convex-BGColor-wide-bg);
			}
		}
	}
	/* toastui editor styling */
	:global(.toastui-editor-ww-container) {
		z-index: 4 !important;
	}
	:global(.toastui-editor-md-container) {
		z-index: 4 !important;
	}
	:global(.toastui-editor-dropdown-toolbar) {
		flex-wrap: wrap !important;
		height: auto !important;
	}
	:global(.toastui-editor-contents) {
		padding: 10px !important;
		z-index: 4 !important;
		:global(hr) {
			border: 1px solid var(--appColorPrimary) !important;
			margin: 5px 0px !important;
		}
		:global(p) {
			margin: 0 !important;
		}
		:global(a) {
			color: var(--appColorPrimary) !important;
		}
		:global(ul) {
			margin: 10px 0px !important;
			list-style-type: disc !important;
		}
		:global(ul ul) {
			list-style-type: circle !important;
		}
		:global(ul ul ul) {
			list-style-type: square !important;
		}
		:global(ul > li::marker) {
			color: var(--appColorBlack) !important;
			font-size: 1.0rem !important;
		}
		:global(ul > li::before) {
			display: none !important;
		}
		:global(ol) {
			margin: 10px 0px !important;
		}
		:global(ol > li::before) {
			color: var(--appColorBlack) !important;
		}
		:global(h1), :global(h2), :global(h3) {
			margin: 10px 0px !important;
		}
		:global(h4), :global(h5), :global(h6) {
			margin: 5px 0px !important;
		}
		:global(h1) {
			border: 0 !important;
			font-size: 1.6rem !important;
		}
		:global(h2) {
			border: 0 !important;
		}
		:global(blockquote) {
			border-left: 5px solid var(--appColorPriOpaque) !important;
			margin-left: 20px !important;
			padding-left: 5px !important;
			:global(p) {
				color: var(--appColorBlack) !important;
			}
		}
		:global(pre) {
			background-color: var(--appBGColorDark) !important;
		}
		:global(code) {
			background-color: var(--appBGColorDark) !important;
			color: var(--appColorBlack) !important;
		}
		:global(table) {
			border: 0 !important;
			border-collapse: collapse !important;
		}
		:global(th) {
			background-color: transparent !important;
			border: 0 !important;
			border-bottom: 2px solid var(--appColorPrimary) !important;
			font-weight: bold !important;
			padding: 0 !important;
			padding-right: 20px !important;
			text-align: left !important;
			:global(p) {
				color: var(--appColorBlack) !important;
				padding: 0 !important;
			}
		}
		:global(td) {
			border: 0 !important;
			border-bottom: 1px solid var(--appColorBlack) !important;
			padding: 0 !important;
		}
		:global(tr) {
			&:nth-child(even) {
				background-color: var(--appColorPriOpaque) !important;
			}
		}
		:global(img) {
			max-width: 100px !important;
		}
	}
</style>
