import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

const FeatureList = [
    {
        title: 'Batteries Included',
        Svg: require('@site/static/img/feature-rich.svg').default,
        description: (
            <>
                zenfuse.js provides <b>feature rich</b> solution. For any
                exchange API endpoint such as <b>fetching</b>, <b>streaming</b>{' '}
                and <b>posting</b>.
            </>
        ),
    },
    {
        title: 'Unopinionated',
        Svg: require('@site/static/img/unopionated.svg').default,
        description: (
            <>
                zenfuse.js lets you focus on <b>your own code</b>. Its{' '}
                <b>simple</b> any <b>easy to use</b>. And fist to any code
                methodology.
            </>
        ),
    },
    {
        title: 'Quality First Mindset',
        Svg: require('@site/static/img/quality-first.svg').default,
        description: (
            <>
                zenfuse.js is <b>thoroughly tested</b>. Any library function is
                made with a special love for <b>quality</b>.
            </>
        ),
    },
];

/**
 *
 * @param root0
 * @param root0.Svg
 * @param root0.title
 * @param root0.description
 */
function Feature({ Svg, title, description }) {
    return (
        <div className={clsx('col col--4')}>
            <div className="text--center">
                <Svg className={styles.featureSvg} role="img" />
            </div>
            <div className="text--center padding-horiz--md">
                <h3>{title}</h3>
                <p>{description}</p>
            </div>
        </div>
    );
}

/**
 *
 */
export default function HomepageFeatures() {
    return (
        <section className={styles.features}>
            <div className="container">
                <div className="row">
                    {FeatureList.map((props, idx) => (
                        <Feature key={idx} {...props} />
                    ))}
                </div>
            </div>
        </section>
    );
}
