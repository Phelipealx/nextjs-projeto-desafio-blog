import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';
import { useState } from 'react';
import { getPrismicClient } from '../services/prismic';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState(postsPagination?.results);
  const [next_page, setNext_page] = useState(postsPagination.next_page);

  async function morePosts() {
    if (!next_page) {
      return;
    }

    const postResults: PostPagination = await fetch(`${next_page}`).then(
      response => response.json()
    );

    if (postResults.results && postResults.results.length > 0) {
      setPosts([...posts, ...postResults.results]);
      setNext_page(postResults.next_page);
    }
  }
  return (
    <main>
      {posts.map(({ uid, data, first_publication_date }: Post) => (
        <Link key={uid} href={`/post/${uid}`}>
          <a>
            <strong>{data.title}</strong>
            <p>{data.subtitle}</p>
            <p>
              {format(new Date(first_publication_date), 'dd MMM yyyy', {
                locale: ptBR,
              })}
            </p>
            <p>{data.author}</p>
          </a>
        </Link>
      ))}
      {next_page ? (
        <button type="button" onClick={morePosts}>
          Carregar mais posts
        </button>
      ) : null}
    </main>
  );
}

export const getStaticProps = async ({}) => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('posts', { pageSize: 1 });

  return {
    props: { postsPagination: postsResponse },
  };
};
