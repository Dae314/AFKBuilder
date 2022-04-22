<script>
	import { onMount, createEventDispatcher } from 'svelte';
	import qs from 'qs';
	import JSONURL from 'json-url';
	import AppData from '../stores/AppData.js';
	import AvatarInput from '../shared/AvatarInput.svelte';
	import LoadingPage from '../shared/LoadingPage.svelte';
	import ReportButton from '../shared/ReportButton.svelte';
	import CompLibCard from './CompLibCard.svelte';
	import ErrorDisplay from './ErrorDisplay.svelte';
	import {getAuthorDetails} from '../rest/RESTFunctions.svelte';
	
	export let params = {};
	const dispatch = createEventDispatcher();
	const jsurl = JSONURL('lzma'); // json-url compressor

	let username = params.username;
	let user = {};
	let comps = [];
	let showErrorDisplay = false;
	let errorDisplayConf = {};
	let sections = [
		{ id: 'published',
			name: 'Published',
			icon: './img/utility/explore_white.png',
		},
		{ id: 'favorites',
			name: 'Favorites',
			icon: './img/utility/favorite_filled_white.png',
		},
	];
	let curSection = 0;

	onMount(async () => {
		$AppData.activeView = 'user';
		dispatch('routeEvent', {action: 'saveData'});
	});

	async function populateAuthorData() {
		const response = await getAuthorDetails(username);
		if(response.status !== 200) {
			errorDisplayConf = {
				errorCode: response.status,
				headText: 'Something went wrong',
				detailText: response.data,
				showHomeButton: true,
			};
			showErrorDisplay = true;
		}
		let data;
		for(let comp of response.data.comps) {
			try {
				const json = await jsurl.decompress(comp.comp_string);
				data = JSON.parse(json);
			} catch(err) {
				errorDisplayConf = {
					errorCode: 400,
					headText: 'Unable to process comps',
					detailText: 'See console for details',
					showHomeButton: false,
				};
				console.log(err);
				showErrorDisplay = true;
				return;
			}
			comp.line_preview = data.lines[0].heroes;
		}
		comps = response.data.comps;

		for(let comp of response.data.author.saved_comps) {
			try {
				const json = await jsurl.decompress(comp.comp_string);
				data = JSON.parse(json);
			} catch(err) {
				errorDisplayConf = {
					errorCode: 400,
					headText: 'Unable to process comps',
					detailText: 'See console for details',
					showHomeButton: false,
				};
				console.log(err);
				showErrorDisplay = true;
				return;
			}
			comp.line_preview = data.lines[0].heroes;
		}
		user = response.data.author;
	}

	function handleSectionClick(type) {
		switch(type) {
			case 'published':
				curSection = sections.findIndex(e => e.id === 'published');
				break;
			case 'favorites':
				curSection = sections.findIndex(e => e.id === 'favorites');
				break;
			default:
				throw new Error(`ERROR: invalid type passed to handleSectionClick: ${type}`);
		}
	}

	function handleCardEvent(event) {
		switch(event.detail.action) {
			case 'saveData':
				dispatch('routeEvent', {action: 'saveData'});
				break;
			case 'logout':
				dispatch('routeEvent', {action: 'logout'});
				break;
			case 'syncFavorites':
				dispatch('routeEvent', {action: 'syncFavorites'});
				break;
			default:
				throw new Error(`Invalid action specified for card event: ${event.detail.action}`);
		}
	}

	function handleShowMoreClick(type) {
		let newQS = new URLSearchParams();
		switch(type) {
			case 'published':
				const author = qs.stringify({
					filter: [{
						displayName: user.username,
						id: user.id,
						name: user.username,
						type: "include",
					}]
				});
				newQS.set('author_filter', author);
				window.location.assign(`${window.location.origin}/#/explore?${newQS.toString()}`);
				break;
			default:
				throw new Error(`Invalid type passed to handleShowMoreClick: ${type}`);
		}
	}
</script>

