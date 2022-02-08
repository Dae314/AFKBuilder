<script context="module">
	let tokenCache = readCache();

	// ===============================
	// Utilities
	// ===============================
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

	// ===============================
	// JWT functions
	// ===============================
	// part of the post-login process: retrieve user's JWT based on their provider token
	/* {
		status: response status,
		data: { jwt: jwt } OR error object
	} */
	export async function postLoginProvider(token, provider) {
		const uri = REST_URI;
		const response = await fetch(`${uri}/auth/${provider}/callback?access_token=${token}`,
		{
			headers: {
				Authorization: `token ${token}`
			}
		});
		const json = await response.json();
		if(response.status !== 200) {
			return { status: response.status, data: json.error };
		}
		return { status: response.status, data: {jwt: json.jwt}};
	}

	// check if the jwt provided is good
	/* bool */
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

	// ===============================
	// Authenticated user functions
	// ===============================
	// get details of the logged in user, returns an object with user properties
	/*{
		status: response status,
		data: {
			id: ID,
			username: String,
			email: String,
			my_heroes: String,
			local_comps: Object,
			avatar: String
		} OR error object
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
				const responseData = await response.json();
				if(response.status !== 200) {
					return { status: response.status, data: responseData.error };
				} else {
					return {
						status: response.status,
						data: {
							id: responseData.id,
							username: responseData.username,
							email: responseData.email,
							my_heroes: responseData.my_heroes,
							local_comps: responseData.local_comps,
							avatar: responseData.avatar,
						}
					};
				}
			} catch(err) {
				throw new Error(`An error occurred while fetching user information: ${err}`);
			}
		}
	}

	// get a list of comps that the user has liked, returns the array
	/*{
		status: response status,
		data: [{ id: ID, uuid: ID }] OR error object
	}*/
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
				const responseData = await response.json();
				if(response.status !== 200) {
					return { status: response.status, data: responseData.error };
				} else {
					return { status: response.status, data: responseData.data.comps };
				}
			} catch(err) {
				throw new Error(`An error occurred while fetching user's liked comps: ${err}`);
			}
		}
	}

	// get a list of comps that the user has disliked, returns the array
	/*{
		status: response status,
		data: [{ id: ID, uuid: ID }] OR error object
	}*/
	export async function getDislikedComps(jwt) {
		const uri = REST_URI;
		if(jwt) {
			try {
				const response = await fetch(`${uri}/custom-comps/getalldownvoted`, {
					method: 'GET',
					mode: 'cors',
					cache: 'no-cache',
					headers: {
						'Authorization': `Bearer ${jwt}`,
					},
				});
				const responseData = await response.json();
				if(response.status !== 200) {
					return { status: response.status, data: responseData.error };
				} else {
					return { status: response.status, data: responseData.data.comps };
				}
			} catch(err) {
				throw new Error(`An error occurred while fetching user's disliked comps: ${err}`);
			}
		}
	}

	// get a list of comps that the user has published, returns the array
	/*{
		status: response status,
		data: [{ id: ID, uuid: ID, comp_update: DateTime }] OR error object
	}*/
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
				const responseData = await response.json();
				if(response.status !== 200) {
					return { status: response.status, data: responseData.error };
				} else {
					for(let comp of responseData.data.comps) {
						// parse the comp_update field as a datetime
						comp.comp_update = new Date(comp.comp_update);
					}
					return { status: response.status, data: responseData.data.comps };
				}
			} catch(err) {
				throw new Error(`An error occurred while fetching user's published comps: ${err}`);
			}
		}
	}

	// get a list of comps that the user has published, returns the array
	/*{
		status: response status,
		data: [{ id: ID, uuid: ID }] OR error object
	}*/
	export async function getSavedComps(jwt) {
		const uri = REST_URI;
		if(jwt) {
			try {
				const response = await fetch(`${uri}/custom-comps/getallsaved`, {
					method: 'GET',
					mode: 'cors',
					cache: 'no-cache',
					headers: {
						'Authorization': `Bearer ${jwt}`,
					},
				});
				const responseData = await response.json();
				if(response.status !== 200) {
					return { status: response.status, data: responseData.error };
				} else {
					return { status: response.status, data: responseData.data.comps };
				}
			} catch(err) {
				throw new Error(`An error occurred while fetching user's saved comps: ${err}`);
			}
		}
	}

	// get user's total upvotes received, returns an int
	/*{
		status: response status,
		data: Int OR error object
	}*/
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
				const responseData = await response.json();
				if(response.status !== 200) {
					return { status: response.status, data: responseData.error };
				} else {
					return { status: response.status, data: responseData.data.upvotes };
				}
			} catch(err) {
				throw new Error(`An error occurred while fetching user's received upvotes: ${err}`);
			}
		}
	}

	// get user's total downvotes received, returns an int
	/*{
		status: response status,
		data: Int OR error object
	}*/
	export async function getReceivedDownvotes(jwt) {
		const uri = REST_URI;
		if(jwt) {
			try {
				const response = await fetch(`${uri}/custom-comps/getreceiveddownvotes`, {
					method: 'GET',
					mode: 'cors',
					cache: 'no-cache',
					headers: {
						'Authorization': `Bearer ${jwt}`,
					},
				});
				const responseData = await response.json();
				if(response.status !== 200) {
					return { status: response.status, data: responseData.error };
				} else {
					return { status: response.status, data: responseData.data.downvotes };
				}
			} catch(err) {
				throw new Error(`An error occurred while fetching user's received downvotes: ${err}`);
			}
		}
	}

	// get user's total saves received, returns an int
	/*{
		status: response status,
		data: Int OR error object
	}*/
	export async function getReceivedSaves(jwt) {
		const uri = REST_URI;
		if(jwt) {
			try {
				const response = await fetch(`${uri}/custom-comps/getreceivedsaves`, {
					method: 'GET',
					mode: 'cors',
					cache: 'no-cache',
					headers: {
						'Authorization': `Bearer ${jwt}`,
					},
				});
				const responseData = await response.json();
				if(response.status !== 200) {
					return { status: response.status, data: responseData.error };
				} else {
					return { status: response.status, data: responseData.data.saves };
				}
			} catch(err) {
				throw new Error(`An error occurred while fetching user's received saves: ${err}`);
			}
		}
	}

	// ===============================
	// Unauthenticated user functions
	// ===============================
</script>
