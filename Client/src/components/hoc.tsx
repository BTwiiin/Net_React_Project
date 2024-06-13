import { observer } from 'mobx-react-lite';
import React, { ReactNode } from 'react';
import Header from './header';
const HighOrderComponent = observer(({ children }: {
    children: ReactNode;
}) => {

    return (
        <div className='min-h-screen flex flex-col'>

            <Header />
            {children}
        </div >
    );
});

export default HighOrderComponent;