{#await populateAuthorData()}
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
		<div class="userContainer">
			<section class="titleArea">
				<div class="userArea">
					<AvatarInput avatar={user.avatar} editable={false} />
					<div class="userHeadline">
						<h3>{user.username}</h3>
						<p class="userSubtitle">{user.upvotes} Received Likes</p>
					</div>
				</div>
				<div class="reportArea">
					<ReportButton reportType="user" reportData={user} />
				</div>
			</section>
			<section class="bodyArea">
				<div class="compArea">
					<h2>Comps</h2>
					<div class="sectionPicker">
						<ul class="sectionList">
							{#each sections as section, i}
								<li>
									<button class="sectionButton" class:open={curSection === i} on:click={() => handleSectionClick(section.id)}>
										<img class="sectionImage" src={section.icon} alt={section.name}>
										<span>{section.name}</span>
									</button>
								</li>
							{/each}
						</ul>
					</div>
					<div class="compContainer">
						{#if curSection === 0}
							{#each comps as comp}
								<div class="cardContainer">
									<CompLibCard comp={comp} on:cardEvent={handleCardEvent} />
								</div>
							{/each}
							<div class="showMoreArea">
								<button type="button" class="showMoreButton" on:click={() => handleShowMoreClick('published')}>Show More</button>
							</div>
						{:else if curSection === 1}
							{#each user.saved_comps as comp}
								<div class="cardContainer">
									<CompLibCard comp={comp} on:cardEvent={handleCardEvent} />
								</div>
							{/each}
						{/if}
					</div>
				</div>
			</section>
		</div>
	{/if}
{/await}

<style lang="scss">
	.userContainer {
		display: flex;
		flex-direction: column;
		height: calc(100vh - var(--headerHeight));
		overflow-y: auto;
		padding: 10px;
		width: 100%;
	}
	.titleArea {
		padding-bottom: 10px;
		position: relative;
		width: 100%;
		&:after {
			content: '';
			position: absolute;
			bottom: 0;
			width: 80%; // controls length
			left: 10%; // controls centering, use % to center
			border-bottom: 2px solid black;
		}
		.userArea {
			align-items: center;
			display: flex;
			flex-direction: column;
			justify-content: center;
			.userHeadline {
				h3 {
					margin: 0;
					text-align: center;
				}
				.userSubtitle {
					font-size: 0.8rem;
					margin: 0;
					text-align: center;
				}
			}
		}
		.reportArea {
			position: absolute;
			right: 0px;
			top: 0px;
		}
	}
	.bodyArea {
		.compArea {
			h2 {
				margin: 10px 0px;
			}
			.sectionPicker {
				.sectionList {
					display: flex;
					flex-direction: row;
					list-style-type: none;
					margin: 0;
					padding: 0;
					.sectionButton {
						align-items: center;
						background: var(--appBGColor);
						border: none;
						border-radius: 10px;
						box-shadow: var(--neu-sm-i-BGColor-shadow);
						cursor: pointer;
						display: flex;
						font-size: 1.2rem;
						height: 40px;
						justify-content: center;
						margin: 0px 10px;
						outline: none;
						padding: 5px;
						img {
							filter: invert(1);
							max-width: 30px;
							opacity: 0.3;
						}
						span {
							opacity: 0.3;
							padding-left: 5px;
						}
						&.open {
							img {
								opacity: 1;
							}
							span {
								opacity: 1;
							}
						}
					}
					li {
						&:first-child {
							.sectionButton {
								margin-left: 0px;
							}
						}
					}
				}
			}
			.compContainer {
				border-radius: 10px;
				display: grid;
				grid-gap: 15px 15px;
				grid-template-columns: repeat(auto-fill, minmax(400px, 400px));
				grid-auto-rows: 240px;
				justify-content: space-evenly;
				margin-top: 15px;
				padding-top: 15px;
			}
			.showMoreArea {
				align-items: center;
				display: flex;
				height: 100%;
				justify-content: center;
				width: 100%;
				.showMoreButton {
					background-color: var(--appBGColor);
					border: none;
					border-radius: 10px;
					box-shadow: var(--neu-med-i-BGColor-shadow);
					color: var(--appColorPrimary);
					cursor: pointer;
					font-weight: bold;
					font-size: 2rem;
					outline: none;
					padding: 10px;
				}
			}
		}
	}
	@media only screen and (min-width: 767px) {
		.userContainer {
			height: 100vh;
			padding: 10px 30px;
		}
		.titleArea {
			&:after {
				left: 8px;
			}
			.userArea {
				flex-direction: row;
				justify-content: flex-start;
				.userHeadline {
					margin-left: 10px;
					h3 {
						text-align: left;
					}
					.userSubtitle {
						text-align: left;
					}
				}
			}
			.reportArea {
				justify-content: flex-start;
				padding-left: 5px;
			}
		}
		.bodyArea {
			.compArea {
				.showMoreArea {
					.showMoreButton {
						&:hover {
							background: var(--neu-convex-BGColor-bg);
						}
					}
				}
			}
		}
	}
</style>
