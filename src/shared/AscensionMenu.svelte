<script>
	import CircleMenu from './CircleMenu.svelte';

	export let menuItemChangeCallback = () => {};
	export let activeItem = 0;
	export let zIndexBase = 1;
	export let centerMenu = false;

	let menuItems = ['E', 'E+', 'L', 'L+', 'M', 'M+', 'A'];
	let fullItems = ['Elite', 'Elite+', 'Legendary', 'Legendary+', 'Mythic', 'Mythic+', 'Ascended'];
	let menuItemsStyle = [
		'background-color: #AF3CEA; color: white; border: 2px solid #AF3CEA;',
		'background-color: #AF3CEA; color: white; border: 2px solid #6D2691;',
		'background-color: #F7BC19; color: white; border: 2px solid #F7BC19;',
		'background-color: #F7BC19; color: white; border: 2px solid #E0920B;',
		'background-color: #E60B51; color: white; border: 2px solid #E60B51;',
		'background-color: #E60B51; color: white; border: 2px solid #A6083A;',
		'background: linear-gradient(#91BDFF, rgba(145, 189, 255, 0)), linear-gradient(-45deg, #E196FF, rgba(225, 150, 255, 0)), linear-gradient(45deg, #B1A3FE, rgba(177, 163, 254, 0)); background-blend-mode: multiply; color: white; border: 2px solid #B289E8;',
	];
	let fullItemsStyle = [
		'background-color: #AF3CEA; color: white; border: 2px solid #AF3CEA;',
		'background-color: #AF3CEA; color: white; border: 2px solid #6D2691;',
		'background-color: #F7BC19; color: white; border: 2px solid #F7BC19;',
		'background-color: #F7BC19; color: white; border: 2px solid #E0920B;',
		'background-color: #E60B51; color: white; border: 2px solid #E60B51;',
		'background-color: #E60B51; color: white; border: 2px solid #A6083A;',
		'background: linear-gradient(#91BDFF, rgba(145, 189, 255, 0)), linear-gradient(-45deg, #E196FF, rgba(225, 150, 255, 0)), linear-gradient(45deg, #B1A3FE, rgba(177, 163, 254, 0)); background-blend-mode: multiply; color: white; border: 2px solid #B289E8;',
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
