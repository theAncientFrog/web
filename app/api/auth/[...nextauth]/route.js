
import NextAuth from 'next-auth';
// ▼▼▼ ВИПРАВЛЕНО: Використовуємо абсолютний шлях з псевдонімом @/ ▼▼▼
import { authOptions } from '@/lib/auth.config'; 
// ▲▲▲ ▲▲▲ ▲▲▲

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };