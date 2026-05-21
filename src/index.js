import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { typeDefs } from './schema/typeDefs.js';
import { resolvers } from './resolvers/index.js';
import { connectDB } from './utils/database.js';
import { getUser } from './utils/auth.js';

const PORT = process.env.PORT || 4000;

// ── Connect MongoDB ───────────────────────────────────────────────────────
await connectDB();

// ── Create Apollo Server ──────────────────────────────────────────────────
const server = new ApolloServer({
  typeDefs,
  resolvers,
  // Shows helpful errors in development
  includeStacktraceInErrorResponses: process.env.NODE_ENV !== 'production',
  formatError: (error) => {
    console.error('GraphQL Error:', error.message);
    return {
      message: error.message,
      code: error.extensions?.code || 'INTERNAL_ERROR',
    };
  },
});

await server.start();

// ── Express App ───────────────────────────────────────────────────────────
const app = express();

app.use(cors());
app.use(morgan('dev'));

// ── Health check (useful for Railway) ────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'MoodTunes GraphQL API', version: '1.0.0' });
});

// ── GraphQL endpoint ──────────────────────────────────────────────────────
app.use(
  '/graphql',
  express.json(),
  expressMiddleware(server, {
    // This runs on every request — reads JWT token and adds user to context
    context: async ({ req }) => {
      const token = req.headers.authorization?.replace('Bearer ', '') || '';
      const user  = token ? await getUser(token) : null;
      return { user };
    },
  })
);

app.listen(PORT, () => {
  console.log(`🎵 MoodTunes GraphQL API running at http://localhost:${PORT}/graphql`);
  console.log(`🚀 Apollo Studio: https://studio.apollographql.com/sandbox?endpoint=http://localhost:${PORT}/graphql`);
});
