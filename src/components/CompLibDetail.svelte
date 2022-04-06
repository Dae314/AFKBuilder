<script>
	import {createEventDispatcher, tick, getContext, onMount} from 'svelte';
	import { fade } from 'svelte/transition';
	import { query, mutation } from 'svelte-apollo';
	import JSONURL from 'json-url';
	import MarkdownIt from 'markdown-it';
	import Emoji from 'markdown-it-emoji';
	import qs from 'qs';
	import ErrorDisplay from './ErrorDisplay.svelte';
	import CompLineEditor from './CompLineEditor.svelte';
	import AppData from '../stores/AppData.js';
	import HeroData from '../stores/HeroData.js';
	import Artifacts from '../stores/Artifacts.js';
	import ModalCloseButton from '../modals/ModalCloseButton.svelte';
	import HeroDetail from '../modals/HeroDetail.svelte';
	import ArtifactDetail from '../modals/ArtifactDetail.svelte';
	import Confirm from '../modals/Confirm.svelte';
	import LoadingPage from '../shared/LoadingPage.svelte';
	import StarsInput from '../shared/StarsInput.svelte';
	import SIFurnEngBox from '../shared/SIFurnEngBox.svelte';
	import AscendBox from '../shared/AscendBox.svelte';
	import TutorialBox from '../shared/TutorialBox.svelte';
	import ReportButton from '../shared/ReportButton.svelte';
	import HeroButton from '../shared/HeroButton.svelte';
	import { gql_GET_COMP, gql_DELETE_COMP } from '../gql/queries.svelte';
	import { getCompAuthor, validateJWT, toggleSave, toggleUpvote, toggleDownvote } from '../rest/RESTFunctions.svelte';
	import { msToString, votesToString } from '../utilities/Utilities.svelte';
	

	export let params = {};
	export let isMobile = false;
	let svrComp;
	let comp;
	let author;
	let showErrorDisplay = false;
	let errorDisplayConf = {};
	let populatePromise;
	let selectedLine = 0;
	let openDesc = false;
	let openHero = false;
	let openSubs = false;
	let selectedHero = '';
	const jsurl = JSONURL('lzma'); // json-url compressor
	const dispatch = createEventDispatcher();
	const md = new MarkdownIt({
		html: false,
		linkify: false,
		typographer: true,
		breaks: true,
	});
	md.use(Emoji);
	const { open } = getContext('simple-modal');
	const compQuery = query(gql_GET_COMP, {
		variables: { uuid: params.uuid }
	});
	const gqlDeleteComp = mutation(gql_DELETE_COMP);
	const now = Date.now();

	// redo the query comp if the params change
	$: compQuery.refetch({ uuid: params.uuid });
	// reload the comp data if the query is rerun
	$: if(!$compQuery.loading) {
		svrComp = $compQuery.data.comps.data[0];
		populatePromise = Promise.all([populateComp(), populateAuthor()]);
	}
	$: avatarHero = author ? $HeroData.find(e => e.id === author.avatar) : '';
	$: editorHeight = isMobile ? '70vh' : '80vh';
	$: favorited = svrComp ? $AppData.user.saved_comps.some(e => e.uuid === svrComp.attributes.uuid) : false;
	$: liked = svrComp ? $AppData.user.liked_comps.some(e => e.uuid === svrComp.attributes.uuid) : false;
	$: disliked = svrComp ?  $AppData.user.disliked_comps.some(e => e.uuid === svrComp.attributes.uuid) : false;
	$: owned = svrComp ? $AppData.user.published_comps.some(e => e.uuid === svrComp.attributes.uuid) : false;
	$: showReturn = svrComp ?  owned && !$AppData.Comps.some(e => e.uuid === svrComp.attributes.uuid) : false;
	$: createdAt = svrComp ? new Date(svrComp.attributes.createdAt) : {};
	$: age = typeof createdAt.getTime === 'function' ? now - createdAt.getTime() : 0;
	$: comp_update = comp ? comp.lastUpdate : {};
	$: updateAge = typeof comp_update.getTime === 'function' ? now - comp_update.getTime() : 0;

	onMount(async () => {
		$AppData.activeView = 'explore';
	});

	async function populateAuthor() {
		const response = await getCompAuthor(svrComp.attributes.uuid);
		if(response.status !== 200) {
			errorDisplayConf = {
				errorCode: response.status,
				headText: 'Something went wrong',
				detailText: response.data,
				showHomeButton: true,
			};
			showErrorDisplay = true;
		} else {
			author = response.data.author;
		}
	}

	async function populateComp() {
		// unpack and decompress data
		let data;
		try {
			const json = await jsurl.decompress(svrComp.attributes.comp_string);
			data = JSON.parse(json);
		} catch(err) {
			errorDisplayConf = {
				errorCode: 400,
				headText: 'Unable to process comp',
				detailText: 'See console for details',
				showHomeButton: false,
			};
			console.log(err);
			showErrorDisplay = true;
			return;
		}
		if('lastUpdate' in data) data.lastUpdate = new Date(data.lastUpdate);

		// run consistency checks on data
		const returnObj = await validateComp(data);
		if(returnObj.retCode !== 0) {
			// validation error occurred
			errorDisplayConf = {
				errorCode: 400,
				headText: 'Unable to process comp',
				detailText: `${returnObj.message}`,
				showHomeButton: false,
			};
			showErrorDisplay = true;
		} else {
			// validation successful, import the comp
			comp = returnObj.message;
		}
	}

	function handleAuthorClick() {
		// navigate to author page
		// note: clears all extraneous URL parameters
		window.location.assign(`${window.location.origin}/#/users/${encodeURIComponent(author.username)}`);
	}

	async function handleFavoriteClick() {
		dispatch('routeEvent', {action: 'showNotice', data: { noticeConf: {type: 'loading'}}});
		const valid = await validateJWT($AppData.user.jwt);
		if(valid) {
			// user is valid, perform query
			const response = await toggleSave($AppData.user.jwt, svrComp.attributes.uuid);
			if(response.status !== 200) {
				errorConf = {
					errorCode: response.status,
					headText: 'Something went wrong',
					detailText: response.data,
				}
				showError = true;
			} else {
				$AppData.user.saved_comps = response.data.comps;
				svrComp.attributes.saves = response.data.saves;
				dispatch('routeEvent', {action: 'saveData'});
				dispatch('routeEvent', {action: 'syncFavorites'});
			}
		} else {
			dispatch('routeEvent', {action: 'logout'});
		}
		dispatch('routeEvent', {action: 'clearNotice'});
	}

	async function handleLikeClick() {
		if(!$AppData.user.disliked_comps.some(e => e.uuid === comp.uuid)) {
			dispatch('routeEvent', {action: 'showNotice', data: { noticeConf: {type: 'loading'}}});
			const valid = await validateJWT($AppData.user.jwt);
			if(valid) {
				// user is valid, perform query
				const response = await toggleUpvote($AppData.user.jwt, svrComp.attributes.uuid);
					if(response.status !== 200) {
						errorConf = {
						errorCode: response.status,
						headText: 'Something went wrong',
						detailText: response.data,
					}
					showError = true;
				} else {
					$AppData.user.liked_comps = response.data.comps;
					svrComp.attributes.upvotes = response.data.upvotes;
					dispatch('routeEvent', {action: 'saveData'});
				}
			} else {
				dispatch('routeEvent', {action: 'logout'});
			}
			dispatch('routeEvent', {action: 'clearNotice'});
		}
	}

	async function handleDislikeClick() {
		if(!$AppData.user.liked_comps.some(e => e.uuid === comp.uuid)) {
			dispatch('routeEvent', {action: 'showNotice', data: { noticeConf: {type: 'loading'}}});
			const valid = await validateJWT($AppData.user.jwt);
			if(valid) {
				// user is valid, perform query
				const response = await toggleDownvote($AppData.user.jwt, svrComp.attributes.uuid);
					if(response.status !== 200) {
						errorConf = {
						errorCode: response.status,
						headText: 'Something went wrong',
						detailText: response.data,
					}
					showError = true;
				} else {
					$AppData.user.disliked_comps = response.data.comps;
					svrComp.attributes.downvotes = response.data.downvotes;
					dispatch('routeEvent', {action: 'saveData'});
				}
			} else {
				dispatch('routeEvent', {action: 'logout'});
			}
			dispatch('routeEvent', {action: 'clearNotice'});
		}
	}

	function handleTagClick(tag) {
		let newQS = new URLSearchParams();
		const tagFilter = qs.stringify({
			filter: [{
				displayName: tag.attributes.name,
				id: tag.id,
				name: tag.attributes.name,
				type: "include",
			}]
		});
		newQS.set('tag_filter', tagFilter);
		window.location.assign(`${window.location.origin}/#/explore?${newQS.toString()}`);
	}

	function renderMarkdown(mdText) {
		return md.render(mdText);
	}

	async function handleHeroClick(hero) {
		selectedHero = hero;
		openHero = true;
		await tick();
		document.getElementById('heroDetailSection').scrollIntoView({behavior: 'smooth', block: 'center', inline: 'center'});
	}

	function openArtifactDetail(artifactID) {
		open(ArtifactDetail, 
		{ artifactID: artifactID, },
		{ closeButton: ModalCloseButton,
			styleContent: {background: '#F0F0F2', padding: 0, borderRadius: '10px', maxHeight: editorHeight,},
		});
	}

	function handleHeroDetailClick(heroID) {
		open(HeroDetail, 
		{ heroID: heroID, },
		{ closeButton: ModalCloseButton,
			styleContent: {background: '#F0F0F2', padding: 0, borderRadius: '10px', maxHeight: editorHeight },
		});
	}

	async function handleUnpublishClick() {
		open(Confirm,
				{onConfirm: handleUnpublishComp, message: `Unpublish comp named ${comp.name}?<br/><br/>The comp will still be available in "Comps" but it will no longer be shared in the "Explore" area.`},
				{closeButton: false,
				 closeOnEsc: true,
				 closeOnOuterClick: true,
				 styleWindow: { width: 'fit-content' },
				 styleContent: { width: 'fit-content', background: '#F0F0F2', borderRadius: '10px' },
				});
	}

	async function handleUnpublishComp() {
		try {
			dispatch('routeEvent', {action: 'showNotice', data: { noticeConf: {type: 'loading'}}});
			// check user's JWT before making queries
			const valid = await validateJWT($AppData.user.jwt);
			if(valid) {
				const response = await gqlDeleteComp({variables: { id: svrComp.id }});
				const delUUID = response.data.deleteComp.data.attributes.uuid;
				$AppData.user.published_comps = $AppData.user.published_comps.filter(e => e.uuid !== delUUID);
				dispatch('routeEvent', {action: 'saveData'});
				window.location.assign(`${window.location.origin}/#/`);
			} else {
				dispatch('routeEvent', {action: 'logout'});;
			}
			dispatch('routeEvent', {action: 'clearNotice'});
		} catch(error) {
			dispatch('routeEvent', {action: 'clearNotice'});
			errorDisplayConf = {
				errorCode: 500,
				headText: 'Something went wrong',
				detailText: error.message,
				showHomeButton: true,
			};
			showErrorDisplay = true;
			console.log(error.message);
		}
	}

	function handleRestoreClick() {
		$AppData.Comps = [...$AppData.Comps, comp];
		dispatch('routeEvent', {action: 'saveData'});
		dispatch('routeEvent',
			{ action: 'showNotice',
				data: {
					noticeConf: {
						type: 'info',
						message: 'Comp restored',
					}
				}
			}
		);
	}

	async function handleLineEvent(event) {
		switch(event.detail.action) {
			case 'heroClick':
				await handleHeroClick(event.detail.data);
				break;
			default:
				throw new Error(`Invalid action specified on compLineEvent: ${action}`);
		}
	}

	async function handleHeroButtonEvent(event) {
		switch(event.detail.action) {
			case 'heroClick':
				await handleHeroClick(event.detail.data);
				break;
			default:
				throw new Error(`Invalid action specified on heroButtonEvent: ${action}`);
		}
	}
