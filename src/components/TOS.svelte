<script>
	import {onMount} from 'svelte';
	import AppData from '../stores/AppData.js';

	const lastUpdate = '7 April 2022';

	onMount(async () => {
		$AppData.activeView = 'about';
		dispatch('routeEvent', {action: 'saveData'});
	});
</script>

<div class="TOSContainer">
	<h2>Website Terms and Conditions of Use</h2>

	<h3>1. Terms</h3>

	<p>By accessing this Website, accessible from https://afkbuilder.com, you are agreeing to be bound by these Website Terms and Conditions of Use and agree that you are responsible for the agreement with any applicable local laws. If you disagree with any of these terms, you are prohibited from accessing this site. The materials contained in this Website are protected by copyright and trade mark law.</p>

	<h3>2. Use License</h3>

	<p>Permission is granted to temporarily download one copy of the materials on AFKBuilder's Website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>

	<ul>
		<li>remove any copyright or other proprietary notations from the materials; or</li>
		<li>transferring the materials to another person or "mirror" the materials on any other server.</li>
	</ul>

	<p>This will let AFKBuilder to terminate upon violations of any of these restrictions. Upon termination, your viewing right will also be terminated and you should destroy any downloaded materials in your possession whether it is printed or electronic format. These Terms of Service has been created with the help of the <a href="https://www.termsofservicegenerator.net" target="_blank" rel="noreferrer noopener">Terms Of Service Generator</a>.</p>

	<h3>3. Disclaimer</h3>

	<p>All the materials on AFKBuilder's Website are provided "as is". AFKBuilder makes no warranties, may it be expressed or implied, therefore negates all other warranties. Furthermore, AFKBuilder does not make any representations concerning the accuracy or reliability of the use of the materials on its Website or otherwise relating to such materials or any sites linked to this Website.</p>

	<h3>4. Limitations</h3>

	<p>AFKBuilder or its suppliers will not be hold accountable for any damages that will arise with the use or inability to use the materials on AFKBuilder's Website, even if AFKBuilder or an authorize representative of this Website has been notified, orally or written, of the possibility of such damage. Some jurisdiction does not allow limitations on implied warranties or limitations of liability for incidental damages, these limitations may not apply to you.</p>

	<h3>5. Revisions and Errata</h3>

	<p>The materials appearing on AFKBuilder's Website may include technical, typographical, or photographic errors. AFKBuilder will not promise that any of the materials in this Website are accurate, complete, or current. AFKBuilder may change the materials contained on its Website at any time without notice. AFKBuilder does not make any commitment to update the materials.</p>

	<h3>6. Links</h3>

	<p>AFKBuilder has not reviewed all of the sites linked to its Website and is not responsible for the contents of any such linked site. The presence of any link does not imply endorsement by AFKBuilder of the site. The use of any linked website is at the user's own risk.</p>

	<h3>7. Site Terms of Use Modifications</h3>

	<p>AFKBuilder may revise these Terms of Use for its Website at any time without prior notice. By using this Website, you are agreeing to be bound by the current version of these Terms and Conditions of Use. This Terms and Conditions of Use was last updated on {lastUpdate}.</p>

	<h3>8. Your Privacy</h3>

	<p>Please read our <a href={`${window.location.origin}/#/privacy`} target="_blank" rel="noreferrer noopener">Privacy Policy</a>.</p>

	<h3>9. Governing Law</h3>

	<p>Any claim related to AFKBuilder's Website shall be governed by the laws of The United States of America without regards to its conflict of law provisions.</p>
</div>

<style lang="scss">
	.TOSContainer {
		height: 100%;
		height: calc(var(--vh, 1vh) * 100 - var(--headerHeight)); /* gymnastics to set height for mobile browsers */
		overflow-y: auto;
		padding: 10px;
		width: 100%;
	}
	h2 {
		margin: 10px 0px;
	}
	h3 {
		margin: 5px 0px;
		margin-top: 10px;
	}
	p {
		margin: 0;
		margin-bottom: 10px;
	}
	a {
		&:link {
			color: var(--appColorPrimary);
		}
		&:visited {
			color: var(--appColorPrimary);
		}
	}
</style>
