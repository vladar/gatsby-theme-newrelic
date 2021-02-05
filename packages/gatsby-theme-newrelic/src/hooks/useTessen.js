import { useMemo } from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import { useLocation } from '@reach/router';
import warning from 'warning';

const warnAboutConfig = (config, action) => {
  warning(
    config == null,
    `You are attempting to use a Tessen action, but do not have Tessen enabled. Calls to '${action}' will result in a noop. Please configure Tessen to track Tessen actions.`
  );

  warning(
    config?.product && config?.subproduct,
    `You are attempting to use a Tessen action, but Tessen is misconfigured. Calls to '${action}' will result in a noop. Please configure both the 'tessen.product' and 'tessen.subproduct' option in gatsby-config.js`
  );
};

const hasValidConfig = (config) =>
  config && config.product && config.subproduct;

const tessenAction = (action, config, location) => (
  name,
  category,
  properties = {}
) => {
  if (!hasValidConfig(config)) {
    return warnAboutConfig(config, action);
  }

  if (!window.Tessen) {
    return warning(
      false,
      `tessen.${name}: You are attempting to use a Tessen action, but Tessen is not available on 'window'. Calls to '${name}' will result in a noop.`
    );
  }

  warning(category, `tessen.${action}: Please provide a category`);

  window.Tessen[action](name, {
    ...properties,
    path: location.pathname,
    category,
    nr_product: config?.product,
    nr_subproduct: config?.subproduct,
    location: 'public',
  });
};

const useTessen = () => {
  const location = useLocation();

  const {
    newRelicThemeConfig: { tessen: config },
  } = useStaticQuery(graphql`
    query {
      newRelicThemeConfig {
        tessen {
          product
          subproduct
        }
      }
    }
  `);

  const tessen = useMemo(
    () => ({
      page: tessenAction('page', config, location),
      track: tessenAction('track', config, location),
    }),
    [config, location]
  );

  return tessen;
};

export default useTessen;
