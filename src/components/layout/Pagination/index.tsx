import { PaginationRenderItemParams } from '@material-ui/lab';
import PaginationMui from '@material-ui/lab/Pagination';
import PaginationItem from '@material-ui/lab/PaginationItem';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ParsedUrlQuery } from 'querystring';
import { forwardRef } from 'react';

import * as S from './styles'

export type Pagination = {
    totalPages: number
    pathname: string
}

export function Pagination({ totalPages, pathname }: Pagination) {
  const { query } = useRouter();

  return (
        <S.Wrapper>
            <PaginationMui
                page={parseInt(String(query.page)) || 1}
                count={totalPages}
                renderItem={(item) => (
                  <PaginationItem
                      component={MaterialUiLink}
                      query={query}
                      pathname={pathname}
                      item={item}
                      {...item}
                  />
                )}
            />
        </S.Wrapper>
  );
}

export interface MaterialUiLinkProps {
  item: PaginationRenderItemParams;
  query: ParsedUrlQuery;
  pathname: string
}

const MaterialUiLink = forwardRef<HTMLAnchorElement, MaterialUiLinkProps>(
  ({ item, query, pathname, ...props }, ref) => (
    <Link
      href={{
        pathname,
        query: { ...query, page: item.page },
      }}
    >
      <a {...props} ref={ref}></a>
    </Link>
  )
);