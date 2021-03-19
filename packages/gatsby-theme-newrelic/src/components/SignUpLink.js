/* eslint-disable jsx-a11y/anchor-has-content */
import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import useTessen from '../hooks/useTessen';
import useLocale from '../hooks/useLocale';
import { useStaticQuery, graphql } from 'gatsby';
import { useLocation } from '@reach/router';
import { localizePath } from '../utils/localization';

const formatHref = (href, { utmSource, locale }) => {
  const url = new URL(href);
  const queryParams = new URLSearchParams(url.search);

  if (utmSource) {
    queryParams.set('utm_source', utmSource);
  }

  url.search = queryParams.toString();
  url.pathname = localizePath({ path: url.pathname, locale });

  return url.href;
};

const SignUpLink = forwardRef(
  ({ href, onClick, instrumentation, ...props }, ref) => {
    const tessen = useTessen();
    const location = useLocation();
    const locale = useLocale();

    const {
      site: {
        siteMetadata: { utmSource },
      },
    } = useStaticQuery(graphql`
      query {
        site {
          siteMetadata {
            utmSource
          }
        }
      }
    `);

    return (
      <a
        {...props}
        ref={ref}
        href={formatHref(href, { utmSource, locale })}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          if (onClick) {
            onClick(e);
          }

          tessen.track('stitchedPathLinkClick', 'DocPageLinkClick', {
            href,
            path: location.pathname,
            component: instrumentation?.component,
          });
        }}
      />
    );
  }
);

SignUpLink.propTypes = {
  href: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  instrumentation: PropTypes.shape({
    component: PropTypes.string,
  }),
};

export default SignUpLink;
