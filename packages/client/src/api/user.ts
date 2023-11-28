export interface User {
  _id: string;
  cid: string;
  name: string;
  role: string;
  created_at: string;
}

export async function getUser(): Promise<User> {
  const res = await fetch('/auth/user');
  return await res.json();
}

export async function login(cid: string, password: string) {
  const res = await fetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cid, password }),
  });
  return await res.json();
}
