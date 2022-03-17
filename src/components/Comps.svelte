<script>
	import { getContext, createEventDispatcher, tick, onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import MarkdownIt from 'markdown-it';
	import Emoji from 'markdown-it-emoji';
	import { v4 as uuidv4 } from 'uuid';
	import JSONURL from 'json-url';
	import {pop as spaRoutePop} from 'svelte-spa-router';
	import { mutation } from "svelte-apollo";
	import CompCard from './CompCard.svelte';
	import AppData from '../stores/AppData.js';
	import HeroData from '../stores/HeroData.js';
	import Artifacts from '../stores/Artifacts.js';
	import Confirm from '../modals/Confirm.svelte';
	import ImportData from '../modals/ImportData.svelte';
	import HeroDetail from '../modals/HeroDetail.svelte';
	import ModalCloseButton from '../modals/ModalCloseButton.svelte';
	import CompEditor from '../modals/CompEditor.svelte';
	import ArtifactDetail from '../modals/ArtifactDetail.svelte';
	import SIFurnEngBox from '../shared/SIFurnEngBox.svelte';
	import TutorialBox from '../shared/TutorialBox.svelte';
	import AscendBox from '../shared/AscendBox.svelte';
	import SortableList from '../shared/SortableList.svelte';
	import StarsInput from '../shared/StarsInput.svelte';
	import ToggleSwitch from '../shared/ToggleSwitch.svelte';
	import { validateJWT, getCompByUUID, toggleSave } from '../rest/RESTFunctions.svelte';
	import { gql_CREATE_COMP, gql_UPDATE_COMP } from '../gql/queries.svelte';
	import { msToString } from '../utilities/Utilities.svelte';

	export let isMobile = false;

	const now = Date.now();
	const jsurl = JSONURL('lzma'); // json-url compressor
	const dispatch = createEventDispatcher();
	const { open } = getContext('simple-modal');
	const gqlCreateComp = mutation(gql_CREATE_COMP);
	const gqlUpdateComp = mutation(gql_UPDATE_COMP);
	const md = new MarkdownIt({
		html: false,
		linkify: false,
		typographer: true,
		breaks: true,
	});
	md.use(Emoji);

	$: compList = makeCompList($AppData.Comps);
	$: openComp = $AppData.Comps.find(e => e.uuid === $AppData.selectedComp);
	$: highlightComp = null;
	$: searchSuggestions = makeSearchSuggestions();
	$: editorWidth = isMobile ? '100%' : '75%';
	$: editorHeight = isMobile ? '70vh' : '80vh';
	$: $AppData.modalClosed && handleModalClosed();

	let openDetail = false;
	let openDesc = true;
	let openHero = false;
	let openSubs = false;
	let openSuggestions = false;
	let selectedLine = 0;
	let selectedHero = '';
	let showowConfirm = false;
	let showEditMenu = false;
	let owText = '';
	let owPromise;
	let modalStack = [];

	onMount(async () => {
		const queryString = window.location.search;
		const urlParams = new URLSearchParams(queryString);
		
		openDetail = urlParams.has('comp');
		modalStack = openDetail ? ['base', 'comp'] : ['base']

		$AppData.activeView = 'comps';
		dispatch('routeEvent', {action: 'saveData'});
	});

	async function postUpdate() {
		$AppData.compLastUpdate = new Date();
		const valid = await validateJWT($AppData.user.jwt);
		if(valid) dispatch('routeEvent', {action: 'syncLocalComps'});
	}

	function makeCompList(comps) {
		let compList = [...comps].filter(e => $AppData.compShowHidden || !e.hidden);

		if($AppData.compSearchStr !== '') {
			// array of search terms (separate by , trim white space, and make lower case)
			let searchTerms = $AppData.compSearchStr.split(',').map(e => e.trim().toLowerCase());
			compList = compList.filter(comp => {
				// array of tags (trim white space and make lower case)
				const tags = comp.tags.map(i => i.trim().toLowerCase());
				for(const term of searchTerms) {
					if(term.charAt(0) === '-') {
						const sterm = term.slice(1, term.length);
						if(comp.name.toLowerCase().includes(sterm) || tags.some(e => e.toLowerCase().includes(sterm))) return false;
					} else {
						if(!comp.name.toLowerCase().includes(term) && !tags.some(e => e.toLowerCase().includes(term))) return false;
					}
				}
				return true;
			});
		}

		searchSuggestions = makeSearchSuggestions();

		return compList;
	}

	function makeSearchSuggestions() {
		let suggestions = [];

		// first make a list of all tags and comp names
		for(const comp of $AppData.Comps) {
			suggestions.push(comp.name);
			suggestions = [...suggestions, ...comp.tags];
		}
		// remove duplicate suggestions
		suggestions = [...new Set(suggestions)];
		// filter suggestions for stuff matching the last search term (split by ,)
		const searchTerms = $AppData.compSearchStr.split(',').map(e => e.trim());
		let lastTerm = searchTerms[searchTerms.length - 1].toLowerCase();
		if(lastTerm.charAt(0) === '-') lastTerm = lastTerm.slice(1, lastTerm.length);
		suggestions = suggestions.filter(e => e.toLowerCase().includes(lastTerm));
		// if there's only 1 suggestion, return nothing because the filter should already be applied
		if(suggestions.length === 1) return [];
		// take only the first 10 suggestions
		suggestions = suggestions.slice(0, 10);
		// finally, sort suggestions before returning
		suggestions.sort();

		return suggestions;
	}

	function handleCompCardClick(uuid) {
		const queryString = window.location.search;
		const urlParams = new URLSearchParams(queryString);
		if(!urlParams.has('comp')) {
			history.pushState({view: $AppData.activeView, comp: true}, $AppData.activeView, `?comp=true${window.location.hash}`);
		}
		modalStack.push('comp');
		$AppData.selectedComp = uuid;
		openDetail = true;
		selectedLine = 0;
		selectedHero = '';
		showEditMenu = false;
		dispatch('routeEvent', {action: 'saveData'});
	}

	function renderMarkdown(mdText) {
		return md.render(mdText);
	}

	function handleShowHiddenChange() {
		dispatch('routeEvent', {action: 'saveData'});
	}

	function handleEditButtonClick(uuid) {
		modalStack.push('editor');
		open(CompEditor,
				{compID: uuid,
				 onSuccess: (uuid) => handleCompChangeSuccess(uuid, 'edit'),
				 isMobile: isMobile,
				},
				{ closeButton: ModalCloseButton,
					styleContent: {background: '#F0F0F2', padding: 0, borderRadius: '10px', maxHeight: editorHeight,},
					styleWindow: {width: editorWidth, maxWidth: '1200px',},
					closeOnOuterClick: false,
				});
	}
	
	function handlePublishButtonClick(uuid) {
		modalStack.push('confirm');
		const comp = $AppData.Comps.find(e => e.uuid === uuid);
		open(Confirm,
				{onConfirm: handlePublishComp, confirmData: uuid, message: `Publish comp named ${comp.name}?`},
				{closeButton: false,
				 closeOnEsc: true,
				 closeOnOuterClick: true,
				 styleWindow: { width: 'fit-content', },
				 styleContent: { width: 'fit-content', },
				});
	}

	function handleHideButtonClick(uuid) {
		const idx = $AppData.Comps.findIndex(e => e.uuid === uuid);
		$AppData.Comps[idx].hidden = !$AppData.Comps[idx].hidden;
		// if hidden comps are not shown, need to set selectedComp to null when the list is updated
		if(!$AppData.compShowHidden) resetOpenComp();
		dispatch('routeEvent', {action: 'saveData'});
	}

	function handleNewButtonClick() {
		modalStack.push('editor');
		open(CompEditor,
				{onSuccess: (uuid) => { $AppData.compSearchStr = ''; handleCompChangeSuccess(uuid, 'new') },
				 isMobile: isMobile,
				},
				{ closeButton: ModalCloseButton,
					closeOnOuterClick: false,
					styleContent: {background: '#F0F0F2', padding: 0, borderRadius: '10px', maxHeight: editorHeight,},
					styleWindow: {width: editorWidth, maxWidth: '1200px',},
				});
	}

	async function handleCompChangeSuccess(uuid, type) {
		searchSuggestions = makeSearchSuggestions();
		highlightComp = compList.findIndex(e => e.uuid === uuid);
		selectedHero = '';
		selectedLine = 0;
		if(type === 'new') $AppData.selectedComp = uuid;
		await tick();
		document.getElementById(`comp${highlightComp}`).scrollIntoView();
		setTimeout(() => highlightComp = null, 2000);
		await postUpdate();
		dispatch('routeEvent', {action: 'saveData'});
	}

	function handleDeleteButtonClick(uuid) {
		modalStack.push('confirm');
		const comp = $AppData.Comps.find(e => e.uuid === uuid);
		let message;
		if($AppData.user.published_comps.some(e => e.uuid === uuid)) {
			// comp is published
			message = `Delete comp named ${comp.name}?<br/><br/>This will only remove the comp from your local Comps. To remove from Explore, you must unpublish.<br/><br/>You can restore the comp by finding the comp in Explore and using the restore button.`;
		} else {
			// comp is not published
			if(comp.source === 'local') {
				// comp is a local comp
				message = `Delete comp named ${comp.name}?`;
			} else {
				// comp is a favorited comp
				message = `Unfavorite comp named ${comp.name}?`
			}
		}
		open(Confirm,
				{onConfirm: handleDelComp, confirmData: uuid, message: message},
				{closeButton: false,
				 closeOnEsc: true,
				 closeOnOuterClick: true,
				 styleWindow: { width: 'fit-content', },
				 styleContent: { width: 'fit-content', },
				});
	}

	function handleImportButtonClick() {
		modalStack.push('import');
		open(ImportData, 
		{ dataHandler: handleCompImport,
			saveAppData: () => dispatch('routeEvent', {action: 'saveData'}),
			title: 'Paste Composition:',
		},
		{ closeButton: ModalCloseButton,
			styleContent: {background: '#F0F0F2', padding: 0, borderRadius: '10px', maxHeight: editorHeight,},
			closeOnOuterClick: false,
		});
	}

	async function handleExportButtonClick(uuid) {
		const comp = $AppData.Comps.find(e => e.uuid === uuid);
		const output = await jsurl.compress(JSON.stringify(comp));
		navigator.clipboard.writeText(output).then(() => {
			dispatch('routeEvent',
				{ action: 'showNotice',
					data: {
						noticeConf: {
							type: 'info',
							message: 'Comp Data Copied to Clipboard',
						}
					}
				}
			);
		}, (error) => {
			dispatch('routeEvent',
				{ action: 'showNotice',
					data: {
						noticeConf: {
							type: 'error',
							message: 'Error copying Comp data to clipboard',
						}
					}
				}
			);
			console.log(error);
		});
	}

	function handleStarClick(event, uuid) {
		const idx = $AppData.Comps.findIndex(e => e.uuid === uuid);
		$AppData.Comps[idx].starred = !$AppData.Comps[idx].starred;
		event.stopPropagation();
		dispatch('routeEvent', {action: 'saveData'});
	}

	async function handleDelComp(uuid) {
		const comp = $AppData.Comps.find(e => e.uuid === uuid);
		if(comp.source === 'local') {
			$AppData.Comps = $AppData.Comps.filter(e => e.uuid !== uuid);
			if($AppData.selectedComp === uuid) resetOpenComp();
			await postUpdate();
			dispatch('routeEvent', {action: 'saveData'});
		} else {
			// assume source is favorite
			const valid = await validateJWT($AppData.user.jwt);
			if(valid) {
				// user is valid, perform query
				const response = await toggleSave($AppData.user.jwt, uuid);
				if(response.status !== 200) {
					dispatch('routeEvent',
						{ action: 'showNotice',
							data: {
								noticeConf: {
									type: 'error',
									message: 'Something went wrong',
								}
							}
						}
					);
					console.log(`An error occurred attempting to unfavorite comp with uuid: ${delUUID}`)
					console.log(response.data);
				} else {
					if($AppData.selectedComp === uuid) resetOpenComp();
					$AppData.user.saved_comps = response.data.comps;
					dispatch('routeEvent', {action: 'saveData'});
					dispatch('routeEvent', {action: 'syncFavorites'});
				}
			} else {
				dispatch('routeEvent', {action: 'logout'});
			}
		}
	}

	async function handlePublishComp(uuid) {
		const comp = $AppData.Comps.find(e => e.uuid === uuid);
		const valid = await validateJWT($AppData.user.jwt);
		if(valid) {
			// setup essential variables
			const comp_string = await jsurl.compress(JSON.stringify(comp));

			// check if the comp has been published before
			let compCheck = [];
			const response = await getCompByUUID(comp.uuid);
			if(response.status !== 200) {
				// errorDisplayConf = {
				// 	errorCode: response.status,
				// 	headText: 'Something went wrong',
				// 	detailText: response.data,
				// 	showHomeButton: true,
				// };
				// showErrorDisplay = true;
				console.log('an error occurred');
				return;
			} else {
				compCheck = response.data;
			}

			if(compCheck.length === 0) {
				// create a new comp
				try {
					const create_response = await gqlCreateComp({
						variables: {
							name: comp.name,
							uuid: comp.uuid,
							comp_string: comp_string,
							heroes: Object.keys(comp.heroes),
							tags: comp.tags.map(e => e.replace(/ /g, '_')),
							comp_update: comp.lastUpdate,
						}
					});
					const id = create_response.data.createComp.data.id;
					const uuid = create_response.data.createComp.data.attributes.uuid;
					$AppData.user.published_comps = [...$AppData.user.published_comps, {id, uuid}];
					dispatch('routeEvent', {action: 'saveData'});
					dispatch('routeEvent',
						{ action: 'showNotice',
							data: {
								noticeConf: {
									type: 'info',
									message: 'Comp published!',
								}
							}
						}
					);
				} catch(error) {
					dispatch('routeEvent',
						{ action: 'showNotice',
							data: {
								noticeConf: {
									type: 'error',
									message: 'Comp publish failed!',
								}
							}
						}
					);
					if(error.graphQLErrors[0]) {
						console.log(error.graphQLErrors[0].message);
					} else {
						console.log(error.message);
					}
					return;
				}
			} else {
				// check that the user owns the comp
				if(!$AppData.user.published_comps.some(e => e.uuid === comp.uuid)) {
					dispatch('routeEvent',
						{ action: 'showNotice',
							data: {
								noticeConf: {
									type: 'error',
									message: 'You do not have permission to publish this comp',
								}
							}
						}
					);
					return;
				}
				// check that the comp needs updating
				const oldDate = new Date(compCheck[0].attributes.comp_update);
				if(comp.lastUpdate > oldDate) {
					// try to update the existing comp
					try {
						const update_response = await gqlUpdateComp({
							variables: {
								id: compCheck[0].id,
								name: comp.name,
								uuid: comp.uuid,
								comp_string: comp_string,
								heroes: Object.keys(comp.heroes),
								tags: comp.tags.map(e => e.replace(/ /g, '_')),
								comp_update: comp.lastUpdate,
							}
						});
						dispatch('routeEvent',
							{ action: 'showNotice',
								data: {
									noticeConf: {
										type: 'info',
										message: 'Comp updated!',
									}
								}
							}
						);
					} catch(error) {
						dispatch('routeEvent',
							{ action: 'showNotice',
								data: {
									noticeConf: {
										type: 'error',
										message: 'Comp publish failed!',
									}
								}
							}
						);
						if(error.graphQLErrors[0]) {
							console.log(error.graphQLErrors[0].message);
						} else {
							console.log(error.message);
						}
						return;
					}
				} else {
					// no updates detected
					dispatch('routeEvent',
						{ action: 'showNotice',
							data: {
								noticeConf: {
									type: 'warning',
									message: 'Publish failed: no change detected',
								}
							}
						}
					);
				}
			}
		} else {
			dispatch('routeEvent', {action: 'logout'});
		}
	}

	async function handleCompImport(compressedData) {
		let data;
		let statusMsg = '';
		
		// unpack and decompress data
		try {
			const json = await jsurl.decompress(compressedData);
			data = JSON.parse(json);
		} catch(e) {
			// there was a problem unpacking the data, return an error
			console.log(e);
			return {retCode: 1, message: 'Failed to parse data'};
		}
		if('lastUpdate' in data) data.lastUpdate = new Date(data.lastUpdate);

		// run consistency checks on data
		const returnObj = await validateComp(data);
		if(returnObj.retCode !== 0) {
			// validation error occurred
			return {retCode: returnObj.retCode, message: returnObj.message};
		} else {
			// message should contain a clean comp object now
			if($AppData.Comps.some(e => e.uuid === returnObj.message.uuid)) {
				// comp exists, check if user wants to update it
				const idx = $AppData.Comps.findIndex(e => e.uuid === returnObj.message.uuid);
				const response = await openOverwriteConfirm(idx);
				switch(response) {
					case 'update':
						returnObj.message.starred = $AppData.Comps[idx].starred;
						returnObj.message.source = $AppData.Comps[idx].source;
						$AppData.Comps[idx] = returnObj.message;
						statusMsg = 'Comp updated successfully';
						break;
					case 'new':
						returnObj.message.uuid = uuidv4();
						returnObj.message.starred = false;
						returnObj.message.source = 'local';
						$AppData.Comps = [...$AppData.Comps, returnObj.message];
						statusMsg = 'Data import successful';
						break;
					case 'cancel':
						return { retCode: 0, message: 'Data import cancelled' };
						break;
					default:
						throw new Error(`Invalid response received from overwrite dialog: ${response}`);
				}
			} else {
				// comp not in list yet, add it to the list
				returnObj.message.starred = false;
				returnObj.message.source = 'local';
				$AppData.Comps = [...$AppData.Comps, returnObj.message];
				statusMsg = 'Data import successful';
			}
			await tick();
			$AppData.compSearchStr = ''; // reset any filters
			highlightComp = compList.findIndex(e => e.uuid === returnObj.message.uuid);
			$AppData.selectedComp = returnObj.message.uuid;
			selectedHero = '';
			selectedLine = 0;
			const compScroller = document.getElementById('compScroller');
			compScroller.scrollTop = compScroller.scrollHeight;
			setTimeout(() => highlightComp = null, 3000);
			await postUpdate();
			dispatch('routeEvent', {action: 'saveData'});
			return { retCode: 0, message: statusMsg };
		}
	}

	async function handleCopyButtonClick(uuid) {
		const comp = $AppData.Comps.find(e => e.uuid === uuid);
		const copyComp = JSON.parse(JSON.stringify(comp));
		copyComp.uuid = uuidv4();
		copyComp.starred = false;
		copyComp.source = 'local';
		copyComp.lastUpdate = new Date(copyComp.lastUpdate);
		$AppData.Comps = [...$AppData.Comps, copyComp];
		handleCloseButtonClick();
		await tick();
		$AppData.compSearchStr = ''; // reset any filters
		highlightComp = compList.findIndex(e => e.uuid === copyComp.uuid);
		$AppData.selectedComp = copyComp.uuid;
		selectedHero = '';
		selectedLine = 0;
		const compScroller = document.getElementById('compScroller');
		compScroller.scrollTop = compScroller.scrollHeight;
		setTimeout(() => highlightComp = null, 3000);
		await postUpdate();
		dispatch('routeEvent', {action: 'saveData'});
	}

	async function openOverwriteConfirm(index) {
		let reply = '';
		owText = `Update comp named "${$AppData.Comps[index].name}"?`;
		showowConfirm = true;
		let promise = new Promise((resolve) => { owPromise = resolve });
		await promise.then((result) => { reply = result });
		showowConfirm = false;
		owText = '';
		return reply;
	}

	function handleCloseButtonClick() {
		if(modalStack.pop() === 'comp') {
			spaRoutePop();
		}
		openDetail = false;
	}

	function handleHeroDetailClick(heroID) {
		modalStack.push('detail');
		open(HeroDetail, 
		{ heroID: heroID, },
		{ closeButton: ModalCloseButton,
			styleContent: {background: '#F0F0F2', padding: 0, borderRadius: '10px', maxHeight: editorHeight,},
		});
	}

	function openArtifactDetail(artifactID) {
		modalStack.push('detail');
		open(ArtifactDetail, 
		{ artifactID: artifactID, },
		{ closeButton: ModalCloseButton,
			styleContent: {background: '#F0F0F2', padding: 0, borderRadius: '10px', maxHeight: editorHeight,},
		});
	}

	function handlePopState(event) {
		const component = modalStack.pop();
		switch(component) {
			case 'detail':
			case 'import':
			case 'editor':
				break;
			case 'base':
				modalStack.push('base');
				break;
			case 'comp':
				openDetail = false;
				history.replaceState({view: $AppData.activeView, comp: false}, $AppData.activeView, `?${window.location.hash}`);
				break;
			case 'confirm':
				showowConfirm = false;
				owText = '';
				break;
			default:
				throw new Error(`Error invalid Comp.svelte modal stack component detected: ${component}`);
		}
	}

	function handleModalClosed() {
		$AppData.modalClosed = false;
		const component = modalStack.pop();
		switch(component) {
			case 'detail':
			case 'import':
			case 'editor':
				if(modalStack[modalStack.length - 1] !== 'comp') {
					spaRoutePop();
				} else {
					history.replaceState({view: $AppData.activeView, comp: true}, $AppData.activeView, `?comp=true${window.location.hash}`);
				}
				break;
			case 'base':
				modalStack.push('base');
				break;
			case 'comp':
				modalStack.push('comp');
				break;
			case 'confirm':
				showowConfirm = false;
				owText = '';
				break;
			default:
				Error(`Error invalid Comp.svelte modal stack component detected: ${component}`);
		}
	}

	async function handleCardSort(event) {
		const {from, to} = event.detail;
		const fromUUID = compList[from].uuid;
		const toUUID = compList[to].uuid;
		const mainFromIdx = $AppData.Comps.findIndex(e => e.uuid === fromUUID);
		const mainToIdx = $AppData.Comps.findIndex(e => e.uuid === toUUID);
		let newList = [...$AppData.Comps];
		newList[mainFromIdx] = [newList[mainToIdx], (newList[mainToIdx] = newList[mainFromIdx])][0];
		// double-check that we didn't lose any comps
		let allCompsValid = true;
		for(const comp of $AppData.Comps) {
			allCompsValid = newList.some(e => e.uuid === comp.uuid);
		}
		if(!allCompsValid) {
			dispatch('routeEvent',
				{ action: 'showNotice',
					data: {
						noticeConf: {
							type: 'error',
							message: 'Re-order error occurred',
						}
					}
				}
			);
			return;
		}
		$AppData.Comps = newList;
		dispatch('routeEvent', {action: 'saveData'});
		// // catch if a user dragged something we weren't expecting and exit
		// if(!Array.isArray(event.detail)) return 0;
		// // don't allow re-ordering when comp list is filtered (could accidently delete comps)
		// if($AppData.compSearchStr !== '') return 0;
		// // don't allow comp overwrite if there are missing comps
		// if(event.detail.length !== $AppData.Comps.length) {
		// 	throw new Error(`Received invalid Comps array, must be same length as original. ${event.detail}`);
		// }
		// let allCompsValid = true;
		// for(const comp of event.detail) {
		// 	let returnObj = await validateComp(comp);
		// 	allCompsValid = allCompsValid && returnObj.retCode === 0;
		// }
		// if(allCompsValid) {
		// 	// one last check that all comps are present
		// 	for(const comp of $AppData.Comps) {
		// 		if(!event.detail.some(e => e.uuid === comp.uuid)) {
		// 			throw new Error(`Received invalid Comps array, missing comp with uuid: ${comp.uuid}`);
		// 		}
		// 	}
		// 	$AppData.Comps = event.detail;
		// 	dispatch('routeEvent', {action: 'saveData'});
		// }
	}

	function updateSearch() {
		if(!compList.some(e => e.uuid === $AppData.selectedComp)) resetOpenComp();
		searchSuggestions = makeSearchSuggestions();
		openSuggestions = true;
		dispatch('routeEvent', {action: 'saveData'});
	}

	function takeSuggestion(suggestion) {
		let searchTerms = $AppData.compSearchStr.split(',').map(e => e.trim());
		if(searchTerms[searchTerms.length - 1].charAt(0) === '-') {
			searchTerms[searchTerms.length - 1] = '-' + suggestion;
		} else {
			searchTerms[searchTerms.length - 1] = suggestion;
		}
		$AppData.compSearchStr = searchTerms.join(', ');
		updateSearch();
		openSuggestions = false;
	}

	async function handleHeroClick(hero) {
		selectedHero = hero;
		openHero = true;
		await tick();
		document.getElementById('heroDetailSection').scrollIntoView({behavior: 'smooth', block: 'center', inline: 'center'});
	}

	function handleViewExploreClick(uuid) {
		window.location.assign(`${window.location.origin}/#/explore/comp/${uuid}`);
	}

	function resetOpenComp() {
		$AppData.selectedComp = null;
		selectedHero = '';
		selectedLine = 0;
		openDetail = false;
		showEditMenu = false;
	}
</script>

<svelte:window on:popstate={handlePopState} />

<div class="CompContainer">
	<section class="sect1">
		<div class="searchArea">
			<input
				bind:value={$AppData.compSearchStr}
				on:keyup={updateSearch}
				on:search={updateSearch}
				on:focus={() => openSuggestions = true}
				on:blur={() => openSuggestions = false}
				class="searchBox"
				type="search"
				placeholder="Filter name or tags">
			<div class="suggestions" class:open={openSuggestions}>
				{#each searchSuggestions as suggestion}
					<button type="button" class="suggestionButton" on:click={() => takeSuggestion(suggestion)}><span>{suggestion}</span></button>
				{/each}
			</div>
			<div class="hiddenToggleArea">
				<span>Show Hidden</span>
				<ToggleSwitch
					size="small"
					bind:state={$AppData.compShowHidden}
					on:toggleEvent={handleShowHiddenChange}
				/>
			</div>
		</div>
		<div class="compScroller" id="compScroller">
			{#if compList.length === 0}
				<div class="noComps" class:noSearch={$AppData.compSearchStr !== ''}>
					{#if $AppData.compSearchStr === ''}
						<span>Add or Import a New Comp</span>
						<div class="noCompsArrow">
							<span>&#8681;</span>
						</div>
					{:else}
						<span>No Comps Found</span>
					{/if}
				</div>
			{:else}
				<SortableList
					list={compList}
					key="uuid"
					on:sort={handleCardSort}
					let:item={comp}
					let:index={i}>
					<CompCard
						comp={comp}
						idx={i}
						highlightComp={highlightComp}
						delCallback={handleDeleteButtonClick}
						cardClickCallback={handleCompCardClick}
						exportCallback={handleExportButtonClick}
						starCallback={handleStarClick}
					/>
				</SortableList>
			{/if}
		</div>
		<div class="addButtonArea">
			<div class="newCompOptionsArea">
				<button type="button" class="newCompOptionButton" on:click={handleImportButtonClick}>
					<div class="imgContainer">
						<img draggable="false" class="importButtonIcon" src="./img/utility/import.png" alt="Import">
					</div>
					<span>Import</span>
				</button>
				<button type="button" class="newCompOptionButton" on:click={handleNewButtonClick}>
					<span class="plusIcon">+</span>
					<span>New</span>
				</button>
			</div>
		</div>
	</section>
	<section class="sect2">
		<div class="compDetails" class:open={openDetail}>
			{#if openComp}
				<div class="compDetailHead">
					<div class="closeButtonContainer">
						<button type="button" class="detailButton closeDetailButton" on:click={handleCloseButtonClick}><i class="arrow left"></i>Close</button>
					</div>
					<div class="titleContainer">
						<h3 class="compTitle">{openComp.name}</h3>
						<p class="authorTitle">{openComp.author}</p>
					</div>
					<button type="button" class="editMenuButton" class:open={showEditMenu} on:click={() => showEditMenu = !showEditMenu}>
						<i class="filledCircle"></i>
						<i class="filledCircle"></i>
						<i class="filledCircle"></i>
					</button>
					<div class="editContainer" class:open={showEditMenu}>
						<button
							type="button"
							class="editDelButton editButton"
							disabled={openComp.source !== 'local'}
							on:click={() => handleEditButtonClick($AppData.selectedComp)}>
							<img draggable="false" src="./img/utility/pencil.png" alt="Edit">
							<span>Edit</span>
						</button>
						<button
							type="button"
							class="editDelButton publishButton"
							class:update={$AppData.user.published_comps.some(e => e.uuid === openComp.uuid)}
							disabled={openComp.source !== 'local'}
							on:click={() => handlePublishButtonClick($AppData.selectedComp)}>
							<img draggable="false" src="./img/utility/explore_white.png" alt="Publish">
							<span>{$AppData.user.published_comps.some(e => e.uuid === openComp.uuid) ? 'Update' : 'Publish'}</span>
						</button>
						<button
							type="button"
							class="editDelButton exportButton"
							on:click={() => handleExportButtonClick($AppData.selectedComp)}>
							<img draggable="false" src="./img/utility/export.png" alt="Export">
							<span>Export</span>
						</button>
						<button
							type="button"
							class="editDelButton hideButton"
							class:hidden={openComp.hidden}
							on:click={() => handleHideButtonClick($AppData.selectedComp)}>
							<img draggable="false" src={openComp.hidden ? './img/utility/view_white.png' : './img/utility/hidden_white.png'} alt={openComp.hidden ? 'Unhide' : 'Hide'}>
							<span>{openComp.hidden ? 'Unhide' : 'Hide'}</span>
						</button>
						<!-- eye icons by https://uxwing.com/ -->
						<button
							type="button"
							class="editDelButton copyButton"
							on:click={() => handleCopyButtonClick($AppData.selectedComp)}>
							<img draggable="false" src="./img/utility/copy_white.png" alt="Copy">
							<span>Copy</span>
						</button>
						<button
							type="button"
							class="editDelButton deleteButton"
							on:click={() => handleDeleteButtonClick($AppData.selectedComp)}>
							<img
								draggable="false"
								src={openComp.source === 'local' ? './img/utility/trashcan.png' : './img/utility/favorite_unfilled_white.png'}
								alt={openComp.source === 'local' ? 'Delete' : 'Unfavorite'}>
							<span>{openComp.source === 'local' ? 'Delete' : 'Unfavorite'}</span>
						</button>
					</div>
				</div>
				<div class="iconsArea">
					<ul class="iconList">
						{#if openComp.hidden}
						<li>
							<img class="iconAreaImage" src="./img/utility/hidden_white.png" alt="Hidden">
						</li>
						{/if}
						{#if openComp.source === 'favorite'}
						<li>
							<img class="iconAreaImage" src="./img/utility/favorite_filled_white.png" alt="Favorite">
						</li>
						{/if}
					</ul>
				</div>
				<div class="tagsArea">
					<div class="tagDisplay">
						{#each openComp.tags as tag}
							<div class="tag">
								<span class="tagText">{tag}</span>
							</div>
						{/each}
					</div>
				</div>
				<div class="viewExploreContainer">
					<button
						type="button"
						class="viewExploreButton"
						class:visible={$AppData.user.published_comps.some(e => e.uuid === openComp.uuid) || $AppData.user.saved_comps.some(e => e.uuid === openComp.uuid)}
						on:click={() => handleViewExploreClick(openComp.uuid)}>
						<span>View in Explore</span>
					</button>
				</div>
				<div class="compDetailBody">
					<div class="lastUpdate">
						<span title="{openComp.lastUpdate.toLocaleString()}">Updated {msToString(now - openComp.lastUpdate.getTime())}</span>
					</div>
					<div class="bodyArea1">
						<div class="lineExamples">
							<div class="lineSwitcher">
								{#each openComp.lines as line, i}
								<button type="button" class="lineSwitchButton" class:active={selectedLine === i} on:click={() => selectedLine = i}>{line.name}</button>
								{/each}
							</div>
							<div class="lineDisplay">
								{#if openComp.lines.length > 0}
									<div class="lineTitle"><span>{openComp.lines[selectedLine].name}</span></div>
								{/if}
								<div class="lineMembers">
									<div class="detailBackline">
										{#if openComp.lines.length > 0}
											{#each openComp.lines[selectedLine].heroes as hero, i}
												{#if i >= 2}
													{#if $HeroData.some(e => e.id === hero)}
														<div class="detailImgContainer">
															<button type="button" class="heroButton"><img draggable="false" on:click={() => handleHeroClick(hero)} class="lineImg" class:claimed={$AppData.MH.List[hero].claimed} src={$HeroData.find(e => e.id === hero).portrait} alt={$HeroData.find(e => e.id === hero).name}></button>
															<span class="coreMark" class:visible={openComp.heroes[hero].core}></span>
															<div class="ascMark">
																{#if $HeroData.find(e => e.id === hero).tier === 'ascended'}
																	{#if openComp.heroes[hero].ascendLv >= 6}
																		<img src="./img/markers/ascended.png" alt="ascended">
																	{:else if openComp.heroes[hero].ascendLv >= 4}
																		<img src="./img/markers/mythic.png" alt="mythic">
																	{:else if openComp.heroes[hero].ascendLv >= 2}
																		<img src="./img/markers/legendary.png" alt="legendary">
																	{:else}
																		<img src="./img/markers/elite.png" alt="elite">
																	{/if}
																{:else}
																	{#if openComp.heroes[hero].ascendLv >= 4}
																		<img src="./img/markers/legendary.png" alt="legendary">
																	{:else if openComp.heroes[hero].ascendLv >= 2}
																		<img src="./img/markers/elite.png" alt="elite">
																	{:else}
																		<img src="./img/markers/rare.png" alt="rare">
																	{/if}
																{/if}
																{#if openComp.heroes[hero].si >= 30}
																	<img src="./img/markers/si30.png" alt="si30">
																{:else if openComp.heroes[hero].si >= 20}
																	<img src="./img/markers/si20.png" alt="si20">
																{:else if openComp.heroes[hero].si >= 10}
																	<img src="./img/markers/si10.png" alt="si10">
																{:else}
																	<img src="./img/markers/si0.png" alt="si0">
																{/if}
																{#if openComp.heroes[hero].furn >= 9}
																	<img class:moveup={openComp.heroes[hero].si < 10} src="./img/markers/9f.png" alt="9f">
																{:else if openComp.heroes[hero].furn >= 3}
																	<img class:moveup={openComp.heroes[hero].si < 10} src="./img/markers/3f.png" alt="3f">
																{/if}
															</div>
														</div>
														<button type="button" class="heroNameButton"><span on:click={() => handleHeroClick(hero)}>{$HeroData.find(e => e.id === hero).name}</span></button>
													{:else}
														<i class="emptyLineSlot"></i>
													{/if}
												{/if}
											{/each}
										{/if}
									</div>
									<div class="detailFrontline">
										{#if openComp.lines.length > 0}
											{#each openComp.lines[selectedLine].heroes as hero, i}
												{#if i < 2}
													{#if $HeroData.some(e => e.id === hero)}
														<div class="detailImgContainer">
															<button type="button" class="heroButton"><img draggable="false" on:click={() => handleHeroClick(hero)} class="lineImg" class:claimed={$AppData.MH.List[hero].claimed} src={$HeroData.find(e => e.id === hero).portrait} alt={$HeroData.find(e => e.id === hero).name}></button>
															<span class="coreMark" class:visible={openComp.heroes[hero].core}></span>
															<div class="ascMark">
																{#if $HeroData.find(e => e.id === hero).tier === 'ascended'}
																	{#if openComp.heroes[hero].ascendLv >= 6}
																		<img src="./img/markers/ascended.png" alt="ascended">
																	{:else if openComp.heroes[hero].ascendLv >= 4}
																		<img src="./img/markers/mythic.png" alt="mythic">
																	{:else if openComp.heroes[hero].ascendLv >= 2}
																		<img src="./img/markers/legendary.png" alt="legendary">
																	{:else}
																		<img src="./img/markers/elite.png" alt="elite">
																	{/if}
																{:else}
																	{#if openComp.heroes[hero].ascendLv >= 4}
																		<img src="./img/markers/legendary.png" alt="legendary">
																	{:else if openComp.heroes[hero].ascendLv >= 2}
																		<img src="./img/markers/elite.png" alt="elite">
																	{:else}
																		<img src="./img/markers/rare.png" alt="rare">
																	{/if}
																{/if}
																{#if openComp.heroes[hero].si >= 30}
																	<img src="./img/markers/si30.png" alt="si30">
																{:else if openComp.heroes[hero].si >= 20}
																	<img src="./img/markers/si20.png" alt="si20">
																{:else if openComp.heroes[hero].si >= 10}
																	<img src="./img/markers/si10.png" alt="si10">
																{:else}
																	<img src="./img/markers/si0.png" alt="si0">
																{/if}
																{#if openComp.heroes[hero].furn >= 9}
																	<img class:moveup={openComp.heroes[hero].si < 10} src="./img/markers/9f.png" alt="9f">
																{:else if openComp.heroes[hero].furn >= 3}
																	<img class:moveup={openComp.heroes[hero].si < 10} src="./img/markers/3f.png" alt="3f">
																{/if}
															</div>
														</div>
														<button type="button" class="heroNameButton"><span on:click={() => handleHeroClick(hero)}>{$HeroData.find(e => e.id === hero).name}</span></button>
													{:else}
														<i class="emptyLineSlot"></i>
													{/if}
												{/if}
											{/each}
										{/if}
									</div>
								</div>
							</div>
						</div>
						<div class="description">
							<div class="mobileExpanderTitle">
								<button type="button" class="expanderButton" on:click={() => openDesc = !openDesc}><i class="expanderArrow {openDesc ? 'down' : 'right' }"></i><span>Description</span></button>
							</div>
							<div class="mobileExpander descSection" class:open={openDesc}>
								<span class="descText">{@html renderMarkdown(openComp.desc)}</span>
							</div>
						</div>
					</div>
					<div class="bodyArea2">
						<div class="heroDetails" id="heroDetailSection">
							<div class="mobileExpanderTitle">
								<button type="button" class="expanderButton" on:click={() => openHero = !openHero}><i class="expanderArrow {openHero ? 'down' : 'right' }"></i><span>Hero Info</span></button>
							</div>
							<div class="mobileExpander selectHeroSection" class:open={openHero}>
								{#if selectedHero !== ''}
									<div class="selectedHero" in:fade="{{duration: 200}}">
										<div class="upperSelectCard">
											<div class="siFurnBoxContainer">
												<SIFurnEngBox type='si' num={openComp.heroes[selectedHero].si} maxWidth='50px' fontSize='1.2rem' />
											</div>
											<div class="selectPortraitArea">
												<div class="portraitContainer" on:click={() => handleHeroDetailClick(selectedHero)}>
													<img draggable="false" class="selectHeroPortrait" class:claimed={$AppData.MH.List[selectedHero].claimed} src="{$HeroData.find(e => e.id === selectedHero).portrait}" alt="{selectedHero}">
													<span class="coreMark" class:visible={openComp.heroes[selectedHero].core}></span>
												</div>
												<p>{$HeroData.find(e => e.id === selectedHero).name}</p>
												<div>
													<StarsInput
														value={openComp.heroes[selectedHero].stars}
														enabled={openComp.heroes[selectedHero].ascendLv === 6}
														engraving={openComp.heroes[selectedHero].engraving}
														displayOnly={true} />
												</div>
											</div>
											<div class="siFurnBoxContainer">
												<SIFurnEngBox type='furn' num={openComp.heroes[selectedHero].furn} maxWidth='50px' fontSize='1.2rem' />
											</div>
										</div>
										<div class="lowerSelectCard">
											<div class="ascendBoxContainer">
												<AscendBox
													ascendLv="{openComp.heroes[selectedHero].ascendLv}"
													tier={$HeroData.find(e => e.id === selectedHero).tier}
												/>
											</div>
											{#if openComp.heroes[selectedHero].stars > 0}
												<div class="engraveBoxContainer">
													<SIFurnEngBox type='engraving' num={openComp.heroes[selectedHero].engraving} maxWidth='50px' fontSize='1.2rem' />
												</div>
											{/if}
											{#if openComp.heroes[selectedHero].notes.length > 0}
												<div class="heroNotesArea">
													<div class="heroNotes">
														<span>{openComp.heroes[selectedHero].notes}</span>
													</div>
												</div>
											{/if}
											{#if openComp.heroes[selectedHero].artifacts.primary.length > 0 || openComp.heroes[selectedHero].artifacts.secondary.length > 0 || openComp.heroes[selectedHero].artifacts.situational.length > 0}
												<div class="artifactsContainer">
													<h5>Artifacts</h5>
													<div class="artifactLine priArtifactLine">
														<h6>Primary</h6>
														<div class="artifactArea">
															{#each openComp.heroes[selectedHero].artifacts.primary as artifact}
																<button type="button" on:click={() => openArtifactDetail(artifact)} class="artifactImgContainer">
																	<img draggable="false" src="{$Artifacts[artifact].image}" alt="{$Artifacts[artifact].name}">
																	<p>{$Artifacts[artifact].name}</p>
																</button>
															{/each}
														</div>
													</div>
													{#if openComp.heroes[selectedHero].artifacts.secondary.length > 0}
														<div class="artifactLine secArtifactLine">
															<h6>Secondary</h6>
															<div class="artifactArea">
																{#each openComp.heroes[selectedHero].artifacts.secondary as artifact}
																	<button type="button" on:click={() => openArtifactDetail(artifact)} class="artifactImgContainer">
																		<img draggable="false" src="{$Artifacts[artifact].image}" alt="{$Artifacts[artifact].name}">
																		<p>{$Artifacts[artifact].name}</p>
																	</button>
																{/each}
															</div>
														</div>
													{/if}
													{#if openComp.heroes[selectedHero].artifacts.situational.length > 0}
														<div class="artifactLine sitArtifactLine">
															<h6>Situational</h6>
															<div class="artifactArea">
																{#each openComp.heroes[selectedHero].artifacts.situational as artifact}
																	<button type="button" on:click={() => openArtifactDetail(artifact)} class="artifactImgContainer">
																		<img draggable="false" src="{$Artifacts[artifact].image}" alt="{$Artifacts[artifact].name}">
																		<p>{$Artifacts[artifact].name}</p>
																	</button>
																{/each}
															</div>
														</div>
													{/if}
												</div>
											{/if}
										</div>
									</div>
								{:else}
									<TutorialBox noMargin={true}>
										<span>Select hero to see Ascension, SI, Furniture, and Artifact details.</span>
									</TutorialBox>
								{/if}
							</div>
						</div>
						<div class="subGroups">
							<div class="mobileExpanderTitle">
								<button type="button" class="expanderButton" on:click={() => openSubs = !openSubs}><i class="expanderArrow {openSubs ? 'down' : 'right' }"></i><span>Substitutes</span></button>
							</div>
							<div class="mobileExpander subGroupExpander" class:open={openSubs}>
								<div class="subDisplay">
									{#each openComp.subs as subgroup}
									<div class="subGroup">
										<div class="subGroupTitle"><span>{subgroup.name}</span></div>
										<div class="subGroupMembers">
											{#each subgroup.heroes as hero}
												<div class="subHeroContainer">
													<button type="button" class="heroButton">
														<div class="subImgContainer">
															<img draggable="false" on:click={() => handleHeroClick(hero)} class="subImg" class:claimed={$AppData.MH.List[hero].claimed} src={$HeroData.find(e => e.id === hero).portrait} alt={$HeroData.find(e => e.id === hero).name}>
															<span class="coreMark subCoreMark" class:visible={openComp.heroes[hero].core}></span>
															<div class="ascMark subAscMark">
																{#if $HeroData.find(e => e.id === hero).tier === 'ascended'}
																	{#if openComp.heroes[hero].ascendLv >= 6}
																		<img src="./img/markers/ascended.png" alt="ascended">
																	{:else if openComp.heroes[hero].ascendLv >= 4}
																		<img src="./img/markers/mythic.png" alt="mythic">
																	{:else if openComp.heroes[hero].ascendLv >= 2}
																		<img src="./img/markers/legendary.png" alt="legendary">
																	{:else}
																		<img src="./img/markers/elite.png" alt="elite">
																	{/if}
																{:else}
																	{#if openComp.heroes[hero].ascendLv >= 4}
																		<img src="./img/markers/legendary.png" alt="legendary">
																	{:else if openComp.heroes[hero].ascendLv >= 2}
																		<img src="./img/markers/elite.png" alt="elite">
																	{:else}
																		<img src="./img/markers/rare.png" alt="rare">
																	{/if}
																{/if}
																{#if openComp.heroes[hero].si >= 30}
																	<img src="./img/markers/si30.png" alt="si30">
																{:else if openComp.heroes[hero].si >= 20}
																	<img src="./img/markers/si20.png" alt="si20">
																{:else if openComp.heroes[hero].si >= 10}
																	<img src="./img/markers/si10.png" alt="si10">
																{:else}
																	<img src="./img/markers/si0.png" alt="si0">
																{/if}
																{#if openComp.heroes[hero].furn >= 9}
																	<img class:moveup={openComp.heroes[hero].si < 10} src="./img/markers/9f.png" alt="9f">
																{:else if openComp.heroes[hero].furn >= 3}
																	<img class:moveup={openComp.heroes[hero].si < 10} src="./img/markers/3f.png" alt="3f">
																{/if}
															</div>
														</div>
														<p on:click={() => handleHeroClick(hero)}>{$HeroData.find(e => e.id === hero).name}</p>
													</button>
												</div>
											{/each}
										</div>
									</div>
									{/each}
								</div>
							</div>
						</div>
					</div>
				</div>
			{:else}
				<div class="noSelectedComp">
					<div class="noSelectedCompText">
						<span>&#8678; Select a Comp</span>
					</div>
				</div>
			{/if}
		</div>
	</section>
	<section class="sect3" class:visible={showowConfirm}>
		{#if showowConfirm}
			<div class="owBackground">
				<div class="owConfirmWindow">
					<div class="owTitle">
						<h4>Previous Comp Found</h4>
					</div>
					<div class="owBody">
						<span>{owText}</span>
					</div>
					<div class="owFooter">
						<button type="button" class="owFooterButton owUpdate" on:click={owPromise('update')}>Update</button>
						<button type="button" class="owFooterButton owNew" on:click={owPromise('new')}>New</button>
						<button type="button" class="owFooterButton owCancel" on:click={owPromise('cancel')}>Cancel</button>
					</div>
				</div>
			</div>
		{/if}
	</section>
</div>

<style lang="scss">
	img {
		user-select: none;
	}
	.CompContainer {
		display: flex;
		flex-direction: row;
	}
	.sect1 {
		display: flex;
		flex-direction: column;
		height: 100%;
		height: calc(var(--vh, 1vh) * 100 - var(--headerHeight)); /* gymnastics to set height for mobile browsers */
		width: 100%;
	}
	.sect2 {
		height: 100%;
		height: calc(var(--vh, 1vh) * 100 - var(--headerHeight)); /* gymnastics to set height for mobile browsers */
	}
	.sect3 {
		display: block;
		height: 100%;
		left: 0;
		position: fixed;
		top: 0;
		width: 100%;
		visibility: hidden;
		z-index: 1001;
		&.visible {
			visibility: visible;
		}
	}
	.owBackground {
		align-items: center;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		flex-direction: column;
		height: 100%;
		justify-content: center;
		width: 100%;
	}
	.owConfirmWindow {
		background-color: var(--appBGColor);
		border-radius: 10px;
		padding: 10px;
	}
	.owTitle {
		display: flex;
		justify-content: center;
		padding: 10px;
		h4 {
			margin: 0;
		}
	}
	.owBody {
		padding: 10px;
	}
	.owFooter {
		display: flex;
		justify-content: flex-end;
		padding-top: 10px;
	}
	.owFooterButton {
		background-color: transparent;
		border: 3px solid var(--appColorPrimary);
		border-radius: 10px;
		color: var(--appColorPrimary);
		margin-right: 10px;
		outline: none;
		padding: 5px;
		&:last-child {
			margin-right: 0;
		}
	}
	.searchArea {
		align-items: center;
		background-color: var(--appBGColorDark);
		border-bottom: 3px solid var(--appColorPrimary);
		display: flex;
		flex-direction: column;
		height: 65px;
		padding: 5px 10px;
		position: relative;
		justify-content: center;
		.searchBox {
			border: 1px solid var(--appColorPrimary);
			border-radius: 5px;
			font-size: 1.1rem;
			outline: none;
			width: 100%;
			&:focus {
				box-shadow: 0 0 0 2px var(--appColorPrimary);
			}
		}
		.suggestions {
			background-color: white;
			border: 1px solid var(--appColorPrimary);
			border-radius: 0px 0px 10px 10px;
			border-top: 0;
			box-shadow: 0 0 10px rgba(0, 0, 0, 0.25);
			display: flex;
			flex-direction: column;
			opacity: 0;
			position: absolute;
			top: 30px;
			transition: all 0.2s;
			visibility: hidden;
			width: 80%;
			z-index: 1;
			.suggestionButton {
				background: transparent;
				border: 0;
				border-bottom: 1px solid var(--appColorPrimary);
				color: var(--appColorPrimary);
				cursor: pointer;
				font-size: 1rem;
				outline: 0;
				user-select: none;
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
		.hiddenToggleArea {
			align-items: center;
			display: flex;
			justify-content: flex-end;
			padding-top: 3px;
			width: 100%;
			span {
				font-size: 0.9rem;
			}
		}
	}
	.compScroller {
		background-color: var(--appBGColorDark);
		height: calc(100vh - var(--headerHeight) - 40px - 80px);
		overflow-x: hidden;
		overflow-y: auto;
		padding: 5px;
		padding-bottom: 0px;
		position: relative;
		scroll-behavior: smooth;
	}
	.noComps {
		bottom: 30%;
		color: rgba(100, 100, 100, 0.3);
		font-size: 3rem;
		font-weight: bold;
		left: 0;
		position: absolute;
		text-align: center;
		text-transform: uppercase;
		width: 100%;
		user-select: none;
	}
	.noComps.noSearch {
		top: 0;
	}
	.addButtonArea {
		bottom: 0;
		height: 80px;
		left: 0;
		width: 100%;
	}
	.plusIcon {
		display: block;
		font-size: 2rem;
		font-weight: bold;
		margin: 0 auto;
		transition: transform 0.7s;
		width: fit-content;
	}
	.newCompOptionsArea {
		background-color: var(--appColorPrimary);
		display: flex;
		flex-direction: row;
		height: 80px;
		width: 100%;
	}
	.newCompOptionButton {
		background-color: transparent;
		border: 0;
		color: white;
		cursor: pointer;
		font-size: 1.1rem;
		width: 100%;
		&:first-child {
			border-right: 3px solid var(--appColorPriAccent);
		}
		&:last-child {
			border-left: 3px solid var(--appColorPriAccent);
		}
		.imgContainer {
			align-items: center;
			display: flex;
			height: 37px;
			justify-content: center;
		}
		img {
			max-width: 20px;
		}
		span {
			display: block;
		}
	}
	.noSelectedComp {
		display: none;
		visibility: hidden;
	}
	.compDetails {
		background-color: var(--appBGColor);
		display: flex;
		flex-direction: column;
		height: calc(var(--vh, 1vh) * 100 - var(--headerHeight)); /* gymnastics to set height for mobile browsers */
		max-width: 0px;
		overflow-x: hidden;
		overflow-y: hidden;
		position: fixed;
		right: 0;
		scroll-behavior: smooth;
		top: var(--headerHeight);
		transition: all 0.3s ease-out;
		visibility: hidden;
	}
	.compDetails.open {
		max-width: 100%;
		overflow-y: auto;
		padding: 10px;
		width: 100%;
		visibility: visible;
	}
	.compDetailHead {
		align-items: center;
		display: flex;
		flex-direction: row;
		position: relative;
		width: 100%;
	}
	.closeButtonContainer {
		width: 25%;
	}
	.closeDetailButton {
		align-items: center;
		background-color: transparent;
		border: 3px solid var(--appColorPrimary);
		border-radius: 5px;
		color: var(--appColorPrimary);
		cursor: pointer;
		display: flex;
		font-size: 1.0rem;
		justify-content: center;
		margin: 5px 10px;
		padding: 3px;
	}
	.arrow {
		border: solid var(--appColorPrimary);
		border-width: 0 3px 3px 0;
		display: inline-block;
		margin: 0px 5px;
		padding: 3px;
	}
	.left {
		transform: rotate(135deg);
	}
	.titleContainer {
		align-items: center;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		justify-content: center;
		width: 50%;
	}
	.compTitle {
		display: inline-block;
		font-size: 1.5rem;
		margin: 0;
		overflow: hidden;
		text-align: center;
		text-overflow: ellipsis;
		white-space: nowrap;
		width: 100%;
	}
	.authorTitle {
		display: inline-block;
		font-size: 0.9rem;
		margin: 0;
		overflow: hidden;
		text-align: center;
		text-overflow: ellipsis;
		white-space: nowrap;
		width: 100%;
	}
	.editMenuButton {
		align-items: center;
		border: 3px solid var(--appColorPrimary);
		border-radius: 10px;
		color: var(--appColorPrimary);
		cursor: pointer;
		display: flex;
		flex-direction: column;
		height: 40px;
		justify-content: center;
		margin-left: auto;
		padding: 0;
		transition: all 0.2s;
		width: 40px;
		.filledCircle {
			background-color: var(--appColorPrimary);
			border-radius: 50%;
			height: 5px;
			margin: 2px;
			max-height: 5px;
			min-height: 5px;
			max-width: 5px;
			min-width: 5px;
			width: 5px;
		}
		&.open {
			background-color: var(--appColorPrimary);
			.filledCircle {
				background-color: var(--appBGColor);
			}
		}
	}
	.editContainer {
		align-items: center;
		background-color: var(--appBGColor);
		border-radius: 10px;
		border-top-right-radius: 0px;
		box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.25);
		display: flex;
		flex-direction: column;
		justify-content: center;
		opacity: 0;
		padding: 5px;
		position: absolute;
		right: 13px;
		bottom: -315px;
		visibility: hidden;
		transition: all 0.2s;
		&:after {
			content: " ";
			position: absolute;
			right: 0px;
			top: -6px;
			border-top: none;
			border-right: 6px solid transparent;
			border-left: 6px solid transparent;
			border-bottom: 6px solid var(--appBGColor);
		}
		&.open {
			opacity: 1;
			visibility: visible;
		}
		.editDelButton {
			align-items: center;
			background-color: var(--appColorPrimary);
			border: 3px solid var(--appColorPrimary);
			border-radius: 5px;
			color: white;
			cursor: pointer;
			display: flex;
			flex-direction: row;
			font-size: 0.9rem;
			height: fit-content;
			justify-content: center;
			margin: 5px;
			height: 40px;
			width: 40px;
			span {
				display: none;
			}
			&:active {
				box-shadow: none;
			}
			img {
				max-width: 20px;
			}
			&.deleteButton {
				background-color: var(--appDelColor);
				border: 3px solid var(--appDelColor);
			}
			&:disabled {
				background-color: var(--appColorDisabled);
				border-color: var(--appColorDisabled);
				cursor: not-allowed;
			}
		}
	}
	.deleteButton {
		background-color: var(--appDelColor);
		border: 3px solid var(--appDelColor);
		img {
			max-width: 16px;
		}
	}
	.tagsArea {
		display: flex;
		flex-direction: column;
		width: 100%;
	}
	.iconsArea {
		align-items: center;
		display: flex;
		justify-content: center;
		padding-top: 3px;
		width: 100%;
		.iconList {
			display: flex;
			justify-content: center;
			list-style-type: none;
			margin: 0;
			padding: 0;
			li {
				padding: 0px 3px;
			}
			img {
				max-width: 20px;
				filter: invert(1.0);
			}
		}
	}
	.viewExploreContainer {
		border-bottom: 1px solid black;
		display: flex;
		justify-content: center;
		padding-bottom: 10px;
		width: 100%;
		.viewExploreButton {
			background-color: var(--appColorPrimary);
			border: 2px solid var(--appColorPrimary);
			border-radius: 7px;
			color: var(--appBGColor);
			cursor: pointer;
			display: none;
			outline: none;
			padding: 5px;
			text-align: center;
			&.visible {
				display: block;
			}
		}
	}
	.tagDisplay {
		align-items: center;
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: center;
		margin-bottom: 5px;
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
	}
	.compDetailBody {
		padding-top: 10px;
	}
	.lastUpdate {
		display: flex;
		justify-content: flex-end;
		padding-bottom: 10px;
	}
	.lineExamples {
		padding-bottom: 10px;
		width: 100%;
	}
	.lineSwitcher {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: center;
	}
	.lineSwitchButton {
		background-color: transparent;
		border: 2px solid var(--appColorPrimary);
		border-bottom: none;
		border-radius: 5px 5px 0px 0px;
		color: var(--appColorPrimary);
		cursor: pointer;
		font-size: 1.0rem;
		margin-right: 5px;
		max-width: 100px;
		min-height: 26px;
		min-width: 30px;
		overflow: hidden;
		padding: 3px;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.lineSwitchButton.active {
		background-color: var(--appColorPrimary);
		color: white;
	}
	.lineDisplay {
		align-items: center;
		border: 2px solid var(--appColorPrimary);
		border-radius: 10px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 10px;
		width: 100%;
	}
	.lineTitle {
		padding: 10px;
		font-size: 1.1rem;
		font-weight: bold;
		max-width: 300px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.lineMembers {
		align-items: center;
		border-radius: 10px;
		display: flex;
		flex-direction: row;
		justify-content: center;
		min-height: 295px;
		width: 100%;
	}
	.detailImgContainer {
		position: relative;
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
	.heroButton {
		background: transparent;
		border: none;
		cursor: pointer;
		margin: 0;
		outline: none;
		padding: 0;
	}
	.heroNameButton {
		background: transparent;
		border: none;
		cursor: pointer;
		margin: 0;
		outline: none;
		padding: 0;
	}
	.lineImg {
		border-radius: 50%;
		cursor: pointer;
		margin: 5px;
		max-width: 70px;
	}
	.lineImg.claimed {
		border: 5px solid var(--appColorPrimary);
	}
	.emptyLineSlot {
		background: transparent;
		border: 3px solid var(--appColorPriAccent);
		border-radius: 50%;
		flex-grow: 0;
		flex-shrink: 0;
		height: 70px;
		margin: 5px;
		width: 70px;
	}
	.expanderButton {
		background-color: var(--appColorSecondary);
		border: none;
		color: black;
		cursor: pointer;
		font-size: 1.1rem;
		outline: none;
		padding: 10px;
		text-align: left;
		width: 100%;
	}
	.expanderArrow {
		border: solid black;
		border-width: 0 3px 3px 0;
		display: inline-block;
		margin-right: 16px;
		padding: 3px;
		transition: transform 0.2s ease-out;
	}
	.expanderArrow.right {
		transform: rotate(-45deg);
	}
	.expanderArrow.down {
		transform: rotate(45deg);
	}
	.selectHeroSection {
		width: 100%;
	}
	#heroDetailSection {
		scroll-snap-align: center;
	}
	.selectedHero {
		border: 2px solid var(--appColorPrimary);
		border-radius: 10px;
		display: flex;
		flex-direction: column;
		margin: 0 auto;
		padding: 10px;
		width: 100%;
	}
	.upperSelectCard {
		align-items: center;
		display: flex;
		flex-direction: row;
		justify-content: center;
		width: 100%;
	}
	.siFurnBoxContainer {
		margin-bottom: 50px;
	}
	.selectPortraitArea {
		align-items: center;
		display: flex;
		flex-direction: column;
		padding: 0px 10px;
	}
	.portraitContainer {
		cursor: pointer;
		position: relative;
		+ {
			p {
				font-size: 1.1rem;
				font-weight: bold;
				margin: 0;
				margin-bottom: 5px;
				margin-top: -8px;
				text-align: center;
			}
		}
	}
	.selectHeroPortrait {
		border-radius: 50%;
		margin-bottom: 5px;
		max-width: 80px;
	}
	.selectHeroPortrait.claimed {
		border: 5px solid var(--appColorPrimary);
	}
	.coreMark {
		background-color: var(--legendColor);
		border: 3px solid var(--appBGColor);
		border-radius: 50%;
		bottom: 5px;
		display: none;
		height: 22px;
		position: absolute;
		right: 4px;
		visibility: hidden;
		width: 22px;
	}
	.coreMark.visible {
		display: inline-block;
		pointer-events: none;
		visibility: visible;
	}
	.ascMark {
		left: -6px;
		position: absolute;
		top: 3px;
		img {
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
	.subAscMark {
		top: -4px;
		left: -10px;
	}
	.lowerSelectCard {
		align-items: center;
		display: flex;
		flex-direction: column;
		justify-content: center;
		margin-top: 5px;
		width: 100%;
	}
	.ascendBoxContainer {
		margin-bottom: 10px;
	}
	.heroNotesArea {
		width: 100%;
		margin: 10px 0px;
		.heroNotes {
			background-color: var(--appBGColorDark);
			border-radius: 10px;
			padding: 10px;
		}
	}
	.artifactsContainer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		width: 100%;
		h5 {
			font-size: 1rem;
			margin: 0;
			text-align: center;
		}
	}
	.artifactLine {
		h6 {
			font-size: 0.9rem;
			margin: 0;
			margin-top: 7px;
			margin-bottom: 3px;
		}
	}
	.artifactArea {
		background: var(--appBGColorDark);
		border-radius: 10px;
		display: grid;
		grid-template-columns: repeat(auto-fill, 90px);
		min-height: 80px;
		padding: 5px;
		width: 100%;
	}
	.artifactImgContainer {
		align-items: center;
		background: transparent;
		border: none;
		cursor: pointer;
		display: flex;
		flex-direction: column;
		justify-content: center;
		outline: none;
		padding: 3px;
		img {
			border-radius: 50%;
			max-width: 60px;
		}
		p {
			margin: 0;
			max-width: 80px;
			overflow: hidden;
			text-align: center;
			text-overflow: ellipsis;
			user-select: none;
			white-space: nowrap;
		}
	}
	.subDisplay {
		display: flex;
		flex-direction: column;
		padding: 10px 0px;
		padding-top: 0;
		width: 100%;
	}
	.subGroupTitle {
		border-bottom: 2px solid black;
		font-size: 1.1rem;
		font-weight: bold;
		padding-bottom: 3px;
		padding-top: 5px;
		width: 100%;
		span {
			display: inline-block;
			width: 100%;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
		&:first-child {
			padding-top: 0;
		}
	}
	.subGroupMembers {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		padding: 5px;
		width: 100%;
	}
	.subHeroContainer {
		margin-right: 8px;
		margin-bottom: 8px;
		p {
			font-size: 0.9rem;
			font-weight: bold;
			margin: 0;
			width: 80px;
			overflow: hidden;
			text-align: center;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	}
	.subImgContainer {
		position: relative;
	}
	.subImg {
		border-radius: 50%;
		max-width: 70px;
	}
	.subImg.claimed {
		border: 5px solid var(--appColorPrimary);
	}
	.subCoreMark {
		bottom: 0px;
		right: -1px;
	}
	.mobileExpander {
		margin-bottom: 10px;
		max-height: 0px;
		overflow: hidden;
		transition: all 0.2s ease-out;
	}
	.mobileExpander.open {
		max-height: 5000px;
		padding-top: 10px;
	}
	.descSection.open {
		padding-left: 5px;
	}
	/* description markdown styling */
	.descText {
		:global(hr) {
			border: 1px solid var(--appColorPrimary);
			margin: 5px 0px;
		}
		:global(p) {
			line-height: 160%;
			margin: 5px 0px;
		}
		:global(a) {
			color: var(--appColorPrimary);
		}
		:global(ul) {
			margin: 10px 0px;
			padding-left: 24px;
		}
		:global(ol) {
			margin: 10px 0px;
			padding-left: 24px;
		}
		:global(h1) {
			margin: 10px 0px;
			font-size: 1.7rem;
		}
		:global(h2) {
			margin: 10px 0px;
		}
		:global(h3) {
			margin: 10px 0px;
		}
		:global(h4) {
			margin: 5px 0px;
		}
		:global(h5) {
			margin: 5px 0px;
		}
		:global(h6) {
			margin: 5px 0px;
		}
		:global(blockquote) {
			border-left: 5px solid var(--appColorPriOpaque);
			color: #999;
			margin-left: 20px;
			padding-left: 5px;
		}
		:global(pre) {
			background-color: var(--appBGColorDark);
			color: black;
			font-family: 'Courier New', Courier, monospace;
			font-size: 1.0rem;
			padding: 10px;
			white-space: break-spaces;
		}
		:global(table) {
			border-collapse: collapse;
		}
		:global(th) {
			border-bottom: 2px solid var(--appColorPrimary);
			padding-top: 7px;
			padding-bottom: 7px;
			padding-right: 20px;
			text-align: left;
		}
		:global(td) {
			border-bottom: 1px solid black;
			padding-top: 7px;
			padding-bottom: 7px;
		}
		:global(tr) {
			&:nth-child(even) {
				background-color: var(--appColorPriOpaque);
			}
		}
		:global(img) {
			max-width: 100px;
		}
	}
	@media only screen and (min-width: 767px) {
		.sect1 {
			max-width: 375px;
			width: 21%;
		}
		.sect2 {
			width: 79%;
		}
		.owFooterButton {
			&:hover {
				background-color: var(--appColorPrimary);
				color: white;
			}
		}
		.owCancel {
			&:hover {
				background-color: var(--appColorPriAccent);
			}
		}
		.searchArea {
			border-right: 3px solid var(--appColorPrimary);
		}
		.compScroller {
			border-right: 3px solid var(--appColorPrimary);
		}
		.noComps {
			font-size: 2.5rem;
		}
		.newCompOptionsArea {
			max-width: 375px;
		}
		.compDetails {
			max-width: 100%;
			padding: 10px;
			position: static;
			overflow-y: auto;
			visibility: visible;
		}
		.closeButtonContainer {
			visibility: hidden;
			width: 25%;
		}
		.titleContainer {
			width: 50%;
		}
		.editContainer {
			align-items: flex-end;
			bottom: -286px;
			.exportButton {
				display: flex;
			}
			.editDelButton {
				height: fit-content;
				width: fit-content;
				padding: 6px;
				span {
					display: block;
				}
				img {
					margin-right: 8px;
					max-width: 15px;
				}
			}
			.deleteButton {
				img {
					max-width: 12px;
				}
			}
		}
		.newCompOptionButton {
			&:hover {
				background-color: var(--appColorPriAccent);
				.plusIcon {
					transform: rotateZ(180deg);
				}
			}
		}
		.bodyArea1 {
			display: flex;
		}
		.bodyArea2 {
			display: flex;
		}
		.noSelectedComp {
			color: rgba(100, 100, 100, 0.3);
			display: block;
			font-size: 4rem;
			font-weight: bold;
			height: 100%;
			text-transform: uppercase;
			user-select: none;
			visibility: visible;
		}
		.closeDetailButton {
			&:hover {
				background-color: var(--appColorPrimary);
				color: white;
				.arrow {
					border-color: white;
				}
			}
		}
		.lastUpdate {
			padding-bottom: 0px;
		}
		.lineExamples {
			flex-grow: 0;
			flex-shrink: 0;
			margin-right: 10px;
			width: 340px;
		}
		.lineSwitcher {
			display: flex;
			flex-direction: row;
			justify-content: flex-start;
		}
		.lineSwitchButton {
			margin-right: 0px;
		}
		.lineDisplay {
			border-radius: 0px 10px 10px 10px;
			max-height: 375px;
			min-height: 375px;
		}
		.lineImg {
			transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 0);
			&:hover {
				transform: scale(1.1);
			}
		}
		.description {
			width: 100%;
		}
		.heroDetails {
			flex-grow: 0;
			flex-shrink: 0;
			margin-right: 10px;
		}
		.selectHeroSection {
			margin: 0;
			padding: 0;
			width: 340px;
		}
		.selectedHero {
			margin: 0;
			width: 340px;
		}
		.expanderButton {
			display: none;
		}
		.mobileExpander {
			max-height: 5000px;
			padding: 0;
		}
		.mobileExpander.open {
			padding: 0;
		}
		.mobileExpander.descSection {
			border: 2px solid var(--appColorPrimary);
			border-radius: 10px 0px 0px 10px;
			margin-top: 27px;
			max-height: 375px;
			overflow-y: auto;
			padding: 10px;
		}
		.subGroups {
			width: 100%;
		}
		.subDisplay {
			display: grid;
			grid-gap: 5px 20px;
			grid-template-columns: repeat(auto-fit, minmax(310px, 1fr));
			grid-template-rows: repeat(auto-fit, minmax(95px, 1fr));
			justify-content: space-evenly;
			margin-top: -4px;
			overflow: hidden;
			padding: 0;
		}
		.subImg {
			transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 0);
			&:hover {
				transform: scale(1.1);
			}
		}
		.subGroupTitle {
			padding-top: 0;
		}
	}
</style>
