import React, { PropsWithChildren } from 'react';
import Header from './Header';

function Layout(props: PropsWithChildren) {
    return (
        <>
            <Header />
            <main role="main" className="container">
                {props.children}
            </main>
            
        </>
    );
}

export default Layout;
