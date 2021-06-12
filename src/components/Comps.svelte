<script>
	import { onMount, getContext, createEventDispatcher, tick } from 'svelte';
	import MarkdownIt from 'markdown-it';
	import Emoji from 'markdown-it-emoji';
	import AppData from '../stores/AppData.js';
	import HeroData from '../stores/HeroData.js';
	import Artifacts from '../stores/Artifacts.js';
	import Confirm from '../modals/Confirm.svelte';
	import ImportData from '../modals/ImportData.svelte';
	import HeroDetail from '../modals/HeroDetail.svelte';
	import ModalCloseButton from '../modals/ModalCloseButton.svelte';
	import CompEditor from '../modals/CompEditor.svelte';
	import ArtifactDtail from '../modals/ArtifactDetail.svelte';
	import SIFurnBox from '../shared/SIFurnBox.svelte';
	import TutorialBox from '../shared/TutorialBox.svelte';
	import AscendBox from '../shared/AscendBox.svelte';

	const months = ["Jan", "Feb", "Mar","Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",];
	const dispatch = createEventDispatcher();
	const { open } = getContext('simple-modal');
	const md = new MarkdownIt({
		html: false,
		linkify: false,
		typographer: true,
		breaks: true,
	});
	md.use(Emoji);

	$: sortedCompList = $AppData.Comps.sort(sortByStars);
	$: highlightComp = null;

	let openDetail = false;
	let openNewCompOptions = false;
	let openDesc = true;
	let openHero = false;
	let openSubs = false;
	let selectedLine = 0;
	let selectedHero = '';
	let copyConfirmVisible = false;
	let editorWidth = window.matchMedia("(max-width: 767px)").matches ? '100%' : '75%';

	onMount(async () => {
		const mediaListener = window.matchMedia("(max-width: 767px)");
		mediaListener.addListener(() => adjustEditorWidth(mediaListener));
	});

	function adjustEditorWidth(listener) {
		if(listener.matches) {
			editorWidth = '100%';
		} else {
			editorWidth = '75%';
		}
	}

	function sortByStars(a, b) {
		if(a.starred && !b.starred) {
			return -1;
		} else if(!a.starred && b.starred) {
			return 1;
		} else {
			return 0;
		}
	}

	function handleCompCardClick(compIdx) {
		$AppData.selectedComp = compIdx;
		openDetail = true;
		selectedLine = 0;
		selectedHero = '';
		dispatch('saveData');
	}

	function renderMarkdown(mdText) {
		return md.render(mdText);
	}

	function handleEditButtonClick(compIdx) {
		open(CompEditor,
				{compID: $AppData.Comps[compIdx].uuid,
				 onSuccess: () => { sortedCompList = $AppData.Comps.sort(sortByStars); dispatch('saveData'); }},
				{ closeButton: ModalCloseButton,
					styleContent: {background: '#F0F0F2', padding: 0, borderRadius: '10px',},
					styleWindow: {width: editorWidth,},
				});
	}

	function handleDeleteButtonClick(compIdx) {
		open(Confirm,
				{onConfirm: handleDelComp, confirmData: compIdx, message: `Delete comp named ${$AppData.Comps[compIdx].name}?`},
				{closeButton: false,
				 closeOnEsc: false,
				 closeOnOuterClick: false,
				 styleWindow: { width: 'fit-content', },
				 styleContent: { width: 'fit-content', },
				});
	}

	function handleImportButtonClick() {
		open(ImportData, 
		{ dataHandler: handleCompImport,
			saveAppData: () => dispatch('saveData'),
		},
		{ closeButton: ModalCloseButton,
			styleContent: {background: '#F0F0F2', padding: 0, borderRadius: '10px'},
		});
		openNewCompOptions = false;
	}

	function handleExportButtonClick(compIdx) {
		navigator.clipboard.writeText(LZUTF8.encodeBase64(LZUTF8.compress(JSON.stringify($AppData.Comps[compIdx])))).then(() => {
			copyConfirmVisible = true;
			setTimeout(() => copyConfirmVisible = false, 1000);
		}, () => {
			throw new Error("Error copying Comp data to clipboard.");
		});
	}

	function handleNewButtonClick() {
		open(CompEditor,
				{onSuccess: () => { sortedCompList = $AppData.Comps.sort(sortByStars); dispatch('saveData'); }},
				{ closeButton: ModalCloseButton,
					closeOnOuterClick: false,
					styleContent: {background: '#F0F0F2', padding: 0, borderRadius: '10px',},
					styleWindow: {width: editorWidth,},
				});
		openNewCompOptions = false;
	}

	function handleStarClick(event, comp) {
		comp.starred = !comp.starred;
		event.stopPropagation();
		sortedCompList = $AppData.Comps.sort(sortByStars);
		dispatch('saveData');
	}

	function handleCardChange(event) {
		if(event.keyCode === 13 || event.keyCode === 27) event.target.blur();
	}

	function handleDelComp(idx) {
		$AppData.Comps = $AppData.Comps.filter((e, i) => i !== idx);
		sortedCompList = $AppData.Comps.sort(sortByStars);
		if($AppData.selectedComp === idx) {
			$AppData.selectedComp = null;
			selectedHero = '';
			selectedLine = 0;
			openDetail = false;
		} else if($AppData.selectedComp > idx) {
			$AppData.selectedComp--;
			selectedLine = 0;
			selectedHero = sortedCompList[$AppData.selectedComp].lines[0].heroes[0];
		}
		dispatch('saveData');
	}

	async function handleCompImport(compressedData) {
		let data;

		// unpack and decompress data
		try {
			data = JSON.parse(LZUTF8.decompress(LZUTF8.decodeBase64(compressedData)));
			// JSON doesn't parse date objects correctly, so need to re-initialize them
			if('lastUpdate' in data) data.lastUpdate = new Date(data.lastUpdate);
		} catch(e) {
			// there was a problem unpacking the data, return an error
			console.log(e);
			return {retCode: 1, message: 'Failed to parse data'};
		}

		// run consistency checks on data
		const returnObj = await validateComp(data);
		if(returnObj.retCode !== 0) {
			// validation error occurred
			return {retCode: returnObj.retCode, message: returnObj.message};
		} else {
			// message should contain a clean comp object now
			if($AppData.Comps.some(e => e.uuid === data.uuid)) {
				// update existing comp
				const idx = $AppData.Comps.findIndex(e => e.uuid === data.uuid);
				$AppData.Comps[idx] = data;
			} else {
				// new comp, add it to the list
				$AppData.Comps.push(returnObj.message);
			}
			sortedCompList = $AppData.Comps.sort(sortByStars);
			highlightComp = sortedCompList.findIndex(e => e.uuid === returnObj.message.uuid);
			$AppData.selectedComp = highlightComp;
			selectedHero = '';
			selectedLine = 0;
			openNewCompOptions = false;
			await tick();
			document.getElementById(`comp${highlightComp}`).scrollIntoView();
			setTimeout(() => highlightComp = null, 3000);
			dispatch('saveData');
			return { retCode: 0, message: 'Data import successful' };
		}
	}

	function handleHeroDetailClick(heroID) {
		open(HeroDetail, 
		{ heroID: heroID, },
		{ closeButton: ModalCloseButton,
			styleContent: {background: '#F0F0F2', padding: 0, borderRadius: '10px'},
		});
	}

	function openArtifactDetail(artifactID) {
		open(ArtifactDtail, 
		{ artifactID: artifactID, },
		{ closeButton: ModalCloseButton,
			styleContent: {background: '#F0F0F2', padding: 0, borderRadius: '10px'},
		});
	}
