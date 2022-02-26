<script>
	import { getAllAuthors, getAllTags, getAllHeroes} from '../rest/RESTFunctions.svelte';
	import LoadingSpinner from '../shared/LoadingSpinner.svelte';

	export let category = 'tag';
	export let curFilter = [];
	export let onSuccess = () => {};

	let errorConf = {};
	let showError = false;
	let resultQuery;

	switch(category) {
		case 'tag':
			resultQuery = getAllTags();
			break;
		case 'hero':
			resultQuery = getAllHeroes();
			break;
		case 'author':
			resultQuery = getAllAuthors();
			break;
		default:
			throw new Error(`ERROR invalid category passed to FilterPicker: ${category}`);
	}
</script>

<div class="filterPickerContainer">
	<div class="filterPickerHead">
		Filter Picker Head here
	</div>
	{#await resultQuery}
		<LoadingSpinner type="dual-ring" size="medium" color="black" />
	{:then result}
		{#each result.data as entity}
			<div>{entity.name}</div>
		{/each}
	{/await}
</div>

<style lang="scss">
	
</style>
