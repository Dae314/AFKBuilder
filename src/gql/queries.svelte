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
</script>
