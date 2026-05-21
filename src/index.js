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

// ── Create Express app FIRST so Railway health check works immediately ─────
const app = express();
app.use(cors());
app.use(morgan('dev'));

// ── Health check — Railway pings this to know app is alive ────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'MoodTunes GraphQL API', version: '1.0.0' });
});

// ── Start Express server FIRST ────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🎵 MoodTunes GraphQL API running at http://localhost:${PORT}/graphql`);
  console.log(`🚀 Apollo Studio: https://studio.apollographql.com/sandbox?endpoint=http://localhost:${PORT}/graphql`);
});

// ── Then connect MongoDB + start Apollo in background ─────────────────────
async function initApollo() {
  try {
    // Connect to MongoDB
    await connectDB();

    // Create and start Apollo Server
    const server = new ApolloServer({
      typeDefs,
      resolvers,
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

    // ── GraphQL endpoint ────────────────────────────────────────────────────
    app.use(
      '/graphql',
      express.json(),
      expressMiddleware(server, {
        context: async ({ req }) => {
          const token = req.headers.authorization?.replace('Bearer ', '') || '';
          const user  = token ? await getUser(token) : null;
          return { user };
        },
      })
    );

    console.log('✅ GraphQL endpoint ready at /graphql');
  } catch (err) {
    console.error('❌ Failed to initialize Apollo:', err.message);
    // Don't crash — health check still works
  }
}

initApollo();