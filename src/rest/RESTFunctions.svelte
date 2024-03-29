<script context="module">
	let tokenCache = readCache();
	const uri = REST_URI;

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
		const response = await fetch(`${uri}/auth/${provider}/callback?access_token=${token}`,
		{
			method: 'GET',
			mode: 'cors',
			cache: 'no-cache',
			headers: {
				Authorization: `token ${token}`
			}
		});
		try {
			const json = await response.json();
			if(response.status !== 200) {
				return { status: response.status, data: json.error };
			}
			return { status: response.status, data: {jwt: json.jwt}};
		} catch(err) {
			if(err instanceof TypeError && err.message) {
				// network error occurred
				return { status: 503, data: err.message }
			} else {
				throw new Error(`An error occurred while attempting postlogin process: ${err}`);
			}
		}
	}

	// check if the jwt provided is good
	/* bool */
	export async function validateJWT(jwt) {
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
				if(err instanceof TypeError && err.message) {
					// network error occurred
					return { status: 503, data: err.message }
				} else {
					throw new Error(`An error occurred while fetching JWT token validation: ${err}`);
				}
			}
		} else {
			return false;
		}
	}

	// ===============================
	// Authenticated user functions
	// ===============================
	// get details of the logged in user
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
				if(err instanceof TypeError && err.message) {
					// network error occurred
					return { status: 503, data: err.message }
				} else {
					throw new Error(`An error occurred while fetching user information: ${err}`);
				}
			}
		}
	}

	// get a list of comps that the user has liked
	/*{
		status: response status,
		data: [{ id: ID, uuid: ID }] OR error object
	}*/
	export async function getLikedComps(jwt) {
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
				if(err instanceof TypeError && err.message) {
					// network error occurred
					return { status: 503, data: err.message }
				} else {
					throw new Error(`An error occurred while fetching user's liked comps: ${err}`);
				}
			}
		}
	}

	// get a list of comps that the user has disliked
	/*{
		status: response status,
		data: [{ id: ID, uuid: ID }] OR error object
	}*/
	export async function getDislikedComps(jwt) {
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
				if(err instanceof TypeError && err.message) {
					// network error occurred
					return { status: 503, data: err.message }
				} else {
					throw new Error(`An error occurred while fetching user's disliked comps: ${err}`);
				}
			}
		}
	}

	// get a list of comps that the user has published
	/*{
		status: response status,
		data: [{ id: ID, uuid: ID }] OR error object
	}*/
	export async function getPublishedComps(jwt) {
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
					return { status: response.status, data: responseData.data.comps };
				}
			} catch(err) {
				if(err instanceof TypeError && err.message) {
					// network error occurred
					return { status: 503, data: err.message }
				} else {
					throw new Error(`An error occurred while fetching user's published comps: ${err}`);
				}
			}
		}
	}

	// get a list of comps that the user has saved (favorited)
	/*{
		status: response status,
		data: [{ id: ID, uuid: ID }] OR error object
	}*/
	export async function getSavedComps(jwt) {
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
				if(err instanceof TypeError && err.message) {
					// network error occurred
					return { status: 503, data: err.message }
				} else {
					throw new Error(`An error occurred while fetching user's saved comps: ${err}`);
				}
			}
		}
	}

	// get user's total upvotes received
	/*{
		status: response status,
		data: Int OR error object
	}*/
	export async function getReceivedUpvotes(jwt) {
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
				if(err instanceof TypeError && err.message) {
					// network error occurred
					return { status: 503, data: err.message }
				} else {
					throw new Error(`An error occurred while fetching user's received upvotes: ${err}`);
				}
			}
		}
	}

	// get user's total downvotes received
	/*{
		status: response status,
		data: Int OR error object
	}*/
	export async function getReceivedDownvotes(jwt) {
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
				if(err instanceof TypeError && err.message) {
					// network error occurred
					return { status: 503, data: err.message }
				} else {
					throw new Error(`An error occurred while fetching user's received downvotes: ${err}`);
				}
			}
		}
	}

	// get user's total saves received
	/*{
		status: response status,
		data: Int OR error object
	}*/
	export async function getReceivedSaves(jwt) {
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
				if(err instanceof TypeError && err.message) {
					// network error occurred
					return { status: 503, data: err.message }
				} else {
					throw new Error(`An error occurred while fetching user's received saves: ${err}`);
				}
			}
		}
	}

	// toggle user comp save
	/*{
		status: response status,
		data: {comps: [{ id: ID, uuid: ID }], saves: int} OR error object
	}*/
	export async function toggleSave(jwt, uuid) {
		if(jwt) {
			try {
				const response = await fetch(`${uri}/custom-comps/togglesave/${uuid}`, {
					method: 'PUT',
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
					return { status: response.status, data: responseData.data };
				}
			} catch(err) {
				if(err instanceof TypeError && err.message) {
					// network error occurred
					return { status: 503, data: err.message }
				} else {
					throw new Error(`An error occurred while toggling comp save: ${err}`);
				}
			}
		}
	}

	// toggle user comp upvote
	/*{
		status: response status,
		data: {comps: [{ id: ID, uuid: ID }], upvotes: int} OR error object
	}*/
	export async function toggleUpvote(jwt, uuid) {
		if(jwt) {
			try {
				const response = await fetch(`${uri}/custom-comps/toggleupvote/${uuid}`, {
					method: 'PUT',
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
					return { status: response.status, data: responseData.data };
				}
			} catch(err) {
				if(err instanceof TypeError && err.message) {
					// network error occurred
					return { status: 503, data: err.message }
				} else {
					throw new Error(`An error occurred while toggling comp upvote: ${err}`);
				}
			}
		}
	}

	// toggle user comp downvote
	/*{
		status: response status,
		data: {comps: [{ id: ID, uuid: ID }], downvotes: int} OR error object
	}*/
	export async function toggleDownvote(jwt, uuid) {
		if(jwt) {
			try {
				const response = await fetch(`${uri}/custom-comps/toggledownvote/${uuid}`, {
					method: 'PUT',
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
					return { status: response.status, data: responseData.data };
				}
			} catch(err) {
				if(err instanceof TypeError && err.message) {
					// network error occurred
					return { status: 503, data: err.message }
				} else {
					throw new Error(`An error occurred while toggling comp downvote: ${err}`);
				}
			}
		}
	}

	// delete a user
	/*{
		status: response status,
		data: {id, username, email, provider, confirmed, blocked, createdAt, updatedAt, my_heroes, local_comps, avatar}
		OR error object
	}*/
	export async function deleteUser(jwt, userID) {
		if(jwt) {
			try {
				const response = await fetch(`${uri}/users/${userID}`, {
					method: 'DELETE',
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
					return { status: response.status, data: responseData.data };
				}
			} catch(err) {
				if(err instanceof TypeError && err.message) {
					// network error occurred
					return { status: 503, data: err.message }
				} else {
					throw new Error(`An error occurred while deleting user: ${err}`);
				}
			}
		}
	}

	// ===============================
	// Unauthenticated user functions
	// ===============================
	// get author's public profile
	/*{
		status: response status,
		data: {
			comps: [{id, uuid, name, upvotes, downvotes, tags, author, comp_update, createdAt, comp_string}],
			author: { username, id, avatar, saved_comps, upvotes }
		} OR error object
	}*/
	export async function getAuthorDetails(author) {
		try {
			const response = await fetch(`${uri}/custom-comps/getauthor/${encodeURIComponent(author)}`, {
				method: 'GET',
				mode: 'cors',
				cache: 'default',
				headers: {},
			});
			const responseData = await response.json();
			if(response.status !== 200) {
				return { status: response.status, data: responseData.error };
			} else {
				return { status: response.status, data: responseData.data };
			}
		} catch(err) {
			if(err instanceof TypeError && err.message) {
				// network error occurred
				return { status: 503, data: err.message }
			} else {
				throw new Error(`An error occurred while fetching author details: ${err}`);
			}
		}
	}

	// get comps (populate explore page)
	/*{
		status: response status,
		data: {
			comps: [{comp}, {comp},...],
			meta: { pagination: {pageInfoObj} }
		} OR error object
	}*/
	export async function getComps(filterStr) {
		try {
			const response = await fetch(`${uri}/comps?${filterStr}`, {
				method: 'GET',
				mode: 'cors',
				cache: 'no-cache',
				headers: {},
			});
			const responseData = await response.json();
			if(response.status !== 200) {
				return { status: response.status, data: responseData.error };
			} else {
				return { status: response.status, data: {comps: responseData.data, meta: responseData.meta} };
			}
		} catch(err) {
			if(err instanceof TypeError && err.message) {
				// network error occurred
				return { status: 503, data: err.message }
			} else {
				throw new Error(`An error occurred while fetching comps: ${err}`);
			}
		}
	}

	// get author of a comp
	/*{
		status: response status,
		data: {
			author: { username, avatar }
		} OR error object
	}*/
	export async function getCompAuthor(uuid) {
		try {
			const response = await fetch(`${uri}/custom-comps/getcompauthor/${uuid}`, {
				method: 'GET',
				mode: 'cors',
				cache: 'default',
				headers: {},
			});
			const responseData = await response.json();
			if(response.status !== 200) {
				return { status: response.status, data: responseData.error };
			} else {
				return { status: response.status, data: responseData.data };
			}
		} catch(err) {
			if(err instanceof TypeError && err.message) {
				// network error occurred
				return { status: 503, data: err.message }
			} else {
				throw new Error(`An error occurred while fetching author for a comp: ${err}`);
			}
		}
	}

	// get comp by UUID - used to check if comp already exists
	export async function getCompByUUID(uuid) {
		try {
			const response = await fetch(`${uri}/comps?filters[uuid][$eq]=${uuid}`, {
				method: 'GET',
				mode: 'cors',
				cache: 'no-cache',
				headers: {},
			});
			const responseData = await response.json();
			if(response.status !== 200) {
				return { status: response.status, data: responseData.error };
			} else {
				return { status: response.status, data: responseData.data };
			}
		} catch(err) {
			if(err instanceof TypeError && err.message) {
				// network error occurred
				return { status: 503, data: err.message }
			} else {
				throw new Error(`An error occurred while fetching comp by UUID: ${err}`);
			}
		}
	}

	// get all authors (users with >0 published comps)
	/*{
		status: response status,
		data: [
			{ name, id, totalComps }
		] OR error object
	}*/
	export async function getAllAuthors() {
		try {
			const response = await fetch(`${uri}/custom-comps/getallauthors`, {
				method: 'GET',
				mode: 'cors',
				cache: 'no-cache',
				headers: {},
			});
			const responseData = await response.json();
			if(response.status !== 200) {
				return { status: response.status, data: responseData.error };
			} else {
				return { status: response.status, data: responseData.data };
			}
		} catch(err) {
			if(err instanceof TypeError && err.message) {
				// network error occurred
				return { status: 503, data: err.message }
			} else {
				throw new Error(`An error occurred while fetching all authors: ${err}`);
			}
		}
	}

	// get all tags with >0 related comps
	/*{
		status: response status,
		data: [
			{ name, id, totalComps }
		] OR error object
	}*/
	export async function getAllTags() {
		try {
			const response = await fetch(`${uri}/custom-tags/getalltags`, {
				method: 'GET',
				mode: 'cors',
				cache: 'no-cache',
				headers: {},
			});
			const responseData = await response.json();
			if(response.status !== 200) {
				return { status: response.status, data: responseData.error };
			} else {
				return { status: response.status, data: responseData.data };
			}
		} catch(err) {
			if(err instanceof TypeError && err.message) {
				// network error occurred
				return { status: 503, data: err.message }
			} else {
				throw new Error(`An error occurred while fetching all tags: ${err}`);
			}
		}
	}

	// get all heroes with >0 related comps
	/*{
		status: response status,
		data: [
			{ name, id, totalComps }
		] OR error object
	}*/
	export async function getAllHeroes() {
		try {
			const response = await fetch(`${uri}/custom-heroes/getallheroes`, {
				method: 'GET',
				mode: 'cors',
				cache: 'no-cache',
				headers: {},
			});
			const responseData = await response.json();
			if(response.status !== 200) {
				return { status: response.status, data: responseData.error };
			} else {
				return { status: response.status, data: responseData.data };
			}
		} catch(err) {
			if(err instanceof TypeError && err.message) {
				// network error occurred
				return { status: 503, data: err.message }
			} else {
				throw new Error(`An error occurred while fetching all heroes: ${err}`);
			}
		}
	}
</script>
