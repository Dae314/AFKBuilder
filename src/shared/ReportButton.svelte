<script>
	import {getContext} from 'svelte';
	import Report from '../modals/Report.svelte';
	import ModalCloseButton from '../modals/ModalCloseButton.svelte';

	export let reportData;
	export let reportType;

	const { open } = getContext('simple-modal');

	function handleReportClick() {
		const bgColor = window.getComputedStyle(document.documentElement).getPropertyValue('--appBGColor');
		open(Report, 
		{ target: {type: reportType, data: reportData}, },
		{ closeButton: ModalCloseButton,
			styleWindow: { background: bgColor },
			styleContent: {background: bgColor, padding: 0, borderRadius: '10px'},
		});
	}
</script>

<button class="reportButton" on:click={handleReportClick}>
	<img src="./img/utility/report.png" class="reportImage" alt="Report" />
	<span>Report</span>
</button>

<style lang="scss">
	.reportButton {
		align-items: center;
		display: flex;
		background-color: var(--appDelColor);
		border: none;
		border-radius: 10px;
		box-shadow: var(--neu-sm-i-BGColor-shadow);
		color: var(--appColorWhite);
		cursor: pointer;
		justify-content: center;
		outline: none;
		padding: 8px;
		.reportImage {
			margin-right: 5px;
			max-width: 15px;
		}
	}
</style>
