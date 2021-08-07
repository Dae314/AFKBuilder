<script>
	import CircleMenu from './CircleMenu.svelte';

	export let menuItemChangeCallback = () => {};
	export let activeItem = 0;
	export let zIndexBase = 1;
	export let centerMenu = false;

	let menuItems = ['OFF', '+0', '+5', '+10', '+15', '+20', '+25', '+30', '+35', '+40'];
	let fullItems = ['SI OFF', 'SI +0', 'SI +5', 'SI +10', 'SI +15', 'SI +20', 'SI +25', 'SI +30', 'SI +35', 'SI +40'];
	let menuItemsStyle = [
		'background-color: #6B8DF2; color: white; border: 2px solid #6B8DF2;',
		'background-color: #6B8DF2; color: white; border: 2px solid #6B8DF2;',
		'background-color: #6B8DF2; color: white; border: 2px solid #6B8DF2;',
		'background-color: #6B8DF2; color: white; border: 2px solid #6B8DF2;',
		'background-color: #6B8DF2; color: white; border: 2px solid #6B8DF2;',
		'background-color: #6B8DF2; color: white; border: 2px solid #6B8DF2;',
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
		'background-color: #6B8DF2; color: white; border: 2px solid #6B8DF2;',
		'background-color: #6B8DF2; color: white; border: 2px solid #6B8DF2;',
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
	{centerMenu}
	containerWidth="80px"
	containerHeight="30px"
	menuItemClickCallback={handleMenuItemClick}
/>

<style lang="scss">
	
</style>
