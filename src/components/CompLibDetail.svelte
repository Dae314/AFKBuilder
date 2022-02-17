<script>
	import {createEventDispatcher} from 'svelte';
	import { query } from 'svelte-apollo';
	import JSONURL from 'json-url';
	import AppData from '../stores/AppData.js';
	import HeroData from '../stores/HeroData.js';
	import LoadingPage from '../shared/LoadingPage.svelte';
	import ErrorDisplay from './ErrorDisplay.svelte';
	import { gql_GET_COMP } from '../gql/queries.svelte';
	import { getCompAuthor, validateJWT, toggleSave, toggleUpvote, toggleDownvote } from '../rest/RESTFunctions.svelte';
	import { msToString, votesToString } from '../utilities/Utilities.svelte';
	

	export let params = {};
	let svrComp;
	let comp;
	let author;
	let showErrorDisplay = false;
	let errorDisplayConf = {};
	let populatePromise;
	const jsurl = JSONURL('lzma'); // json-url compressor
	const dispatch = createEventDispatcher();
	const compQuery = query(gql_GET_COMP, {
		variables: { uuid: params.uuid }
	});

	// redo the query comp if the params change
	$: compQuery.refetch({ uuid: params.uuid });
	// reload the comp data if the query is rerun
	$: if(!$compQuery.loading) {
		svrComp = $compQuery.data.comps.data[0];
		populatePromise = Promise.all([populateComp(), populateAuthor()]);
	}
	$: avatarHero = author ? $HeroData.find(e => e.id === author.avatar) : '';
	$: age = comp ? Date.now() - comp.lastUpdate.getTime() : '';
	$: favorited = svrComp ? $AppData.user.saved_comps.some(e => e.uuid === svrComp.attributes.uuid) : false;
	$: liked = svrComp ? $AppData.user.liked_comps.some(e => e.uuid === svrComp.attributes.uuid) : false;
	$: disliked = svrComp ?  $AppData.user.disliked_comps.some(e => e.uuid === svrComp.attributes.uuid) : false;

	function reload() {
		compQuery.refetch({ uuid: params.uuid });
	}

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
			console.log(comp);
		}
	}

	function handleAuthorClick() {
		// navigate to author page
		// note: clears all extraneous URL parameters
		window.location.assign(`${window.location.origin}/#/users/${encodeURIComponent(author.username)}`);
	}

	async function handleFavoriteClick() {
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
				$AppData.user.saved_comps = response.data;
				svrComp.attributes.saves = response.data.saves;
				dispatch('routeEvent', {action: 'saveData'});
			}
		} else {
			dispatch('routeEvent', {action: 'logout'});
		}
	}

	async function handleLikeClick() {
		if(!$AppData.user.disliked_comps.some(e => e.uuid === comp.uuid)) {
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
		}
	}

	async function handleDislikeClick() {
		if(!$AppData.user.liked_comps.some(e => e.uuid === comp.uuid)) {
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
								</div>
							</div>
							<h3 class="compTitle">{comp.name}</h3>
							<div class="ageContainer">
								<span class="age">{msToString(age)}</span>
							</div>
						</div>
					</div>
					<!--
					<div class="tagsArea">
						<div class="tagDisplay">
							{#each sortedCompList[$AppData.selectedComp].tags as tag}
								<div class="tag">
									<span class="tagText">{tag}</span>
								</div>
							{/each}
						</div>
					</div>
					<div class="compDetailBody">
						<div class="lastUpdate">
							<span>Updated: {`${months[sortedCompList[$AppData.selectedComp].lastUpdate.getMonth()]} ${sortedCompList[$AppData.selectedComp].lastUpdate.getDate()}, ${sortedCompList[$AppData.selectedComp].lastUpdate.getFullYear()}`}</span>
						</div>
						<div class="bodyArea1">
							<div class="lineExamples">
								<div class="lineSwitcher">
									{#each sortedCompList[$AppData.selectedComp].lines as line, i}
									<button type="button" class="lineSwitchButton" class:active={selectedLine === i} on:click={() => selectedLine = i}>{line.name}</button>
									{/each}
								</div>
								<div class="lineDisplay">
									{#if sortedCompList[$AppData.selectedComp].lines.length > 0}
										<div class="lineTitle"><span>{sortedCompList[$AppData.selectedComp].lines[selectedLine].name}</span></div>
									{/if}
									<div class="lineMembers">
										<div class="detailBackline">
											{#if sortedCompList[$AppData.selectedComp].lines.length > 0}
												{#each sortedCompList[$AppData.selectedComp].lines[selectedLine].heroes as hero, i}
													{#if i >= 2}
														{#if $HeroData.some(e => e.id === hero)}
															<div class="detailImgContainer">
																<button type="button" class="heroButton"><img draggable="false" on:click={() => handleHeroClick(hero)} class="lineImg" class:claimed={$AppData.MH.List[hero].claimed} src={$HeroData.find(e => e.id === hero).portrait} alt={$HeroData.find(e => e.id === hero).name}></button>
																<span class="coreMark" class:visible={sortedCompList[$AppData.selectedComp].heroes[hero].core}></span>
																<div class="ascMark">
																	{#if $HeroData.find(e => e.id === hero).tier === 'ascended'}
																		{#if sortedCompList[$AppData.selectedComp].heroes[hero].ascendLv >= 6}
																			<img src="./img/markers/ascended.png" alt="ascended">
																		{:else if sortedCompList[$AppData.selectedComp].heroes[hero].ascendLv >= 4}
																			<img src="./img/markers/mythic.png" alt="mythic">
																		{:else if sortedCompList[$AppData.selectedComp].heroes[hero].ascendLv >= 2}
																			<img src="./img/markers/legendary.png" alt="legendary">
																		{:else}
																			<img src="./img/markers/elite.png" alt="elite">
																		{/if}
																	{:else}
																		{#if sortedCompList[$AppData.selectedComp].heroes[hero].ascendLv >= 4}
																			<img src="./img/markers/legendary.png" alt="legendary">
																		{:else if sortedCompList[$AppData.selectedComp].heroes[hero].ascendLv >= 2}
																			<img src="./img/markers/elite.png" alt="elite">
																		{:else}
																			<img src="./img/markers/rare.png" alt="rare">
																		{/if}
																	{/if}
																	{#if sortedCompList[$AppData.selectedComp].heroes[hero].si >= 30}
																		<img src="./img/markers/si30.png" alt="si30">
																	{:else if sortedCompList[$AppData.selectedComp].heroes[hero].si >= 20}
																		<img src="./img/markers/si20.png" alt="si20">
																	{:else if sortedCompList[$AppData.selectedComp].heroes[hero].si >= 10}
																		<img src="./img/markers/si10.png" alt="si10">
																	{:else}
																		<img src="./img/markers/si0.png" alt="si0">
																	{/if}
																	{#if sortedCompList[$AppData.selectedComp].heroes[hero].furn >= 9}
																		<img class:moveup={sortedCompList[$AppData.selectedComp].heroes[hero].si < 10} src="./img/markers/9f.png" alt="9f">
																	{:else if sortedCompList[$AppData.selectedComp].heroes[hero].furn >= 3}
																		<img class:moveup={sortedCompList[$AppData.selectedComp].heroes[hero].si < 10} src="./img/markers/3f.png" alt="3f">
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
											{#if sortedCompList[$AppData.selectedComp].lines.length > 0}
												{#each sortedCompList[$AppData.selectedComp].lines[selectedLine].heroes as hero, i}
													{#if i < 2}
														{#if $HeroData.some(e => e.id === hero)}
															<div class="detailImgContainer">
																<button type="button" class="heroButton"><img draggable="false" on:click={() => handleHeroClick(hero)} class="lineImg" class:claimed={$AppData.MH.List[hero].claimed} src={$HeroData.find(e => e.id === hero).portrait} alt={$HeroData.find(e => e.id === hero).name}></button>
																<span class="coreMark" class:visible={sortedCompList[$AppData.selectedComp].heroes[hero].core}></span>
																<div class="ascMark">
																	{#if $HeroData.find(e => e.id === hero).tier === 'ascended'}
																		{#if sortedCompList[$AppData.selectedComp].heroes[hero].ascendLv >= 6}
																			<img src="./img/markers/ascended.png" alt="ascended">
																		{:else if sortedCompList[$AppData.selectedComp].heroes[hero].ascendLv >= 4}
																			<img src="./img/markers/mythic.png" alt="mythic">
																		{:else if sortedCompList[$AppData.selectedComp].heroes[hero].ascendLv >= 2}
																			<img src="./img/markers/legendary.png" alt="legendary">
																		{:else}
																			<img src="./img/markers/elite.png" alt="elite">
																		{/if}
																	{:else}
																		{#if sortedCompList[$AppData.selectedComp].heroes[hero].ascendLv >= 4}
																			<img src="./img/markers/legendary.png" alt="legendary">
																		{:else if sortedCompList[$AppData.selectedComp].heroes[hero].ascendLv >= 2}
																			<img src="./img/markers/elite.png" alt="elite">
																		{:else}
																			<img src="./img/markers/rare.png" alt="rare">
																		{/if}
																	{/if}
																	{#if sortedCompList[$AppData.selectedComp].heroes[hero].si >= 30}
																		<img src="./img/markers/si30.png" alt="si30">
																	{:else if sortedCompList[$AppData.selectedComp].heroes[hero].si >= 20}
																		<img src="./img/markers/si20.png" alt="si20">
																	{:else if sortedCompList[$AppData.selectedComp].heroes[hero].si >= 10}
																		<img src="./img/markers/si10.png" alt="si10">
																	{:else}
																		<img src="./img/markers/si0.png" alt="si0">
																	{/if}
																	{#if sortedCompList[$AppData.selectedComp].heroes[hero].furn >= 9}
																		<img class:moveup={sortedCompList[$AppData.selectedComp].heroes[hero].si < 10} src="./img/markers/9f.png" alt="9f">
																	{:else if sortedCompList[$AppData.selectedComp].heroes[hero].furn >= 3}
																		<img class:moveup={sortedCompList[$AppData.selectedComp].heroes[hero].si < 10} src="./img/markers/3f.png" alt="3f">
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
									<span class="descText">{@html renderMarkdown(sortedCompList[$AppData.selectedComp].desc)}</span>
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
													<SIFurnEngBox type='si' num={sortedCompList[$AppData.selectedComp].heroes[selectedHero].si} maxWidth='50px' fontSize='1.2rem' />
												</div>
												<div class="selectPortraitArea">
													<div class="portraitContainer" on:click={() => handleHeroDetailClick(selectedHero)}>
														<img draggable="false" class="selectHeroPortrait" class:claimed={$AppData.MH.List[selectedHero].claimed} src="{$HeroData.find(e => e.id === selectedHero).portrait}" alt="{selectedHero}">
														<span class="coreMark" class:visible={sortedCompList[$AppData.selectedComp].heroes[selectedHero].core}></span>
													</div>
													<p>{$HeroData.find(e => e.id === selectedHero).name}</p>
													<div>
														<StarsInput
															value={sortedCompList[$AppData.selectedComp].heroes[selectedHero].stars}
															enabled={sortedCompList[$AppData.selectedComp].heroes[selectedHero].ascendLv === 6}
															engraving={sortedCompList[$AppData.selectedComp].heroes[selectedHero].engraving}
															displayOnly={true} />
													</div>
												</div>
												<div class="siFurnBoxContainer">
													<SIFurnEngBox type='furn' num={sortedCompList[$AppData.selectedComp].heroes[selectedHero].furn} maxWidth='50px' fontSize='1.2rem' />
												</div>
											</div>
											<div class="lowerSelectCard">
												<div class="ascendBoxContainer">
													<AscendBox
														ascendLv="{sortedCompList[$AppData.selectedComp].heroes[selectedHero].ascendLv}"
														tier={$HeroData.find(e => e.id === selectedHero).tier}
													/>
												</div>
												{#if sortedCompList[$AppData.selectedComp].heroes[selectedHero].stars > 0}
													<div class="engraveBoxContainer">
														<SIFurnEngBox type='engraving' num={sortedCompList[$AppData.selectedComp].heroes[selectedHero].engraving} maxWidth='50px' fontSize='1.2rem' />
													</div>
												{/if}
												{#if sortedCompList[$AppData.selectedComp].heroes[selectedHero].notes.length > 0}
													<div class="heroNotesArea">
														<div class="heroNotes">
															<span>{sortedCompList[$AppData.selectedComp].heroes[selectedHero].notes}</span>
														</div>
													</div>
												{/if}
												{#if sortedCompList[$AppData.selectedComp].heroes[selectedHero].artifacts.primary.length > 0 || sortedCompList[$AppData.selectedComp].heroes[selectedHero].artifacts.secondary.length > 0 || sortedCompList[$AppData.selectedComp].heroes[selectedHero].artifacts.situational.length > 0}
													<div class="artifactsContainer">
														<h5>Artifacts</h5>
														<div class="artifactLine priArtifactLine">
															<h6>Primary</h6>
															<div class="artifactArea">
																{#each sortedCompList[$AppData.selectedComp].heroes[selectedHero].artifacts.primary as artifact}
																	<button type="button" on:click={() => openArtifactDetail(artifact)} class="artifactImgContainer">
																		<img draggable="false" src="{$Artifacts[artifact].image}" alt="{$Artifacts[artifact].name}">
																		<p>{$Artifacts[artifact].name}</p>
																	</button>
																{/each}
															</div>
														</div>
														{#if sortedCompList[$AppData.selectedComp].heroes[selectedHero].artifacts.secondary.length > 0}
															<div class="artifactLine secArtifactLine">
																<h6>Secondary</h6>
																<div class="artifactArea">
																	{#each sortedCompList[$AppData.selectedComp].heroes[selectedHero].artifacts.secondary as artifact}
																		<button type="button" on:click={() => openArtifactDetail(artifact)} class="artifactImgContainer">
																			<img draggable="false" src="{$Artifacts[artifact].image}" alt="{$Artifacts[artifact].name}">
																			<p>{$Artifacts[artifact].name}</p>
																		</button>
																	{/each}
																</div>
															</div>
														{/if}
														{#if sortedCompList[$AppData.selectedComp].heroes[selectedHero].artifacts.situational.length > 0}
															<div class="artifactLine sitArtifactLine">
																<h6>Situational</h6>
																<div class="artifactArea">
																	{#each sortedCompList[$AppData.selectedComp].heroes[selectedHero].artifacts.situational as artifact}
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
									</div>
								</div>
							</div>
						</div>
					</div>
					-->
				</div>
			{/if}
		{/await}
	{/if}
{/if}

<style lang="scss">
	.compLibDetailContainer {
		height: calc(100vh - var(--headerHeight));
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
					background-color: transparent;
					border: 2px solid black;
					border-radius: 10px;
					cursor: pointer;
					display: flex;
					justify-content: center;
					margin: 0px 5px;
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
					border: 2px solid var(--appColorPrimary);
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
					border: 2px solid var(--appDelColor);
					p {
						color: var(--appDelColor);
					}
					&.liked {
						background-color: var(--appDelColor);
						p {
							color: var(--appBGColor);
						}
					}
				}
				.favoriteButton {
					border: 2px solid var(--mythicColor);
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
				.tooltip {
					display: none;
				}
			}
		}
		.compTitle {
			font-size: 1.5rem;
			margin: 0;
			text-align: center;
			width: 100%;
		}
		.ageContainer {
			font-size: 0.8rem;
			text-align: center;
			width: 100%;
		}
	}
</style>
