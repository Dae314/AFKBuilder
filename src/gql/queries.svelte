<script context="module">
	import { gql } from 'apollo-boost';

	export const gql_UPDATE_USER = gql`
	mutation($id: ID!, $username: String!, $avatar: String!) {
		updateUsersPermissionsUser(
				id: $id
				data: {
					username: $username
					avatar: $avatar
				}
		) {
				data {
						id
						attributes {
								username
								avatar
						}
				}
		}
	}`;
</script>
