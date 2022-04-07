<script>
	import {onMount} from 'svelte';
	import AppData from '../stores/AppData.js';

	const lastUpdate = '6 April 2022';

	onMount(async () => {
		$AppData.activeView = 'about';
		dispatch('routeEvent', {action: 'saveData'});
	});
</script>

<div class="PrivPolicyContainer">
	<h2>Privacy Policy for AFKBuilder</h2>

	<p>At AFKBuilder, accessible from https://afkbuilder.com, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by AFKBuilder and how we use it.</p>

	<p>If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us. Our Privacy Policy was generated with the help of <a href="https://www.gdprprivacynotice.com/" target="_blank" rel="noreferrer noopener">GDPR Privacy Policy Generator from GDPRPrivacyNotice.com</a></p>

	<h3>General Data Protection Regulation (GDPR)</h3>
	<p>We are a Data Controller of your information.</p>

	<p>AFKBuilder legal basis for collecting and using the personal information described in this Privacy Policy depends on the Personal Information we collect and the specific context in which we collect the information:</p>
	<ul>
			<li>AFKBuilder needs to perform a contract with you</li>
			<li>You have given AFKBuilder permission to do so</li>
			<li>Processing your personal information is in AFKBuilder legitimate interests</li>
			<li>AFKBuilder needs to comply with the law</li>
	</ul>
		
	<p>AFKBuilder will retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use your information to the extent necessary to comply with our legal obligations, resolve disputes, and enforce our policies.</p>

	<p>If you are a resident of the European Economic Area (EEA), you have certain data protection rights. If you wish to be informed what Personal Information we hold about you and if you want it to be removed from our systems, please contact us.</p>
	<p>In certain circumstances, you have the following data protection rights:</p>
	<ul>
			<li>The right to access, update or to delete the information we have on you.</li>
			<li>The right of rectification.</li> 
			<li>The right to object.</li>
			<li>The right of restriction.</li>
			<li>The right to data portability</li>
			<li>The right to withdraw consent</li>
	</ul>

	<h3>What data do we collect?</h3>
	
	<ul>
		<li>Name (only collected when logging in with oauth, and may be changed on the <a href="${window.location.origin}/#/profile" target="_blank" rel="noreferrer noopener">Profile</a> settings</li>
		<li>Email (only collected when logging in with oauth, will only be stored and never used in the website or given out to third parties)</li>
		<li>Necessary cookies</li>
	</ul>

	<h3>How will we use your data?</h3>
	
	<p>AFKBuilder collects your data so that we can:</p>

	<ul>
		<li>Enable core functionality on the website</li>
	</ul>

	<h3>Cookies and Web Beacons</h3>

	<p>Like any other website, AFKBuilder uses 'cookies'. These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.</p>

	<p>For more general information on cookies, please read <a href="https://www.generateprivacypolicy.com/#cookies" target="_blank" rel="noreferrer noopener">"Cookies" article from the Privacy Policy Generator</a>.</p>

	<h3>Privacy policies of other websites</h3>

	<p>The AFKBuilder website contains links to other websites. Our privacy policy applies only to our website, so if you click on a link to another website, you should read their privacy policy.</p>

	<h3>Children's Information</h3>

	<p>Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity.</p>

	<p>AFKBuilder does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you think that your child provided this kind of information on our website, we strongly encourage you to contact us immediately and we will do our best efforts to promptly remove such information from our records.</p>

	<h3>Online Privacy Policy Only</h3>

	<p>Our Privacy Policy applies only to our online activities and is valid for visitors to our website with regards to the information that they shared and/or collect in AFKBuilder. This policy is not applicable to any information collected offline or via channels other than this website.</p>

	<h3>Changes to our privacy policy</h3>
	
	<p>AFKBuilder keeps its privacy policy under regular review and places any updates on this web page. This privacy policy was last updated on {lastUpdate}.</p>

	<h3>Consent</h3>

	<p>By using our website, you hereby consent to our Privacy Policy and agree to its terms.</p>
</div>

<style lang="scss">
	.PrivPolicyContainer {
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
