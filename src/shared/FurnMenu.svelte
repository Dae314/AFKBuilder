<script>
	import CircleMenu from './CircleMenu.svelte';

	export let menuItemChangeCallback = () => {};
	export let activeItem = 0;
	export let zIndexBase = 1;
	export let centerMenu = false;
	export let active = true;

	let menuItems = ['0F', '3F', '9F'];
	let fullItems = ['0 Furn', '3 Furn', '9 Furn'];
	let menuItemsStyle = [
		'background-color: #F0F0F2; color: #6B8DF2; border: none;',
		'background-color: #F0F0F2; color: #6B8DF2; border: none;',
		'background-color: #F0F0F2; color: #6B8DF2; border: none;',
	];
	let fullItemsStyle = [
		'background-color: #F0F0F2; color: #6B8DF2; border: none;',
		'background-color: #F0F0F2; color: #6B8DF2; border: none;',
		'background-color: #F0F0F2; color: #6B8DF2; border: none;',
	];

	function handleMenuItemClick(index) {
		activeItem = index;
		let trueFurn = 0;
		switch(index) {
			case 0:
				trueFurn = 0;
				break;
			case 1:
				trueFurn = 3;
				break;
			case 2:
				trueFurn = 9;
				break;
			default:
				throw new Error(`Invalid furniture level provided: ${index}`);
		}
		menuItemChangeCallback(trueFurn);
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
	{active}
	containerWidth="80px"
	containerHeight="30px"
	menuItemClickCallback={handleMenuItemClick}
/>

<style lang="scss">
	
</style>
