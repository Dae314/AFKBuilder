<script>
	export let ascendLv;
	export let tier = 'ascended';

	function getHeroAscendText(ascLv) {
		if(tier === 'ascended') {
			switch(ascLv) {
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
		} else {
			switch(ascLv) {
				case 0:
					return 'Rare';
				case 1:
					return 'Rare+';
				case 2:
					return 'Elite';
				case 3:
					return 'Elite+';
				case 4:
					return 'Legendary';
				case 5:
					return 'Legendary+';
				default:
					return '';
			}
		}
	}
</script>

<div class="ascendBox ascLv-{ascendLv}" class:fodder={tier !== 'ascended'}>
	<span>{getHeroAscendText(ascendLv)}</span>
</div>

<style lang="scss">
	.ascendBox {
		border-radius: 10px;
		color: white;
		font-weight: bold;
		padding: 5px 10px;
		width: fit-content;
		span {
			user-select: none;
		}
		&.fodder {
			&.ascLv-0 {
				background-color: var(--rareColor);
				border: 3px solid var(--rareColor);
			}
			&.ascLv-1 {
				background-color: var(--rareColor);
				border: 3px solid var(--rareColorAccent);
			}
			&.ascLv-2 {
				background-color: var(--eliteColor);
				border: 3px solid var(--eliteColor);
			}
			&.ascLv-3 {
				background-color: var(--eliteColor);
				border: 3px solid var(--eliteColorAccent);
			}
			&.ascLv-4 {
				background-color: var(--legendColor);
				border: 3px solid var(--legendColor);
			}
			&.ascLv-5 {
				background-color: var(--legendColor);
				border: 3px solid var(--legendColorAccent);
			}
		}
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
		background: linear-gradient(var(--ascColor1), var(--ascColor1Alpha)), linear-gradient(-45deg, var(--ascColor2), var(--ascColor2Alpha)), linear-gradient(45deg, var(--ascColor3), var(--ascColor3Alpha));
		background-blend-mode: multiply;
		border: 3px solid var(--ascColorAccent);
	}
</style>
