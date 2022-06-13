import { GetStaticPaths, GetStaticProps } from 'next';

import { getPrismicClient } from '../../services/prismic';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import { useRouter } from 'next/router';
interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();
  console.log(router);
  if (router.isFallback) {
    return <h3>Carregando...</h3>;
  }

  function readingTime() {
    let totalNumberOfWords = 0;
    post.data.content.forEach(data => {
      totalNumberOfWords = data.body.reduce((ac, value) => {
        const numberOfWords = value.text.split(' ').length;
        return ac + numberOfWords;
      }, 0);
    });
    return String(Math.ceil(totalNumberOfWords / 200) + ' min');
  }

  return (
    <main>
      <article>
        <h1>{post.data.title}</h1>
        <time>
          {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
            locale: ptBR,
          })}
        </time>
        <p>{post.data.author}</p>
        <time>{`${readingTime()}`}</time>
        {post.data.content.map(content => (
          <section key={content.heading}>
            <h2>{content.heading}</h2>
            {content.body.map(body => (
              <p key={body.text}>{body.text}</p>
            ))}
          </section>
        ))}
      </article>
    </main>
  );
}

export const getStaticPaths: GetStaticPaths = async ({}) => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType<any>('posts');

  const slugs = [];
  posts.results.forEach(result => {
    slugs.push({ params: { slug: result.uid } });
  });

  return {
    paths: slugs,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient({});
  const response = await prismic.getByUID<any>('posts', String(slug));

  const post = response;

  return {
    props: {
      post,
    },
  };
};
