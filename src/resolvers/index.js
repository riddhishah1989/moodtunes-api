import { authResolvers }  from './authResolvers.js';
import { musicResolvers } from './musicResolvers.js';

// Merge all resolvers into one object
export const resolvers = {
  Query: {
    ...authResolvers.Query,
    ...musicResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...musicResolvers.Mutation,
  },
};
