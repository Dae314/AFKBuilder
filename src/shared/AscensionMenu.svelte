<script>
	import CircleMenu from './CircleMenu.svelte';

	export let menuItemChangeCallback = () => {};
	export let activeItem = 0;
	export let zIndexBase = 1;
	export let centerMenu = false;
	export let tier = 'ascended';
	export let active = true;

	let menuItems;
	let fullItems;
	let menuItemsStyle;
	let fullItemsStyle;

	const rareColor = window.getComputedStyle(document.documentElement).getPropertyValue('--rareColor');
	const rareColorAccent = window.getComputedStyle(document.documentElement).getPropertyValue('--rareColorAccent');
	const eliteColor = window.getComputedStyle(document.documentElement).getPropertyValue('--eliteColor');
	const eliteColorAccent = window.getComputedStyle(document.documentElement).getPropertyValue('--eliteColorAccent');
	const legendColor = window.getComputedStyle(document.documentElement).getPropertyValue('--legendColor');
	const legendColorAccent = window.getComputedStyle(document.documentElement).getPropertyValue('--legendColorAccent');
	const mythicColor = window.getComputedStyle(document.documentElement).getPropertyValue('--mythicColor');
	const mythicColorAccent = window.getComputedStyle(document.documentElement).getPropertyValue('--mythicColorAccent');
	const ascColor1 = window.getComputedStyle(document.documentElement).getPropertyValue('--ascColor1');
	const ascColor1Alpha = window.getComputedStyle(document.documentElement).getPropertyValue('--ascColor1Alpha');
	const ascColor2 = window.getComputedStyle(document.documentElement).getPropertyValue('--ascColor2');
	const ascColor2Alpha = window.getComputedStyle(document.documentElement).getPropertyValue('--ascColor2Alpha');
	const ascColor3 = window.getComputedStyle(document.documentElement).getPropertyValue('--ascColor3');
	const ascColor3Alpha = window.getComputedStyle(document.documentElement).getPropertyValue('--ascColor3Alpha');
	const ascColorAccent = window.getComputedStyle(document.documentElement).getPropertyValue('--ascColorAccent');
	const appWhite = window.getComputedStyle(document.documentElement).getPropertyValue('--appColorWhite');

	if(tier === 'ascended') {
		menuItems = ['E', 'E+', 'L', 'L+', 'M', 'M+', 'A'];
		fullItems = ['Elite', 'Elite+', 'Legendary', 'Legendary+', 'Mythic', 'Mythic+', 'Ascended'];
		menuItemsStyle = [
			`background-color: ${eliteColor}; color: ${appWhite}; border: 2px solid ${eliteColor};`,
			`background-color: ${eliteColor}; color: ${appWhite}; border: 2px solid ${eliteColorAccent};`,
			`background-color: ${legendColor}; color: ${appWhite}; border: 2px solid ${legendColor};`,
			`background-color: ${legendColor}; color: ${appWhite}; border: 2px solid ${legendColorAccent};`,
			`background-color: ${mythicColor}; color: ${appWhite}; border: 2px solid ${mythicColor};`,
			`background-color: ${mythicColor}; color: ${appWhite}; border: 2px solid ${mythicColorAccent};`,
			`background: linear-gradient(${ascColor1}, ${ascColor1Alpha}), linear-gradient(-45deg, ${ascColor2}, ${ascColor2Alpha}), linear-gradient(45deg, ${ascColor3}, ${ascColor3Alpha}); background-blend-mode: multiply; color: white; border: 2px solid ${ascColorAccent};`,
		];
		fullItemsStyle = [
			`background-color: ${eliteColor}; color: ${appWhite}; border: 2px solid ${eliteColor};`,
			`background-color: ${eliteColor}; color: ${appWhite}; border: 2px solid ${eliteColorAccent};`,
			`background-color: ${legendColor}; color: ${appWhite}; border: 2px solid ${legendColor};`,
			`background-color: ${legendColor}; color: ${appWhite}; border: 2px solid ${legendColorAccent};`,
			`background-color: ${mythicColor}; color: ${appWhite}; border: 2px solid ${mythicColor};`,
			`background-color: ${mythicColor}; color: ${appWhite}; border: 2px solid ${mythicColorAccent};`,
			`background: linear-gradient(${ascColor1}, ${ascColor1Alpha}), linear-gradient(-45deg, ${ascColor2}, ${ascColor2Alpha}), linear-gradient(45deg, ${ascColor3}, ${ascColor3Alpha}); background-blend-mode: multiply; color: white; border: 2px solid ${ascColorAccent};`,
		];
	} else {
		menuItems = ['R', 'R+', 'E', 'E+', 'L', 'L+'];
		fullItems = ['Rare', 'Rare+', 'Elite', 'Elite+', 'Legendary', 'Legendary+'];
		menuItemsStyle = [
			`background-color: ${rareColor}; color: ${appWhite}; border: 2px solid ${rareColor};`,
			`background-color: ${rareColor}; color: ${appWhite}; border: 2px solid ${rareColorAccent};`,
			`background-color: ${eliteColor}; color: ${appWhite}; border: 2px solid ${eliteColor};`,
			`background-color: ${eliteColor}; color: ${appWhite}; border: 2px solid ${eliteColorAccent};`,
			`background-color: ${legendColor}; color: ${appWhite}; border: 2px solid ${legendColor};`,
			`background-color: ${legendColor}; color: ${appWhite}; border: 2px solid ${legendColorAccent};`,
		];
		fullItemsStyle = [
			`background-color: ${rareColor}; color: ${appWhite}; border: 2px solid ${rareColor};`,
			`background-color: ${rareColor}; color: ${appWhite}; border: 2px solid ${rareColorAccent};`,
			`background-color: ${eliteColor}; color: ${appWhite}; border: 2px solid ${eliteColor};`,
			`background-color: ${eliteColor}; color: ${appWhite}; border: 2px solid ${eliteColorAccent};`,
			`background-color: ${legendColor}; color: ${appWhite}; border: 2px solid ${legendColor};`,
			`background-color: ${legendColor}; color: ${appWhite}; border: 2px solid ${legendColorAccent};`,
		];
	}

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
	{active}
	containerWidth="80px"
	containerHeight="30px"
	menuItemClickCallback={handleMenuItemClick}
/>

<style lang="scss">
	
</style>
