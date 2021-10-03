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

	if(tier === 'ascended') {
		menuItems = ['E', 'E+', 'L', 'L+', 'M', 'M+', 'A'];
		fullItems = ['Elite', 'Elite+', 'Legendary', 'Legendary+', 'Mythic', 'Mythic+', 'Ascended'];
		menuItemsStyle = [
			'background-color: #AF3CEA; color: white; border: 2px solid #AF3CEA;',
			'background-color: #AF3CEA; color: white; border: 2px solid #6D2691;',
			'background-color: #F7BC19; color: white; border: 2px solid #F7BC19;',
			'background-color: #F7BC19; color: white; border: 2px solid #E0920B;',
			'background-color: #E60B51; color: white; border: 2px solid #E60B51;',
			'background-color: #E60B51; color: white; border: 2px solid #A6083A;',
			'background: linear-gradient(#91BDFF, rgba(145, 189, 255, 0)), linear-gradient(-45deg, #E196FF, rgba(225, 150, 255, 0)), linear-gradient(45deg, #B1A3FE, rgba(177, 163, 254, 0)); background-blend-mode: multiply; color: white; border: 2px solid #B289E8;',
		];
		fullItemsStyle = [
			'background-color: #AF3CEA; color: white; border: 2px solid #AF3CEA;',
			'background-color: #AF3CEA; color: white; border: 2px solid #6D2691;',
			'background-color: #F7BC19; color: white; border: 2px solid #F7BC19;',
			'background-color: #F7BC19; color: white; border: 2px solid #E0920B;',
			'background-color: #E60B51; color: white; border: 2px solid #E60B51;',
			'background-color: #E60B51; color: white; border: 2px solid #A6083A;',
			'background: linear-gradient(#91BDFF, rgba(145, 189, 255, 0)), linear-gradient(-45deg, #E196FF, rgba(225, 150, 255, 0)), linear-gradient(45deg, #B1A3FE, rgba(177, 163, 254, 0)); background-blend-mode: multiply; color: white; border: 2px solid #B289E8;',
		];
	} else {
		menuItems = ['R', 'R+', 'E', 'E+', 'L', 'L+'];
		fullItems = ['Rare', 'Rare+', 'Elite', 'Elite+', 'Legendary', 'Legendary+'];
		menuItemsStyle = [
			'background-color: #5EAFFA; color: white; border: 2px solid #5EAFFA;',
			'background-color: #5EAFFA; color: white; border: 2px solid #4D8DC8;',
			'background-color: #AF3CEA; color: white; border: 2px solid #AF3CEA;',
			'background-color: #AF3CEA; color: white; border: 2px solid #6D2691;',
			'background-color: #F7BC19; color: white; border: 2px solid #F7BC19;',
			'background-color: #F7BC19; color: white; border: 2px solid #E0920B;',
		];
		fullItemsStyle = [
			'background-color: #5EAFFA; color: white; border: 2px solid #5EAFFA;',
			'background-color: #5EAFFA; color: white; border: 2px solid #4D8DC8;',
			'background-color: #AF3CEA; color: white; border: 2px solid #AF3CEA;',
			'background-color: #AF3CEA; color: white; border: 2px solid #6D2691;',
			'background-color: #F7BC19; color: white; border: 2px solid #F7BC19;',
			'background-color: #F7BC19; color: white; border: 2px solid #E0920B;',
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
