
import { SEOPageSummary, type SEOPageInfo } from 'deadsimpleseo-react';

export default function Index({ pageInfo }: { pageInfo: SEOPageInfo }) {
  return (
    <div>
      <h1>Dead Simple Blog</h1>
      <ul>
        {pageInfo.childPages?.map((child: SEOPageInfo) => (
          <li key={child.route}>
            <h3><a href={child.route}>{child.pageTitle || child.name}</a></h3>
            <div style={{ marginTop: '2rem', marginBottom: '3rem' }}>
                <SEOPageSummary pageInfo={child} filterFirstHeading />
                <p style={{ marginTop: '0.2rem' }}><a href={child.route}>Continue reading</a></p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}