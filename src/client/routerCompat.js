import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';

function getDisplayName(Component) {
  return Component.displayName || Component.name || 'Component';
}

export function withRouter(Component) {
  function ComponentWithRouterProp(props) {
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();

    const history = React.useMemo(() => ({
      push: (to, state) => navigate(to, { state }),
      replace: (to, state) => navigate(to, { replace: true, state }),
      go: (delta) => navigate(delta),
      back: () => navigate(-1),
      forward: () => navigate(1),
      location
    }), [location, navigate]);

    const match = React.useMemo(() => ({
      params,
      path: '',
      url: location.pathname,
      isExact: true
    }), [location.pathname, params]);

    return (
      <Component
        {...props}
        history={history}
        location={location}
        match={match}
        routeParams={params}
      />
    );
  }

  ComponentWithRouterProp.displayName = `withRouter(${getDisplayName(Component)})`;
  return ComponentWithRouterProp;
}