</script>

<div class="CompContainer">
	<section class="sect1">
		<div class="compScroller">
			{#if sortedCompList.length === 0}
				<div class="noComps">
					<span>Add or Import a New Comp</span>
					<div class="noCompsArrow">
						<span>&#8681;</span>
					</div>
				</div>
			{:else}
				{#each sortedCompList as comp, i}
					<div id="comp{i}" class="compCard" class:highlight={highlightComp !== null && highlightComp === i} on:click={() => handleCompCardClick(i) }>
						<div class="compCardHead">
							<div class="titleAuthorContainer">
								<input type="text" class="compCardTitle" readonly="true" on:dblclick={(e) => { e.target.readOnly = ''; e.stopPropagation(); }} on:blur={(e) => { e.target.readOnly='true'; dispatch('saveData'); }} bind:value={comp.name} on:keydown={handleCardChange}>
								<div class="authorContainer">
									<span class="author">{comp.author}</span>
								</div>
							</div>
							<button class="cardDeleteButton" on:click={(e) => { handleDeleteButtonClick(i); e.stopPropagation(); }}><img class="deleteIcon" src="./img/utility/trashcan.png" alt="Delete"></button>
							<div class="tooltip deleteTooltip"><span class="tooltipText">Delete</span></div>
							<button class="cardExportButton" on:click={(e) => { handleExportButtonClick(i); e.stopPropagation(); }}><img class="exportIcon" src="./img/utility/export.png" alt="Export"></button>
							<div class="tooltip exportTooltip"><span class="tooltipText">Export</span></div>
							<i class="star" class:active={comp.starred} on:click={(e) => handleStarClick(e, comp)}></i>
						</div>
						<div class="compImgs">
							{#each comp.lines[0].heroes as hero,i}
								<img class="compCardImg" class:claimed={$AppData.MH.List[hero].claimed} src={$HeroData.find(e => e.id === hero).portrait} alt={$HeroData.find(e => e.id === hero).name}>
							{/each}
						</div>
					</div>
				{/each}
			{/if}
		</div>
		<div class="addButtonArea">
			<button class="newCompButton" class:open={!openNewCompOptions} on:click={() => openNewCompOptions = !openNewCompOptions}>
				<span class="plusIcon">+</span><span class="newCompText">Add</span>
			</button>
			<div class="newCompOptionsArea" class:open={openNewCompOptions}>
				<button class="newCompOptionButton" on:click={handleImportButtonClick}><span>Import</span></button>
				<button class="newCompOptionButton" on:click={handleNewButtonClick}><span>New</span></button>
				<button class="newCompOptionButton" on:click={() => openNewCompOptions = !openNewCompOptions}><span>Back</span></button>
			</div>
		</div>
	</section>
	<section class="sect2">
		<div class="compDetails" class:open={openDetail}>
			{#if $AppData.selectedComp !== null}
				<div class="compDetailHead">
					<div class="closeButtonContainer">
						<button class="detailButton closeDetailButton" on:click={() => openDetail = false}><i class="arrow left"></i>Close</button>
					</div>
					<div class="titleContainer">
						<h3 class="compTitle">{$AppData.Comps[$AppData.selectedComp].name}</h3>
						<p class="authorTitle">{$AppData.Comps[$AppData.selectedComp].author}</p>
					</div>
					<div class="editContainer">
						<button class="editDelButton exportButton" on:click={() => handleExportButtonClick($AppData.selectedComp)}><img src="./img/utility/export.png" alt="Export"><span>Export</span></button>
						<button class="editDelButton editButton" on:click={() => handleEditButtonClick($AppData.selectedComp)}><img src="./img/utility/pencil.png" alt="Edit"><span>Edit</span></button>
						<button class="editDelButton deleteButton" on:click={() => handleDeleteButtonClick($AppData.selectedComp)}><img src="./img/utility/trashcan.png" alt="Delete"><span>Delete</span></button>
					</div>
				</div>
				<div class="compDetailBody">
					<div class="lastUpdate">
						<span>Updated: {`${months[$AppData.Comps[$AppData.selectedComp].lastUpdate.getMonth()]} ${$AppData.Comps[$AppData.selectedComp].lastUpdate.getDate()}, ${$AppData.Comps[$AppData.selectedComp].lastUpdate.getFullYear()}`}</span>
					</div>
					<div class="bodyArea1">
						<div class="lineExamples">
							<div class="lineSwitcher">
								{#each $AppData.Comps[$AppData.selectedComp].lines as line, i}
								<button class="lineSwitchButton" class:active={selectedLine === i} on:click={() => selectedLine = i}>{line.name}</button>
								{/each}
							</div>
							<div class="lineDisplay">
								<div class="detailBackline">
									{#each $AppData.Comps[$AppData.selectedComp].lines[selectedLine].heroes as hero, i}
										{#if i >= 2}
										<div class="detailImgContainer">
											<a href="#heroDetailSection"><img on:click={() => { selectedHero = hero; openHero = true; }} class="lineImg" class:claimed={$AppData.MH.List[hero].claimed} src={$HeroData.find(e => e.id === hero).portrait} alt={$HeroData.find(e => e.id === hero).name}></a>
											<span class="coreMark" class:visible={$AppData.Comps[$AppData.selectedComp].heroes[hero].core}></span>
										</div>
										<a href="#heroDetailSection"><span on:click={() => { selectedHero = hero; openHero = true; }}>{$HeroData.find(e => e.id === hero).name}</span></a>
										{/if}
									{/each}
								</div>
								<div class="detailFrontline">
									{#each $AppData.Comps[$AppData.selectedComp].lines[selectedLine].heroes as hero, i}
										{#if i < 2}
											<div class="detailImgContainer">
												<a href="#heroDetailSection"><img on:click={() => { selectedHero = hero; openHero = true; }} class="lineImg" class:claimed={$AppData.MH.List[hero].claimed} src={$HeroData.find(e => e.id === hero).portrait} alt={$HeroData.find(e => e.id === hero).name}></a>
												<span class="coreMark" class:visible={$AppData.Comps[$AppData.selectedComp].heroes[hero].core}></span>
											</div>
											<a href="#heroDetailSection"><span on:click={() => { selectedHero = hero; openHero = true; }}>{$HeroData.find(e => e.id === hero).name}</span></a>
										{/if}
									{/each}
								</div>
							</div>
						</div>
						<div class="description">
							<div class="mobileExpanderTitle">
								<button class="expanderButton" on:click={() => openDesc = !openDesc}><i class="expanderArrow {openDesc ? 'down' : 'right' }"></i><span>Description</span></button>
							</div>
							<div class="mobileExpander descSection" class:open={openDesc}>
								<span class="descText">{@html renderMarkdown($AppData.Comps[$AppData.selectedComp].desc)}</span>
							</div>
						</div>
					</div>
					<div class="bodyArea2">
						<div class="heroDetails" id="heroDetailSection">
							<div class="mobileExpanderTitle">
								<button class="expanderButton" on:click={() => openHero = !openHero}><i class="expanderArrow {openHero ? 'down' : 'right' }"></i><span>Hero Info</span></button>
							</div>
							<div class="mobileExpander selectHeroSection" class:open={openHero}>
								{#if selectedHero !== ''}
									<div class="selectedHero">
										<div class="upperSelectCard">
											<div>
												<SIFurnBox type='si' num={sortedCompList[$AppData.selectedComp].heroes[selectedHero].si} maxWidth='50px' fontSize='1.2rem' />
											</div>
											<div class="selectPortraitArea">
												<div class="portraitContainer" on:click={() => handleHeroDetailClick(selectedHero)}>
													<img class="selectHeroPortrait" class:claimed={$AppData.MH.List[selectedHero].claimed} src="{$HeroData.find(e => e.id === selectedHero).portrait}" alt="{selectedHero}">
													<span class="coreMark" class:visible={sortedCompList[$AppData.selectedComp].heroes[selectedHero].core}></span>
												</div>
												<p>{$HeroData.find(e => e.id === selectedHero).name}</p>
											</div>
											<div>
												<SIFurnBox type='furn' num={sortedCompList[$AppData.selectedComp].heroes[selectedHero].furn} maxWidth='50px' fontSize='1.2rem' />
											</div>
										</div>
										<div class="lowerSelectCard">
											<div class="ascendBoxContainer">
												<AscendBox ascendLv="{$AppData.Comps[$AppData.selectedComp].heroes[selectedHero].ascendLv}" />
											</div>
											<div class="artifactsContainer">
												{#each sortedCompList[$AppData.selectedComp].heroes[selectedHero].artifact as artifact, i}
													<button on:click={() => openArtifactDetail(artifact)} class="artifactImgContainer">
														<img src="{$Artifacts[artifact].image}" alt="{$Artifacts[artifact].name}">
														<p>{$Artifacts[artifact].name}</p>
													</button>
													{#if i < sortedCompList[$AppData.selectedComp].heroes[selectedHero].artifact.length - 1}
														<span>&gt;</span>
													{/if}
												{/each}
											</div>
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
								<button class="expanderButton" on:click={() => openSubs = !openSubs}><i class="expanderArrow {openSubs ? 'down' : 'right' }"></i><span>Substitutes</span></button>
							</div>
							<div class="mobileExpander subGroupExpander" class:open={openSubs}>
								<div class="subDisplay">
									{#each $AppData.Comps[$AppData.selectedComp].subs as subgroup}
									<div class="subGroup">
										<div class="subGroupTitle"><span>{subgroup.name}</span></div>
										<div class="subGroupMembers">
											{#each subgroup.heroes as hero}
												<div class="subHeroContainer">
													<a href="#heroDetailSection">
														<img on:click={() => { selectedHero = hero; openHero = true; }} class="subImg" class:claimed={$AppData.MH.List[hero].claimed} src={$HeroData.find(e => e.id === hero).portrait} alt={$HeroData.find(e => e.id === hero).name}>
														<p on:click={() => { selectedHero = hero; openHero = true; }}>{$HeroData.find(e => e.id === hero).name}</p>
													</a>
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
				<div class="noComp">
					<TutorialBox noMargin={true}>
						<span>Select a comp to view details.</span>
					</TutorialBox>
				</div>
			{/if}
		</div>
	</section>
	<section class="sect3">
		<div class="copyConfirm" class:visible={copyConfirmVisible}><span>Comp Data Copied to Clipboard</span></div>
	</section>
</div>

<style>
	.CompContainer {
		display: flex;
		flex-direction: row;
	}
	.sect1 {
		height: 100%;
		width: 100%;
	}
	.sect2 {
		height: 100%;
	}
	.sect3 {
		left: 50%;
		position: fixed;
		top: 80px;
		transform: translate(-50%, 0);
		width: fit-content;
	}
	.copyConfirm {
		background-color: rgba(50, 50, 50, 0.7);
		border-radius: 10px;
		color: rgba(255, 255, 255, 0.7);
		display: none;
		opacity: 0;
		padding: 5px;
		transition: visibility 0.3s, opacity 0.3s;
		visibility: hidden;
	}
	.copyConfirm.visible {
		display: block;
		opacity: 1;
		visibility: visible;
	}
	.compScroller {
		background-color: var(--appBGColorDark);
		height: calc(100vh - 45px - 80px);
		overflow-x: hidden;
		overflow-y: auto;
		padding: 10px;
		padding-bottom: 0px;
		position: relative;
		scroll-behavior: smooth;
	}
	.noComps {
		bottom: 0;
		color: rgba(100, 100, 100, 0.3);
		font-size: 3rem;
		font-weight: bold;
		left: 0;
		position: absolute;
		text-align: center;
		width: 100%;
	}
	.compCard {
		background-color: var(--appBGColor);
		border: 3px solid var(--appColorPrimary);
		border-radius: 10px;
		cursor: pointer;
		margin-bottom: 10px;
		scroll-snap-align: center;
	}
	.compCard.highlight {
		animation: flash 1s linear 3;
	}
	.compCardHead {
		display: flex;
		justify-content: center;
		padding: 10px;
	}
	.titleAuthorContainer {
		width: 100%;
	}
	.compCardTitle:read-only {
		background: transparent;
		border: 0;
		font-size: 1.3rem;
		font-weight: bold;
		margin: 0;
		padding: 0;
		width: 80%;
	}
	.compCardTitle:focus {
		outline: none;
	}
	.compCardTitle {
		width: 80%;
	}
	.cardDeleteButton {
		background-color: transparent;
		border: 0;
		cursor: pointer;
		height: fit-content;
		margin: 0;
		margin-right: 12px;
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
		margin-right: 10px;
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
	.star:hover, .star:hover:before, .star:hover:after {
		border-bottom-color: #E0920B;
	}
	.star:active, .star:active:before, .star:active:after {
		border-bottom-color: #F7BC19;
	}
	.star.active:hover, .star.active:hover:before, .star.active:hover:after {
		border-bottom-color: #F7BC19;
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
	.addButtonArea {
		bottom: 0;
		left: 0;
		position: fixed;
		width: 100%;
	}
	.newCompButton {
		border: none;
		border-top: 3px solid var(--appColorPrimary);
		color: var(--appColorPrimary);
		cursor: pointer;
		display: none;
		height: 80px;
		transition: all 0.1s;
		width: 100%;
	}
	.newCompButton.open {
		align-items: center;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}
	.newCompButton:hover {
		background-color: var(--appColorPrimary);
		color: white;
	}
	.plusIcon {
		display: block;
		font-size: 2.5rem;
		font-weight: bold;
		transition: transform 0.7s;
	}
	.newCompButton:hover .plusIcon {
		transform: rotateZ(180deg);
	}
	.newCompText {
		font-size: 1.1rem;
		margin-bottom: 8px;
	}
	.newCompOptionsArea {
		background-color: var(--appColorPrimary);
		display: none;
		height: 80px;
		width: 100%;
	}
	.newCompOptionsArea.open {
		display: flex;
		flex-direction: row;
		visibility: visible;
	}
	.newCompOptionButton {
		background-color: transparent;
		border: 0;
		color: white;
		cursor: pointer;
		font-size: 1.1rem;
		width: 100%;
	}
	.newCompOptionButton:hover {
		background-color: var(--appColorPriAccent);
	}
	.newCompOptionButton:first-child {
		border-right: 3px solid var(--appColorPriAccent);
	}
	.newCompOptionButton:last-child {
		border-left: 3px solid var(--appColorPriAccent);
	}
	.compDetails {
		background-color: var(--appBGColor);
		display: flex;
		flex-direction: column;
		height: calc(100vh - 45px);
		max-width: 0px;
		overflow-x: hidden;
		overflow-y: auto;
		position: fixed;
		right: 0;
		scroll-behavior: smooth;
		top: 45px;
		transition: all 0.3s ease-out;
		visibility: hidden;
	}
	.compDetails.open {
		max-width: 100%;
		padding: 10px;
		visibility: visible;
	}
	.compDetailHead {
		border-bottom: 1px solid black;
		display: flex;
		flex-direction: row;
		padding-bottom: 10px;
		width: 100%;
	}
	.closeDetailButton {
		align-items: center;
		background-color: transparent;
		border: 3px solid var(--appColorPrimary);
		border-radius: 5px;
		color: var(--appColorPrimary);
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
	.closeDetailButton:hover {
		background-color: var(--appColorPrimary);
		color: white;
	}
	.closeDetailButton:hover .arrow {
		border-color: white;
	}
	.titleContainer {
		align-items: center;
		display: flex;
		flex-direction: column;
		justify-content: center;
		width: 100%;
	}
	.compTitle {
		font-size: 1.5rem;
		margin: 0;
	}
	.authorTitle {
		font-size: 0.9rem;
		margin: 0;
	}
	.editContainer {
		align-items: center;
		display: flex;
		flex-direction: row;
	}
	.editDelButton {
		align-items: center;
		background-color: var(--appColorPrimary);
		border: 3px solid var(--appColorPrimary);
		border-radius: 5px;
		color: white;
		display: flex;
		flex-direction: row;
		font-size: 0.9rem;
		height: fit-content;
		justify-content: center;
		margin: 0px 5px;
		padding: 5px 8px;
	}
	.editDelButton span {
		display: none;
	}
	.exportButton {
		display: none;
	}
	.deleteButton {
		background-color: var(--appDelColor);
		border: 3px solid var(--appDelColor);
	}
	.editDelButton:hover {
		box-shadow: 2px 2px 5px #aaa;
	}
	.editDelButton:active {
		box-shadow: none;
	}
	.editDelButton img {
		max-width: 20px;
	}
	.deleteButton img {
		max-width: 16px;
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
		padding: 3px;
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
		flex-direction: row;
		justify-content: center;
		padding: 10px;
		width: 100%;
	}
	.detailImgContainer {
		position: relative;
	}
	.detailFrontline, .detailBackline {
		align-items: center;
		display: flex;
		flex-direction: column;
		justify-content: center;
		width: 80px;
	}
	.detailImgContainer + a {
		color: black;
		font-size: 0.8rem;
		font-weight: bold;
		margin: 0;
		margin-bottom: 5px;
		margin-top: -8px;
		text-align: center;
		text-decoration: none;
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
		-webkit-transform: rotate(-45deg);
	}
	.expanderArrow.down {
		transform: rotate(45deg);
		-webkit-transform: rotate(45deg);
	}
	.selectHeroSection {
		width: 100%;
	}
	#heroDetailSection {
		scroll-snap-align: center;
	}
	.selectedHero {
		border: 3px solid var(--appColorPrimary);
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
	.selectPortraitArea {
		align-items: center;
		display: flex;
		flex-direction: column;
		padding: 0px 10px;
	}
	.portraitContainer {
		cursor: pointer;
		position: relative;
	}
	.portraitContainer + p {
		font-size: 1rem;
		font-weight: bold;
		margin: 0;
		margin-bottom: 5px;
		margin-top: -8px;
		text-align: center;
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
		background-color: var(--appDelColor);
		border-radius: 50%;
		bottom: 7px;
		display: none;
		height: 20px;
		position: absolute;
		right: 2px;
		visibility: hidden;
		width: 20px;
	}
	.coreMark.visible {
		display: inline-block;
		pointer-events: none;
		visibility: visible;
	}
	.lowerSelectCard {
		align-items: center;
		display: flex;
		flex-direction: column;
		justify-content: center;
		width: 100%;
	}
	.ascendBoxContainer {
		margin-bottom: 10px;
	}
	.artifactsContainer {
		align-items: center;
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: center;
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
	}
	.artifactImgContainer img {
		border-radius: 50%;
		max-width: 50px;
	}
	.artifactImgContainer p {
		margin: 0;
		max-width: 100px;
		text-align: center;
	}
	.artifactsContainer span {
		font-size: 2rem;
		font-weight: bold;
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
	}
	.subGroupTitle:first-child {
		padding-top: 0;
	}
	.subGroupMembers {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		padding: 5px;
		width: 100%;
	}
	.subHeroContainer p {
		font-size: 1rem;
		font-weight: bold;
		margin: 0;
		margin-top: -5px;
		padding-right: 10px;
		text-align: center;
	}
	.subHeroContainer a {
		color: black;
		text-decoration: none;
	}
	.subImg {
		border-radius: 50%;
		margin-right: 10px;
		max-width: 70px;
	}
	.subImg.claimed {
		border: 5px solid var(--appColorPrimary);
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
	@media only screen and (min-width: 767px) {
		.sect1 {
			width: 21%;
		}
		.sect2 {
			max-width: 79%;
			width: 79%;
		}
		.tooltip {
			bottom: -25px;
			display: inline-block;
			position: relative;
			right: 41.5px;
		}
		.exportTooltip {
			right: 39px;
		}
		.tooltip .tooltipText {
			background-color: var(--appColorPrimary);
			border-radius: 6px;
			color: white;
			font-size: 0.8rem;
			padding: 4px;
			position: absolute;
			text-align: center;
			visibility: hidden;
			z-index: 1;
		}
		.compScroller {
			border-right: 3px solid var(--appColorPrimary);
		}
		.noComps {
			font-size: 2.5rem;
		}
		.cardDeleteButton:hover+.tooltip .tooltipText {
			visibility: visible;
		}
		.cardExportButton:hover+.tooltip .tooltipText {
			visibility: visible;
		}
		.compDetails {
			max-width: 100%;
			padding: 10px;
			position: static;
			visibility: visible;
		}
		.closeDetailButton {
			visibility: hidden;
		}
		.exportButton {
			display: flex;
		}
		.editDelButton span {
			display: block;
		}
		.editDelButton img {
			margin-right: 8px;
			max-width: 15px;
		}
		.deleteButton img {
			max-width: 12px;
		}
		.addButtonArea {
			width: 21%;
		}
		.newCompButton {
			border-right: 3px solid var(--appColorPrimary);
		}
		.bodyArea1, .bodyArea2 {
			display: flex;
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
		.mobileExpander.descSection {
			border: 2px solid var(--appColorPrimary);
			border-radius: 10px 0px 0px 10px;
			margin-top: 27.5px;
			max-height: 275px;
			overflow-y: auto;
			padding: 5px;
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
		.subGroupTitle {
			padding-top: 0;
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
	/* description markdown styling */
	.descText :global(hr) {
		border: 1px solid var(--appColorPrimary);
		margin: 5px 0px;
	}
	.descText :global(p) {
		margin: 5px 0px;
	}
	.descText :global(a) {
		color: var(--appColorPrimary);
	}
	.descText :global(ul), .descText :global(ol) {
		margin: 10px 0px;
	}
	.descText :global(h1), .descText :global(h2), .descText :global(h3) {
		margin: 10px 0px;
	}
	.descText :global(h4), .descText :global(h5), .descText :global(h6) {
		margin: 5px 0px;
	}
	.descText :global(h1) {
		font-size: 1.7rem;
	}
	.descText :global(blockquote) {
		border-left: 5px solid var(--appColorPriOpaque);
		margin-left: 20px;
		padding-left: 5px;
	}
	.descText :global(code) {
		background-color: var(--appBGColorDark);
		color: black;
		font-family: 'Courier New', Courier, monospace;
		font-size: 1.0rem;
	}
	.descText :global(table) {
		border-collapse: collapse;
	}
	.descText :global(th) {
		border-bottom: 2px solid var(--appColorPrimary);
		padding-right: 20px;
		text-align: left;
	}
	.descText :global(td) {
		border-bottom: 1px solid black;
	}
	.descText :global(tr):nth-child(even) {
		background-color: var(--appColorPriOpaque);
	}
	.descText :global(img) {
		max-width: 100px;
	}
</style>
