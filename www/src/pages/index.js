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
        <CodeBlock
            className="main-code-demonstration"
            language="js"
            showLineNumbers
        >
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
            <a style={{ 'margin-right': '0.3em' }} href="https://binance.com">
                <img
                    src="img/exchanges/badges/binance-badge.svg"
                    alt="Binance"
                ></img>
            </a>

            <a style={{ 'margin-right': '0.3em' }} href="https://huobi.com">
                <img
                    src="img/exchanges/badges/Huobi-badge.svg"
                    alt="Huobi"
                ></img>
            </a>
            <a style={{ 'margin-right': '0.3em' }} href="https://okx.com">
                <img src="img/exchanges/badges/OKX-badge.svg" alt="OKX"></img>
            </a>
            <a
                style={{ 'margin-right': '0.3em' }}
                href="https://www.bitglobal.com/en-us"
            >
                <img
                    src="img/exchanges/badges/Bitglobal-badge.svg"
                    alt="Bitglobal"
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
