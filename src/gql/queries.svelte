<script context="module">
	import { gql } from 'apollo-boost';

	export const gql_UPDATE_USERNAME = gql`
	mutation($id: ID!, $username: String!) {
		updateUsersPermissionsUser(
			id: $id
			data: {
				username: $username
			}
		) {
			data {
					id
					attributes {
							username
					}
			}
		}
	}`;
	export const gql_UPDATE_AVATAR = gql`
	mutation($id: ID!, $avatar: String!) {
		updateUsersPermissionsUser(
			id: $id
			data: {
				avatar: $avatar
			}
		) {
			data {
					id
					attributes {
							avatar
					}
			}
		}
	}`;
	export const gql_GET_COMP = gql`
	query($uuid: String!) {
		comps(filters: { uuid: { eq: $uuid } }) {
			data {
				id
				attributes {
					name
					uuid
					upvotes
					downvotes
					saves
					comp_string
				}
			}
		}
	}`;
	export const gql_CREATE_COMP = gql`
	mutation ($name: String!, $uuid: String!, $comp_string: String!, $heroes: [ID], $tags: [ID], $comp_update: DateTime!) {
		createComp(
			data: {
				name: $name
				uuid: $uuid
				comp_string: $comp_string
				heroes: $heroes
				tags: $tags
				comp_update: $comp_update
			}
		) {
			data {
				id
				attributes {
					uuid
				}
			}
		}
	}`;
	export const gql_UPDATE_COMP = gql`
	mutation ($id: ID!, $name: String!, $uuid: String!, $comp_string: String!, $heroes: [ID], $tags: [ID], $comp_update: DateTime!) {
		updateComp(
			id: $id
			data: {
				name: $name
				uuid: $uuid
				comp_string: $comp_string
				heroes: $heroes
				tags: $tags
				comp_update: $comp_update
			}
		) {
			data {
				id
				attributes {
					uuid
				}
			}
		}
	}`;
	export const gql_DELETE_COMP = gql`
	mutation ($id: ID!) {
		deleteComp(
			id: $id
		) {
			data {
				id
				attributes {
					uuid
				}
			}
		}
	}`;
</script>
