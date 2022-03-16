<script>
	import { onMount, onDestroy, tick, getContext } from 'svelte';
	import { v4 as uuidv4 } from 'uuid';
	import Editor from '@toast-ui/editor';
	import '@toast-ui/editor/dist/toastui-editor.css';
	import AppData from '../stores/AppData.js';
	import HeroData from '../stores/HeroData.js';
	import HeroFinder from '../shared/HeroFinder.svelte';
	import ImportLine from '../shared/ImportLine.svelte';
	import SimpleSortableList from '../shared/SimpleSortableList.svelte';
	import XButton from '../shared/XButton.svelte';
	import {validateJWT} from '../rest/RESTFunctions.svelte';

	export let compID = null; // uuid for comp to be edited
	export let onSuccess = () => {}; // save success callback
	export let isMobile = false;

	const { close } = getContext('simple-modal');

	$: tagSuggestions = makeTagSuggestions();
	$: isValidTag = newTagText !== '' && tagValidation.test(newTagText);
	$: validLogin = $AppData.user.jwt && validateJWT($AppData.user.jwt);

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
	}
	let openLine = null;
	let statusMessage = '';
	let showStatusMessage = false;
	let statusError = false;
	let heroFinderOpen = false;
	let importLineOpen = false;
	let hfConfig = {};
	let ilConfig = {};
	let newTagText = '';
	let addTagOpen = false;
	let openSuggestions = false;
	let autosave;
	let editor; // ToastUI editor
	const tagValidation = new RegExp('^[A-Za-z0-9-_.~]*$');
	const heroLookup = makeHeroLookup();

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
		setTimeout(() => editor.blur(), 5);
	});

	onDestroy(async () => {
		clearTimeout(autosave);
	});

	function makeTagSuggestions() {
		let suggestions = [];
		// start suggestions off as an array of all tags in all comps
		for(const comp of $AppData.Comps) {
			for(const tag of comp.tags) {
				suggestions.push(tag);
			}
		}
		// remove duplicate tags
		suggestions = [...new Set(suggestions)];
		// filter suggestions to just strings that match what's already been typed
		suggestions = suggestions.filter(e => e.toLowerCase().includes(newTagText));
		// take only the first 10 suggestions
		suggestions = suggestions.slice(0, 10);
		// finally, sort suggestions before returning
		suggestions.sort();

		return suggestions;
	}

	function makeHeroLookup() {
		let lookup = {}
		for(const hero of $HeroData) {
			lookup[hero.id] = {
				portrait: hero.portrait,
				name: hero.name
			};
		}
		return lookup;
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
		const srcComp = $AppData.Comps.find(e => e.uuid === srcUUID);
		const srcHeroes = srcComp.lines[srcLine].heroes;
		for(const hero of srcHeroes) {
			// import all hero details
			if($HeroData.some(e => e.id === hero)) comp.heroes[hero] = srcComp.heroes[hero];
		}
		comp.lines[destLine] = srcComp.lines[srcLine];
	}

	function closeImportLine() {
		importLineOpen = false;
		// save and resume autosaving now that ImportLine is closed
		if(comp.draft) saveDraft();
		ilConfig = {};
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
		if(isValidTag) {
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
		handleAddTag();
	}

	function validateLineEditHead(list) {
		// catch if a user dragged something we weren't expecting and exit
		if(!Array.isArray(list)) return false;
		// don't allow overwrite if there are missing lines
		if(list.length !== comp.lines.length) return false;
		for(const item of list) {
			// don't allow overwrite if list is not a list of objects
			if(Object.prototype.toString.call(item) !== '[object Object]') return false;
		}
		return true;
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
</script>

<svelte:window on:popstate={handlePopState} />

<div class="editorContainer">
	<section class="sect1">
		<div class="editorHead">
			<input class="titleInput" type="text" bind:value={comp.name} placeholder="Title" maxlength="50" class:maxed={comp.name.length >= 50}>
			<input disabled={validLogin} class="authorInput" type="text" bind:value={comp.author} placeholder="Author" maxlength="50" class:maxed={comp.author.length >= 50}>
			{#if comp.draft}
				<div class="draftContainer"><span class="draftLabel">draft</span></div>
			{/if}
			<div class="tagsArea">
				<h5>Tags</h5>
				<div class="tagDisplay">
					{#each comp.tags as tag, i}
						<div class="tag">
							<span class="tagText">{tag}</span>
							<div class="removeTagButtonContainer">
								<XButton clickCallback={() => removeTag(i)} size="small" hoverable={false} />
							</div>
						</div>
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
			<div class="lineEditor">
				<h4 class="lineEditorTitle">Lines</h4>
				<div class="lineEditHead">
					<SimpleSortableList
						list={comp.lines}
						groupID="lineEditHead"
						validate={validateLineEditHead}
						on:sort={handleLineSort}
						let:item={line}
						let:i={i}>
						<button type="button" class="linePickerOption" class:open={openLine === i} on:click={() => openLine = i}>
							<span>{line.name}</span>
							<div class="removeButtonContainer" class:open={openLine === i}>
								<XButton clickCallback={() => deleteLine(i)} size="small" hoverable={false} />
							</div>
						</button>
					</SimpleSortableList>
					<button type="button" class="linePickerOption addLineButton" on:click={addLine}>+</button>
				</div>
				<div class="lineEditBody">
					{#if openLine === null}
						<span class="noLine">Select a line to edit.</span>
					{:else}
						<div class="lineDisplayHead">
							<input type="text" class="lineNameInput" bind:value={comp.lines[openLine].name} placeholder="Line Name" maxlength="30" class:maxed={comp.lines[openLine].name.length >= 30}>
							<button type="button" class="importLineButton" on:click={() => handleImportLineClick({idx: openLine, onSuccess: handleImportLine, close: closeImportLine, })}>
								<img class="importLineImage" src="./img/utility/import_line_white.png" alt="Import Line">
							</button>
						</div>
						<div class="lineDisplay">
							<SimpleSortableList
								list={[...comp.lines[openLine].heroes].reverse()}
								groupID="lineDisplay"
								validate={validateLineDisplay}
								on:sort={handleLineDisplaySort}
								let:item={hero}
								let:i={i}>
								{#if hero === 'unknown'}
									<button type="button" class="addHeroButton lineButton" on:click={() => openHeroFinder({idx: openLine, pos: i, onSuccess: updateLineHero, close: closeHeroFinder, compHeroData: comp.heroes, })}>
										<span>+</span>
									</button>
								{:else}
									<button type="button" class="heroButton" on:click={() => openHeroFinder({idx: openLine, pos: i, onSuccess: updateLineHero, close: closeHeroFinder, oldHeroID: hero, compHeroData: comp.heroes, })}>
										<div class="imgContainer">
											<img draggable="false" src={heroLookup[hero].portrait} alt={heroLookup[hero].name}>
											<span class="coreMark" class:visible={comp.heroes[hero].core}></span>
											<div class="removeHeroButtonContainer">
												<XButton clickCallback={() => removeLineHero(openLine, i)} size="medium" hoverable={false} />
											</div>
											<div class="ascMark">
												{#if $HeroData.find(e => e.id === hero).tier === 'ascended'}
													{#if comp.heroes[hero].ascendLv >= 6}
														<img draggable="false" src="./img/markers/ascended.png" alt="ascended">
													{:else if comp.heroes[hero].ascendLv >= 4}
														<img draggable="false" src="./img/markers/mythic.png" alt="mythic">
													{:else if comp.heroes[hero].ascendLv >= 2}
														<img draggable="false" src="./img/markers/legendary.png" alt="legendary">
													{:else}
														<img draggable="false" src="./img/markers/elite.png" alt="elite">
													{/if}
												{:else}
													{#if comp.heroes[hero].ascendLv >= 4}
														<img draggable="false" src="./img/markers/legendary.png" alt="ascended">
													{:else if comp.heroes[hero].ascendLv >= 2}
														<img draggable="false" src="./img/markers/elite.png" alt="mythic">
													{:else}
														<img draggable="false" src="./img/markers/rare.png" alt="elite">
													{/if}
												{/if}
												{#if comp.heroes[hero].si >= 30}
													<img draggable="false" src="./img/markers/si30.png" alt="si30">
												{:else if comp.heroes[hero].si >= 20}
													<img draggable="false" src="./img/markers/si20.png" alt="si20">
												{:else if comp.heroes[hero].si >= 10}
													<img draggable="false" src="./img/markers/si10.png" alt="si10">
												{:else}
													<img draggable="false" src="./img/markers/si0.png" alt="si0">
												{/if}
												{#if comp.heroes[hero].furn >= 9}
													<img draggable="false" class:moveup={comp.heroes[hero].si < 10} src="./img/markers/9f.png" alt="9f">
												{:else if comp.heroes[hero].furn >= 3}
													<img draggable="false" class:moveup={comp.heroes[hero].si < 10} src="./img/markers/3f.png" alt="3f">
												{/if}
											</div>
										</div>
										<p>{heroLookup[hero].name}</p>
									</button>
								{/if}
							</SimpleSortableList>
						</div>
					{/if}
				</div>
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
								<input class="subTitleInput" type="text" bind:value={sub.name} placeholder="Subgroup Name" maxlength="50" class:maxed={sub.name.length >= 50}>
								<div class="removeButtonContainer">
									<XButton clickCallback={() => deleteSub(i)} size="large" hoverable={true} />
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
										<button type="button" class="heroButton" on:click={() => openHeroFinder({idx: i, pos: j, onSuccess: updateSubHero, close: closeHeroFinder, oldHeroData: comp.heroes[hero], oldHeroID: hero, compHeroData: comp.heroes, })}>
											<img
												draggable="false"
												src={$HeroData.some(e => e.id === hero) ? heroLookup[hero].portrait : './img/portraits/unavailable.png'}
												alt={$HeroData.some(e => e.id === hero) ? heroLookup[hero].name : 'Pick a Hero'}>
											<div class="removeHeroButtonContainer">
												<XButton clickCallback={() => removeSubHero(i, j)} size="medium" hoverable={false} />
											</div>
											<span class="coreMark" class:visible={comp.heroes[hero].core}></span>
											<div class="ascMark subAscMark">
												{#if $HeroData.find(e => e.id === hero).tier === 'ascended'}
													{#if comp.heroes[hero].ascendLv >= 6}
														<img draggable="false" src="./img/markers/ascended.png" alt="ascended">
													{:else if comp.heroes[hero].ascendLv >= 4}
														<img draggable="false" src="./img/markers/mythic.png" alt="mythic">
													{:else if comp.heroes[hero].ascendLv >= 2}
														<img draggable="false" src="./img/markers/legendary.png" alt="legendary">
													{:else}
														<img draggable="false" src="./img/markers/elite.png" alt="elite">
													{/if}
												{:else}
													{#if comp.heroes[hero].ascendLv >= 4}
														<img draggable="false" src="./img/markers/legendary.png" alt="ascended">
													{:else if comp.heroes[hero].ascendLv >= 2}
														<img draggable="false" src="./img/markers/elite.png" alt="mythic">
													{:else}
														<img draggable="false" src="./img/markers/rare.png" alt="elite">
													{/if}
												{/if}
												{#if comp.heroes[hero].si >= 30}
													<img draggable="false" src="./img/markers/si30.png" alt="si30">
												{:else if comp.heroes[hero].si >= 20}
													<img draggable="false" src="./img/markers/si20.png" alt="si20">
												{:else if comp.heroes[hero].si >= 10}
													<img draggable="false" src="./img/markers/si10.png" alt="si10">
												{:else}
													<img draggable="false" src="./img/markers/si0.png" alt="si0">
												{/if}
												{#if comp.heroes[hero].furn >= 9}
													<img draggable="false" class:moveup={comp.heroes[hero].si < 10} src="./img/markers/9f.png" alt="9f">
												{:else if comp.heroes[hero].furn >= 3}
													<img draggable="false" class:moveup={comp.heroes[hero].si < 10} src="./img/markers/3f.png" alt="3f">
												{/if}
											</div>
										</button>
										<p>{heroLookup[hero].name}</p>
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
	<section class="sect4">
		<div class="statusMessage" class:visible={showStatusMessage} class:error={statusError}>{statusMessage}</div>
	</section>
</div>

<style lang="scss">
	.editorContainer {
		padding: 10px;
	}
	input {
		border: 1px solid var(--appColorPrimary);
		border-radius: 5px;
		transition: box-shadow 0.1s;
		&:focus {
			border-color: var(--appColorPrimary);
			box-shadow: 0 0 0 2px var(--appColorPrimary);
			outline: 0;
		}
	}
	input.maxed {
		border-color: var(--appDelColor);
		outline: 0;
		box-shadow: 0 0 0 2px var(--appDelColor);
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
	}
	.statusMessage.visible {
		display: block;
		opacity: 1;
		visibility: visible;
	}
	.statusMessage.error {
		background-color: var(--appDelColorOpaque);
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
	.tagsArea {
		width: 100%;
		display: flex;
		flex-direction: column;
		h5 {
			margin: 5px 0px;
			text-align: center;
		}
	}
	.tagDisplay {
		align-items: center;
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: center;
		margin-bottom: 10px;
		width: 100%;
		.tag {
			position: relative;
			margin: 0px 5px;
			margin-bottom: 5px;
		}
		.tagText {
			border: 1px solid var(--appColorPrimary);
			border-radius: 15px;
			display: inline-block;
			background-color: var(--appColorPrimary);
			color: white;
			font-size: 0.8rem;
			padding: 0px 5px;
			padding-bottom: 4px;
			text-align: center;
			user-select: none;
		}
		.removeTagButtonContainer {
			position: absolute;
			right: -5px;
			top: 0;
		}
		.addTagButton {
			align-items: center;
			background-color: transparent;
			border: 3px solid var(--appColorPrimary);
			border-radius: 50%;
			color: var(--appColorPrimary);
			cursor: pointer;
			display: flex;
			font-size: 1rem;
			font-weight: bold;
			height: 20px;
			justify-content: center;
			margin-left: 10px;
			padding: 0;
			user-select: none;
			-webkit-appearance: none;
			width: 20px;
			&:disabled {
				border-color: #BEBEBE;
				color: #BEBEBE;
				cursor: default;
			}
		}
		.newTagInputArea {
			position: relative;
		}
		.tagInput {
			margin-left: 10px;
			&.invalid {
				border: 1px solid var(--appDelColor);
				outline: 2px solid var(--appDelColor);
			}
		}
		.addTagButton.noMargin, .tagInput.noMargin {
			margin: 0;
		}
		.suggestions {
			background-color: white;
			border: 1px solid var(--appColorPrimary);
			border-radius: 0px 0px 10px 10px;
			border-top: 0;
			box-shadow: 0 0 10px rgba(0, 0, 0, 0.25);
			display: flex;
			flex-direction: column;
			left: 22.5px;
			opacity: 0;
			position: absolute;
			top: 22px;
			transition: all 0.2s;
			visibility: hidden;
			width: 80%;
			z-index: 5;
			.suggestionButton {
				background: transparent;
				border: 0;
				border-bottom: 1px solid var(--appColorPrimary);
				color: var(--appColorPrimary);
				cursor: pointer;
				font-size: 1rem;
				outline: 0;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
				&:hover {
					color: white;
					background-color: var(--appColorPrimary);
				}
				&:last-child {
					border-bottom: 0;
					border-radius: 0px 0px 10px 10px;
				}
			}
		}
		.suggestions.open {
			visibility: visible;
			opacity: 1;
		}
	}
	.lineEditorTitle {
		margin-top: 0;
	}
	.editorHead {
		align-items: center;
		border-bottom: 1px solid black;
		display: flex;
		flex-direction: column;
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
		:global(div) {
			border: 0;
			margin: 0;
			padding: 0;
		}
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
		max-width: 100px;
		min-width: 40px;
		min-height: 26px;
		padding: 3px;
		span {
			display: inline-block;
			width: 100%;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
		.removeButtonContainer {
			margin-left: 3px;
		}
	}
	.linePickerOption.open {
		background-color: var(--appColorPrimary);
		color: white;
	}
	.addLineButton {
		min-width: 20px;
		padding: 3px;
		user-select: none;
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
		.lineDisplayHead {
			display: flex;
			justify-content: center;
			position: relative;
			width: 100%;
			.lineNameInput {
				text-align: center;
			}
			.importLineButton {
				align-items: center;
				background-color: var(--appColorPrimary);
				border: 2px solid var(--appColorPrimary);
				border-radius: 5px;
				cursor: pointer;
				display: flex;
				justify-content: center;
				margin-left: auto;
				outline: none;
				padding: 3px;
				position: absolute;
				right: 0px;
				.importLineImage {
					max-width: 15px;
				}
			}
		}
	}
	.noLine {
		color: rgba(100, 100, 100, 0.5);
		font-size: 1rem;
		font-weight: bold;
		text-align: center;
		text-transform: uppercase;
		user-select: none;
		width: 100%;
	}
	.lineDisplay {
		align-items: center;
		display: flex;
		width: 170px;
		flex-direction: column-reverse;
		height: 290px;
		flex-wrap: wrap;
		justify-content: center;
	}
	.lineButton {
		margin: 5px;
	}
	.heroButton {
		background: transparent;
		border: none;
		cursor: pointer;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		padding: 0;
		position: relative;
		img {
			border-radius: 50%;
			max-width: 60px;
		}
		p {
			font-weight: bold;
			margin: 0;
			overflow: hidden;
			text-align: center;
			text-overflow: ellipsis;
			white-space: nowrap;
			width: 70px;
		}
	}
	.imgContainer {
		height: fit-content;
		position: relative;
		width: fit-content;
	}
	.coreMark {
		background-color: var(--legendColor);
		border: 3px solid var(--appBGColor);
		border-radius: 50%;
		bottom: 0px;
		display: none;
		height: 22px;
		position: absolute;
		right: -4px;
		visibility: hidden;
		width: 22px;
	}
	.coreMark.visible {
		display: inline-block;
		pointer-events: none;
		visibility: visible;
	}
	.removeHeroButtonContainer {
		position: absolute;
		right: -6px;
		top: 0;
	}
	.ascMark {
		left: -11px;
		position: absolute;
		top: -5px;
		img {
			border-radius: 0;
			left: 0;
			max-width: 35px;
			pointer-events: none;
			position: absolute;
			top: 0;
		}
		img.moveup {
			top: -3.5px;
		}
	}
	.heroButton+p {
		color: black;
		font-size: 0.8rem;
		font-weight: bold;
		margin: 0;
		overflow: hidden;
		text-align: center;
		text-overflow: ellipsis;
		white-space: nowrap;
		width: 70px;
	}
	.subLine {
		p {
			color: black;
		}
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
		.removeButtonContainer {
			margin-left: 5px;
		}
	}
	.subGroupMember {
		align-items: center;
		display: flex;
		flex-direction: column;
		margin-left: 5px;
		margin-right: 7px;
		margin-bottom: 7px;
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
		padding: 5px;
	}
	.cancelButton {
		margin-right: 0;
	}
	@media only screen and (min-width: 767px) {
		.tagDisplay {
			.addTagButton {
				&:hover {
					background-color: var(--appColorPrimary);
					color: white;
				}
				&:disabled:hover {
					background-color: transparent;
					color: #BEBEBE;
				}
			}
		}
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
		.linePickerOption {
			.removeButtonContainer {
				opacity: 0;
				transition: opacity 0.2s;
				visibility: hidden;
			}
			&:hover .removeButtonContainer {
				opacity: 1;
				visibility: visible;
			}
			.removeButtonContainer.open {
				opacity: 1;
				visibility: visible;
			}
		}
		.lineEditBody {
			border-radius: 0px 10px 10px 10px;
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
			overflow: hidden;
			padding: 0;
		}
		.footerButton {
			&:hover {
				background-color: var(--appColorPrimary);
				color: white;
			}
		}
		.cancelButton {
			&:hover {
				background-color: var(--appColorPriAccent);
				color: white;
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
			font-size: 1.0rem !important;
		}
		:global(ul > li::before) {
			display: none !important;
		}
		:global(ol) {
			margin: 10px 0px !important;
		}
		:global(ol > li::before) {
			color: black !important;
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
		}
		:global(pre) {
			background-color: var(--appBGColorDark) !important;
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
				color: black !important;
				padding: 0 !important;
			}
		}
		:global(td) {
			border: 0 !important;
			border-bottom: 1px solid black !important;
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
