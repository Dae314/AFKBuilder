<script>
	export let ascendLv;

	function getHeroAscendText(ascLv) {
		switch(ascendLv) {
			case 0:
				return 'Elite';
			case 1:
				return 'Elite+';
			case 2:
				return 'Legendary';
			case 3:
				return 'Legendary+';
			case 4:
				return 'Mythic';
			case 5:
				return 'Mythic+';
			case 6:
				return 'Ascended';
			default:
				return '';
		}
	}
</script>

<div class="ascendBox ascLv-{ascendLv}">
	<span>{getHeroAscendText(ascendLv)}</span>
</div>

<style>
	.ascendBox {
		border-radius: 10px;
		color: white;
		font-weight: bold;
		padding: 5px 10px;
		width: fit-content;
	}
	.ascendBox span {
		-ms-user-select: none;
		user-select: none;
		-webkit-user-select: none;
	}
	.ascLv-0 {
		background-color: var(--eliteColor);
		border: 3px solid var(--eliteColor);
	}
	.ascLv-1 {
		background-color: var(--eliteColor);
		border: 3px solid var(--eliteColorAccent);
	}
	.ascLv-2 {
		background-color: var(--legendColor);
		border: 3px solid var(--legendColor);
	}
	.ascLv-3 {
		background-color: var(--legendColor);
		border: 3px solid var(--legendColorAccent);
	}
	.ascLv-4 {
		background-color: var(--mythicColor);
		border: 3px solid var(--mythicColor);
	}
	.ascLv-5 {
		background-color: var(--mythicColor);
		border: 3px solid var(--mythicColorAccent);
	}
	.ascLv-6 {
		background: linear-gradient(var(--ascColor1), transparent), linear-gradient(-45deg, var(--ascColor2), transparent), linear-gradient(45deg, var(--ascColor3), transparent);
		background-blend-mode: multiply;
		border: 3px solid var(--ascColorAccent);
	}
</style>
