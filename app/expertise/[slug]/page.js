import ExpertiseClient from './ExpertiseClient';

export async function generateStaticParams() {
  return [
    { slug: 'urbanisme' },
    { slug: 'geometre' },
    { slug: 'vrd' },
    { slug: 'sport' },
    { slug: 'topographie' },
  ];
}

export default async function ExpertisePage({ params }) {
  const { slug } = await params;
  
  return <ExpertiseClient slug={slug} />;
}
