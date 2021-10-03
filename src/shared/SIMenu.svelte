<script>
	import CircleMenu from './CircleMenu.svelte';

	export let menuItemChangeCallback = () => {};
	export let activeItem = 0;
	export let zIndexBase = 1;
	export let centerMenu = false;
	export let si40 = true;
	export let active = true;

	let menuItems = [];
	let fullItems = [];
	let menuItemsStyle = [];
	let fullItemsStyle = [];
	if(si40) {
		menuItems = ['OFF', '+0', '+5', '+10', '+15', '+20', '+25', '+30', '+35', '+40'];
		fullItems = ['SI OFF', 'SI +0', 'SI +5', 'SI +10', 'SI +15', 'SI +20', 'SI +25', 'SI +30', 'SI +35', 'SI +40'];
		menuItemsStyle = [
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
		fullItemsStyle = [
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
	} else {
		menuItems = ['OFF', '+0', '+5', '+10', '+15', '+20', '+25', '+30'];
		fullItems = ['SI OFF', 'SI +0', 'SI +5', 'SI +10', 'SI +15', 'SI +20', 'SI +25', 'SI +30'];
		menuItemsStyle = [
			'background-color: #6B8DF2; color: white; border: 2px solid #6B8DF2;',
			'background-color: #6B8DF2; color: white; border: 2px solid #6B8DF2;',
			'background-color: #6B8DF2; color: white; border: 2px solid #6B8DF2;',
			'background-color: #6B8DF2; color: white; border: 2px solid #6B8DF2;',
			'background-color: #6B8DF2; color: white; border: 2px solid #6B8DF2;',
			'background-color: #6B8DF2; color: white; border: 2px solid #6B8DF2;',
			'background-color: #6B8DF2; color: white; border: 2px solid #6B8DF2;',
			'background-color: #6B8DF2; color: white; border: 2px solid #6B8DF2;',
		];
		fullItemsStyle = [
			'background-color: #6B8DF2; color: white; border: 2px solid #6B8DF2;',
			'background-color: #6B8DF2; color: white; border: 2px solid #6B8DF2;',
			'background-color: #6B8DF2; color: white; border: 2px solid #6B8DF2;',
			'background-color: #6B8DF2; color: white; border: 2px solid #6B8DF2;',
			'background-color: #6B8DF2; color: white; border: 2px solid #6B8DF2;',
			'background-color: #6B8DF2; color: white; border: 2px solid #6B8DF2;',
			'background-color: #6B8DF2; color: white; border: 2px solid #6B8DF2;',
			'background-color: #6B8DF2; color: white; border: 2px solid #6B8DF2;',
		];
	}

	function handleMenuItemClick(index) {
		activeItem = index;
		let trueSI = index === 0 ? -1 : (index - 1) * 5;
		menuItemChangeCallback(trueSI);
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
