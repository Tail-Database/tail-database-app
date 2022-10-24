import React, { PropsWithChildren } from 'react';
import Header from './Header';

function Layout(props: PropsWithChildren) {
    return (
        <>
            <Header />
            {props.children}
        </>
    );
}

export default Layout;
