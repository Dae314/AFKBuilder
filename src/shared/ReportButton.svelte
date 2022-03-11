<script>
	import {getContext} from 'svelte';
	import Report from '../modals/Report.svelte';
	import ModalCloseButton from '../modals/ModalCloseButton.svelte';

	export let reportData;
	export let reportType;

	const { open } = getContext('simple-modal');

	function handleReportClick() {
		open(Report, 
		{ target: {type: reportType, data: reportData}, },
		{ closeButton: ModalCloseButton,
			styleContent: {background: '#F0F0F2', padding: 0, borderRadius: '10px'},
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
		border: 2px solid var(--appDelColor);
		border-radius: 10px;
		color: var(--appBGColor);
		cursor: pointer;
		justify-content: center;
		outline: none;
		padding: 5px;
		.reportImage {
			margin-right: 5px;
			max-width: 15px;
		}
	}
</style>
