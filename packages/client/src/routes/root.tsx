import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  FetchQueryOptions,
  QueryClient,
  useQuery,
} from '@tanstack/react-query';
import { getUser } from '../api/user';

const userQuery = () =>
  ({
    queryKey: ['user'],
    queryFn: () => getUser(),
    retry: false,
  } satisfies FetchQueryOptions);

export const loader = (queryClient: QueryClient) => async () => {
  await queryClient.prefetchQuery(userQuery());
  return null;
};

export const Root = () => {
  const { data: user } = useQuery(userQuery());

  return (
    <>
      <Header user={user}></Header>
      <div className="sticky-header"></div>
      <div className="content">
        <div className="row">
          <div className="wrapper">
            <Outlet />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};
