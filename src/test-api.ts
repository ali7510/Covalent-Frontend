import { login } from './services/auth';
import { getUserSpaces } from './services/spaces';

async function smoke() {
  const auth = await login({ email: 'test@example.com', password: 'Test@1234' });
  console.log('✅ login:', auth);

  const spaces = await getUserSpaces();
  console.log('✅ spaces:', spaces);
}

smoke().catch(console.error);