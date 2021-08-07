<script>
	import CircleMenu from './CircleMenu.svelte';

	export let menuItemChangeCallback = () => {};
	export let activeItem = 0;
	export let zIndexBase = 1;

	let menuItems = ['0F', '3F', '9F', '36F'];
	let fullItems = ['0 Furn', '3 Furn', '9 Furn', '36 Furn'];
	let menuItemsStyle = [
		'background-color: #6B8DF2; color: white; border: 2px solid #6B8DF2;',
		'background-color: #6B8DF2; color: white; border: 2px solid #6B8DF2;',
		'background-color: #6B8DF2; color: white; border: 2px solid #6B8DF2;',
		'background-color: #6B8DF2; color: white; border: 2px solid #6B8DF2;',
	];
	let fullItemsStyle = [
		'background-color: #6B8DF2; color: white; border: 2px solid #6B8DF2;',
		'background-color: #6B8DF2; color: white; border: 2px solid #6B8DF2;',
		'background-color: #6B8DF2; color: white; border: 2px solid #6B8DF2;',
		'background-color: #6B8DF2; color: white; border: 2px solid #6B8DF2;',
	];

	function handleMenuItemClick(index) {
		activeItem = index;
		menuItemChangeCallback(index);
	}
</script>

<CircleMenu
	{menuItems}
	{menuItemsStyle}
	{fullItems}
	{fullItemsStyle}
	{activeItem}
	{zIndexBase}
	containerWidth="80px"
	containerHeight="30px"
	menuItemClickCallback={handleMenuItemClick}
/>

<style lang="scss">
	
</style>
