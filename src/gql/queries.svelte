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
	export const gql_UPDATE_MY_HEROES = gql`
	mutation($id: ID!, $mh: JSON!) {
		updateUsersPermissionsUser(
			id: $id
			data: {
				my_heroes: $mh
			}
		) {
			data {
				id
				attributes {
					my_heroes
				}
			}
		}
	}`;
	export const gql_UPDATE_LOCAL_COMPS = gql`
	mutation($id: ID!, $comps: JSON!) {
		updateUsersPermissionsUser(
			id: $id
			data: {
				local_comps: $comps
			}
		) {
			data {
				id
				attributes {
					local_comps
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
					createdAt
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
	export const gql_GET_COMP_LIST = gql`
	query ($filter: CompFiltersInput, $pagination: PaginationArg, $sort: [String]) {
		comps(filters: $filter, pagination: $pagination, sort: $sort) {
			data {
				id
				attributes {
					name
					uuid
					upvotes
					downvotes
					createdAt
					heroes {
						data {
							id
							attributes {
								name
							}
						}
					}
					comp_update
				}
			}
			meta {
				pagination {
					page
					pageSize
					pageCount
					total
				}
			}
		}
	}`
	export const gql_CREATE_REPORT = gql`
	mutation ($type: String!, $description: String, $target_type: String!, $target_id: String!, $target_name: String!) {
		createReport(
			data: {
				type: $type
				description: $description
				target_type: $target_type
				target_id: $target_id
				target_name: $target_name
			}
		) {
			data {
				id
			}
		}
	}`;
</script>
