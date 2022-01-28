<script context="module">
	let tokenCache = readCache();

	// utility function to save token data to localstorage
	function saveCache() {
		window.localStorage.setItem('tokenCache', JSON.stringify(tokenCache));
	}

	// utility function to load token data from localstorage
	function readCache() {
		const item = localStorage.getItem('tokenCache');
		if(item === null) {
			return {};
		} else {
			return JSON.parse(item);
		}
	}

	export async function postLoginProvider(token, provider) {
		const uri = REST_URI;
		const response = await fetch(`${uri}/auth/${provider}/callback?access_token=${token}`,
		{
			headers: {
				Authorization: `token ${token}`
			}
		});
		if(response.status !== 200) {
			console.log(`Failed to retrieve JWT from backend: ${response.status}`);
			return { status: response.status, data: {message: 'Failed to retrieve JWT from backend.'}};
		}
		const json = await response.json();
		return { status: response.status, data: {jwt: json.jwt}};
	}

	// if the jwt provided is good, return true otherwise return false
	export async function validateJWT(jwt) {
		const uri = REST_URI;
		// check for cached result
		if(tokenCache.jwt === jwt) {
			return Date.now() < tokenCache.tokenData.exp * 1000; // returns false if token is expired
		}
		// jwt changed, cache needs to be refreshed
		if(jwt) {
			try {
				const response = await fetch(`${uri}/token/validation`, {
					method: 'POST',
					mode: 'cors',
					cache: 'no-cache',
					headers: {
						'Authorization': `Bearer ${jwt}`,
						'Content-Type': 'application/json',
					},
					body: `{ "token": "${jwt}" }`,
				});
				if(response.status !== 200) {
					// bad response code: assume JWT is invalid
					return false;
				} else {
					const responseData = await response.json();
					tokenCache.tokenData = responseData; // cache the result
					tokenCache.jwt = jwt; // cache the token as well
					saveCache();
					return Date.now() < responseData.exp * 1000; // returns false if token is expired
				}
			} catch(err) {
				throw new Error(`An error occurred while fetching JWT token validation: ${err}`);
			}
		} else {
			return false;
		}
	}

	// functions below here assume a valid JWT

	// get details of the logged in user, returns an object with user properties
	/*{
		id: ID,
		username: String,
		email: String,
		my_heroes: String,
		local_comps: Object
	}*/
	export async function getUserDetails(jwt) {
		const uri = REST_URI;
		if(jwt) {
			try {
				const response = await fetch(`${uri}/users/me`, {
					method: 'GET',
					mode: 'cors',
					cache: 'no-cache',
					headers: {
						'Authorization': `Bearer ${jwt}`,
					},
				});
				if(response.status !== 200) {
					throw new Error(`An error occurred while fetching user information: ${response.json()}`)
				} else {
					const responseData = await response.json();
					return {
						id: responseData.id,
						username: responseData.username,
						email: responseData.email,
						my_heroes: responseData.my_heroes,
						local_comps: responseData.local_comps,
						avatar: responseData.avatar,
					};
				}
			} catch(err) {
				throw new Error(`An error occurred while fetching user information: ${err}`);
			}
		}
	}

	// get a list of comps that the user has liked, returns the array
	/*[
			{ id: ID, uuid: ID }
	]*/
	export async function getLikedComps(jwt) {
		const uri = REST_URI;
		if(jwt) {
			try {
				const response = await fetch(`${uri}/custom-comps/getallupvoted`, {
					method: 'GET',
					mode: 'cors',
					cache: 'no-cache',
					headers: {
						'Authorization': `Bearer ${jwt}`,
					},
				});
				if(response.status !== 200) {
					throw new Error(`An error occurred while fetching user's liked comps: ${response.json()}`)
				} else {
					const responseData = await response.json();
					return responseData.data.comps;
				}
			} catch(err) {
				throw new Error(`An error occurred while fetching user's liked comps: ${err}`);
			}
		}
	}

	// get a list of comps that the user has published, returns the array
	/*[
			{ id: ID, uuid: ID, updatedAt: String }
	]*/
	export async function getPublishedComps(jwt) {
		const uri = REST_URI;
		if(jwt) {
			try {
				const response = await fetch(`${uri}/custom-comps/getmycomps`, {
					method: 'GET',
					mode: 'cors',
					cache: 'no-cache',
					headers: {
						'Authorization': `Bearer ${jwt}`,
					},
				});
				if(response.status !== 200) {
					throw new Error(`An error occurred while fetching user's published comps: ${response.json()}`)
				} else {
					const responseData = await response.json();
					return responseData.data.comps;
				}
			} catch(err) {
				throw new Error(`An error occurred while fetching user's published comps: ${err}`);
			}
		}
	}

	// get user's total upvotes received, returns an int
	/* Int */
	export async function getReceivedUpvotes(jwt) {
		const uri = REST_URI;
		if(jwt) {
			try {
				const response = await fetch(`${uri}/custom-comps/getreceivedupvotes`, {
					method: 'GET',
					mode: 'cors',
					cache: 'no-cache',
					headers: {
						'Authorization': `Bearer ${jwt}`,
					},
				});
				if(response.status !== 200) {
					throw new Error(`An error occurred while fetching user's received upvotes: ${response.json()}`)
				} else {
					const responseData = await response.json();
					return responseData.data.upvotes;
				}
			} catch(err) {
				throw new Error(`An error occurred while fetching user's received upvotes: ${err}`);
			}
		}
	}
</script>