</script>

{#if $compQuery.loading}
	<LoadingPage />
{:else if $compQuery.error}
	<ErrorDisplay
		errorCode="503"
		headText="Something went wrong"
		detailText="Check the console for details."
		showHomeButton={false}
	/>
	{console.log($compQuery.error.message)}
{:else}
	{#if $compQuery.data.comps.data.length === 0}
		<ErrorDisplay
			errorCode="404"
			headText="We couldn't find that comp"
			detailText="Sorry about that!"
			showHomeButton={false}
		/>
	{:else}
		{#await populatePromise}
			<LoadingPage />
		{:then _}
			{#if showErrorDisplay}
				<ErrorDisplay
					errorCode={errorDisplayConf.errorCode}
					headText={errorDisplayConf.headText}
					detailText={errorDisplayConf.detailText}
					showHomeButton={errorDisplayConf.showHomeButton}
				/>
			{:else}
				<div class="compLibDetailContainer">
					<div class="compLibDetailHead">
						<div class="titleContainer">
							<div class="authorButtonsContainer">
								<button type="button" class="authorButton" on:click={handleAuthorClick}>
									<img class="avatar" src="{avatarHero.portrait}" alt="{avatarHero.name}" draggable="false">
									<div class="username">{author.username}</div>
								</button>
								<div class="buttonsContainer">
									<div class="buttonContainer likeButtonContainer">
										<button type="button" class="headButton likeButton" class:liked={liked} on:click={handleLikeClick}>
											<img draggable="false" class="headImage likeImage" src="{liked ? './img/utility/like_filled_white.png' : './img/utility/like_unfilled.png'}" alt="Like">
											<p>{votesToString(svrComp.attributes.upvotes)}</p>
										</button>
										<div class="tooltip likeTooltip"><span class="tooltipText">{liked ? 'Unlike' : 'Like'}</span></div>
									</div>
									<div class="buttonContainer dislikeButtonContainer">
										<button type="button" class="headButton dislikeButton" class:disliked={disliked} on:click={handleDislikeClick}>
											<img draggable="false" class="headImage dislikeImage" src="{disliked ? './img/utility/dislike_filled_white.png' : './img/utility/dislike_unfilled.png'}" alt="Dislike">
											<p>{votesToString(svrComp.attributes.downvotes)}</p>
										</button>
										<div class="tooltip dislikeTooltip"><span class="tooltipText">{disliked ? 'Undislike' : 'Dislike'}</span></div>
									</div>
									<div class="buttonContainer favoriteButtonContainer">
										<button type="button" class="headButton favoriteButton" class:favorited={favorited} on:click={handleFavoriteClick}>
											<img draggable="false" class="headImage favoriteImage" src="{favorited ? './img/utility/favorite_filled_white.png' : './img/utility/favorite_unfilled.png'}" alt="Favorite">
											<p>{votesToString(svrComp.attributes.saves)}</p>
										</button>
										<div class="tooltip favoriteTooltip"><span class="tooltipText">{favorited ? 'Unfavorite' : 'Favorite'}</span></div>
									</div>
									{#if owned}
										<div class="buttonContainer unpublishButtonContainer">
											<button type="button" class="headButton unpublishButton" on:click={handleUnpublishClick}>
												<img draggable="false" class="headImage unpublishImage" src="./img/utility/unpublish_white.png" alt="Unpublish">
												<p>Unpublish</p>
											</button>
											<div class="tooltip unpublishTooltip"><span class="tooltipText">Unpublish</span></div>
										</div>
									{/if}
								</div>
							</div>
							<h3 class="compTitle">{comp.name}</h3>
							<div class="ageContainer">
								<span class="age" title="{createdAt.toLocaleString()}">Published {msToString(age)}</span>
							</div>
						</div>
						{#if showReturn}
							<div class="restoreArea">
								<button type="button" class="restoreButton" on:click={handleRestoreClick}>
									Restore to Comps
								</button>
							</div>
						{/if}
						<div class="tagsArea">
							<div class="tagDisplay">
								{#each svrComp.attributes.tags.data as tag}
									<button type="button" class="tag" on:click={() => handleTagClick(tag)}>
										<span class="tagText">{tag.attributes.name}</span>
									</button>
								{/each}
							</div>
						</div>
					</div>
					<div class="compLibDetailBody">
						<div class="updateContainer">
							<span class="updateAge" title="{comp_update.toLocaleString()}">Updated {msToString(updateAge)}</span>
						</div>
						<div class="bodyArea1">
							<CompLineEditor
								lines={comp.lines}
								compHeroes={comp.heroes}
								bind:selectedLine={selectedLine}
								on:compLineEvent={handleLineEvent}
							/>
							<div class="description">
								<div class="mobileExpanderTitle">
									<button type="button" class="expanderButton" on:click={() => openDesc = !openDesc}><i class="expanderArrow {openDesc ? 'down' : 'right' }"></i><span>Description</span></button>
								</div>
								<div class="mobileExpander descSection" class:open={openDesc}>
									<span class="descText">{@html renderMarkdown(comp.desc)}</span>
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
													<SIFurnEngBox type='si' num={comp.heroes[selectedHero].si} maxWidth='50px' fontSize='1.2rem' />
												</div>
												<div class="selectPortraitArea">
													<div class="portraitContainer" on:click={() => handleHeroDetailClick(selectedHero)}>
														<img draggable="false" class="selectHeroPortrait" class:claimed={$AppData.MH.List[selectedHero].claimed} src="{$HeroData.find(e => e.id === selectedHero).portrait}" alt="{selectedHero}">
														<span class="coreMark" class:visible={comp.heroes[selectedHero].core}></span>
													</div>
													<p>{$HeroData.find(e => e.id === selectedHero).name}</p>
													<div>
														<StarsInput
															value={comp.heroes[selectedHero].stars}
															enabled={comp.heroes[selectedHero].ascendLv === 6}
															engraving={comp.heroes[selectedHero].engraving}
															displayOnly={true} />
													</div>
												</div>
												<div class="siFurnBoxContainer">
													<SIFurnEngBox type='furn' num={comp.heroes[selectedHero].furn} maxWidth='50px' fontSize='1.2rem' />
												</div>
											</div>
											<div class="lowerSelectCard">
												<div class="ascendBoxContainer">
													<AscendBox
														ascendLv="{comp.heroes[selectedHero].ascendLv}"
														tier={$HeroData.find(e => e.id === selectedHero).tier}
													/>
												</div>
												{#if comp.heroes[selectedHero].stars > 0}
													<div class="engraveBoxContainer">
														<SIFurnEngBox type='engraving' num={comp.heroes[selectedHero].engraving} maxWidth='50px' fontSize='1.2rem' />
													</div>
												{/if}
												{#if comp.heroes[selectedHero].notes.length > 0}
													<div class="heroNotesArea">
														<div class="heroNotes">
															<span>{comp.heroes[selectedHero].notes}</span>
														</div>
													</div>
												{/if}
												{#if comp.heroes[selectedHero].artifacts.primary.length > 0 || comp.heroes[selectedHero].artifacts.secondary.length > 0 || comp.heroes[selectedHero].artifacts.situational.length > 0}
													<div class="artifactsContainer">
														<h5>Artifacts</h5>
														<div class="artifactLine priArtifactLine">
															<h6>Primary</h6>
															<div class="artifactArea">
																{#each comp.heroes[selectedHero].artifacts.primary as artifact}
																	<button type="button" on:click={() => openArtifactDetail(artifact)} class="artifactImgContainer">
																		<img draggable="false" src="{$Artifacts[artifact].image}" alt="{$Artifacts[artifact].name}">
																		<p>{$Artifacts[artifact].name}</p>
																	</button>
																{/each}
															</div>
														</div>
														{#if comp.heroes[selectedHero].artifacts.secondary.length > 0}
															<div class="artifactLine secArtifactLine">
																<h6>Secondary</h6>
																<div class="artifactArea">
																	{#each comp.heroes[selectedHero].artifacts.secondary as artifact}
																		<button type="button" on:click={() => openArtifactDetail(artifact)} class="artifactImgContainer">
																			<img draggable="false" src="{$Artifacts[artifact].image}" alt="{$Artifacts[artifact].name}">
																			<p>{$Artifacts[artifact].name}</p>
																		</button>
																	{/each}
																</div>
															</div>
														{/if}
														{#if comp.heroes[selectedHero].artifacts.situational.length > 0}
															<div class="artifactLine sitArtifactLine">
																<h6>Situational</h6>
																<div class="artifactArea">
																	{#each comp.heroes[selectedHero].artifacts.situational as artifact}
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
										{#each comp.subs as subgroup}
										<div class="subGroup">
											<div class="subGroupTitle"><span>{subgroup.name}</span></div>
											<div class="subGroupMembers">
												{#each subgroup.heroes as hero}
													<div class="subHeroContainer">
														<HeroButton
															hero={hero}
															heroDetails={comp.heroes[hero]}
															on:heroButtonEvent={handleHeroButtonEvent}
														/>
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
					<div class="reportContainer">
						<ReportButton
							reportType="comp"
							reportData={svrComp}
						/>
					</div>
				</div>
			{/if}
		{/await}
	{/if}
{/if}

<style lang="scss">
	.compLibDetailContainer {
		height: 100%;
		height: calc(var(--vh, 1vh) * 100 - var(--headerHeight)); /* gymnastics to set height for mobile browsers */
		overflow-y: auto;
		width: 100%;
	}
	.compLibDetailHead {
		display: flex;
		flex-direction: column;
		padding: 10px;
		padding-bottom: 0px;
		.authorButtonsContainer {
			display: flex;
			.authorButton {
				align-items: center;
				background: transparent;
				border: none;
				cursor: pointer;
				display: flex;
				outline: none;
				.avatar {
					border-radius: 50%;
					max-width: 40px;
				}
				.username {
					font-size: 1rem;
					margin-left: 10px;
					user-select: none;
				}
			}
			.buttonsContainer {
				align-items: center;
				display: flex;
				justify-content: flex-end;
				margin-left: auto;
				.buttonContainer {
					position: relative;
				}
				.headButton {
					align-items: center;
					background-color: var(--appBGColor);
					border: none;
					border-radius: 10px;
					box-shadow: var(--neu-sm-i-BGColor-shadow);
					cursor: pointer;
					display: flex;
					height: 35px;
					justify-content: center;
					margin: 0px 8px;
					outline: none;
					padding: 5px;
					.headImage {
						max-width: 20px;
					}
					p {
						margin: 0;
						margin-left: 3px;
						padding: 3px;
					}
				}
				.likeButton {
					p {
						color: var(--appColorPrimary);
					}
					&.liked {
						background-color: var(--appColorPrimary);
						p {
							color: var(--appBGColor);
						}
					}
				}
				.dislikeButton {
					p {
						color: var(--appDelColor);
					}
					&.disliked {
						background-color: var(--appDelColor);
						p {
							color: var(--appBGColor);
						}
					}
				}
				.favoriteButton {
					p {
						color: var(--mythicColor);
					}
					&.favorited {
						background-color: var(--mythicColor);
						p {
							color: var(--appBGColor);
						}
					}
				}
				.unpublishButton {
					background-color: var(--appDelColor);
					padding: 0px 8px;
					p {
						color: var(--appBGColor);
						display: none;
					}
				}
				.tooltip {
					display: none;
				}
			}
		}
		.compTitle {
			font-size: 1.5rem;
			margin: 0;
			padding-top: 10px;
			text-align: center;
			width: 100%;
		}
		.ageContainer {
			font-size: 0.8rem;
			text-align: center;
			width: 100%;
		}
		.restoreArea {
			display: flex;
			justify-content: center;
			padding-top: 10px;
			width: 100%;
			.restoreButton {
				background-color: var(--appColorPrimary);
				border: 2px solid var(--appColorPrimary);
				border-radius: 5px;
				color: var(--appBGColor);
				cursor: pointer;
				outline: none;
				padding: 3px;
				text-align: center;
			}
		}
		.tagsArea {
			border-bottom: 1px solid black;
			display: flex;
			flex-direction: column;
			padding-top: 15px;
			width: 100%;
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
				background-color: var(--appBGColor);
				border: none;
				box-shadow: var(--neu-sm-ni-BGColor-shadow);
				border-radius: 15px;
				cursor: pointer;
				outline: none;
				padding: 0;
				position: relative;
				margin: 0px 8px;
				margin-bottom: 10px;
			}
			.tagText {
				display: inline-block;
				color: var(--appColorPrimary);
				font-size: 0.8rem;
				padding: 3px 8px;
				text-align: center;
				user-select: none;
			}
		}
	}
	.compLibDetailBody {
		padding: 10px;
		padding-top: 5px;
		.updateContainer {
			display: flex;
			font-size: 0.8rem;
			justify-content: flex-end;
			padding-bottom: 10px;
			width: 100%;
		}
		.expanderButton {
			background-color: var(--appBGColor);
			border: none;
			border-radius: 10px;
			box-shadow: var(--neu-med-i-BGColor-shadow);
			color: black;
			cursor: pointer;
			font-size: 1.1rem;
			outline: none;
			padding: 10px;
			text-align: left;
			width: 100%;
			.expanderArrow {
				border: solid black;
				border-width: 0 3px 3px 0;
				display: inline-block;
				margin-right: 16px;
				padding: 3px;
				transition: transform 0.2s ease-out;
				&.right {
					transform: rotate(-45deg);
				}
				&.down {
					transform: rotate(45deg);
				}
			}
		}
		.mobileExpander {
			margin-bottom: 10px;
			max-height: 0px;
			overflow: hidden;
			transition: all 0.2s ease-out;
			&.open {
				max-height: 5000px;
				overflow: visible;
				padding-top: 10px;
			}
		}
		.descSection.open {
			padding-left: 5px;
		}
		.selectHeroSection {
			width: 100%;
		}
		#heroDetailSection {
			scroll-snap-align: center;
			.selectedHero {
				background-color: var(--appBGColor);
				border-radius: 10px;
				box-shadow: var(--neu-med-ni-BGColor-shadow);
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
					&.claimed {
						border: 5px solid var(--appColorPrimary);
					}
				}
			}
			.lowerSelectCard {
				align-items: center;
				display: flex;
				flex-direction: column;
				justify-content: center;
				margin-top: 10px;
				width: 100%;
				.ascendBoxContainer {
					margin-bottom: 10px;
				}
				.heroNotesArea {
					width: 100%;
					margin: 10px 0px;
					.heroNotes {
						border-radius: 10px;
						box-shadow: var(--neu-sm-ni-BGColor-shadow);
						padding: 10px;
					}
				}
				.artifactsContainer {
					display: flex;
					flex-direction: column;
					justify-content: center;
					width: 100%;
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
					border-radius: 10px;
					box-shadow: var(--neu-sm-ni-BGColor-inset-shadow);
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
			}
		}
		.subDisplay {
			display: flex;
			flex-direction: column;
			padding: 10px 0px;
			padding-top: 0;
			width: 100%;
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
				margin: 5px 8px;
			}
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
	}
	.reportContainer {
		display: flex;
		justify-content: flex-end;
		padding-bottom: 10px;
		padding-right: 10px;
	}
	@media only screen and (min-width: 767px) {
		.compLibDetailContainer {
			height: 100vh;
		}
		.compLibDetailHead {
			.authorButtonsContainer {
				.buttonsContainer {
					.unpublishButton {
						padding: 5px;
						p {
							display: block;
						}
					}
				}
			}
			.tagDisplay {
				.tag {
					&:hover {
						background: var(--neu-convex-BGColor-wide-bg);
					}
				}
			}
		}
		.compLibDetailBody {
			.bodyArea1 {
				display: flex;
			}
			.bodyArea2 {
				display: flex;
			}
			.description {
				padding-right: 10px;
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
				.selectedHero {
					margin: 0;
					width: 340px;
				}
			}
			.expanderButton {
				display: none;
			}
			.mobileExpander {
				max-height: 5000px;
				overflow: visible;
				padding: 0;
				&.open {
					padding: 0;
				}
				&.descSection {
					border-radius: 10px;
					box-shadow: var(--neu-med-ni-BGColor-shadow);
					height: 100%;
					margin-left: 10px;
					max-height: 390px;
					overflow-y: auto;
					padding: 10px;
					width: 100%;
				}
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
				.subGroupTitle {
					padding-top: 0;
				}
			}
		}
	}
</style>
