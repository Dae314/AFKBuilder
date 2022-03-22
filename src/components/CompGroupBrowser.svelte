<script>
	import AppData from '../stores/AppData.js';
</script>

<div class="groupBrowserContainer">
	<ul class="groupGrid">
		<li class="newGroup">
			<button type="button" class="newGroupButton">
				<span>New Group</span>
			</button>
		</li>
		{#each $AppData.compGroups as group}
			<button type="button" class="groupButton">
				<span>{group.name}</span>
			</button>
		{/each}
	</ul>
</div>

<style lang="scss">
	.groupBrowserContainer {
		height: 100%;
		width: 100%;
	}
	.groupGrid {
		
	}
</style>
