export interface Gallery {
  _id: string;
  name: string;
  description?: string;
  published: boolean;
  shootDate: string;
  created_at: string;
}

export interface ListResponse<T> {
  data: T[];
  total: number;
}

export async function getGalleies(
  page?: number,
  limit?: number
): Promise<ListResponse<Gallery>> {
  const params = new URLSearchParams();
  if (page) params.append('page', page.toString());
  if (limit) params.append('limit', limit.toString());

  const res = await fetch(`/v1/gallery?${params.toString()}`);
  return await res.json();
}
