import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '../components/HomepageFeatures';
import CodeBlock from '@theme/CodeBlock';

import styles from './index.module.css';

/**
 *
 */
function CodeDemonstration() {
    return (
        <CodeBlock className="main-code-demonstration" language="js" showLineNumbers>
            {`import { Binance } from 'zenfuse';

// Creating connection instance
const binance = new Binance.spot(options);

// Fetch current BTC price
binance.fetchPrice('BTC/USDT');

// Post order
binance.auth(creds).postOrder(params);`}
        </CodeBlock>
    );
}

/**
 *
 */
function Badges() {
    return (
        <>
            <a
                style={{ 'margin-right': '0.3em' }}
                href="https://github.com/zenfuse/zenfuse.js/actions/workflows/ci.yml"
            >
                <img
                    src="https://github.com/zenfuse/zenfuse.js/actions/workflows/ci.yml/badge.svg"
                    alt="github CI status"
                ></img>
            </a>

            <img
                style={{ 'margin-right': '0.3em' }}
                src="https://img.shields.io/node/v/zenfuse?logo=nodedotjs"
                alt="nodejs version support"
            ></img>

            <a
                style={{ 'margin-right': '0.3em' }}
                href="https://snyk.io/vuln/npm:zenfuse"
            >
                <img
                    src="https://img.shields.io/snyk/vulnerabilities/github/zenfuse/zenfuse.js?logo=snyk"
                    alt="snyk vulnerabilities"
                ></img>
            </a>

            <a
                style={{ 'margin-right': '0.3em' }}
                href="https://github.com/zenfuse/zenfuse.js/commits"
            >
                <img
                    src="https://img.shields.io/github/last-commit/zenfuse/zenfuse.js?logo=git"
                    alt="github CI status"
                ></img>
            </a>
        </>
    );
}

/**
 *
 */
function HomepageHeader() {
    const { siteConfig } = useDocusaurusContext();
    return (
        <div className={clsx('hero hero--primary', styles.heroBanner)}>
            <div className="container">
                <h1 className="hero__title">{siteConfig.title}</h1>
                <Badges />
                <p className="hero__subtitle">{siteConfig.tagline}</p>
                <div className={styles.buttons}>
                    <Link
                        className="button button--secondary button--lg"
                        to="/docs/intro"
                    >
                        Getting started
                    </Link>
                </div>
                <CodeDemonstration />
            </div>
        </div>
    );
}

/**
 *
 */
export default function Home() {
    const { siteConfig } = useDocusaurusContext();
    return (
        <Layout
            title={`Hello from ${siteConfig.title}`}
            description="Description will go into a meta tag in <head />"
        >
            <HomepageHeader />
            <main>
                <HomepageFeatures />
            </main>
        </Layout>
    );
}
