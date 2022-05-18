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

	const appBGColor = window.getComputedStyle(document.documentElement).getPropertyValue('--appBGColor');
	const appColorPrimary = window.getComputedStyle(document.documentElement).getPropertyValue('--appColorPrimary');

	if(si40) {
		menuItems = ['OFF', '+0', '+5', '+10', '+15', '+20', '+25', '+30', '+35', '+40'];
		fullItems = ['SI OFF', 'SI +0', 'SI +5', 'SI +10', 'SI +15', 'SI +20', 'SI +25', 'SI +30', 'SI +35', 'SI +40'];
		menuItemsStyle = [
			`background-color: ${appBGColor}; color: ${appColorPrimary}; border: none;`,
			`background-color: ${appBGColor}; color: ${appColorPrimary}; border: none;`,
			`background-color: ${appBGColor}; color: ${appColorPrimary}; border: none;`,
			`background-color: ${appBGColor}; color: ${appColorPrimary}; border: none;`,
			`background-color: ${appBGColor}; color: ${appColorPrimary}; border: none;`,
			`background-color: ${appBGColor}; color: ${appColorPrimary}; border: none;`,
			`background-color: ${appBGColor}; color: ${appColorPrimary}; border: none;`,
			`background-color: ${appBGColor}; color: ${appColorPrimary}; border: none;`,
			`background-color: ${appBGColor}; color: ${appColorPrimary}; border: none;`,
			`background-color: ${appBGColor}; color: ${appColorPrimary}; border: none;`,
		];
		fullItemsStyle = [
			`background-color: ${appBGColor}; color: ${appColorPrimary}; border: none;`,
			`background-color: ${appBGColor}; color: ${appColorPrimary}; border: none;`,
			`background-color: ${appBGColor}; color: ${appColorPrimary}; border: none;`,
			`background-color: ${appBGColor}; color: ${appColorPrimary}; border: none;`,
			`background-color: ${appBGColor}; color: ${appColorPrimary}; border: none;`,
			`background-color: ${appBGColor}; color: ${appColorPrimary}; border: none;`,
			`background-color: ${appBGColor}; color: ${appColorPrimary}; border: none;`,
			`background-color: ${appBGColor}; color: ${appColorPrimary}; border: none;`,
			`background-color: ${appBGColor}; color: ${appColorPrimary}; border: none;`,
			`background-color: ${appBGColor}; color: ${appColorPrimary}; border: none;`,
		];
	} else {
		menuItems = ['OFF', '+0', '+5', '+10', '+15', '+20', '+25', '+30'];
		fullItems = ['SI OFF', 'SI +0', 'SI +5', 'SI +10', 'SI +15', 'SI +20', 'SI +25', 'SI +30'];
		menuItemsStyle = [
			`background-color: ${appBGColor}; color: ${appColorPrimary}; border: none;`,
			`background-color: ${appBGColor}; color: ${appColorPrimary}; border: none;`,
			`background-color: ${appBGColor}; color: ${appColorPrimary}; border: none;`,
			`background-color: ${appBGColor}; color: ${appColorPrimary}; border: none;`,
			`background-color: ${appBGColor}; color: ${appColorPrimary}; border: none;`,
			`background-color: ${appBGColor}; color: ${appColorPrimary}; border: none;`,
			`background-color: ${appBGColor}; color: ${appColorPrimary}; border: none;`,
			`background-color: ${appBGColor}; color: ${appColorPrimary}; border: none;`,
		];
		fullItemsStyle = [
			`background-color: ${appBGColor}; color: ${appColorPrimary}; border: none;`,
			`background-color: ${appBGColor}; color: ${appColorPrimary}; border: none;`,
			`background-color: ${appBGColor}; color: ${appColorPrimary}; border: none;`,
			`background-color: ${appBGColor}; color: ${appColorPrimary}; border: none;`,
			`background-color: ${appBGColor}; color: ${appColorPrimary}; border: none;`,
			`background-color: ${appBGColor}; color: ${appColorPrimary}; border: none;`,
			`background-color: ${appBGColor}; color: ${appColorPrimary}; border: none;`,
			`background-color: ${appBGColor}; color: ${appColorPrimary}; border: none;`,
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
