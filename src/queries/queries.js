import { gql } from 'apollo-boost';

export const gql_GET_COMP_NAMES = gql`
query {
	comps {
		data {
			attributes {
				name
			}
		}
	}
}`;
